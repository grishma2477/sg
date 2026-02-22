
// // src/controllers/kycController.js
// // FIXED: Creates KYC record if it doesn't exist (handles old users)

// import { pool } from '../database/DBConnection.js';
// import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
// import { ApiResponse } from '../utils/ApiResponse.js';

// // TODO: Move this to backend/src/application/services/KYCVerificationService.js
// const scheduleAutoVerification = async (userId, userRole) => {
//   console.log(`⏰ Scheduling auto-verification for user ${userId} in 10 seconds...`);
  
//   setTimeout(async () => {
//     const client = await pool.connect();
    
//     try {
//       await client.query('BEGIN');

//       console.log(`🔍 Auto-verifying KYC for user: ${userId}`);

//       await client.query(`
//         UPDATE user_profiles 
//         SET is_kyc_verified = true,
//             kyc_verified_at = NOW(),
//             updated_at = NOW()
//         WHERE user_id = $1
//       `, [userId]);

//       console.log('✅ KYC auto-verified!');

//       if (userRole === 'driver') {
//         const existingDriver = await client.query(
//           'SELECT id FROM drivers WHERE user_id = $1',
//           [userId]
//         );

//         if (existingDriver.rows.length === 0) {
//           await client.query(`
//             INSERT INTO drivers (user_id, is_online, is_available, status)
//             VALUES ($1, false, false, 'offline')
//           `, [userId]);

//           console.log('🚗 Driver profile created automatically!');
//         }
//       }

//       await client.query('COMMIT');
//       console.log('🎉 Auto-verification completed!');

//     } catch (error) {
//       await client.query('ROLLBACK');
//       console.error('❌ Auto-verification error:', error);
//     } finally {
//       client.release();
//     }
//   }, 10000);
// };

// /**
//  * GET /api/kyc/status
//  */
// export const getKYCStatus = async (req, res, next) => {
//   try {
//     const userId = req.user.id;

//     console.log(`📋 Checking KYC status for user: ${userId}`);

//     const kycQuery = `
//       SELECT 
//         k.*,
//         COALESCE(up.is_kyc_verified, false) as is_kyc_verified,
//         u.role
//       FROM kyc k
//       JOIN users u ON k.user_id = u.id
//       LEFT JOIN user_profiles up ON k.user_id = up.user_id
//       WHERE k.user_id = $1
//     `;
    
//     const result = await pool.query(kycQuery, [userId]);

//     if (result.rows.length === 0) {
//       return res.json(ApiResponse.success({
//         kycExists: false,
//         isVerified: false,
//         message: 'KYC not completed yet'
//       }));
//     }

//     const kyc = result.rows[0];

//     const isKycComplete = 
//       kyc.date_of_birth && kyc.date_of_birth !== '2000-01-01' &&
//       kyc.address && kyc.address !== 'To be updated' &&
//       kyc.profile_url && kyc.profile_url !== 'https://via.placeholder.com/150' &&
//       !kyc.national_identity_number.startsWith('TEMP-');

//     res.json(ApiResponse.success({
//       kycExists: true,
//       isComplete: isKycComplete,
//       isVerified: kyc.is_kyc_verified,
//       role: kyc.role,
//       kycData: {
//         firstName: kyc.first_name,
//         lastName: kyc.last_name,
//         email: kyc.email,
//         phone: kyc.phone_number
//       },
//       message: kyc.is_kyc_verified 
//         ? 'KYC verified' 
//         : isKycComplete 
//           ? 'KYC pending verification' 
//           : 'KYC incomplete'
//     }));

//   } catch (error) {
//     console.error('❌ Get KYC status error:', error);
//     next(error);
//   }
// };

// /**
//  * POST /api/kyc/complete
//  * FIXED: Creates KYC record if it doesn't exist (handles users created before KYC system)
//  */
// export const completeKYC = async (req, res, next) => {
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');

//     const userId = req.user.id;
//     const {
//       firstName,
//       lastName,
//       dateOfBirth,
//       address,
//       phoneNumber,
//       email,
//       gender,
//       nationalIdentityNumber,
//       bloodGroup,
//       documentType,
//       documentNumber,
//       issuedDate,
//       expiryDate
//     } = req.body;

//     console.log('📝 Completing KYC for user:', userId);

//     // Validate required files
//     if (!req.files || !req.files.profilePhoto) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(ApiResponse.error('Profile photo is required'));
//     }

//     if (!req.files.documentFront) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(ApiResponse.error('Document front image is required'));
//     }

//     // Upload files
//     console.log('📤 Uploading profile photo...');
//     const profileUrl = await uploadToCloudinary(
//       req.files.profilePhoto.tempFilePath,
//       'kyc/profiles',
//       'image'
//     );

//     console.log('📤 Uploading document front...');
//     const docFrontUrl = await uploadToCloudinary(
//       req.files.documentFront.tempFilePath,
//       'kyc/documents',
//       'image'
//     );

//     let docBackUrl = null;
//     if (req.files.documentBack) {
//       console.log('📤 Uploading document back...');
//       docBackUrl = await uploadToCloudinary(
//         req.files.documentBack.tempFilePath,
//         'kyc/documents',
//         'image'
//       );
//     }

//     // 🆕 CHECK if KYC record exists, if not CREATE it first
//     const existingKyc = await client.query(
//       'SELECT id FROM kyc WHERE user_id = $1',
//       [userId]
//     );

//     let kycId;

//     if (existingKyc.rows.length === 0) {
//       // KYC record doesn't exist - CREATE it
//       console.log('ℹ️  No KYC record found - creating new one');
      
//       const createKycQuery = `
//         INSERT INTO kyc (
//           user_id, first_name, last_name, date_of_birth, address, 
//           profile_url, phone_number, email, gender, 
//           national_identity_number, blood_group
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
//         RETURNING id
//       `;

//       const createResult = await client.query(createKycQuery, [
//         userId,
//         firstName,
//         lastName,
//         dateOfBirth,
//         address,
//         profileUrl,
//         phoneNumber,
//         email,
//         gender,
//         nationalIdentityNumber,
//         bloodGroup
//       ]);

//       kycId = createResult.rows[0].id;
//       console.log('✅ KYC record created:', kycId);

//     } else {
//       // KYC record exists - UPDATE it
//       const updateKycQuery = `
//         UPDATE kyc SET
//           first_name = $1,
//           last_name = $2,
//           date_of_birth = $3,
//           address = $4,
//           profile_url = $5,
//           phone_number = $6,
//           email = $7,
//           gender = $8,
//           national_identity_number = $9,
//           blood_group = $10,
//           updated_at = NOW()
//         WHERE user_id = $11
//         RETURNING id
//       `;

//       const updateResult = await client.query(updateKycQuery, [
//         firstName,
//         lastName,
//         dateOfBirth,
//         address,
//         profileUrl,
//         phoneNumber,
//         email,
//         gender,
//         nationalIdentityNumber,
//         bloodGroup,
//         userId
//       ]);

//       kycId = updateResult.rows[0].id;
//       console.log('✅ KYC record updated:', kycId);
//     }

//     // Save documents
//     await client.query('DELETE FROM kyc_documents WHERE kyc_id = $1', [kycId]);

//     const insertDocQuery = `
//       INSERT INTO kyc_documents (
//         kyc_id, document_type, document_number,
//         issued_date, expiry_date, document_front_url, document_back_url
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
//     `;

//     await client.query(insertDocQuery, [
//       kycId,
//       documentType,
//       documentNumber,
//       issuedDate,
//       expiryDate || null,
//       docFrontUrl,
//       docBackUrl
//     ]);

//     console.log('✅ Documents saved');

//     // Create or check user_profiles
//     const checkProfileQuery = `SELECT user_id FROM user_profiles WHERE user_id = $1`;
//     const profileExists = await client.query(checkProfileQuery, [userId]);

//     if (profileExists.rows.length === 0) {
//       const createProfileQuery = `
//         INSERT INTO user_profiles (
//           user_id,
//           is_email_verified,
//           is_phone_verified,
//           is_kyc_verified
//         ) VALUES ($1, true, true, false)
//       `;
      
//       await client.query(createProfileQuery, [userId]);
//       console.log('✅ user_profiles created');
//     }

//     // Get user role
//     const userResult = await client.query(
//       'SELECT role FROM users WHERE id = $1',
//       [userId]
//     );

//     const userRole = userResult.rows.length > 0 ? userResult.rows[0].role : null;

//     await client.query('COMMIT');

//     console.log('🎉 KYC completion successful');
    
//     // Schedule auto-verification
//     // TODO: Move to application/services/KYCVerificationService.js
//     if (userRole) {
//       scheduleAutoVerification(userId, userRole);
//       console.log('⏰ Auto-verification scheduled for 10 seconds');
//     }

//     res.status(200).json(ApiResponse.success({
//       kycId: kycId,
//       message: 'KYC completed successfully. Auto-verification in 10 seconds (test mode).'
//     }, 'KYC_COMPLETED'));

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Complete KYC error:', error);
    
//     if (error.code === '23505') {
//       return res.status(400).json(
//         ApiResponse.error('National Identity Number or Document Number already exists')
//       );
//     }
    
//     next(error);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * POST /api/kyc/verify/:userId (ADMIN ONLY)
//  */
// export const verifyKYC = async (req, res, next) => {
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');

//     const { userId } = req.params;
//     const { approved, remarks } = req.body;

//     console.log(`🔍 Admin verifying KYC for user: ${userId}, Approved: ${approved}`);

//     if (!approved) {
//       await client.query(`
//         UPDATE user_profiles 
//         SET is_kyc_verified = false,
//             kyc_verified_at = NULL,
//             updated_at = NOW()
//         WHERE user_id = $1
//       `, [userId]);

//       await client.query('COMMIT');

//       return res.json(ApiResponse.success({
//         message: `KYC rejected. ${remarks || ''}`
//       }, 'KYC_REJECTED'));
//     }

//     await client.query(`
//       UPDATE user_profiles 
//       SET is_kyc_verified = true,
//           kyc_verified_at = NOW(),
//           updated_at = NOW()
//       WHERE user_id = $1
//     `, [userId]);

//     console.log('✅ KYC VERIFIED');

//     const userResult = await client.query(
//       'SELECT role FROM users WHERE id = $1',
//       [userId]
//     );

//     if (userResult.rows.length === 0) {
//       throw new Error('User not found');
//     }

//     const userRole = userResult.rows[0].role;

//     if (userRole === 'driver') {
//       const existingDriver = await client.query(
//         'SELECT id FROM drivers WHERE user_id = $1',
//         [userId]
//       );

//       if (existingDriver.rows.length === 0) {
//         await client.query(`
//           INSERT INTO drivers (user_id, is_online, is_available, status)
//           VALUES ($1, false, false, 'offline')
//         `, [userId]);

//         console.log('🚗 Driver profile created!');
//       }
//     }

//     await client.query('COMMIT');

//     res.json(ApiResponse.success({
//       message: 'KYC verified successfully' + 
//         (userRole === 'driver' ? '. Driver profile created.' : ''),
//       userRole: userRole
//     }, 'KYC_VERIFIED'));

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Verify KYC error:', error);
//     next(error);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * GET /api/kyc/pending (ADMIN ONLY)
//  */
// export const getPendingKYCs = async (req, res, next) => {
//   try {
//     const query = `
//       SELECT 
//         k.id as kyc_id,
//         k.user_id,
//         k.first_name,
//         k.last_name,
//         k.email,
//         k.phone_number,
//         k.created_at,
//         k.updated_at,
//         u.role,
//         COALESCE(up.is_kyc_verified, false) as is_kyc_verified,
//         COUNT(kd.id) as document_count
//       FROM kyc k
//       JOIN users u ON k.user_id = u.id
//       LEFT JOIN user_profiles up ON k.user_id = up.user_id
//       LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
//       WHERE COALESCE(up.is_kyc_verified, false) = false
//         AND k.date_of_birth != '2000-01-01'
//         AND k.address != 'To be updated'
//       GROUP BY k.id, k.user_id, k.first_name, k.last_name, 
//                k.email, k.phone_number, k.created_at, k.updated_at,
//                u.role, up.is_kyc_verified
//       ORDER BY k.updated_at DESC
//     `;

//     const result = await pool.query(query);

//     res.json(ApiResponse.success({
//       count: result.rows.length,
//       pendingKYCs: result.rows
//     }));

//   } catch (error) {
//     console.error('❌ Get pending KYCs error:', error);
//     next(error);
//   }
// };

// /**
//  * GET /api/kyc/:userId (ADMIN ONLY)
//  */
// export const getKYCDetails = async (req, res, next) => {
//   try {
//     const { userId } = req.params;

//     const kycQuery = `
//       SELECT 
//         k.*, 
//         COALESCE(up.is_kyc_verified, false) as is_kyc_verified, 
//         u.role
//       FROM kyc k
//       JOIN users u ON k.user_id = u.id
//       LEFT JOIN user_profiles up ON k.user_id = up.user_id
//       WHERE k.user_id = $1
//     `;
    
//     const kycResult = await pool.query(kycQuery, [userId]);

//     if (kycResult.rows.length === 0) {
//       return res.status(404).json(ApiResponse.error('KYC not found'));
//     }

//     const kyc = kycResult.rows[0];

//     const docsQuery = 'SELECT * FROM kyc_documents WHERE kyc_id = $1';
//     const docsResult = await pool.query(docsQuery, [kyc.id]);

//     res.json(ApiResponse.success({
//       kyc: kyc,
//       documents: docsResult.rows
//     }));

//   } catch (error) {
//     console.error('❌ Get KYC details error:', error);
//     next(error);
//   }
// };



import { pool } from '../database/DBConnection.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import KYC from "../models/user/kyc/KYC.js"
import { String } from '../utils/Constant.js';

/**
 * GET /api/kyc/status
 */
export const getKYCStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log(`📋 Checking KYC status for user: ${userId}`);

    const kycQuery = `
      SELECT 
        k.*,
        COALESCE(up.is_kyc_verified, false) as is_kyc_verified,
        u.role
      FROM kyc k
      JOIN users u ON k.user_id = u.id
      LEFT JOIN user_profiles up ON k.user_id = up.user_id
      WHERE k.user_id = $1
    `;
    
    const result = await pool.query(kycQuery, [userId]);

    const myResultFind = await KYC.find()
    // console.log(`FIND===================> ${JSON.stringify(myResultFind, null, 2) }`);
    
    const myResultPop = await KYC.populate([
      { model: String.USER_MODEL, attributes: ["role", "status", "id"] },
    ]).find()
    console.log(`POP ===================> ${JSON.stringify(myResultPop, null, 2) }`);
    

    if (result.rows.length === 0) {
      return res.json(ApiResponse.success({
        kycExists: false,
        isVerified: false,
        message: 'KYC not completed yet'
      }));
    }

    const kyc = result.rows[0];

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

    // Validate required files
    if (!req.files || !req.files.profilePhoto) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Profile photo is required'));
    }

    if (!req.files.documentFront) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Document front image is required'));
    }

    // Upload files
    console.log('📤 Uploading profile photo...');
    const profileUrl = await uploadToCloudinary(
      req.files.profilePhoto.tempFilePath,
      'kyc/profiles',
      'image'
    );

    console.log('📤 Uploading document front...');
    const docFrontUrl = await uploadToCloudinary(
      req.files.documentFront.tempFilePath,
      'kyc/documents',
      'image'
    );

    let docBackUrl = null;
    if (req.files.documentBack) {
      console.log('📤 Uploading document back...');
      docBackUrl = await uploadToCloudinary(
        req.files.documentBack.tempFilePath,
        'kyc/documents',
        'image'
      );
    }

    // Check if KYC record exists
    const existingKyc = await client.query(
      'SELECT id FROM kyc WHERE user_id = $1',
      [userId]
    );

    let kycId;

    if (existingKyc.rows.length === 0) {
      console.log('ℹ️  No KYC record found - creating new one');
      
      const createKycQuery = `
        INSERT INTO kyc (
          user_id, first_name, last_name, date_of_birth, address, 
          profile_url, phone_number, email, gender, 
          national_identity_number, blood_group
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;

      const createResult = await client.query(createKycQuery, [
        userId,
        firstName,
        lastName,
        dateOfBirth,
        address,
        profileUrl,
        phoneNumber,
        email,
        gender,
        nationalIdentityNumber,
        bloodGroup
      ]);

      kycId = createResult.rows[0].id;
      console.log('✅ KYC record created:', kycId);

    } else {
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

      const updateResult = await client.query(updateKycQuery, [
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

      kycId = updateResult.rows[0].id;
      console.log('✅ KYC record updated:', kycId);
    }

    // Save documents
    await client.query('DELETE FROM kyc_documents WHERE kyc_id = $1', [kycId]);

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

    console.log('✅ Documents saved');

    // Create or check user_profiles
    const checkProfileQuery = `SELECT user_id FROM user_profiles WHERE user_id = $1`;
    const profileExists = await client.query(checkProfileQuery, [userId]);

    if (profileExists.rows.length === 0) {
      const createProfileQuery = `
        INSERT INTO user_profiles (
          user_id,
          is_email_verified,
          is_phone_verified,
          is_kyc_verified
        ) VALUES ($1, true, true, false)
      `;
      
      await client.query(createProfileQuery, [userId]);
      console.log('✅ user_profiles created');
    }

    // Get user role
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    const userRole = userResult.rows.length > 0 ? userResult.rows[0].role : null;

    await client.query('COMMIT');

    console.log('🎉 KYC completion successful');
    
    // ✅ EMIT SOCKET EVENT TO ADMIN
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Emitting new KYC submission to admins...');
      io.emit('kyc:new_submission', {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: userRole,
        timestamp: new Date()
      });
      console.log('✅ Socket event emitted: kyc:new_submission');
    }

    res.status(200).json(ApiResponse.success({
      kycId: kycId,
      message: 'KYC submitted successfully. Waiting for admin approval.'
    }, 'KYC_SUBMITTED'));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Complete KYC error:', error);
    
    if (error.code === '23505') {
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
 */
export const verifyKYC = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { userId } = req.params;
    const { approved, remarks } = req.body;

    console.log(`🔍 Admin verifying KYC for user: ${userId}, Approved: ${approved}`);

    if (!approved) {
      await client.query(`
        UPDATE user_profiles 
        SET is_kyc_verified = false,
            updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);

      await client.query('COMMIT');

      // ✅ EMIT SOCKET EVENT TO USER
      const io = req.app.get('io');
      if (io) {
        console.log('📡 Emitting KYC rejection to user:', userId);
        io.to(`user:${userId}`).emit('kyc:status_update', {
          approved: false,
          message: remarks || 'Your KYC has been rejected',
          timestamp: new Date()
        });
      }

      return res.json(ApiResponse.success({
        message: `KYC rejected. ${remarks || ''}`
      }, 'KYC_REJECTED'));
    }

    await client.query(`
      UPDATE user_profiles 
      SET is_kyc_verified = true,
          updated_at = NOW()
      WHERE user_id = $1
    `, [userId]);

    console.log('✅ KYC VERIFIED');

    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userRole = userResult.rows[0].role;

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

        console.log('🚗 Driver profile created!');
      }
    }

    await client.query('COMMIT');

    // ✅ EMIT SOCKET EVENT TO USER
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Emitting KYC approval to user:', userId);
      io.to(`user:${userId}`).emit('kyc:status_update', {
        approved: true,
        message: 'Your KYC has been approved! You can now start driving.',
        timestamp: new Date()
      });
    }

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
        COALESCE(up.is_kyc_verified, false) as is_kyc_verified,
        COUNT(kd.id) as document_count
      FROM kyc k
      JOIN users u ON k.user_id = u.id
      LEFT JOIN user_profiles up ON k.user_id = up.user_id
      LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
      WHERE COALESCE(up.is_kyc_verified, false) = false
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
 */
export const getKYCDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const kycQuery = `
      SELECT 
        k.*, 
        COALESCE(up.is_kyc_verified, false) as is_kyc_verified, 
        u.role
      FROM kyc k
      JOIN users u ON k.user_id = u.id
      LEFT JOIN user_profiles up ON k.user_id = up.user_id
      WHERE k.user_id = $1
    `;
    
    const kycResult = await pool.query(kycQuery, [userId]);

    if (kycResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('KYC not found'));
    }

    const kyc = kycResult.rows[0];

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