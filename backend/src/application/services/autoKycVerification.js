// src/services/autoKycVerification.js
// AUTO-VERIFICATION SERVICE - FOR TESTING ONLY
// Automatically verifies KYC after 10 seconds

import { pool } from '../../database/DBConnection.js';

/**
 * Auto-verify KYC after 10 seconds (FOR TESTING ONLY)
 * In production, this should be replaced with manual admin verification
 */
export const scheduleAutoVerification = async (userId, userRole) => {
  console.log(`⏰ Scheduling auto-verification for user ${userId} in 10 seconds...`);
  
  // Wait 10 seconds
  setTimeout(async () => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      console.log(`🔍 Auto-verifying KYC for user: ${userId}`);

      // 1. Set KYC as verified
      await client.query(`
        UPDATE user_profiles 
        SET is_kyc_verified = true,
            kyc_verified_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);

      console.log('✅ KYC auto-verified!');

      // 2. If driver, create driver profile automatically
      if (userRole === 'driver') {
        const existingDriver = await client.query(
          'SELECT id FROM drivers WHERE user_id = $1',
          [userId]
        );

        if (existingDriver.rows.length === 0) {
          await client.query(`
            INSERT INTO drivers (user_id, is_online, is_available, status)
            VALUES ($1, false, false, 'offline')
          `, [userId]);

          console.log('🚗 Driver profile created automatically!');
        } else {
          console.log('ℹ️  Driver profile already exists');
        }
      }

      await client.query('COMMIT');

      console.log('🎉 Auto-verification completed successfully!');
      console.log(`👉 User ${userId} can now access full features`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Auto-verification error:', error);
    } finally {
      client.release();
    }
  }, 10000); // 10 seconds = 10000 milliseconds
};