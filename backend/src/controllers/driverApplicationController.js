
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
//  * ✅ FIXED: Uses k.email instead of u.email
//  */
// export const getPendingApplications = async (req, res, next) => {
//   try {
//     const query = `
//       SELECT 
//         da.*,
//         k.email,
//         CONCAT(k.first_name, ' ', k.last_name) as full_name,
//         va.vehicle_type,
//         va.make,
//         va.model,
//         va.license_plate
//       FROM driver_applications da
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
//  * ✅ FIXED: Uses k.email instead of u.email
//  */
// export const getApplicationDetails = async (req, res, next) => {
//   try {
//     const { applicationId } = req.params;

//     // Get driver application
//     const driverQuery = `
//       SELECT 
//         da.*,
//         k.email,
//         k.first_name,
//         k.last_name,
//         k.phone_number,
//         k.profile_url
//       FROM driver_applications da
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

//     // 5. ✅ Create vehicle in vehicles table
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
 * Submit complete driver application with ALL 72 fields
 */
export const submitApplication = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const {
      // License Information
      licenseNumber,
      licenseType,
      licenseCategory,
      licenseIssuedDate,
      licenseExpiryDate,
      licenseRenewedDate,
      issuingAuthority,
      yearsOfExperience,
      
      // Vehicle Information
      vehicleType,
      vehicleCategory,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehiclePlateNumber,
      vin,
      cc,
      transmissionType,
      fuelType,
      seatCapacity,
      hasAc,
      
      // Vehicle Documents
      registrationNumber,
      registrationExpiryDate,
      blueBookNumber,
      blueBookExpiryDate,
      blueBookRenewedDate,
      insurancePolicyNumber,
      insuranceExpiryDate,
      fitnessExpiryDate,
      emissionExpiryDate,
      
      // Vehicle Amenities
      hasDashcam,
      hasMusic,
      hasWater,
      hasCharger,
      isPetFriendly,
      isWheelchairAccessible,
      
      // Safety & Compliance
      backgroundCheckStatus,
      criminalRecordCheckStatus,
      drivingHistoryCheckStatus,
      driverTrainingCompleted,
      trainingDate,
      safetyQuizScore,
      emergencyContactName,
      emergencyContactNumber,
      
      // Operational Preferences
      preferredWorkingAreas, // Array
      preferredWorkingHours,
      languagesSpoken, // Array
      
      // Payment Information
      bankAccountNumber,
      bankName,
      bankBranch,
      accountHolderName,
      taxIdNumber,
      paymentMethodPreference
    } = req.body;

    console.log('📝 Submitting driver application for user:', userId);
    console.log('📋 Fields received:', Object.keys(req.body).length);

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

    // Validate required files
    const requiredFiles = ['licenseFront', 'registrationUrl', 'insuranceUrl', 'photoFront'];
    for (const fileField of requiredFiles) {
      if (!req.files?.[fileField]) {
        await client.query('ROLLBACK');
        return res.status(400).json(
          ApiResponse.error(`${fileField} is required`)
        );
      }
    }

    // ========== UPLOAD ALL DOCUMENTS ==========
    console.log('📤 Uploading documents to Cloudinary...');
    
    // License Documents
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

    // Vehicle Documents
    const registrationUrl = await uploadToCloudinary(
      req.files.registrationUrl.tempFilePath,
      'driver-applications/documents',
      'image'
    );

    let blueBookUrl = null;
    if (req.files.blueBookUrl) {
      blueBookUrl = await uploadToCloudinary(
        req.files.blueBookUrl.tempFilePath,
        'driver-applications/documents',
        'image'
      );
    }

    const insuranceUrl = await uploadToCloudinary(
      req.files.insuranceUrl.tempFilePath,
      'driver-applications/documents',
      'image'
    );

    let fitnessCertificateUrl = null;
    if (req.files.fitnessCertificateUrl) {
      fitnessCertificateUrl = await uploadToCloudinary(
        req.files.fitnessCertificateUrl.tempFilePath,
        'driver-applications/documents',
        'image'
      );
    }

    let emissionCertificateUrl = null;
    if (req.files.emissionCertificateUrl) {
      emissionCertificateUrl = await uploadToCloudinary(
        req.files.emissionCertificateUrl.tempFilePath,
        'driver-applications/documents',
        'image'
      );
    }

    // Vehicle Photos (4 angles)
    const photoFrontUrl = await uploadToCloudinary(
      req.files.photoFront.tempFilePath,
      'driver-applications/vehicles',
      'image'
    );

    let photoBackUrl = null;
    if (req.files.photoBack) {
      photoBackUrl = await uploadToCloudinary(
        req.files.photoBack.tempFilePath,
        'driver-applications/vehicles',
        'image'
      );
    }

    let photoLeftUrl = null;
    if (req.files.photoLeft) {
      photoLeftUrl = await uploadToCloudinary(
        req.files.photoLeft.tempFilePath,
        'driver-applications/vehicles',
        'image'
      );
    }

    let photoRightUrl = null;
    if (req.files.photoRight) {
      photoRightUrl = await uploadToCloudinary(
        req.files.photoRight.tempFilePath,
        'driver-applications/vehicles',
        'image'
      );
    }

    console.log('✅ All documents uploaded successfully');

    // ========== INSERT INTO DATABASE ==========
    const insertQuery = `
      INSERT INTO driver_applications (
        user_id,
        license_number, license_type, license_category,
        license_issued_date, license_expiry_date, license_renewed_date,
        issuing_authority, years_of_experience,
        license_front_url, license_back_url,
        
        vehicle_type, vehicle_category, make, model, year, color,
        license_plate, vin, cc, transmission_type, fuel_type,
        seating_capacity, has_ac,
        
        registration_number, registration_url, registration_expiry_date,
        blue_book_number, blue_book_url, blue_book_expiry_date, blue_book_renewed_date,
        insurance_policy_number, insurance_url, insurance_expiry_date,
        fitness_certificate_url, fitness_expiry_date,
        emission_certificate_url, emission_expiry_date,
        
        photo_front_url, photo_back_url, photo_left_url, photo_right_url,
        
        has_dashcam, has_music, has_water, has_charger,
        is_pet_friendly, is_wheelchair_accessible,
        
        background_check_status, criminal_record_check_status,
        driving_history_check_status, driver_training_completed,
        training_date, safety_quiz_score,
        emergency_contact_name, emergency_contact_number,
        
        preferred_working_areas, preferred_working_hours, languages_spoken,
        
        bank_account_number, bank_name, bank_branch,
        account_holder_name, tax_id_number, payment_method_preference,
        
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
        $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
        $61, $62, $63, $64, $65, $66, $67, $68, $69, 'pending'
      )
      RETURNING id
    `;

    const values = [
      userId,
      licenseNumber, licenseType, licenseCategory,
      licenseIssuedDate, licenseExpiryDate, licenseRenewedDate,
      issuingAuthority, yearsOfExperience || null,
      licenseFrontUrl, licenseBackUrl,
      
      vehicleType, vehicleCategory, vehicleMake, vehicleModel,
      vehicleYear, vehicleColor, vehiclePlateNumber, vin, cc,
      transmissionType, fuelType, seatCapacity || 4, hasAc !== false,
      
      registrationNumber, registrationUrl, registrationExpiryDate,
      blueBookNumber, blueBookUrl, blueBookExpiryDate, blueBookRenewedDate,
      insurancePolicyNumber, insuranceUrl, insuranceExpiryDate,
      fitnessCertificateUrl, fitnessExpiryDate,
      emissionCertificateUrl, emissionExpiryDate,
      
      photoFrontUrl, photoBackUrl, photoLeftUrl, photoRightUrl,
      
      hasDashcam || false, hasMusic || false, hasWater || false, hasCharger || false,
      isPetFriendly || false, isWheelchairAccessible || false,
      
      backgroundCheckStatus || 'pending',
      criminalRecordCheckStatus || 'pending',
      drivingHistoryCheckStatus || 'pending',
      driverTrainingCompleted || false,
      trainingDate || null, safetyQuizScore || null,
      emergencyContactName, emergencyContactNumber,
      
      preferredWorkingAreas || null, // PostgreSQL array
      preferredWorkingHours,
      languagesSpoken || null, // PostgreSQL array
      
      bankAccountNumber, bankName, bankBranch,
      accountHolderName, taxIdNumber, paymentMethodPreference
    ];

    const result = await client.query(insertQuery, values);
    const applicationId = result.rows[0].id;

    console.log('✅ Application created:', applicationId);

    await client.query('COMMIT');

    // ✅ EMIT SOCKET EVENT TO ADMIN
    const io = req.app.get('io');
    if (io) {
      io.emit('driver:application:new', {
        applicationId: applicationId,
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
        applicationId: applicationId,
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
 */
export const getPendingApplications = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        da.*,
        k.email,
        CONCAT(k.first_name, ' ', k.last_name) as full_name,
        k.phone_number
      FROM driver_applications da
      LEFT JOIN kyc k ON da.user_id = k.user_id
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
 */
export const getApplicationDetails = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const query = `
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

    const result = await pool.query(query, [applicationId]);

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Application not found'));
    }

    res.json(ApiResponse.success({
      application: result.rows[0]
    }));

  } catch (error) {
    console.error('❌ Get application details error:', error);
    next(error);
  }
};

/**
 * POST /api/driver-applications/:applicationId/review (ADMIN)
 * ✅ Approve/Reject and create driver with verification badges
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

    // 4. ✅ Create vehicle in vehicles table
    await client.query(
      `INSERT INTO vehicles (
        driver_id, vehicle_type, make, model, year, color,
        license_plate, seat_capacity, has_ac, is_active, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)`,
      [
        driverId,
        application.vehicle_type,
        application.make,
        application.model,
        application.year,
        application.color,
        application.license_plate,
        application.seating_capacity || 4,
        application.has_ac !== false
      ]
    );

    console.log('✅ Vehicle created in vehicles table');

    // 5. ✅ Create verification record with initial badges
    await client.query(
      `INSERT INTO driver_verifications (
        driver_id,
        confirmed_identity,
        driver_license_verified,
        vehicle_registration_verified
      ) VALUES ($1, true, true, true)`,
      [driverId]
    );

    console.log('✅ Initial verification badges assigned');

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
      message: 'Application approved. Driver created with initial badges!',
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