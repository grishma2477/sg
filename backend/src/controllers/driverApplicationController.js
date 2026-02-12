
// import { pool } from '../database/DBConnection.js';
// import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
// import { ApiResponse } from '../utils/ApiResponse.js';

// /**
//  * GET /api/driver-applications/check
//  */
// export const checkApplication = async (req, res, next) => {
//   try {
//     const userId = req.user.id;

//     const query = `
//       SELECT 
//         da.id,
//         da.status,
//         da.created_at,
//         da.updated_at,
//         da.admin_remarks
//       FROM driver_applications da
//       WHERE da.user_id = $1
//       ORDER BY da.created_at DESC
//       LIMIT 1
//     `;

//     const result = await pool.query(query, [userId]);

//     if (result.rows.length === 0) {
//       return res.json(ApiResponse.success({
//         hasApplication: false,
//         message: 'No application found'
//       }));
//     }

//     const application = result.rows[0];

//     res.json(ApiResponse.success({
//       hasApplication: true,
//       status: application.status,
//       submittedAt: application.created_at,
//       reviewedAt: application.updated_at,
//       remarks: application.admin_remarks,
//       message: getStatusMessage(application.status)
//     }));

//   } catch (error) {
//     console.error('❌ Check application error:', error);
//     next(error);
//   }
// };

// /**
//  * POST /api/driver-applications/submit
//  * Submit BOTH driver license AND vehicle info
//  */
// export const submitApplication = async (req, res, next) => {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const userId = req.user.id;
//     const {
//       // License info
//       licenseNumber,
//       licenseIssuedDate,
//       licenseExpiryDate,
//       licenseCategory,
      
//       // Vehicle info
//       vehicleType,
//       vehicleMake,
//       vehicleModel,
//       vehicleYear,
//       vehicleColor,
//       vehiclePlateNumber,
//       seatCapacity,
//       hasAc
//     } = req.body;

//     console.log('📝 Submitting driver application for user:', userId);

//     // Check existing application
//     const existingApp = await client.query(
//       'SELECT id, status FROM driver_applications WHERE user_id = $1',
//       [userId]
//     );

//     if (existingApp.rows.length > 0) {
//       const status = existingApp.rows[0].status;
//       if (status === 'pending') {
//         await client.query('ROLLBACK');
//         return res.status(400).json(
//           ApiResponse.error('You already have a pending application')
//         );
//       }
//       if (status === 'approved') {
//         await client.query('ROLLBACK');
//         return res.status(400).json(
//           ApiResponse.error('Your application has already been approved')
//         );
//       }
//     }

//     // Validate files
//     if (!req.files?.licenseFront) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(ApiResponse.error('License front required'));
//     }
//     if (!req.files?.vehicleRegistration) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(ApiResponse.error('Vehicle registration required'));
//     }
//     if (!req.files?.vehicleInsurance) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(ApiResponse.error('Vehicle insurance required'));
//     }
//     if (!req.files?.vehiclePhotoFront) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(ApiResponse.error('Vehicle photo required'));
//     }

//     // ========== UPLOAD LICENSE DOCUMENTS ==========
//     console.log('📤 Uploading license documents...');
//     const licenseFrontUrl = await uploadToCloudinary(
//       req.files.licenseFront.tempFilePath,
//       'driver-applications/licenses',
//       'image'
//     );

//     let licenseBackUrl = null;
//     if (req.files.licenseBack) {
//       licenseBackUrl = await uploadToCloudinary(
//         req.files.licenseBack.tempFilePath,
//         'driver-applications/licenses',
//         'image'
//       );
//     }

//     // ========== CREATE DRIVER APPLICATION (LICENSE INFO) ==========
//     const driverAppQuery = `
//       INSERT INTO driver_applications (
//         user_id, license_number, license_issued_date, license_expiry_date,
//         license_category, license_front_url, license_back_url, status
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
//       RETURNING id
//     `;

//     const driverAppResult = await client.query(driverAppQuery, [
//       userId,
//       licenseNumber,
//       licenseIssuedDate,
//       licenseExpiryDate,
//       licenseCategory,
//       licenseFrontUrl,
//       licenseBackUrl
//     ]);

//     const driverAppId = driverAppResult.rows[0].id;
//     console.log('✅ Driver application created:', driverAppId);

//     // ========== UPLOAD VEHICLE DOCUMENTS ==========
//     console.log('📤 Uploading vehicle documents...');
//     const vehicleRegistrationUrl = await uploadToCloudinary(
//       req.files.vehicleRegistration.tempFilePath,
//       'driver-applications/vehicles',
//       'image'
//     );

//     const vehicleInsuranceUrl = await uploadToCloudinary(
//       req.files.vehicleInsurance.tempFilePath,
//       'driver-applications/vehicles',
//       'image'
//     );

//     const vehiclePhotoFrontUrl = await uploadToCloudinary(
//       req.files.vehiclePhotoFront.tempFilePath,
//       'driver-applications/vehicles',
//       'image'
//     );

//     let vehiclePhotoBackUrl = null;
//     if (req.files.vehiclePhotoBack) {
//       vehiclePhotoBackUrl = await uploadToCloudinary(
//         req.files.vehiclePhotoBack.tempFilePath,
//         'driver-applications/vehicles',
//         'image'
//       );
//     }

//     // ========== CREATE VEHICLE APPLICATION ==========
//     const vehicleAppQuery = `
//       INSERT INTO vehicle_applications (
//         driver_application_id, vehicle_type, make, model, year, color,
//         license_plate, registration_url, insurance_url,
//         photo_front_url, photo_back_url, seat_capacity, has_ac
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
//       RETURNING id
//     `;

//     await client.query(vehicleAppQuery, [
//       driverAppId,
//       vehicleType,
//       vehicleMake,
//       vehicleModel,
//       vehicleYear,
//       vehicleColor,
//       vehiclePlateNumber,
//       vehicleRegistrationUrl,
//       vehicleInsuranceUrl,
//       vehiclePhotoFrontUrl,
//       vehiclePhotoBackUrl,
//       seatCapacity || 4,
//       hasAc !== false
//     ]);

//     console.log('✅ Vehicle application created');

//     await client.query('COMMIT');

//     // ✅ EMIT SOCKET EVENT TO ADMIN
//     const io = req.app.get('io');
//     if (io) {
//       io.emit('driver:application:new', {
//         applicationId: driverAppId,
//         userId: userId,
//         email: req.user.email || 'N/A',
//         vehicleType: vehicleType,
//         vehicleMake: vehicleMake,
//         vehicleModel: vehicleModel,
//         timestamp: new Date()
//       });
//     }

//     res.status(200).json(
//       ApiResponse.success({
//         applicationId: driverAppId,
//         message: 'Application submitted successfully. Review within 72 hours.'
//       }, 'APPLICATION_SUBMITTED')
//     );

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Submit application error:', error);

//     if (error.code === '23505') {
//       return res.status(400).json(
//         ApiResponse.error('License number or plate number already exists')
//       );
//     }

//     next(error);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * GET /api/driver-applications/pending (ADMIN)
//  */
// export const getPendingApplications = async (req, res, next) => {
//   try {
//     const query = `
//       SELECT 
//         da.*,
//         u.email,
//         CONCAT(k.first_name, ' ', k.last_name) as full_name,
//         va.vehicle_type,
//         va.make,
//         va.model,
//         va.license_plate
//       FROM driver_applications da
//       JOIN users u ON da.user_id = u.id
//       LEFT JOIN kyc k ON da.user_id = k.user_id
//       LEFT JOIN vehicle_applications va ON da.id = va.driver_application_id
//       WHERE da.status = 'pending'
//       ORDER BY da.created_at DESC
//     `;

//     const result = await pool.query(query);

//     res.json(ApiResponse.success({
//       count: result.rows.length,
//       applications: result.rows
//     }));

//   } catch (error) {
//     console.error('❌ Get pending applications error:', error);
//     next(error);
//   }
// };

// /**
//  * GET /api/driver-applications/:applicationId (ADMIN)
//  */
// export const getApplicationDetails = async (req, res, next) => {
//   try {
//     const { applicationId } = req.params;

//     // Get driver application
//     const driverQuery = `
//       SELECT 
//         da.*,
//         u.email,
//         u.role,
//         k.first_name,
//         k.last_name,
//         k.phone_number,
//         k.profile_url
//       FROM driver_applications da
//       JOIN users u ON da.user_id = u.id
//       LEFT JOIN kyc k ON da.user_id = k.user_id
//       WHERE da.id = $1
//     `;

//     const driverResult = await pool.query(driverQuery, [applicationId]);

//     if (driverResult.rows.length === 0) {
//       return res.status(404).json(ApiResponse.error('Application not found'));
//     }

//     // Get vehicle application
//     const vehicleQuery = `
//       SELECT * FROM vehicle_applications 
//       WHERE driver_application_id = $1
//     `;

//     const vehicleResult = await pool.query(vehicleQuery, [applicationId]);

//     res.json(ApiResponse.success({
//       application: driverResult.rows[0],
//       vehicle: vehicleResult.rows[0] || null
//     }));

//   } catch (error) {
//     console.error('❌ Get application details error:', error);
//     next(error);
//   }
// };

// /**
//  * POST /api/driver-applications/:applicationId/review (ADMIN)
//  * ✅ Creates entries in drivers + vehicles tables
//  */
// export const reviewApplication = async (req, res, next) => {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const { applicationId } = req.params;
//     const { approved, remarks } = req.body;
//     const adminId = req.user.id;

//     // Get application
//     const appResult = await client.query(
//       'SELECT * FROM driver_applications WHERE id = $1',
//       [applicationId]
//     );

//     if (appResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json(ApiResponse.error('Application not found'));
//     }

//     const application = appResult.rows[0];
//     const userId = application.user_id;

//     if (!approved) {
//       // REJECT
//       await client.query(
//         `UPDATE driver_applications 
//          SET status = 'rejected', admin_remarks = $1, 
//              reviewed_by = $2, reviewed_at = NOW()
//          WHERE id = $3`,
//         [remarks, adminId, applicationId]
//       );

//       await client.query('COMMIT');

//       const io = req.app.get('io');
//       if (io) {
//         io.to(`user:${userId}`).emit('driver:application:rejected', {
//           message: remarks || 'Application rejected',
//           timestamp: new Date()
//         });
//       }

//       return res.json(ApiResponse.success({ message: 'Application rejected' }));
//     }

//     // ========== APPROVE ==========
    
//     // 1. Update application status
//     await client.query(
//       `UPDATE driver_applications 
//        SET status = 'approved', admin_remarks = $1,
//            reviewed_by = $2, reviewed_at = NOW()
//        WHERE id = $3`,
//       [remarks, adminId, applicationId]
//     );

//     // 2. Change user role to driver
//     await client.query(
//       'UPDATE users SET role = $1 WHERE id = $2',
//       ['driver', userId]
//     );

//     // 3. Create driver profile
//     const driverExists = await client.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [userId]
//     );

//     let driverId;
//     if (driverExists.rows.length === 0) {
//       const driverResult = await client.query(
//         `INSERT INTO drivers (user_id, is_online, is_available, status)
//          VALUES ($1, false, false, 'offline')
//          RETURNING id`,
//         [userId]
//       );
//       driverId = driverResult.rows[0].id;
//     } else {
//       driverId = driverExists.rows[0].id;
//     }

//     // 4. ✅ Get vehicle application data
//     const vehicleAppResult = await client.query(
//       'SELECT * FROM vehicle_applications WHERE driver_application_id = $1',
//       [applicationId]
//     );

//     if (vehicleAppResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(400).json(
//         ApiResponse.error('Vehicle application not found')
//       );
//     }

//     const vehicleApp = vehicleAppResult.rows[0];

//     // 5. ✅ Create vehicle in YOUR vehicles table
//     await client.query(
//       `INSERT INTO vehicles (
//         driver_id, vehicle_type, make, model, year, color,
//         license_plate, seat_capacity, has_ac, is_active, is_verified
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)`,
//       [
//         driverId,
//         vehicleApp.vehicle_type,
//         vehicleApp.make,
//         vehicleApp.model,
//         vehicleApp.year,
//         vehicleApp.color,
//         vehicleApp.license_plate,
//         vehicleApp.seat_capacity,
//         vehicleApp.has_ac
//       ]
//     );

//     console.log('✅ Vehicle created in vehicles table');

//     await client.query('COMMIT');

//     // ✅ SOCKET EVENT
//     const io = req.app.get('io');
//     if (io) {
//       io.to(`user:${userId}`).emit('driver:application:approved', {
//         message: 'Application approved! You can now drive.',
//         timestamp: new Date()
//       });
//     }

//     res.json(ApiResponse.success({
//       message: 'Application approved. User is now a driver!',
//       driverId: driverId
//     }));

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Review error:', error);
//     next(error);
//   } finally {
//     client.release();
//   }
// };

// function getStatusMessage(status) {
//   const messages = {
//     pending: 'Your application is being reviewed',
//     approved: 'Your application has been approved',
//     rejected: 'Your application was rejected'
//   };
//   return messages[status] || 'Unknown status';
// }

// export default {
//   checkApplication,
//   submitApplication,
//   getPendingApplications,
//   getApplicationDetails,
//   reviewApplication
// };


import { pool } from '../database/DBConnection.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/driver-applications/check
 */
export const checkApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        da.id,
        da.status,
        da.created_at,
        da.updated_at,
        da.admin_remarks
      FROM driver_applications da
      WHERE da.user_id = $1
      ORDER BY da.created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json(ApiResponse.success({
        hasApplication: false,
        message: 'No application found'
      }));
    }

    const application = result.rows[0];

    res.json(ApiResponse.success({
      hasApplication: true,
      status: application.status,
      submittedAt: application.created_at,
      reviewedAt: application.updated_at,
      remarks: application.admin_remarks,
      message: getStatusMessage(application.status)
    }));

  } catch (error) {
    console.error('❌ Check application error:', error);
    next(error);
  }
};

/**
 * POST /api/driver-applications/submit
 * Submit BOTH driver license AND vehicle info
 */
export const submitApplication = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const {
      // License info
      licenseNumber,
      licenseIssuedDate,
      licenseExpiryDate,
      licenseCategory,
      
      // Vehicle info
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehiclePlateNumber,
      seatCapacity,
      hasAc
    } = req.body;

    console.log('📝 Submitting driver application for user:', userId);

    // Check existing application
    const existingApp = await client.query(
      'SELECT id, status FROM driver_applications WHERE user_id = $1',
      [userId]
    );

    if (existingApp.rows.length > 0) {
      const status = existingApp.rows[0].status;
      if (status === 'pending') {
        await client.query('ROLLBACK');
        return res.status(400).json(
          ApiResponse.error('You already have a pending application')
        );
      }
      if (status === 'approved') {
        await client.query('ROLLBACK');
        return res.status(400).json(
          ApiResponse.error('Your application has already been approved')
        );
      }
    }

    // Validate files
    if (!req.files?.licenseFront) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('License front required'));
    }
    if (!req.files?.vehicleRegistration) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Vehicle registration required'));
    }
    if (!req.files?.vehicleInsurance) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Vehicle insurance required'));
    }
    if (!req.files?.vehiclePhotoFront) {
      await client.query('ROLLBACK');
      return res.status(400).json(ApiResponse.error('Vehicle photo required'));
    }

    // ========== UPLOAD LICENSE DOCUMENTS ==========
    console.log('📤 Uploading license documents...');
    const licenseFrontUrl = await uploadToCloudinary(
      req.files.licenseFront.tempFilePath,
      'driver-applications/licenses',
      'image'
    );

    let licenseBackUrl = null;
    if (req.files.licenseBack) {
      licenseBackUrl = await uploadToCloudinary(
        req.files.licenseBack.tempFilePath,
        'driver-applications/licenses',
        'image'
      );
    }

    // ========== CREATE DRIVER APPLICATION (LICENSE INFO) ==========
    const driverAppQuery = `
      INSERT INTO driver_applications (
        user_id, license_number, license_issued_date, license_expiry_date,
        license_category, license_front_url, license_back_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING id
    `;

    const driverAppResult = await client.query(driverAppQuery, [
      userId,
      licenseNumber,
      licenseIssuedDate,
      licenseExpiryDate,
      licenseCategory,
      licenseFrontUrl,
      licenseBackUrl
    ]);

    const driverAppId = driverAppResult.rows[0].id;
    console.log('✅ Driver application created:', driverAppId);

    // ========== UPLOAD VEHICLE DOCUMENTS ==========
    console.log('📤 Uploading vehicle documents...');
    const vehicleRegistrationUrl = await uploadToCloudinary(
      req.files.vehicleRegistration.tempFilePath,
      'driver-applications/vehicles',
      'image'
    );

    const vehicleInsuranceUrl = await uploadToCloudinary(
      req.files.vehicleInsurance.tempFilePath,
      'driver-applications/vehicles',
      'image'
    );

    const vehiclePhotoFrontUrl = await uploadToCloudinary(
      req.files.vehiclePhotoFront.tempFilePath,
      'driver-applications/vehicles',
      'image'
    );

    let vehiclePhotoBackUrl = null;
    if (req.files.vehiclePhotoBack) {
      vehiclePhotoBackUrl = await uploadToCloudinary(
        req.files.vehiclePhotoBack.tempFilePath,
        'driver-applications/vehicles',
        'image'
      );
    }

    // ========== CREATE VEHICLE APPLICATION ==========
    const vehicleAppQuery = `
      INSERT INTO vehicle_applications (
        driver_application_id, vehicle_type, make, model, year, color,
        license_plate, registration_url, insurance_url,
        photo_front_url, photo_back_url, seat_capacity, has_ac
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;

    await client.query(vehicleAppQuery, [
      driverAppId,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehiclePlateNumber,
      vehicleRegistrationUrl,
      vehicleInsuranceUrl,
      vehiclePhotoFrontUrl,
      vehiclePhotoBackUrl,
      seatCapacity || 4,
      hasAc !== false
    ]);

    console.log('✅ Vehicle application created');

    await client.query('COMMIT');

    // ✅ EMIT SOCKET EVENT TO ADMIN
    const io = req.app.get('io');
    if (io) {
      io.emit('driver:application:new', {
        applicationId: driverAppId,
        userId: userId,
        email: req.user.email || 'N/A',
        vehicleType: vehicleType,
        vehicleMake: vehicleMake,
        vehicleModel: vehicleModel,
        timestamp: new Date()
      });
    }

    res.status(200).json(
      ApiResponse.success({
        applicationId: driverAppId,
        message: 'Application submitted successfully. Review within 72 hours.'
      }, 'APPLICATION_SUBMITTED')
    );

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Submit application error:', error);

    if (error.code === '23505') {
      return res.status(400).json(
        ApiResponse.error('License number or plate number already exists')
      );
    }

    next(error);
  } finally {
    client.release();
  }
};

/**
 * GET /api/driver-applications/pending (ADMIN)
 * ✅ FIXED: Uses k.email instead of u.email
 */
export const getPendingApplications = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        da.*,
        k.email,
        CONCAT(k.first_name, ' ', k.last_name) as full_name,
        va.vehicle_type,
        va.make,
        va.model,
        va.license_plate
      FROM driver_applications da
      LEFT JOIN kyc k ON da.user_id = k.user_id
      LEFT JOIN vehicle_applications va ON da.id = va.driver_application_id
      WHERE da.status = 'pending'
      ORDER BY da.created_at DESC
    `;

    const result = await pool.query(query);

    res.json(ApiResponse.success({
      count: result.rows.length,
      applications: result.rows
    }));

  } catch (error) {
    console.error('❌ Get pending applications error:', error);
    next(error);
  }
};

/**
 * GET /api/driver-applications/:applicationId (ADMIN)
 * ✅ FIXED: Uses k.email instead of u.email
 */
export const getApplicationDetails = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // Get driver application
    const driverQuery = `
      SELECT 
        da.*,
        k.email,
        k.first_name,
        k.last_name,
        k.phone_number,
        k.profile_url
      FROM driver_applications da
      LEFT JOIN kyc k ON da.user_id = k.user_id
      WHERE da.id = $1
    `;

    const driverResult = await pool.query(driverQuery, [applicationId]);

    if (driverResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Application not found'));
    }

    // Get vehicle application
    const vehicleQuery = `
      SELECT * FROM vehicle_applications 
      WHERE driver_application_id = $1
    `;

    const vehicleResult = await pool.query(vehicleQuery, [applicationId]);

    res.json(ApiResponse.success({
      application: driverResult.rows[0],
      vehicle: vehicleResult.rows[0] || null
    }));

  } catch (error) {
    console.error('❌ Get application details error:', error);
    next(error);
  }
};

/**
 * POST /api/driver-applications/:applicationId/review (ADMIN)
 * ✅ Creates entries in drivers + vehicles tables
 */
export const reviewApplication = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { applicationId } = req.params;
    const { approved, remarks } = req.body;
    const adminId = req.user.id;

    // Get application
    const appResult = await client.query(
      'SELECT * FROM driver_applications WHERE id = $1',
      [applicationId]
    );

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json(ApiResponse.error('Application not found'));
    }

    const application = appResult.rows[0];
    const userId = application.user_id;

    if (!approved) {
      // REJECT
      await client.query(
        `UPDATE driver_applications 
         SET status = 'rejected', admin_remarks = $1, 
             reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3`,
        [remarks, adminId, applicationId]
      );

      await client.query('COMMIT');

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('driver:application:rejected', {
          message: remarks || 'Application rejected',
          timestamp: new Date()
        });
      }

      return res.json(ApiResponse.success({ message: 'Application rejected' }));
    }

    // ========== APPROVE ==========
    
    // 1. Update application status
    await client.query(
      `UPDATE driver_applications 
       SET status = 'approved', admin_remarks = $1,
           reviewed_by = $2, reviewed_at = NOW()
       WHERE id = $3`,
      [remarks, adminId, applicationId]
    );

    // 2. Change user role to driver
    await client.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['driver', userId]
    );

    // 3. Create driver profile
    const driverExists = await client.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [userId]
    );

    let driverId;
    if (driverExists.rows.length === 0) {
      const driverResult = await client.query(
        `INSERT INTO drivers (user_id, is_online, is_available, status)
         VALUES ($1, false, false, 'offline')
         RETURNING id`,
        [userId]
      );
      driverId = driverResult.rows[0].id;
    } else {
      driverId = driverExists.rows[0].id;
    }

    // 4. ✅ Get vehicle application data
    const vehicleAppResult = await client.query(
      'SELECT * FROM vehicle_applications WHERE driver_application_id = $1',
      [applicationId]
    );

    if (vehicleAppResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json(
        ApiResponse.error('Vehicle application not found')
      );
    }

    const vehicleApp = vehicleAppResult.rows[0];

    // 5. ✅ Create vehicle in vehicles table
    await client.query(
      `INSERT INTO vehicles (
        driver_id, vehicle_type, make, model, year, color,
        license_plate, seat_capacity, has_ac, is_active, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)`,
      [
        driverId,
        vehicleApp.vehicle_type,
        vehicleApp.make,
        vehicleApp.model,
        vehicleApp.year,
        vehicleApp.color,
        vehicleApp.license_plate,
        vehicleApp.seat_capacity,
        vehicleApp.has_ac
      ]
    );

    console.log('✅ Vehicle created in vehicles table');

    await client.query('COMMIT');

    // ✅ SOCKET EVENT
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('driver:application:approved', {
        message: 'Application approved! You can now drive.',
        timestamp: new Date()
      });
    }

    res.json(ApiResponse.success({
      message: 'Application approved. User is now a driver!',
      driverId: driverId
    }));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Review error:', error);
    next(error);
  } finally {
    client.release();
  }
};

function getStatusMessage(status) {
  const messages = {
    pending: 'Your application is being reviewed',
    approved: 'Your application has been approved',
    rejected: 'Your application was rejected'
  };
  return messages[status] || 'Unknown status';
}

export default {
  checkApplication,
  submitApplication,
  getPendingApplications,
  getApplicationDetails,
  reviewApplication
};