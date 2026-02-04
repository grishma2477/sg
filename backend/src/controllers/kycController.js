// src/controllers/kycController.js

import { pool } from '../database/DBConnection.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/kyc/status
 * Check KYC status for logged-in user
 */
export const getKYCStatus = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware

    console.log(`📋 Checking KYC status for user: ${userId}`);

    // Check KYC and user profile
    const query = `
      SELECT 
        k.*,
        up.is_kyc_verified,
        u.role
      FROM kyc k
      JOIN user_profiles up ON k.user_id = up.user_id
      JOIN users u ON k.user_id = u.id
      WHERE k.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json(ApiResponse.success({
        kycExists: false,
        isVerified: false,
        message: 'KYC not completed yet'
      }));
    }

    const kyc = result.rows[0];

    // Check if all required fields are filled (not placeholders)
    const isKycComplete = 
      kyc.date_of_birth && kyc.date_of_birth !== '2000-01-01' &&
      kyc.address && kyc.address !== 'To be updated' &&
      kyc.profile_url && kyc.profile_url !== 'https://via.placeholder.com/150' &&
      !kyc.national_identity_number.startsWith('TEMP-');

    res.json(ApiResponse.success({
      kycExists: true,
      isComplete: isKycComplete,
      isVerified: kyc.is_kyc_verified,
      role: kyc.role,
      kycData: {
        firstName: kyc.first_name,
        lastName: kyc.last_name,
        email: kyc.email,
        phone: kyc.phone_number
      },
      message: kyc.is_kyc_verified 
        ? 'KYC verified' 
        : isKycComplete 
          ? 'KYC pending verification' 
          : 'KYC incomplete'
    }));

  } catch (error) {
    console.error('❌ Get KYC status error:', error);
    next(error);
  }
};

/**
 * POST /api/kyc/complete
 * Complete KYC with all details and documents
 */
export const completeKYC = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const {
      firstName,
      lastName,
      dateOfBirth,
      address,
      phoneNumber,
      email,
      gender,
      nationalIdentityNumber,
      bloodGroup,
      documentType,
      documentNumber,
      issuedDate,
      expiryDate
    } = req.body;

    console.log('📝 Completing KYC for user:', userId);
    console.log('📦 Form data:', { firstName, lastName, gender, documentType });

    // Validate required files
    if (!req.files || !req.files.profilePhoto) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Profile photo is required'));
    }

    if (!req.files.documentFront) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Document front image is required'));
    }

    // Upload profile photo
    console.log('📤 Uploading profile photo...');
    const profileUrl = await uploadToCloudinary(
      req.files.profilePhoto.tempFilePath,
      'kyc/profiles',
      'image'
    );

    // Upload document front
    console.log('📤 Uploading document front...');
    const docFrontUrl = await uploadToCloudinary(
      req.files.documentFront.tempFilePath,
      'kyc/documents',
      'image'
    );

    // Upload document back (optional)
    let docBackUrl = null;
    if (req.files.documentBack) {
      console.log('📤 Uploading document back...');
      docBackUrl = await uploadToCloudinary(
        req.files.documentBack.tempFilePath,
        'kyc/documents',
        'image'
      );
    }

    // Update KYC record with complete data
    const updateKycQuery = `
      UPDATE kyc SET
        first_name = $1,
        last_name = $2,
        date_of_birth = $3,
        address = $4,
        profile_url = $5,
        phone_number = $6,
        email = $7,
        gender = $8,
        national_identity_number = $9,
        blood_group = $10,
        updated_at = NOW()
      WHERE user_id = $11
      RETURNING id
    `;

    const kycResult = await client.query(updateKycQuery, [
      firstName,
      lastName,
      dateOfBirth,
      address,
      profileUrl,
      phoneNumber,
      email,
      gender,
      nationalIdentityNumber,
      bloodGroup,
      userId
    ]);

    if (kycResult.rows.length === 0) {
      throw new Error('Failed to update KYC record');
    }

    const kycId = kycResult.rows[0].id;
    console.log('✅ KYC record updated:', kycId);

    // Delete existing documents (if any)
    await client.query('DELETE FROM kyc_documents WHERE kyc_id = $1', [kycId]);

    // Insert document record
    const insertDocQuery = `
      INSERT INTO kyc_documents (
        kyc_id, document_type, document_number,
        issued_date, expiry_date, document_front_url, document_back_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await client.query(insertDocQuery, [
      kycId,
      documentType,
      documentNumber,
      issuedDate,
      expiryDate || null,
      docFrontUrl,
      docBackUrl
    ]);

    console.log('✅ Document record created');

    await client.query('COMMIT');

    console.log('🎉 KYC completion successful');

    res.status(200).json(ApiResponse.success({
      kycId: kycId,
      message: 'KYC completed successfully. Awaiting admin verification.'
    }, 'KYC_COMPLETED'));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Complete KYC error:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json(
        ApiResponse.error('National Identity Number or Document Number already exists')
      );
    }
    
    next(error);
  } finally {
    client.release();
  }
};

/**
 * POST /api/kyc/verify/:userId (ADMIN ONLY)
 * Verify KYC and create driver profile if role=driver
 */
export const verifyKYC = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { userId } = req.params;
    const { approved, remarks } = req.body;

    console.log(`🔍 Admin verifying KYC for user: ${userId}, Approved: ${approved}`);

    if (!approved) {
      // Reject KYC
      await client.query(`
        UPDATE user_profiles 
        SET is_kyc_verified = false,
            updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);

      await client.query('COMMIT');

      return res.json(ApiResponse.success({
        message: `KYC rejected. ${remarks || ''}`
      }, 'KYC_REJECTED'));
    }

    // APPROVE KYC
    await client.query(`
      UPDATE user_profiles 
      SET is_kyc_verified = true,
          updated_at = NOW()
      WHERE user_id = $1
    `, [userId]);

    console.log('✅ User profile marked as KYC verified');

    // Check user role
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userRole = userResult.rows[0].role;
    console.log('👤 User role:', userRole);

    // If DRIVER, create driver profile automatically
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

    console.log('🎉 KYC verification completed');

    res.json(ApiResponse.success({
      message: 'KYC verified successfully' + 
        (userRole === 'driver' ? '. Driver profile created.' : ''),
      userRole: userRole
    }, 'KYC_VERIFIED'));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Verify KYC error:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * GET /api/kyc/pending (ADMIN ONLY)
 * Get all pending KYC submissions
 */
export const getPendingKYCs = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        k.id as kyc_id,
        k.user_id,
        k.first_name,
        k.last_name,
        k.email,
        k.phone_number,
        k.created_at,
        k.updated_at,
        u.role,
        up.is_kyc_verified,
        COUNT(kd.id) as document_count
      FROM kyc k
      JOIN users u ON k.user_id = u.id
      JOIN user_profiles up ON k.user_id = up.user_id
      LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
      WHERE up.is_kyc_verified = false
        AND k.date_of_birth != '2000-01-01'
        AND k.address != 'To be updated'
      GROUP BY k.id, k.user_id, k.first_name, k.last_name, 
               k.email, k.phone_number, k.created_at, k.updated_at,
               u.role, up.is_kyc_verified
      ORDER BY k.updated_at DESC
    `;

    const result = await pool.query(query);

    res.json(ApiResponse.success({
      count: result.rows.length,
      pendingKYCs: result.rows
    }));

  } catch (error) {
    console.error('❌ Get pending KYCs error:', error);
    next(error);
  }
};

/**
 * GET /api/kyc/:userId (ADMIN ONLY)
 * Get complete KYC details
 */
export const getKYCDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const kycQuery = `
      SELECT k.*, up.is_kyc_verified, u.role
      FROM kyc k
      JOIN user_profiles up ON k.user_id = up.user_id
      JOIN users u ON k.user_id = u.id
      WHERE k.user_id = $1
    `;
    
    const kycResult = await pool.query(kycQuery, [userId]);

    if (kycResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('KYC not found'));
    }

    const kyc = kycResult.rows[0];

    // Get documents
    const docsQuery = 'SELECT * FROM kyc_documents WHERE kyc_id = $1';
    const docsResult = await pool.query(docsQuery, [kyc.id]);

    res.json(ApiResponse.success({
      kyc: kyc,
      documents: docsResult.rows
    }));

  } catch (error) {
    console.error('❌ Get KYC details error:', error);
    next(error);
  }
};