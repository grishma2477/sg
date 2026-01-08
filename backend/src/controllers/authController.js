// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// import UserModel from "../models/user/User.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { Constant } from "../utils/Constant.js";
// import AuthCredentialModel from "../models/user/auth_credentials/AuthCredential.js";


// export const register = async (req, res, next) => {
//   try {
//     const { email, password, role = "rider" } = req.body;

//     const existing = await AuthCredentialModel.findOne({ email });
//     if (existing) {
//       return res
//         .status(400)
//         .json(ApiResponse.success({}, "USER_ALREADY_EXISTS"));
//     }

//     const password_hash = await bcrypt.hash(password, 10);

//     const user = await AuthCredentialModel.create({
//       email,
//       password_hash,
//       role,
//       status: "active"
//     });

//     res.status(201).json(
//       ApiResponse.success(
//         { id: user.id, email: user.email, role: user.role },
//         "USER_REGISTERED"
//       )
//     );
//   } catch (err) {
//     next(err);
//   }
// };

// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res
//         .status(401)
//         .json(ApiResponse.success({}, "INVALID_CREDENTIALS"));
//     }

//     const valid = await bcrypt.compare(password, user.password_hash);
//     if (!valid) {
//       return res
//         .status(401)
//         .json(ApiResponse.success({}, "INVALID_CREDENTIALS"));
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       Constant.AccessTokenSecretKey,
//       { expiresIn: Constant.AccessTokenExpirationTime }
//     );

//     res.json(
//       ApiResponse.success(
//         {
//           token,
//           user: {
//             id: user.id,
//             email: user.email,
//             role: user.role
//           }
//         },
//         "LOGIN_SUCCESS"
//       )
//     );
//   } catch (err) {
//     next(err);
//   }
// };



import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import UserModel from "../models/user/User.js";
import AuthCredentialModel from "../models/user/auth_credentials/AuthCredential.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Constant } from "../utils/Constant.js";
import UserProfile from "../models/user/user_profile/UserProfile.js"

import { pool } from '../database/DBConnection.js';
/**
 * REGISTER
 * Everyone registers as a USER first
 * Drivers are just users with role="driver"
 */
export const register = async (req, res, next) => {
  console.log("working till here ...")

  try {
    const { first_name, last_name, email, password, role } = req.body;

    // 1️⃣ Check email uniqueness
    const existing = await AuthCredentialModel.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json(ApiResponse.error("EMAIL_ALREADY_EXISTS"));
    }
    // 2️⃣ Create user identity
    const user = await UserModel.create({
      role,
      status: "active"
    });

    // 3️⃣ Create credentials
    const password_hash = await bcrypt.hash(password, 10);

    await AuthCredentialModel.create({
      user_id: user.id,
      email,
      password_hash
    });

    await UserProfile.create({
      user_id: user.id,
      first_name,
      last_name
    });

    res.status(201).json(
      ApiResponse.success(
        {
          id: user.id,
          email,
          role: user.role
        },
        "USER_REGISTERED"
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * LOGIN
 * Returns access + refresh token
 */
// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // 1️⃣ Find credentials
//     const creds = await AuthCredentialModel.findOne({ email });
//     if (!creds) {
//       return res
//         .status(401)
//         .json(ApiResponse.error("INVALID_CREDENTIALS"));
//     }

//     // 2️⃣ Verify password
//     const valid = await bcrypt.compare(password, creds.password_hash);
//     if (!valid) {
//       return res
//         .status(401)
//         .json(ApiResponse.error("INVALID_CREDENTIALS"));
//     }

//     // 3️⃣ Fetch user identity
//     const user = await UserModel.findById(creds.user_id);

//     // 4️⃣ Generate tokens
//     const accessToken = jwt.sign(
//       { id: user.id, role: user.role },
//       Constant.AccessTokenSecretKey,
//       { expiresIn: Constant.AccessTokenExpirationTime }
//     );

//     const refreshToken = jwt.sign(
//       { id: user.id },
//       Constant.RefreshTokenSecretKey,
//       { expiresIn: Constant.RefreshTokenExpirationTime }
//     );

//     // (optional but recommended)
//     await AuthCredentialModel.updateOne(
//       { user_id: user.id },
//       { last_login_at: new Date() }
//     );

//     res.json(
//       ApiResponse.success(
//         {
//           accessToken,
//           refreshToken,
//           user: {
//             id: user.id,
//             role: user.role
//           }
//         },
//         "LOGIN_SUCCESS"
//       )
//     );
//   } catch (err) {
//     next(err);
//   }
// };


// In your authController.js or loginController.js
// Update the login function to return driver_id for drivers
// In your authController.js or loginController.js
// Update the login function to return driver_id for drivers

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET_KEY,
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
        console.log('⚠️ No driver record found for user:', user.id);
      }
    }

    console.log('✅ Login successful');
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('Driver ID:', driverId);

    res.status(200).json({
      success: true,
      message: 'LOGIN_SUCCESS',
      token: token,
      userId: user.id,
      role: user.role,
      driverId: driverId  // THIS IS CRITICAL!
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR'
    });
  }
};