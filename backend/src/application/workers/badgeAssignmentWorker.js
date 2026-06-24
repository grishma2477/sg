import { pool } from "../../database/DBConnection.js";
import { NotificationService } from "../services/NotificationService.js";

// Badge criteria:
//   avg_rating >= 4.7
//   felt_safe_percentage >= 95% (last 100 rides)
//   no safety concerns in past 60 days
//   safety_points >= 950

const BADGE_MIN_RATING = 4.7;
const BADGE_MIN_FELT_SAFE_PCT = 95;
const BADGE_SAFETY_CONCERN_LOOKBACK_DAYS = 60;
const BADGE_MIN_POINTS = 950;

export const runBadgeAssignmentWorker = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Evaluate every driver with at least 1 completed ride
    const driversResult = await client.query(`
      SELECT
        dss.driver_id,
        dss.current_points,
        dss.average_rating,
        dss.completed_rides,
        dss.verified_safe_badge,
        -- felt_safe_percentage over last 100 rides
        COALESCE((
          SELECT ROUND(
            COUNT(*) FILTER (WHERE r.felt_safe = true)::numeric
            / NULLIF(COUNT(*), 0) * 100,
          2)
          FROM reviews r
          WHERE r.driver_id = dss.driver_id
          ORDER BY r.created_at DESC
          LIMIT 100
        ), 0) AS felt_safe_pct,
        -- any safety concern in last 60 days?
        EXISTS (
          SELECT 1 FROM driver_safety_audit_log dsal
          WHERE dsal.driver_id = dss.driver_id
            AND dsal.event_type = 'safety_concern'
            AND dsal.created_at >= NOW() - INTERVAL '60 days'
        ) AS has_recent_concern
      FROM driver_safety_stats dss
      WHERE dss.completed_rides > 0
    `);

    let granted = 0;
    let revoked = 0;

    for (const row of driversResult.rows) {
      const meetsAllCriteria =
        parseFloat(row.average_rating) >= BADGE_MIN_RATING &&
        parseFloat(row.felt_safe_pct) >= BADGE_MIN_FELT_SAFE_PCT &&
        !row.has_recent_concern &&
        row.current_points >= BADGE_MIN_POINTS;

      if (meetsAllCriteria && !row.verified_safe_badge) {
        // Grant badge
        await client.query(
          `UPDATE driver_safety_stats SET verified_safe_badge = true, updated_at = NOW() WHERE driver_id = $1`,
          [row.driver_id]
        );
        await client.query(`
          INSERT INTO driver_safety_audit_log
            (driver_id, event_type, points_before, points_after, note, created_at)
          VALUES ($1, 'badge_granted', $2, $2, 'Met all badge criteria', NOW())
          ON CONFLICT DO NOTHING
        `, [row.driver_id, row.current_points]);
        // Notify driver (lookup user_id outside transaction — fire-and-forget)
        const uRow = await pool.query(`SELECT user_id FROM drivers WHERE id = $1`, [row.driver_id]);
        if (uRow.rows.length > 0) {
          NotificationService.notify(uRow.rows[0].user_id, {
            title: 'Badge Earned! 🏆',
            body: 'You are now a Verified Safe Driver',
            data: { driverId: String(row.driver_id) },
            type: 'safety'
          });
        }
        granted++;
      } else if (!meetsAllCriteria && row.verified_safe_badge) {
        // Revoke badge
        await client.query(
          `UPDATE driver_safety_stats SET verified_safe_badge = false, updated_at = NOW() WHERE driver_id = $1`,
          [row.driver_id]
        );
        await client.query(`
          INSERT INTO driver_safety_audit_log
            (driver_id, event_type, points_before, points_after, note, created_at)
          VALUES ($1, 'badge_revoked', $2, $2, 'No longer meets badge criteria', NOW())
          ON CONFLICT DO NOTHING
        `, [row.driver_id, row.current_points]);
        revoked++;
      }
    }

    await client.query("COMMIT");
    console.log(`[badgeAssignmentWorker] Badges granted: ${granted}, revoked: ${revoked}`);
    return { granted, revoked };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[badgeAssignmentWorker] Error:", err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Self-scheduling daily runner at 2am (call once at server start)
export const startBadgeAssignmentScheduler = () => {
  const TARGET_HOUR = 2;

  const scheduleNextRun = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(TARGET_HOUR, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const msUntilNext = next.getTime() - now.getTime();
    console.log(`[badgeAssignmentWorker] Next run at ${next.toISOString()} (${Math.round(msUntilNext / 3600000)}h from now)`);

    setTimeout(async () => {
      await runBadgeAssignmentWorker().catch((e) =>
        console.error("[badgeAssignmentWorker] Run failed:", e.message)
      );
      scheduleNextRun();
    }, msUntilNext);
  };

  scheduleNextRun();
};
