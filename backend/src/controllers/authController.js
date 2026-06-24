

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import UserModel from "../models/user/User.js";
import AuthCredentialModel from "../models/user/auth_credentials/AuthCredential.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Constant } from "../utils/Constant.js";
import UserProfile from "../models/user/user_profile/UserProfile.js"

import { pool } from '../database/DBConnection.js';
import Wallet from "../models/finance/transaction/wallet/Wallet.js";
import { LedgerService } from './../application/services/LedgerService.js';
import { generateOTP, storeOTP, verifyOTP, sendOTP } from "../infrastructure/smsClient.js";
import { RefreshTokenService } from "../application/services/RefreshTokenService.js";
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
 * Users can select role (rider/driver) during registration
 * KYC completion happens separately after registration
 */
export const register = async (req, res, next) => {
  console.log("📝 Registration started...");

  try {
    const {
      email,
      password,
      role = "rider"
    } = req.body;

    console.log(`👤 Registering as: ${role}`);

    // Validate role
    if (!['rider', 'driver'].includes(role)) {
      return res.status(400).json(
        ApiResponse.error("Invalid role. Must be 'rider' or 'driver'")
      );
    }

    // 1️⃣ Check email uniqueness
    const existing = await AuthCredentialModel.findOne({ email });
    if (existing) {
      return res.status(400).json(
        ApiResponse.error("EMAIL_ALREADY_EXISTS")
      );
    }

    // 2️⃣ Create user identity with selected role
    const user = await UserModel.create({
      role: role,
      status: "active"
    });
    await Wallet.create({
      user_id: user.id,
      balance: 0,
      locked_balance: 0
    });
    console.log('💰 Wallet created for user');
    await LedgerService.getOrCreateAccount({
      ownerType: 'user',
      ownerId: user.id,
      accountType: 'wallet'
    });

    console.log(`✅ User created with ID: ${user.id}, Role: ${role}`);

    // 3️⃣ Create credentials
    const password_hash = await bcrypt.hash(password, 10);

    await AuthCredentialModel.create({
      user_id: user.id,
      email,
      password_hash
    });

    console.log('✅ Auth credentials created');

    // KYC is NOT created here — user submits it via POST /api/kyc/complete
    // Login handles the case where no KYC row exists (isKycComplete = false)

    console.log('✅ Registration completed successfully');

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

    // Check KYC status (if user_profiles exists for this user)
    const kycQuery = `
      SELECT 
        up.is_kyc_verified,
        k.date_of_birth,
        k.address,
        k.profile_url,
        k.national_identity_number
      FROM kyc k
      LEFT JOIN user_profiles up ON k.user_id = up.user_id
      WHERE k.user_id = $1
    `;
    const kycResult = await pool.query(kycQuery, [user.id]);
    
    let isKycVerified = false;
    let isKycComplete = false;
    
    if (kycResult.rows.length > 0) {
      const kycData = kycResult.rows[0];
      isKycVerified = kycData.is_kyc_verified || false;
      
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
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME || '24h' }
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

// ─── PHONE-FIRST OTP AUTH ────────────────────────────────────────────────────

function issueAccessToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME || "15m" }
  );
}

/**
 * POST /api/auth/send-otp
 * Body: { phone }
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    await storeOTP(phone, otp);

    // In dev/test, skip real SMS and echo OTP
    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json(
        ApiResponse.success({ otp }, "OTP_SENT")
      );
    }

    await sendOTP(phone, otp);
    res.status(200).json(ApiResponse.success(null, "OTP_SENT"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp, role?, device_id?, device_name? }
 * Creates account on first verify; logs in on subsequent calls.
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, role = "rider", device_id, device_name } = req.body;

    const result = await verifyOTP(phone, otp);
    if (!result.valid) {
      return res.status(400).json(ApiResponse.error(result.reason, 400));
    }

    // Find or create user by phone
    let credential = await AuthCredentialModel.findOne({ phone });
    let isNewUser = false;

    if (!credential) {
      isNewUser = true;
      if (!["rider", "driver"].includes(role)) {
        return res.status(400).json(ApiResponse.error("INVALID_ROLE", 400));
      }

      // New user — create user + wallet + ledger account + auth credential
      const user = await UserModel.create({ role, status: "active" });

      await Wallet.create({ user_id: user.id, balance: 0, locked_balance: 0 });
      await LedgerService.getOrCreateAccount({ ownerType: "user", ownerId: user.id, accountType: "wallet" });

      credential = await AuthCredentialModel.create({
        user_id: user.id,
        phone,
        is_phone_verified: true,
      });
      credential.role = role;
      credential.user_id = user.id;
    } else {
      // Existing user — mark phone verified if it wasn't
      if (!credential.is_phone_verified) {
        await AuthCredentialModel.updateOne(
          { id: credential.id },
          { is_phone_verified: true }
        );
      }
      // Fetch role from users table
      const { rows } = await pool.query(`SELECT role FROM users WHERE id = $1`, [credential.user_id]);
      credential.role = rows[0]?.role ?? "rider";
    }

    // Issue tokens
    const accessToken  = issueAccessToken(credential.user_id, credential.role);
    const refreshToken = await RefreshTokenService.create(credential.user_id, {
      deviceId: device_id,
      deviceName: device_name,
    });

    // Update last login
    await pool.query(
      `UPDATE auth_credentials SET last_login_at = NOW() WHERE user_id = $1`,
      [credential.user_id]
    );

    res.status(isNewUser ? 201 : 200).json(
      ApiResponse.success(
        {
          userId:       credential.user_id,
          role:         credential.role,
          isNewUser,
          accessToken,
          refreshToken,
          expiresIn:    15 * 60, // seconds
        },
        isNewUser ? "ACCOUNT_CREATED" : "LOGIN_SUCCESS"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/resend-otp
 * Body: { phone }
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    await storeOTP(phone, otp);

    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json(ApiResponse.success({ otp }, "OTP_RESENT"));
    }

    await sendOTP(phone, otp);
    res.status(200).json(ApiResponse.success(null, "OTP_RESENT"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Body: { refresh_token }
 * Rotates the refresh token (old is revoked, new is issued).
 */
export const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const rotation = await RefreshTokenService.rotate(refresh_token);

    if (!rotation.success) {
      return res.status(401).json(ApiResponse.error(rotation.reason, 401));
    }

    const { rows } = await pool.query(
      `SELECT role FROM users WHERE id = $1`,
      [rotation.userId]
    );
    const role = rows[0]?.role ?? "rider";

    const accessToken = issueAccessToken(rotation.userId, role);

    res.status(200).json(
      ApiResponse.success(
        {
          accessToken,
          refreshToken: rotation.token,
          expiresIn: 15 * 60,
        },
        "TOKEN_REFRESHED"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Body: { refresh_token }
 * Revokes the provided refresh token (single device logout).
 */
export const logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      await RefreshTokenService.revoke(refresh_token);
    }
    res.status(200).json(ApiResponse.success(null, "LOGGED_OUT"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout-all
 * Revokes all refresh tokens for the authenticated user.
 */
export const logoutAll = async (req, res, next) => {
  try {
    await RefreshTokenService.revokeAll(req.user.id);
    res.status(200).json(ApiResponse.success(null, "ALL_SESSIONS_REVOKED"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/delete-account
 * Soft-deletes the authenticated user's account and revokes all sessions.
 * Cascades: deactivates driver record (if applicable), marks wallet inactive.
 */
export const deleteAccount = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    await client.query('BEGIN');

    // Revoke all refresh tokens
    await RefreshTokenService.revokeAll(userId);

    // Deactivate device tokens
    await client.query(`UPDATE device_tokens SET is_active = FALSE WHERE user_id = $1`, [userId]);

    // Soft-delete driver record if exists
    await client.query(`UPDATE drivers SET status = 'deleted' WHERE user_id = $1`, [userId]);

    // Mark user as deleted
    await client.query(
      `UPDATE users SET status = 'deleted', deleted_at = NOW(), phone_number = CONCAT('deleted_', id, '_', phone_number) WHERE id = $1`,
      [userId]
    );

    await client.query('COMMIT');
    res.status(200).json(ApiResponse.success(null, 'ACCOUNT_DELETED'));
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PUT /api/auth/device
 * Body: { fcm_token, device_type, device_id?, device_name? }
 * Stores or updates the FCM device token for the authenticated user.
 */
export const registerDevice = async (req, res, next) => {
  try {
    const { fcm_token, device_type, device_id, device_name } = req.body;
    const userId = req.user.id;

    if (device_id) {
      await pool.query(
        `INSERT INTO device_tokens (user_id, fcm_token, device_type, device_id, device_name, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
         ON CONFLICT (user_id, device_id)
         DO UPDATE SET fcm_token = EXCLUDED.fcm_token,
                       device_type = EXCLUDED.device_type,
                       device_name = EXCLUDED.device_name,
                       is_active = TRUE,
                       updated_at = NOW()`,
        [userId, fcm_token, device_type, device_id, device_name ?? null]
      );
    } else {
      await pool.query(
        `INSERT INTO device_tokens (user_id, fcm_token, device_type, device_name)
         VALUES ($1, $2, $3, $4)`,
        [userId, fcm_token, device_type, device_name ?? null]
      );
    }

    res.status(200).json(ApiResponse.success(null, "DEVICE_REGISTERED"));
  } catch (err) {
    next(err);
  }
};