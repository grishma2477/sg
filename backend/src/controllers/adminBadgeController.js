import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/admin/drivers/badges
 * Get all drivers with their verification status
 */
export const getAllDriversWithBadges = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        d.id as driver_id,
        d.user_id,
        d.verification_level,
        d.verification_score,
        d.average_rating,
        d.total_trips,
        d.is_online,
        d.is_available,
        k.first_name,
        k.last_name,
        k.email,
        k.phone_number,
        k.profile_url,
        dv.confirmed_identity,
        dv.portrait_picture_check,
        dv.driver_license_verified,
        dv.authorized_driver,
        dv.driving_history_check,
        dv.national_police_check,
        dv.vehicle_inspected,
        dv.motor_vehicle_insurance,
        dv.ctp_insurance_check,
        dv.vehicle_registration_verified,
        dv.blue_book_verified,
        dv.all_verifications_complete,
        dv.verification_score as dv_score
      FROM drivers d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN kyc k ON u.id = k.user_id
      LEFT JOIN driver_verifications dv ON d.id = dv.driver_id
      ORDER BY d.created_at DESC
    `;

    const result = await pool.query(query);

    res.json(ApiResponse.success({
      count: result.rows.length,
      drivers: result.rows
    }));

  } catch (error) {
    console.error('❌ Get drivers with badges error:', error);
    next(error);
  }
};

/**
 * GET /api/admin/drivers/:driverId/badges
 * Get specific driver's badge details
 */
export const getDriverBadges = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const query = `
      SELECT 
        dv.*,
        d.verification_level,
        d.verification_score as driver_score,
        k.first_name,
        k.last_name,
        k.email
      FROM driver_verifications dv
      JOIN drivers d ON dv.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN kyc k ON u.id = k.user_id
      WHERE dv.driver_id = $1
    `;

    const result = await pool.query(query, [driverId]);

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Driver verification not found'));
    }

    res.json(ApiResponse.success({ verification: result.rows[0] }));

  } catch (error) {
    console.error('❌ Get driver badges error:', error);
    next(error);
  }
};

/**
 * PUT /api/admin/drivers/:driverId/badges
 * Update driver's verification badges
 */
export const updateDriverBadges = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { driverId } = req.params;
    const badgeUpdates = req.body; // Object with badge fields to update

    console.log('🎖️ Updating badges for driver:', driverId);
    console.log('📋 Badge updates:', badgeUpdates);

    // Check if driver exists
    const driverCheck = await client.query(
      'SELECT id FROM drivers WHERE id = $1',
      [driverId]
    );

    if (driverCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json(ApiResponse.error('Driver not found'));
    }

    // Check if verification record exists
    const verificationCheck = await client.query(
      'SELECT id FROM driver_verifications WHERE driver_id = $1',
      [driverId]
    );

    if (verificationCheck.rows.length === 0) {
      // Create verification record if doesn't exist
      await client.query(
        'INSERT INTO driver_verifications (driver_id) VALUES ($1)',
        [driverId]
      );
      console.log('✅ Created new verification record');
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'confirmed_identity',
      'portrait_picture_check',
      'driver_license_verified',
      'authorized_driver',
      'driving_history_check',
      'national_police_check',
      'vehicle_inspected',
      'motor_vehicle_insurance',
      'ctp_insurance_check',
      'vehicle_registration_verified',
      'blue_book_verified'
    ];

    for (const field of allowedFields) {
      if (badgeUpdates[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(badgeUpdates[field]);
        paramCount++;

        // Update verified_at timestamp
        if (badgeUpdates[field] === true) {
          const verifiedAtField = field + '_verified_at';
          updates.push(`${verifiedAtField} = NOW()`);
        }
      }
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('No valid badge fields to update'));
    }

    values.push(driverId);

    const query = `
      UPDATE driver_verifications 
      SET ${updates.join(', ')}
      WHERE driver_id = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(query, values);

    // Update driver's verification score and level (copied from verification record)
    await client.query(
      `UPDATE drivers 
       SET verification_score = $1, verification_level = $2
       WHERE id = $3`,
      [
        result.rows[0].verification_score,
        result.rows[0].verification_level,
        driverId
      ]
    );

    await client.query('COMMIT');

    console.log('✅ Badges updated successfully');
    console.log('📊 New score:', result.rows[0].verification_score);
    console.log('🏆 New level:', result.rows[0].verification_level);

    res.json(ApiResponse.success({
      verification: result.rows[0],
      message: 'Badges updated successfully'
    }));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Update driver badges error:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * POST /api/admin/drivers/:driverId/badges/reset
 * Reset all badges to false
 */
export const resetDriverBadges = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { driverId } = req.params;

    const result = await client.query(
      `UPDATE driver_verifications 
       SET 
         confirmed_identity = false,
         portrait_picture_check = false,
         driver_license_verified = false,
         authorized_driver = false,
         driving_history_check = false,
         national_police_check = false,
         vehicle_inspected = false,
         motor_vehicle_insurance = false,
         ctp_insurance_check = false,
         vehicle_registration_verified = false,
         blue_book_verified = false
       WHERE driver_id = $1
       RETURNING *`,
      [driverId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json(ApiResponse.error('Driver verification not found'));
    }

    // Update driver's verification score and level
    await client.query(
      `UPDATE drivers 
       SET verification_score = 0, verification_level = 'bronze'
       WHERE id = $1`,
      [driverId]
    );

    await client.query('COMMIT');

    res.json(ApiResponse.success({
      message: 'All badges reset successfully',
      verification: result.rows[0]
    }));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Reset badges error:', error);
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getAllDriversWithBadges,
  getDriverBadges,
  updateDriverBadges,
  resetDriverBadges
};