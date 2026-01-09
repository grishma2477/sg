// ═══════════════════════════════════════════════════════════════════════════════
// DRIVER PROFILE CREATION ENDPOINT
// Add this to your driverController.js or create a new controller
// ═══════════════════════════════════════════════════════════════════════════════

import { pool } from '../database/DBConnection.js';

/**
 * Create or update driver profile for an existing user
 * POST /api/drivers/create-profile
 */
export const createDriverProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id; // From JWT auth middleware
    
    console.log('📝 Creating driver profile for user:', userId);

    // Start transaction
    await client.query('BEGIN');

    // 1. Check if user exists and has driver role
    const userCheck = await client.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];

    if (user.role !== 'driver') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User must have driver role. Current role: ' + user.role
      });
    }

    // 2. Check if driver profile already exists
    const existingDriver = await client.query(
      `SELECT id FROM drivers WHERE user_id = $1`,
      [userId]
    );

    let driverId;

    if (existingDriver.rows.length > 0) {
      // Driver profile already exists
      driverId = existingDriver.rows[0].id;
      console.log('✅ Driver profile already exists:', driverId);
    } else {
      // 3. Create driver profile
      const driverResult = await client.query(
        `INSERT INTO drivers (user_id, is_online, is_available, status)
         VALUES ($1, false, false, 'offline')
         RETURNING id`,
        [userId]
      );
      
      driverId = driverResult.rows[0].id;
      console.log('✅ Driver profile created:', driverId);

      // 4. Create driver safety stats
      await client.query(
        `INSERT INTO driver_safety_stats (driver_id, current_points, average_rating, completed_rides, total_safety_concerns, verified_safe_badge)
         VALUES ($1, 1000, 0.00, 0, 0, false)
         ON CONFLICT (driver_id) DO NOTHING`,
        [driverId]
      );
      console.log('✅ Driver safety stats created');

      // 5. Create driver visibility settings
      await client.query(
        `INSERT INTO driver_visibility (driver_id, visibility_multiplier, max_request_radius_km, max_concurrent_requests, performance_tier)
         VALUES ($1, 1.00, 5.00, 10, 'standard')
         ON CONFLICT (driver_id) DO NOTHING`,
        [driverId]
      );
      console.log('✅ Driver visibility settings created');
    }

    // Commit transaction
    await client.query('COMMIT');

    // 6. Return complete driver info
    const driverInfo = await client.query(
      `SELECT 
        d.id as driver_id,
        d.user_id,
        d.is_online,
        d.is_available,
        d.status,
        dss.current_points,
        dss.average_rating,
        dss.completed_rides,
        dss.verified_safe_badge,
        dv.visibility_multiplier,
        dv.max_request_radius_km,
        dv.performance_tier
       FROM drivers d
       LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
       LEFT JOIN driver_visibility dv ON d.id = dv.driver_id
       WHERE d.user_id = $1`,
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'Driver profile ready',
      data: driverInfo.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating driver profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver profile',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get driver profile
 * GET /api/drivers/profile
 */
export const getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        d.id as driver_id,
        d.user_id,
        d.is_online,
        d.is_available,
        d.status,
        dss.current_points,
        dss.average_rating,
        dss.completed_rides,
        dss.verified_safe_badge,
        dv.visibility_multiplier,
        dv.max_request_radius_km,
        dv.performance_tier,
        u.role,
        u.status as user_status,
        up.first_name,
        up.last_name,
        ac.email,
        ac.phone
       FROM drivers d
       LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
       LEFT JOIN driver_visibility dv ON d.id = dv.driver_id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
       WHERE d.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching driver profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver profile',
      error: error.message
    });
  }
};