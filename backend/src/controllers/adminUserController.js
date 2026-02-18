

// import { pool } from '../database/DBConnection.js';
// import { ApiResponse } from '../utils/ApiResponse.js';
// import bcrypt from 'bcryptjs';

// /**
//  * GET /api/admin/users
//  * Get all users with their KYC info
//  */
// export const getAllUsers = async (req, res, next) => {
//   try {
//     const query = `
//       SELECT 
//         u.id,
//         u.role,
//         u.status as user_status,
//         u.created_at,
//         u.updated_at,
//         -- KYC data
//         k.id as kyc_id,
//         k.email,
//         k.first_name,
//         k.last_name,
//         k.phone_number,
//         k.profile_url,
//         k.date_of_birth,
//         k.gender,
//         k.address,
//         k.national_identity_number,
//         k.blood_group,
//         -- User profiles
//         up.is_email_verified,
//         up.is_phone_verified,
//         up.is_kyc_verified,
//         up.kyc_verified_at,
//         -- KYC documents
//         kd.id as kyc_doc_id,
//         kd.citizenship_front,
//         kd.citizenship_back,
//         kd.status as kyc_doc_status,
//         kd.rejection_reason as kyc_rejection_reason,
//         kd.reviewed_at as kyc_reviewed_at,
//         -- Auth credentials
//         ac.email as auth_email,
//         ac.phone as auth_phone,
//         ac.is_email_verified as auth_email_verified,
//         ac.is_phone_verified as auth_phone_verified,
//         ac.last_login_at,
//         -- Computed KYC status
//         CASE 
//           WHEN kd.status = 'approved' THEN 'verified'
//           WHEN kd.status = 'pending' THEN 'pending'
//           WHEN kd.status = 'rejected' THEN 'rejected'
//           WHEN k.id IS NOT NULL THEN 'submitted'
//           ELSE 'not_submitted'
//         END as kyc_status
//       FROM users u
//       LEFT JOIN kyc k ON u.id = k.user_id
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
//       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
//       ORDER BY u.created_at DESC
//     `;

//     const result = await pool.query(query);

//     res.json(ApiResponse.success({
//       count: result.rows.length,
//       users: result.rows
//     }));

//   } catch (error) {
//     console.error('❌ Get all users error:', error);
//     next(error);
//   }
// };

// /**
//  * GET /api/admin/users/:userId
//  * Get single user details
//  */
// export const getUserById = async (req, res, next) => {
//   try {
//     const { userId } = req.params;

//     const query = `
//       SELECT 
//         u.id,
//         u.role,
//         u.status as user_status,
//         u.created_at,
//         u.updated_at,
//         -- KYC data
//         k.id as kyc_id,
//         k.email,
//         k.first_name,
//         k.last_name,
//         k.phone_number,
//         k.date_of_birth,
//         k.gender,
//         k.address,
//         k.profile_url,
//         k.national_identity_number,
//         k.blood_group,
//         k.created_at as kyc_created_at,
//         k.updated_at as kyc_updated_at,
//         -- User profiles
//         up.is_email_verified,
//         up.is_phone_verified,
//         up.is_kyc_verified,
//         up.kyc_verified_at,
//         -- KYC documents
//         kd.id as kyc_doc_id,
//         kd.citizenship_front,
//         kd.citizenship_back,
//         kd.status as kyc_doc_status,
//         kd.rejection_reason as kyc_rejection_reason,
//         kd.reviewed_by as kyc_reviewed_by,
//         kd.reviewed_at as kyc_reviewed_at,
//         -- Auth credentials
//         ac.email as auth_email,
//         ac.phone as auth_phone,
//         ac.is_email_verified as auth_email_verified,
//         ac.is_phone_verified as auth_phone_verified,
//         ac.last_login_at,
//         -- Computed KYC status
//         CASE 
//           WHEN kd.status = 'approved' THEN 'verified'
//           WHEN kd.status = 'pending' THEN 'pending'
//           WHEN kd.status = 'rejected' THEN 'rejected'
//           WHEN k.id IS NOT NULL THEN 'submitted'
//           ELSE 'not_submitted'
//         END as kyc_status
//       FROM users u
//       LEFT JOIN kyc k ON u.id = k.user_id
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
//       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
//       WHERE u.id = $1
//     `;

//     const result = await pool.query(query, [userId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json(ApiResponse.error('User not found'));
//     }

//     res.json(ApiResponse.success({ user: result.rows[0] }));

//   } catch (error) {
//     console.error('❌ Get user by ID error:', error);
//     next(error);
//   }
// };

// /**
//  * POST /api/admin/users
//  * Create new user (Admin only)
//  */
// export const createUser = async (req, res, next) => {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const { email, role, firstName, lastName, phoneNumber } = req.body;

//     // Validate required fields
//     if (!email || !role) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(
//         ApiResponse.error('Email and role are required')
//       );
//     }

//     // Check if email already exists in auth_credentials
//     const existingEmail = await client.query(
//       'SELECT user_id FROM auth_credentials WHERE email = $1',
//       [email]
//     );

//     if (existingEmail.rows.length > 0) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(
//         ApiResponse.error('Email already exists')
//       );
//     }

//     // Generate temporary password
//     const tempPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);

//     // Create user (role + status)
//     const userResult = await client.query(
//       `INSERT INTO users (role, status)
//        VALUES ($1, 'active')
//        RETURNING id, role, status, created_at`,
//       [role]
//     );

//     const userId = userResult.rows[0].id;

//     // Create auth credentials with email
//     await client.query(
//       `INSERT INTO auth_credentials (user_id, email, password_hash, is_email_verified)
//        VALUES ($1, $2, $3, true)`,
//       [userId, email, hashedPassword]
//     );

//     // Create KYC record (email is required in KYC table too)
//     await client.query(
//       `INSERT INTO kyc (
//         user_id, email, first_name, last_name, phone_number,
//         date_of_birth, address, profile_url, gender, national_identity_number
//       )
//        VALUES ($1, $2, $3, $4, $5, '2000-01-01', 'N/A', 'https://via.placeholder.com/150', 'male', 'TEMP-' || $1)`,
//       [userId, email, firstName || 'User', lastName || 'Admin', phoneNumber || '0000000000']
//     );

//     // Create wallet
//     await client.query(
//       `INSERT INTO wallets (user_id, balance)
//        VALUES ($1, 0)`,
//       [userId]
//     );

//     // Create user profile
//     await client.query(
//       `INSERT INTO user_profiles (user_id, is_email_verified)
//        VALUES ($1, true)`,
//       [userId]
//     );

//     await client.query('COMMIT');

//     console.log(`✅ User created: ${email} with temp password: ${tempPassword}`);

//     res.status(201).json(ApiResponse.success({
//       user: { ...userResult.rows[0], email },
//       tempPassword: tempPassword,
//       message: `User created successfully. Temporary password: ${tempPassword}`
//     }));

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Create user error:', error);
//     next(error);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * PUT /api/admin/users/:userId
//  * Update user (can update both users table and KYC table)
//  */
// export const updateUser = async (req, res, next) => {
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');

//     const { userId } = req.params;
//     const { 
//       role, status,
//       firstName, lastName, email, phoneNumber,
//       dateOfBirth, gender, address, nationalIdentityNumber, bloodGroup
//     } = req.body;

//     // Update users table
//     const userUpdates = [];
//     const userValues = [];
//     let userParamCount = 1;

//     if (role !== undefined) {
//       userUpdates.push(`role = $${userParamCount}`);
//       userValues.push(role);
//       userParamCount++;
//     }

//     if (status !== undefined) {
//       userUpdates.push(`status = $${userParamCount}`);
//       userValues.push(status);
//       userParamCount++;
//     }

//     if (userUpdates.length > 0) {
//       userUpdates.push(`updated_at = NOW()`);
//       userValues.push(userId);

//       const userQuery = `
//         UPDATE users 
//         SET ${userUpdates.join(', ')}
//         WHERE id = $${userParamCount}
//         RETURNING id, role, status, updated_at
//       `;

//       await client.query(userQuery, userValues);
//     }

//     // Update KYC table
//     const kycUpdates = [];
//     const kycValues = [];
//     let kycParamCount = 1;

//     if (firstName !== undefined) {
//       kycUpdates.push(`first_name = $${kycParamCount}`);
//       kycValues.push(firstName);
//       kycParamCount++;
//     }

//     if (lastName !== undefined) {
//       kycUpdates.push(`last_name = $${kycParamCount}`);
//       kycValues.push(lastName);
//       kycParamCount++;
//     }

//     if (email !== undefined) {
//       kycUpdates.push(`email = $${kycParamCount}`);
//       kycValues.push(email);
//       kycParamCount++;
//     }

//     if (phoneNumber !== undefined) {
//       kycUpdates.push(`phone_number = $${kycParamCount}`);
//       kycValues.push(phoneNumber);
//       kycParamCount++;
//     }

//     if (dateOfBirth !== undefined) {
//       kycUpdates.push(`date_of_birth = $${kycParamCount}`);
//       kycValues.push(dateOfBirth);
//       kycParamCount++;
//     }

//     if (gender !== undefined) {
//       kycUpdates.push(`gender = $${kycParamCount}`);
//       kycValues.push(gender);
//       kycParamCount++;
//     }

//     if (address !== undefined) {
//       kycUpdates.push(`address = $${kycParamCount}`);
//       kycValues.push(address);
//       kycParamCount++;
//     }

//     if (nationalIdentityNumber !== undefined) {
//       kycUpdates.push(`national_identity_number = $${kycParamCount}`);
//       kycValues.push(nationalIdentityNumber);
//       kycParamCount++;
//     }

//     if (bloodGroup !== undefined) {
//       kycUpdates.push(`blood_group = $${kycParamCount}`);
//       kycValues.push(bloodGroup);
//       kycParamCount++;
//     }

//     if (kycUpdates.length > 0) {
//       kycUpdates.push(`updated_at = NOW()`);
//       kycValues.push(userId);

//       const kycQuery = `
//         UPDATE kyc 
//         SET ${kycUpdates.join(', ')}
//         WHERE user_id = $${kycParamCount}
//         RETURNING *
//       `;

//       await client.query(kycQuery, kycValues);
//     }

//     // Update auth_credentials email if email changed
//     if (email !== undefined) {
//       await client.query(
//         `UPDATE auth_credentials SET email = $1, updated_at = NOW() WHERE user_id = $2`,
//         [email, userId]
//       );
//     }

//     await client.query('COMMIT');

//     // Fetch updated user
//     const updatedUser = await pool.query(
//       `SELECT 
//         u.id, u.role, u.status as user_status, u.updated_at,
//         k.email, k.first_name, k.last_name, k.phone_number,
//         k.date_of_birth, k.gender, k.address, k.national_identity_number, k.blood_group
//       FROM users u
//       LEFT JOIN kyc k ON u.id = k.user_id
//       WHERE u.id = $1`,
//       [userId]
//     );

//     res.json(ApiResponse.success({
//       user: updatedUser.rows[0],
//       message: 'User updated successfully'
//     }));

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Update user error:', error);
//     next(error);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * DELETE /api/admin/users/:userId
//  * Delete user (CASCADE deletes related records)
//  */
// export const deleteUser = async (req, res, next) => {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const { userId } = req.params;

//     // Get user email before deleting
//     const userCheck = await client.query(
//       'SELECT k.email FROM users u LEFT JOIN kyc k ON u.id = k.user_id WHERE u.id = $1',
//       [userId]
//     );

//     if (userCheck.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json(ApiResponse.error('User not found'));
//     }

//     const userEmail = userCheck.rows[0].email || 'Unknown';

//     // Delete user (CASCADE will delete related records)
//     await client.query('DELETE FROM users WHERE id = $1', [userId]);

//     await client.query('COMMIT');

//     console.log(`✅ User deleted: ${userEmail}`);

//     res.json(ApiResponse.success({
//       message: `User ${userEmail} deleted successfully`
//     }));

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Delete user error:', error);
//     next(error);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * GET /api/admin/users/stats
//  * Get user statistics
//  */
// export const getUserStats = async (req, res, next) => {
//   try {
//     const statsQuery = `
//       SELECT 
//         COUNT(*) as total_users,
//         COUNT(CASE WHEN role = 'driver' THEN 1 END) as total_drivers,
//         COUNT(CASE WHEN role = 'rider' THEN 1 END) as total_riders,
//         COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
//         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
//       FROM users
//     `;

//     const result = await pool.query(statsQuery);

//     res.json(ApiResponse.success({
//       users: result.rows[0]
//     }));

//   } catch (error) {
//     console.error('❌ Get user stats error:', error);
//     next(error);
//   }
// };

// export default {
//   getAllUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   deleteUser,
//   getUserStats
// };
import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * Get all users with their KYC info
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.role,
        u.status as user_status,
        u.created_at,
        u.updated_at,
        -- KYC data
        k.id as kyc_id,
        k.email,
        k.first_name,
        k.last_name,
        k.phone_number,
        k.profile_url,
        k.date_of_birth,
        k.gender,
        k.address,
        k.national_identity_number,
        k.blood_group,
        -- User profiles
        up.is_email_verified,
        up.is_phone_verified,
        up.is_kyc_verified,
        up.kyc_verified_at,
        -- KYC documents (FIXED COLUMN NAMES)
        kd.id as kyc_doc_id,
        kd.document_front_url,
        kd.document_back_url,
        kd.document_type,
        -- Auth credentials
        ac.email as auth_email,
        ac.phone as auth_phone,
        ac.is_email_verified as auth_email_verified,
        ac.is_phone_verified as auth_phone_verified,
        ac.last_login_at,
        -- Computed KYC status (FIXED LOGIC)
        CASE 
          WHEN up.is_kyc_verified = TRUE THEN 'verified'
          WHEN k.id IS NOT NULL AND kd.id IS NOT NULL THEN 'submitted'
          WHEN k.id IS NOT NULL THEN 'pending'
          ELSE 'not_submitted'
        END as kyc_status
      FROM users u
      LEFT JOIN kyc k ON u.id = k.user_id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
      LEFT JOIN auth_credentials ac ON u.id = ac.user_id
      ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query);

    res.json(ApiResponse.success({
      count: result.rows.length,
      users: result.rows
    }));

  } catch (error) {
    console.error('❌ Get all users error:', error);
    next(error);
  }
};

/**
 * GET /api/admin/users/:userId
 * Get single user details
 */
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        u.id,
        u.role,
        u.status as user_status,
        u.created_at,
        u.updated_at,
        -- KYC data
        k.id as kyc_id,
        k.email,
        k.first_name,
        k.last_name,
        k.phone_number,
        k.date_of_birth,
        k.gender,
        k.address,
        k.profile_url,
        k.national_identity_number,
        k.blood_group,
        k.created_at as kyc_created_at,
        k.updated_at as kyc_updated_at,
        -- User profiles
        up.is_email_verified,
        up.is_phone_verified,
        up.is_kyc_verified,
        up.kyc_verified_at,
        -- KYC documents (FIXED COLUMN NAMES)
        kd.id as kyc_doc_id,
        kd.document_front_url,
        kd.document_back_url,
        kd.document_type,
        kd.document_number,
        kd.issued_date,
        kd.expiry_date,
        -- Auth credentials
        ac.email as auth_email,
        ac.phone as auth_phone,
        ac.is_email_verified as auth_email_verified,
        ac.is_phone_verified as auth_phone_verified,
        ac.last_login_at,
        -- Computed KYC status (FIXED LOGIC)
        CASE 
          WHEN up.is_kyc_verified = TRUE THEN 'verified'
          WHEN k.id IS NOT NULL AND kd.id IS NOT NULL THEN 'submitted'
          WHEN k.id IS NOT NULL THEN 'pending'
          ELSE 'not_submitted'
        END as kyc_status
      FROM users u
      LEFT JOIN kyc k ON u.id = k.user_id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN kyc_documents kd ON k.id = kd.kyc_id
      LEFT JOIN auth_credentials ac ON u.id = ac.user_id
      WHERE u.id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    res.json(ApiResponse.success({ user: result.rows[0] }));

  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    next(error);
  }
};

/**
 * POST /api/admin/users
 * Create new user (Admin only)
 */
export const createUser = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { email, role, firstName, lastName, phoneNumber } = req.body;

    // Validate required fields
    if (!email || !role) {
      await client.query('ROLLBACK');
      return res.status(400).json(
        ApiResponse.error('Email and role are required')
      );
    }

    // Check if email already exists in auth_credentials
    const existingEmail = await client.query(
      'SELECT user_id FROM auth_credentials WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json(
        ApiResponse.error('Email already exists')
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user (role + status)
    const userResult = await client.query(
      `INSERT INTO users (role, status)
       VALUES ($1, 'active')
       RETURNING id, role, status, created_at`,
      [role]
    );

    const userId = userResult.rows[0].id;

    // Create auth credentials with email
    await client.query(
      `INSERT INTO auth_credentials (user_id, email, password_hash, is_email_verified)
       VALUES ($1, $2, $3, true)`,
      [userId, email, hashedPassword]
    );

    // Create KYC record (email is required in KYC table too)
    await client.query(
      `INSERT INTO kyc (
        user_id, email, first_name, last_name, phone_number,
        date_of_birth, address, profile_url, gender, national_identity_number
      )
       VALUES ($1, $2, $3, $4, $5, '2000-01-01', 'N/A', 'https://via.placeholder.com/150', 'male', 'TEMP-' || $1)`,
      [userId, email, firstName || 'User', lastName || 'Admin', phoneNumber || '0000000000']
    );

    // Create wallet
    await client.query(
      `INSERT INTO wallets (user_id, balance)
       VALUES ($1, 0)`,
      [userId]
    );

    // Create user profile
    await client.query(
      `INSERT INTO user_profiles (user_id, is_email_verified)
       VALUES ($1, true)`,
      [userId]
    );

    await client.query('COMMIT');

    console.log(`✅ User created: ${email} with temp password: ${tempPassword}`);

    res.status(201).json(ApiResponse.success({
      user: { ...userResult.rows[0], email },
      tempPassword: tempPassword,
      message: `User created successfully. Temporary password: ${tempPassword}`
    }));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Create user error:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * PUT /api/admin/users/:userId
 * Update user (can update both users table and KYC table)
 */
export const updateUser = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { userId } = req.params;
    const { 
      role, status,
      firstName, lastName, email, phoneNumber,
      dateOfBirth, gender, address, nationalIdentityNumber, bloodGroup
    } = req.body;

    // Update users table
    const userUpdates = [];
    const userValues = [];
    let userParamCount = 1;

    if (role !== undefined) {
      userUpdates.push(`role = $${userParamCount}`);
      userValues.push(role);
      userParamCount++;
    }

    if (status !== undefined) {
      userUpdates.push(`status = $${userParamCount}`);
      userValues.push(status);
      userParamCount++;
    }

    if (userUpdates.length > 0) {
      userUpdates.push(`updated_at = NOW()`);
      userValues.push(userId);

      const userQuery = `
        UPDATE users 
        SET ${userUpdates.join(', ')}
        WHERE id = $${userParamCount}
        RETURNING id, role, status, updated_at
      `;

      await client.query(userQuery, userValues);
    }

    // Update KYC table
    const kycUpdates = [];
    const kycValues = [];
    let kycParamCount = 1;

    if (firstName !== undefined) {
      kycUpdates.push(`first_name = $${kycParamCount}`);
      kycValues.push(firstName);
      kycParamCount++;
    }

    if (lastName !== undefined) {
      kycUpdates.push(`last_name = $${kycParamCount}`);
      kycValues.push(lastName);
      kycParamCount++;
    }

    if (email !== undefined) {
      kycUpdates.push(`email = $${kycParamCount}`);
      kycValues.push(email);
      kycParamCount++;
    }

    if (phoneNumber !== undefined) {
      kycUpdates.push(`phone_number = $${kycParamCount}`);
      kycValues.push(phoneNumber);
      kycParamCount++;
    }

    if (dateOfBirth !== undefined) {
      kycUpdates.push(`date_of_birth = $${kycParamCount}`);
      kycValues.push(dateOfBirth);
      kycParamCount++;
    }

    if (gender !== undefined) {
      kycUpdates.push(`gender = $${kycParamCount}`);
      kycValues.push(gender);
      kycParamCount++;
    }

    if (address !== undefined) {
      kycUpdates.push(`address = $${kycParamCount}`);
      kycValues.push(address);
      kycParamCount++;
    }

    if (nationalIdentityNumber !== undefined) {
      kycUpdates.push(`national_identity_number = $${kycParamCount}`);
      kycValues.push(nationalIdentityNumber);
      kycParamCount++;
    }

    if (bloodGroup !== undefined) {
      kycUpdates.push(`blood_group = $${kycParamCount}`);
      kycValues.push(bloodGroup);
      kycParamCount++;
    }

    if (kycUpdates.length > 0) {
      kycUpdates.push(`updated_at = NOW()`);
      kycValues.push(userId);

      const kycQuery = `
        UPDATE kyc 
        SET ${kycUpdates.join(', ')}
        WHERE user_id = $${kycParamCount}
        RETURNING *
      `;

      await client.query(kycQuery, kycValues);
    }

    // Update auth_credentials email if email changed
    if (email !== undefined) {
      await client.query(
        `UPDATE auth_credentials SET email = $1, updated_at = NOW() WHERE user_id = $2`,
        [email, userId]
      );
    }

    await client.query('COMMIT');

    // Fetch updated user
    const updatedUser = await pool.query(
      `SELECT 
        u.id, u.role, u.status as user_status, u.updated_at,
        k.email, k.first_name, k.last_name, k.phone_number,
        k.date_of_birth, k.gender, k.address, k.national_identity_number, k.blood_group
      FROM users u
      LEFT JOIN kyc k ON u.id = k.user_id
      WHERE u.id = $1`,
      [userId]
    );

    res.json(ApiResponse.success({
      user: updatedUser.rows[0],
      message: 'User updated successfully'
    }));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Update user error:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Delete user (CASCADE deletes related records)
 */
export const deleteUser = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { userId } = req.params;

    // Get user email before deleting
    const userCheck = await client.query(
      'SELECT k.email FROM users u LEFT JOIN kyc k ON u.id = k.user_id WHERE u.id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    const userEmail = userCheck.rows[0].email || 'Unknown';

    // Delete user (CASCADE will delete related records)
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    console.log(`✅ User deleted: ${userEmail}`);

    res.json(ApiResponse.success({
      message: `User ${userEmail} deleted successfully`
    }));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Delete user error:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * GET /api/admin/users/stats
 * Get user statistics
 */
export const getUserStats = async (req, res, next) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'driver' THEN 1 END) as total_drivers,
        COUNT(CASE WHEN role = 'rider' THEN 1 END) as total_riders,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
      FROM users
    `;

    const result = await pool.query(statsQuery);

    res.json(ApiResponse.success({
      users: result.rows[0]
    }));

  } catch (error) {
    console.error('❌ Get user stats error:', error);
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
};