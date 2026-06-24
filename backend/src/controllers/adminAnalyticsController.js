import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';

function periodToTimestamp(period) {
  switch (period) {
    case 'week':  return `NOW() - INTERVAL '7 days'`;
    case 'month': return `NOW() - INTERVAL '30 days'`;
    default:      return `DATE_TRUNC('day', NOW())`; // today
  }
}

// GET /api/admin/analytics/overview?period=today|week|month
export const getOverview = async (req, res, next) => {
  try {
    const since = periodToTimestamp(req.query.period);

    const [ridesRes, usersRes, financeRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'active')     AS active_rides,
          COUNT(*) FILTER (WHERE created_at >= ${since}) AS total_rides,
          COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= ${since}) AS completed_rides,
          COUNT(*) FILTER (WHERE status = 'cancelled' AND created_at >= ${since}) AS cancelled_rides,
          COUNT(*) FILTER (WHERE status = 'pending'   AND created_at >= ${since}) AS pending_rides
        FROM rides
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= ${since} AND role = 'rider')  AS new_riders,
          COUNT(*) FILTER (WHERE created_at >= ${since} AND role = 'driver') AS new_drivers
        FROM users
      `),
      pool.query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'ride_payment'), 0)  AS total_revenue,
          COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'platform_fee'), 0) AS platform_fees
        FROM wallet_transactions
        WHERE created_at >= ${since}
      `),
    ]);

    res.json(ApiResponse.success({
      ...ridesRes.rows[0],
      ...usersRes.rows[0],
      total_revenue:  parseFloat(financeRes.rows[0].total_revenue),
      platform_fees:  parseFloat(financeRes.rows[0].platform_fees),
    }));
  } catch (err) { next(err); }
};

// GET /api/admin/analytics/rides?from=&to=
export const getRidesAnalytics = async (req, res, next) => {
  try {
    const from = req.query.from ? `'${req.query.from}'::date` : `NOW() - INTERVAL '30 days'`;
    const to   = req.query.to   ? `'${req.query.to}'::date + INTERVAL '1 day'` : `NOW()`;

    const [statusRes, fareRes, vehicleRes, peakRes] = await Promise.all([
      pool.query(`
        SELECT status, COUNT(*) AS count FROM rides
        WHERE created_at BETWEEN ${from} AND ${to}
        GROUP BY status ORDER BY count DESC
      `),
      pool.query(`
        SELECT
          ROUND(AVG(total_fare)::numeric, 2)                                AS average_fare,
          ROUND(
            100.0 * COUNT(*) FILTER (WHERE status='cancelled') / NULLIF(COUNT(*),0),
            1
          )                                                                 AS cancellation_rate,
          ROUND(AVG(r2.average_rating)::numeric, 2)                        AS average_rating
        FROM rides r
        LEFT JOIN (
          SELECT ride_id, AVG(rating) AS average_rating FROM reviews GROUP BY ride_id
        ) r2 ON r2.ride_id = r.id
        WHERE r.created_at BETWEEN ${from} AND ${to}
      `),
      pool.query(`
        SELECT vehicle_type, COUNT(*) AS count FROM rides
        WHERE created_at BETWEEN ${from} AND ${to}
        GROUP BY vehicle_type ORDER BY count DESC
      `),
      pool.query(`
        SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*) AS count
        FROM rides
        WHERE created_at BETWEEN ${from} AND ${to} AND status = 'completed'
        GROUP BY hour ORDER BY hour
      `),
    ]);

    res.json(ApiResponse.success({
      by_status:         statusRes.rows,
      average_fare:      parseFloat(fareRes.rows[0]?.average_fare ?? 0),
      cancellation_rate: parseFloat(fareRes.rows[0]?.cancellation_rate ?? 0),
      average_rating:    parseFloat(fareRes.rows[0]?.average_rating ?? 0),
      by_vehicle:        vehicleRes.rows,
      peak_hours:        peakRes.rows,
    }));
  } catch (err) { next(err); }
};

// GET /api/admin/analytics/drivers?from=&to=
export const getDriversAnalytics = async (req, res, next) => {
  try {
    const from = req.query.from ? `'${req.query.from}'::date` : `NOW() - INTERVAL '30 days'`;
    const to   = req.query.to   ? `'${req.query.to}'::date + INTERVAL '1 day'` : `NOW()`;

    const [summaryRes, topRes, safetyRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(DISTINCT driver_id)                                            AS active_drivers,
          ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT driver_id),0), 2)   AS rides_per_driver
        FROM rides
        WHERE created_at BETWEEN ${from} AND ${to} AND status = 'completed'
      `),
      pool.query(`
        SELECT d.id AS driver_id, u.phone_number, up.full_name,
               COUNT(r.id) AS completed_rides,
               COALESCE(SUM(r.driver_earnings), 0) AS total_earnings
        FROM drivers d
        JOIN users u ON u.id = d.user_id
        LEFT JOIN user_profiles up ON up.user_id = d.user_id
        JOIN rides r ON r.driver_id = d.id AND r.status = 'completed'
          AND r.created_at BETWEEN ${from} AND ${to}
        GROUP BY d.id, u.phone_number, up.full_name
        ORDER BY total_earnings DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT
          CASE
            WHEN safety_score >= 80 THEN 'high'
            WHEN safety_score >= 50 THEN 'medium'
            ELSE 'low'
          END AS safety_level,
          COUNT(*) AS count
        FROM drivers
        GROUP BY 1 ORDER BY 1
      `),
    ]);

    res.json(ApiResponse.success({
      active_drivers:        parseInt(summaryRes.rows[0]?.active_drivers ?? 0),
      rides_per_driver:      parseFloat(summaryRes.rows[0]?.rides_per_driver ?? 0),
      top_10_by_earnings:    topRes.rows,
      by_safety_level:       safetyRes.rows,
    }));
  } catch (err) { next(err); }
};

// GET /api/admin/analytics/finance?from=&to=
export const getFinanceAnalytics = async (req, res, next) => {
  try {
    const from = req.query.from ? `'${req.query.from}'::date` : `NOW() - INTERVAL '30 days'`;
    const to   = req.query.to   ? `'${req.query.to}'::date + INTERVAL '1 day'` : `NOW()`;

    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'ride_payment'),  0) AS gross_bookings,
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'platform_fee'),  0) AS platform_fees_collected,
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'payout'),        0) AS payout_volume,
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'wallet_topup'),  0) AS wallet_top_ups,
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'refund'),        0) AS refunds_issued
      FROM wallet_transactions
      WHERE created_at BETWEEN ${from} AND ${to}
    `);

    const r = rows[0];
    res.json(ApiResponse.success({
      gross_bookings:         parseFloat(r.gross_bookings),
      platform_fees_collected:parseFloat(r.platform_fees_collected),
      payout_volume:          parseFloat(r.payout_volume),
      wallet_top_ups:         parseFloat(r.wallet_top_ups),
      refunds_issued:         parseFloat(r.refunds_issued),
      net_revenue:            parseFloat(r.platform_fees_collected) - parseFloat(r.refunds_issued),
    }));
  } catch (err) { next(err); }
};

// GET /api/admin/analytics/geography
export const getGeographyHeatmap = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        ROUND(ST_X(pickup_location::geometry)::numeric, 3) AS lng,
        ROUND(ST_Y(pickup_location::geometry)::numeric, 3) AS lat,
        COUNT(*) AS weight
      FROM ride_requests
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1, 2
      ORDER BY weight DESC
      LIMIT 500
    `);

    res.json(ApiResponse.success({
      type: 'FeatureCollection',
      features: rows.map(r => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [parseFloat(r.lng), parseFloat(r.lat)] },
        properties: { weight: parseInt(r.weight) },
      })),
    }));
  } catch (err) { next(err); }
};
