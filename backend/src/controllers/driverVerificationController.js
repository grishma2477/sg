import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/drivers/verification-status
 * Get current driver's verification badges
 */
export const getVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get driver ID
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [userId]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Driver profile not found'));
    }

    const driverId = driverResult.rows[0].id;

    // Get verification record
    const verificationResult = await pool.query(
      'SELECT * FROM driver_verifications WHERE driver_id = $1',
      [driverId]
    );

    // Get driver stats
    const driverStats = await pool.query(
      `SELECT 
        verification_level, verification_score, average_rating, 
        total_trips, acceptance_rate, cancellation_rate
      FROM drivers WHERE id = $1`,
      [driverId]
    );

    res.json(ApiResponse.success({
      verification: verificationResult.rows[0] || null,
      driver: driverStats.rows[0] || null
    }));

  } catch (error) {
    console.error('❌ Get verification status error:', error);
    next(error);
  }
};

export default {
  getVerificationStatus
};