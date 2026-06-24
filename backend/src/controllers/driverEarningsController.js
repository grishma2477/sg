import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Helper — resolve driverId from JWT userId
async function getDriverId(userId) {
  const r = await pool.query(`SELECT id FROM drivers WHERE user_id = $1`, [userId]);
  return r.rows[0]?.id ?? null;
}

/**
 * GET /api/drivers/earnings/summary?period=today|week|month
 */
export const getEarningsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'today' } = req.query;

    const driverId = await getDriverId(userId);
    if (!driverId) return res.status(404).json(ApiResponse.error('Driver not found', 404));

    const intervalMap = { today: 'CURRENT_DATE', week: "NOW() - INTERVAL '7 days'", month: "NOW() - INTERVAL '30 days'" };
    const since = intervalMap[period] ?? 'CURRENT_DATE';

    const [earningsResult, ridesResult] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(le.amount) FILTER (WHERE le.direction = 'credit'), 0) as gross_earnings,
          COALESCE(SUM(le.amount) FILTER (WHERE le.direction = 'debit'), 0)  as deductions,
          COUNT(*) FILTER (WHERE le.direction = 'credit')                    as credit_count
        FROM ledger_entry le
        JOIN ledger_account la ON le.account_id = la.id
        WHERE la.owner_id = $1
          AND la.owner_type = 'driver'
          AND le.created_at >= ${since}
      `, [driverId]),

      pool.query(`
        SELECT
          COUNT(*) as completed_rides,
          COALESCE(SUM(fare_amount), 0) as total_fare
        FROM rides
        WHERE driver_id = $1
          AND status = 'completed'
          AND completed_at >= ${since}
      `, [driverId])
    ]);

    const gross = parseFloat(earningsResult.rows[0].gross_earnings);
    const deductions = parseFloat(earningsResult.rows[0].deductions);

    res.json(ApiResponse.success({
      period,
      gross_earnings: gross,
      deductions,
      net_earnings: gross - deductions,
      completed_rides: parseInt(ridesResult.rows[0].completed_rides, 10),
      total_fare_collected: parseFloat(ridesResult.rows[0].total_fare)
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch earnings summary', 500));
  }
};

/**
 * GET /api/drivers/earnings/history?page=1&limit=20
 */
export const getEarningsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    const driverId = await getDriverId(userId);
    if (!driverId) return res.status(404).json(ApiResponse.error('Driver not found', 404));

    const [rowsResult, countResult] = await Promise.all([
      pool.query(`
        SELECT
          r.id as ride_id,
          r.completed_at,
          r.fare_amount,
          r.status,
          rr.pickup_address,
          rr.dropoff_address
        FROM rides r
        LEFT JOIN ride_requests rr ON r.ride_request_id = rr.id
        WHERE r.driver_id = $1
          AND r.status = 'completed'
        ORDER BY r.completed_at DESC
        LIMIT $2 OFFSET $3
      `, [driverId, limit, offset]),

      pool.query(`SELECT COUNT(*) FROM rides WHERE driver_id = $1 AND status = 'completed'`, [driverId])
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    res.json(ApiResponse.success({
      rides: rowsResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch earnings history', 500));
  }
};

/**
 * GET /api/drivers/earnings/statement?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export const getEarningsStatement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json(ApiResponse.error('from and to date params required', 400));
    }

    const driverId = await getDriverId(userId);
    if (!driverId) return res.status(404).json(ApiResponse.error('Driver not found', 404));

    const [ledgerResult, ridesResult] = await Promise.all([
      pool.query(`
        SELECT
          le.id,
          le.direction,
          le.amount,
          le.description,
          le.reference_type,
          le.reference_id,
          le.created_at
        FROM ledger_entry le
        JOIN ledger_account la ON le.account_id = la.id
        WHERE la.owner_id = $1
          AND la.owner_type = 'driver'
          AND le.created_at::date BETWEEN $2 AND $3
        ORDER BY le.created_at DESC
      `, [driverId, from, to]),

      pool.query(`
        SELECT
          COUNT(*) as rides,
          COALESCE(SUM(fare_amount), 0) as total_fare
        FROM rides
        WHERE driver_id = $1
          AND status = 'completed'
          AND completed_at::date BETWEEN $2 AND $3
      `, [driverId, from, to])
    ]);

    const credits = ledgerResult.rows.filter((e) => e.direction === 'credit').reduce((s, e) => s + parseFloat(e.amount), 0);
    const debits  = ledgerResult.rows.filter((e) => e.direction === 'debit').reduce((s, e) => s + parseFloat(e.amount), 0);

    res.json(ApiResponse.success({
      period: { from, to },
      summary: {
        gross_earnings: credits,
        deductions: debits,
        net_earnings: credits - debits,
        completed_rides: parseInt(ridesResult.rows[0].rides, 10),
        total_fare_collected: parseFloat(ridesResult.rows[0].total_fare)
      },
      transactions: ledgerResult.rows
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to generate earnings statement', 500));
  }
};
