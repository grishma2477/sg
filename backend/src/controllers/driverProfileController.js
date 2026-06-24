import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
        d.created_at as member_since,
        dss.current_points as safety_points,
        dss.average_rating,
        dss.completed_rides as total_rides,
        dss.verified_safe_badge as has_badge,
        dv.visibility_multiplier,
        dv.max_request_radius_km,
        dv.performance_tier,
        u.role,
        u.status as user_status,
        k.first_name,
        k.last_name,
        k.profile_url as photo_url,
        ac.phone_number as phone,
        da.vehicle_type,
        da.vehicle_model,
        da.vehicle_color,
        da.license_plate,
        da.vehicle_year
       FROM drivers d
       LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
       LEFT JOIN driver_visibility dv ON d.id = dv.driver_id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN kyc k ON u.id = k.user_id
       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
       LEFT JOIN driver_applications da ON u.id = da.user_id AND da.status = 'approved'
       WHERE d.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Driver profile not found', 404));
    }

    const row = result.rows[0];
    const pts = row.safety_points ?? 1000;
    const safetyLevel =
      pts >= 950 ? 'Trusted' :
      pts >= 900 ? 'Very Good' :
      pts >= 850 ? 'Average' :
      pts >= 800 ? 'Low Trust' : 'Risk Flagged';

    res.json(ApiResponse.success({ ...row, safety_level: safetyLevel }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch driver profile', 500));
  }
};

/**
 * PUT /api/drivers/profile
 */
export const updateDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle_model, vehicle_color, license_plate, vehicle_year, photo_url } = req.body;

    const driverResult = await pool.query(`SELECT id FROM drivers WHERE user_id = $1`, [userId]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Driver not found', 404));
    }

    // Update KYC photo if provided
    if (photo_url) {
      await pool.query(`UPDATE kyc SET profile_url = $1 WHERE user_id = $2`, [photo_url, userId]);
    }

    // Update vehicle info in approved driver application
    const vehicleFields = [];
    const vehicleValues = [];
    let idx = 1;
    if (vehicle_model !== undefined)  { vehicleFields.push(`vehicle_model = $${idx++}`);  vehicleValues.push(vehicle_model); }
    if (vehicle_color !== undefined)  { vehicleFields.push(`vehicle_color = $${idx++}`);  vehicleValues.push(vehicle_color); }
    if (license_plate !== undefined)  { vehicleFields.push(`license_plate = $${idx++}`);  vehicleValues.push(license_plate); }
    if (vehicle_year !== undefined)   { vehicleFields.push(`vehicle_year = $${idx++}`);   vehicleValues.push(vehicle_year); }

    if (vehicleFields.length > 0) {
      vehicleValues.push(userId);
      await pool.query(
        `UPDATE driver_applications SET ${vehicleFields.join(', ')} WHERE user_id = $${idx} AND status = 'approved'`,
        vehicleValues
      );
    }

    res.json(ApiResponse.success({ updated: true }, 'Profile updated successfully'));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to update profile', 500));
  }
};

/**
 * GET /api/drivers/onboarding-status
 * 6-step state machine
 */
export const getOnboardingStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all needed data in one round-trip
    const result = await pool.query(`
      SELECT
        u.id,
        u.role,
        k.id as kyc_id,
        k.first_name,
        da.id as app_id,
        da.status as app_status,
        d.id as driver_id,
        d.is_online
      FROM users u
      LEFT JOIN kyc k ON u.id = k.user_id
      LEFT JOIN driver_applications da ON u.id = da.user_id
      LEFT JOIN drivers d ON u.id = d.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('User not found', 404));
    }

    const r = result.rows[0];

    const steps = [
      {
        step: 1,
        label: 'Register',
        completed: true,
        detail: 'Account created'
      },
      {
        step: 2,
        label: 'KYC',
        completed: !!r.kyc_id,
        detail: r.kyc_id ? 'Identity submitted' : 'Submit national ID / passport'
      },
      {
        step: 3,
        label: 'Driver Application',
        completed: !!r.app_id,
        detail: r.app_id ? `Application ${r.app_status}` : 'Submit vehicle & license details'
      },
      {
        step: 4,
        label: 'Admin Approval',
        completed: r.app_status === 'approved',
        detail: r.app_status === 'approved' ? 'Approved' :
                r.app_status === 'rejected' ? 'Rejected — resubmit required' :
                r.app_id ? 'Pending admin review' : 'Complete application first'
      },
      {
        step: 5,
        label: 'Driver Profile',
        completed: !!r.driver_id,
        detail: r.driver_id ? 'Profile ready' : 'Call POST /api/drivers/create-profile'
      },
      {
        step: 6,
        label: 'Go Online',
        completed: !!r.is_online,
        detail: r.is_online ? 'Currently online' : 'Toggle status to start receiving rides'
      }
    ];

    const currentStep = steps.find((s) => !s.completed)?.step ?? 7;
    const fullyOnboarded = currentStep === 7;

    res.json(ApiResponse.success({ steps, currentStep, fullyOnboarded }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch onboarding status', 500));
  }
};

/**
 * GET /api/drivers/stats
 */
export const getDriverStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const driverResult = await pool.query(`SELECT id FROM drivers WHERE user_id = $1`, [userId]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Driver not found', 404));
    }
    const driverId = driverResult.rows[0].id;

    const [earningsRow, ridesRow, bidsRow] = await Promise.all([
      // Today's earnings from ledger (credit entries)
      pool.query(`
        SELECT COALESCE(SUM(le.amount), 0) as today_earnings
        FROM ledger_entry le
        JOIN ledger_account la ON le.account_id = la.id
        WHERE la.owner_id = $1
          AND la.owner_type = 'driver'
          AND le.direction = 'credit'
          AND le.created_at >= CURRENT_DATE
      `, [driverId]),

      // Rides today
      pool.query(`
        SELECT COUNT(*) as rides_today
        FROM rides
        WHERE driver_id = $1
          AND status = 'completed'
          AND DATE(completed_at) = CURRENT_DATE
      `, [driverId]),

      // Acceptance rate: accepted / (accepted + expired without driver)
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE rb.status = 'accepted') as accepted,
          COUNT(*) as total_submitted
        FROM ride_bids rb
        WHERE rb.driver_id = $1
          AND rb.created_at >= NOW() - INTERVAL '30 days'
      `, [driverId])
    ]);

    const totalBids = parseInt(bidsRow.rows[0].total_submitted, 10);
    const acceptedBids = parseInt(bidsRow.rows[0].accepted, 10);
    const acceptanceRate = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : null;

    res.json(ApiResponse.success({
      today_earnings: parseFloat(earningsRow.rows[0].today_earnings),
      rides_today: parseInt(ridesRow.rows[0].rides_today, 10),
      acceptance_rate: acceptanceRate,
      bids_last_30d: totalBids
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch stats', 500));
  }
};