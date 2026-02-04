

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import UserModel from "../models/user/User.js";
import AuthCredentialModel from "../models/user/auth_credentials/AuthCredential.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Constant } from "../utils/Constant.js";
import UserProfile from "../models/user/user_profile/UserProfile.js"

import { pool } from '../database/DBConnection.js';
import KYC from "../models/user/kyc/KYC.js";
import KYCDocument from '../models/user/kyc_document/KYCDocument.js';
/**
 * REGISTER
 * Everyone registers as a USER first
 * Drivers are just users with role="driver"
 */
// export const register = async (req, res, next) => {
//   console.log("working till here ...")

//   try {
//     const { first_name, last_name, email, password, phone_number } = req.body;

//     // 1️⃣ Check email uniqueness
//     const existing = await AuthCredentialModel.findOne({ email });
//     if (existing) {
//       return res
//         .status(400)
//         .json(ApiResponse.error("EMAIL_ALREADY_EXISTS"));
//     }
//     // 2️⃣ Create user identity
//     const user = await UserModel.create({
//       role: "rider",
//       status: "active"
//     });

//     // 3️⃣ Create credentials
//     const password_hash = await bcrypt.hash(password, 10);

//     await AuthCredentialModel.create({
//       user_id: user.id,
//       email,
//       password_hash
//     });

//     await KYC.create({
//       user_id: user.id,
//       first_name,
//       last_name,
//       phone_number,
//       email,
//     });
    
//     await UserProfile.create({
//       user_id: user.id,
//       is_kyc_verified: false,
//       is_email_verified: true,
//       is_phone_verified: true
      
//     });

//     res.status(201).json(
//       ApiResponse.success(
//         {
//           id: user.id,
//           email,
//           role: user.role
//         },
//         "USER_REGISTERED"
//       )
//     );
//   } catch (err) {
//     next(err);
//   }
// };




/**
 * REGISTER
 * User selects role (rider/driver) on frontend
 * Basic KYC record created with placeholders
 */
export const register = async (req, res, next) => {
  console.log("📝 Registration started...");

  try {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      phone_number,
      role = "rider" // Comes from frontend role selection
    } = req.body;

    console.log(`👤 Registering as: ${role}`);

    // Validate role
    if (!['rider', 'driver'].includes(role)) {
      return res.status(400).json(
        ApiResponse.error("Invalid role. Must be 'rider' or 'driver'")
      );
    }

    // Check email uniqueness
    const existing = await AuthCredentialModel.findOne({ email });
    if (existing) {
      return res.status(400).json(
        ApiResponse.error("EMAIL_ALREADY_EXISTS")
      );
    }

    // Create user with selected role
    const user = await UserModel.create({
      role: role,
      status: "active"
    });

    console.log(`✅ User created with ID: ${user.id}, Role: ${role}`);

    // Create credentials
    const password_hash = await bcrypt.hash(password, 10);

    await AuthCredentialModel.create({
      user_id: user.id,
      email,
      password_hash
    });

    console.log('✅ Auth credentials created');

    // Create minimal KYC record (placeholders - will be completed in KYC page)
    await KYC.create({
      user_id: user.id,
      first_name: first_name || '',
      last_name: last_name || '',
      phone_number: phone_number || '',
      email: email,
      // Placeholders (will be updated in KYC completion):
      date_of_birth: '2000-01-01',
      address: 'To be updated',
      profile_url: 'https://via.placeholder.com/150',
      gender: 'male',
      national_identity_number: `TEMP-${user.id.substring(0, 8)}`,
      blood_group: 'O+'
    });

    console.log('✅ Minimal KYC record created (to be completed later)');
    
    // Create user profile
    await UserProfile.create({
      user_id: user.id,
      is_kyc_verified: false,
      is_email_verified: true,
      is_phone_verified: true
    });

    console.log('✅ User profile created');

    res.status(201).json(
      ApiResponse.success(
        {
          id: user.id,
          email,
          role: role,
          kycRequired: true,
          message: role === 'driver' 
            ? 'Registration successful! Please complete KYC to start driving.' 
            : 'Registration successful! Complete KYC for full access.'
        },
        "USER_REGISTERED"
      )
    );
  } catch (err) {
    console.error('❌ Registration error:', err);
    next(err);
  }
};

/**
 * LOGIN
 * Returns user info + KYC status + driver ID (if driver)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Login attempt: ${email}`);

    // Get user with credentials
    const userQuery = `
      SELECT u.*, ac.password_hash, ac.email
      FROM users u
      JOIN auth_credentials ac ON u.id = ac.user_id
      WHERE ac.email = $1
    `;
    
    const userResult = await pool.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check KYC status
    const kycQuery = `
      SELECT 
        up.is_kyc_verified,
        k.date_of_birth,
        k.address,
        k.profile_url,
        k.national_identity_number
      FROM user_profiles up
      JOIN kyc k ON up.user_id = k.user_id
      WHERE up.user_id = $1
    `;
    const kycResult = await pool.query(kycQuery, [user.id]);
    
    let isKycVerified = false;
    let isKycComplete = false;
    
    if (kycResult.rows.length > 0) {
      const kycData = kycResult.rows[0];
      isKycVerified = kycData.is_kyc_verified;
      
      // Check if KYC is complete (not placeholder values)
      isKycComplete = 
        kycData.date_of_birth !== '2000-01-01' &&
        kycData.address !== 'To be updated' &&
        kycData.profile_url !== 'https://via.placeholder.com/150' &&
        !kycData.national_identity_number.startsWith('TEMP-');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET_KEY || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // If driver, get driver database ID
    let driverId = null;
    if (user.role === 'driver') {
      const driverQuery = `SELECT id FROM drivers WHERE user_id = $1`;
      const driverResult = await pool.query(driverQuery, [user.id]);
      
      if (driverResult.rows.length > 0) {
        driverId = driverResult.rows[0].id;
        console.log('✅ Driver ID found:', driverId);
      } else {
        console.log('ℹ️  No driver profile yet (KYC not verified)');
      }
    }

    console.log('✅ Login successful');
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('KYC Complete:', isKycComplete);
    console.log('KYC Verified:', isKycVerified);
    console.log('Driver ID:', driverId);

    res.status(200).json({
      success: true,
      message: 'LOGIN_SUCCESS',
      token: token,
      userId: user.id,
      role: user.role,
      driverId: driverId,
      isKycComplete: isKycComplete,
      isKycVerified: isKycVerified,
      requiresKyc: !isKycComplete || !isKycVerified
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR'
    });
  }
};

//old version
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Get user with credentials
//     const userQuery = `
//       SELECT u.*, ac.password_hash, ac.email
//       FROM users u
//       JOIN auth_credentials ac ON u.id = ac.user_id
//       WHERE ac.email = $1
//     `;
    
//     const userResult = await pool.query(userQuery, [email]);
    
//     if (userResult.rows.length === 0) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const user = userResult.rows[0];

//     // Verify password
//     const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
//     if (!isValidPassword) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Generate token
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.ACCESS_TOKEN_SECRET_KEY,
//       { expiresIn: '24h' }
//     );

//     // If driver, get driver database ID
//     let driverId = null;
//     if (user.role === 'driver') {
//       const driverQuery = `SELECT id FROM drivers WHERE user_id = $1`;
//       const driverResult = await pool.query(driverQuery, [user.id]);
      
//       if (driverResult.rows.length > 0) {
//         driverId = driverResult.rows[0].id;
//         console.log('✅ Driver ID found:', driverId);
//       } else {
//         console.log('⚠️ No driver record found for user:', user.id);
//       }
//     }

//     console.log('✅ Login successful');
//     console.log('User ID:', user.id);
//     console.log('Role:', user.role);
//     console.log('Driver ID:', driverId);

//     res.status(200).json({
//       success: true,
//       message: 'LOGIN_SUCCESS',
//       token: token,
//       userId: user.id,
//       role: user.role,
//       driverId: driverId  // THIS IS CRITICAL!
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR'
//     });
//   }
// };