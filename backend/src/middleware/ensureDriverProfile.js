// ═══════════════════════════════════════════════════════════════════════════════
// ENSURE DRIVER PROFILE MIDDLEWARE
// Automatically creates driver profile if it doesn't exist
// Place this in: src/middleware/ensureDriverProfile.js
// ═══════════════════════════════════════════════════════════════════════════════

import { pool } from '../database/DBConnection.js';

/**
 * Middleware to ensure driver profile exists
 * If user has driver role but no driver profile, creates it automatically
 */
export const ensureDriverProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only check for drivers
    if (userRole !== 'driver') {
      return next();
    }

    console.log('🔍 Checking driver profile for user:', userId);

    // Check if driver profile exists
    const driverCheck = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [userId]
    );

    if (driverCheck.rows.length > 0) {
      // Driver profile exists, attach to request
      req.driverId = driverCheck.rows[0].id;
      console.log('✅ Driver profile exists:', req.driverId);
      return next();
    }

    // Driver profile doesn't exist - create it automatically
    console.log('⚠️ Driver profile not found, creating...');

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create driver profile
      const driverResult = await client.query(
        `INSERT INTO drivers (user_id, is_online, is_available, status)
         VALUES ($1, false, false, 'offline')
         RETURNING id`,
        [userId]
      );

      const driverId = driverResult.rows[0].id;
      console.log('✅ Driver profile created:', driverId);

      // Create driver safety stats
      await client.query(
        `INSERT INTO driver_safety_stats (
          driver_id, 
          current_points, 
          average_rating, 
          completed_rides, 
          total_safety_concerns, 
          verified_safe_badge
        )
        VALUES ($1, 1000, 0.00, 0, 0, false)`,
        [driverId]
      );

      // Create driver visibility
      await client.query(
        `INSERT INTO driver_visibility (
          driver_id, 
          visibility_multiplier, 
          max_request_radius_km, 
          max_concurrent_requests, 
          performance_tier
        )
        VALUES ($1, 1.00, 5.00, 10, 'standard')`,
        [driverId]
      );

      await client.query('COMMIT');

      // Attach driver_id to request
      req.driverId = driverId;
      
      console.log('✅ Driver profile fully initialized:', driverId);
      
      next();

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error in ensureDriverProfile middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize driver profile',
      error: error.message
    });
  }
};

/**
 * Simpler version - just gets driver ID, throws error if not found
 * Use this if you don't want auto-creation
 */
export const requireDriverProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only for drivers'
      });
    }

    const driverCheck = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [userId]
    );

    if (driverCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found. Please complete your driver registration.',
        hint: 'Call POST /api/drivers/create-profile first'
      });
    }

    req.driverId = driverCheck.rows[0].id;
    next();

  } catch (error) {
    console.error('❌ Error in requireDriverProfile middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify driver profile',
      error: error.message
    });
  }
};