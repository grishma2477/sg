import { pool } from "../../database/DBConnection.js";

// Weekly recovery: drivers who have had no safety concerns in the past 7 days
// receive +1 safety point. Runs every Sunday at 3am (caller's responsibility to schedule).
export const runSafetyRecoveryWorker = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find drivers with no safety concerns in the past 7 days AND below max (2000)
    const eligibleResult = await client.query(`
      SELECT dss.driver_id, dss.current_points
      FROM driver_safety_stats dss
      WHERE dss.current_points < 2000
        AND NOT EXISTS (
          SELECT 1 FROM driver_safety_audit_log dsal
          WHERE dsal.driver_id = dss.driver_id
            AND dsal.created_at >= NOW() - INTERVAL '7 days'
            AND dsal.event_type = 'safety_concern'
        )
    `);

    const eligible = eligibleResult.rows;
    if (eligible.length === 0) {
      await client.query("COMMIT");
      console.log("[safetyRecoveryWorker] No eligible drivers for recovery this week.");
      return { recovered: 0 };
    }

    // Apply +1 recovery point per driver
    const driverIds = eligible.map((r) => r.driver_id);

    await client.query(`
      UPDATE driver_safety_stats
      SET current_points = LEAST(current_points + 1, 2000),
          updated_at = NOW()
      WHERE driver_id = ANY($1::int[])
    `, [driverIds]);

    // Log recovery in audit table (IF NOT EXISTS handled by IF table exists)
    for (const row of eligible) {
      await client.query(`
        INSERT INTO driver_safety_audit_log
          (driver_id, event_type, points_before, points_after, note, created_at)
        VALUES ($1, 'weekly_recovery', $2, LEAST($2 + 1, 2000), '7-day clean streak recovery', NOW())
        ON CONFLICT DO NOTHING
      `, [row.driver_id, row.current_points]);
    }

    await client.query("COMMIT");
    console.log(`[safetyRecoveryWorker] Recovery applied to ${eligible.length} driver(s).`);
    return { recovered: eligible.length };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[safetyRecoveryWorker] Error:", err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Self-scheduling weekly runner (call once at server start)
export const startSafetyRecoveryScheduler = () => {
  const SUNDAY = 0;
  const TARGET_HOUR = 3; // 3am

  const scheduleNextRun = () => {
    const now = new Date();
    const next = new Date(now);

    // Advance to next Sunday 3am
    const daysUntilSunday = (SUNDAY + 7 - now.getDay()) % 7 || 7;
    next.setDate(now.getDate() + daysUntilSunday);
    next.setHours(TARGET_HOUR, 0, 0, 0);

    const msUntilNext = next.getTime() - now.getTime();
    console.log(`[safetyRecoveryWorker] Next run scheduled in ${Math.round(msUntilNext / 3600000)}h (${next.toISOString()})`);

    setTimeout(async () => {
      await runSafetyRecoveryWorker().catch((e) =>
        console.error("[safetyRecoveryWorker] Run failed:", e.message)
      );
      scheduleNextRun(); // reschedule for the following week
    }, msUntilNext);
  };

  scheduleNextRun();
};
