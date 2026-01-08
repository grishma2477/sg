


// import { pool } from '../database/DBConnection.js';
// import { notifyBidAccepted, notifyRideStatusChange } from '../realtime/socketServer.js';

// // Accept a ride request (for fixed price rides)
// export const acceptRideRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const driverId = req.user.id;

//     console.log('✅ Driver accepting ride request:', requestId);

//     // Get driver's database ID
//     const driverResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [driverId]
//     );

//     if (driverResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Driver not found'
//       });
//     }

//     const driverDbId = driverResult.rows[0].id;

//     // Get ride request details
//     const requestResult = await pool.query(
//       'SELECT * FROM ride_requests WHERE id = $1 AND status = $2',
//       [requestId, 'pending']
//     );

//     if (requestResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride request not found or already accepted'
//       });
//     }

//     const request = requestResult.rows[0];

//     // Create ride
//     const rideQuery = `
//       INSERT INTO rides (
//         rider_id,
//         driver_id,
//         fare_amount,
//         currency,
//         status,
//         created_at
//       ) VALUES ($1, $2, $3, $4, $5, NOW())
//       RETURNING *
//     `;

//     const rideResult = await pool.query(rideQuery, [
//       request.rider_id,
//       driverDbId,
//       request.estimated_fare_max || 0,
//       'NPR',
//       'accepted'
//     ]);

//     const ride = rideResult.rows[0];

//     // Update ride request status
//     await pool.query(
//       `UPDATE ride_requests 
//        SET status = 'accepted', 
//            matched_driver_id = $1
//        WHERE id = $2`,
//       [driverDbId, requestId]
//     );

//     console.log('✅ Ride created:', ride.id);

//     res.status(201).json({
//       success: true,
//       message: 'RIDE_ACCEPTED',
//       data: {
//         ride_id: ride.id,
//         ride: ride
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error accepting ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// // Get ride details with stops
// export const getRideDetails = async (req, res) => {
//   try {
//     const { rideId } = req.params;

//     console.log('📋 Fetching ride details:', rideId);

//     const query = `
//       SELECT 
//         r.*,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pickup_location,
//         rr.dropoff_location,
//         CONCAT(up.first_name, ' ', up.last_name) as rider_name,
//         ac.phone as rider_phone
//       FROM rides r
//       LEFT JOIN ride_requests rr ON rr.rider_id = r.rider_id
//         AND rr.matched_driver_id = (SELECT id FROM drivers WHERE user_id = $2)
//         AND rr.status = 'accepted'
//       JOIN users u ON r.rider_id = u.id
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
//       WHERE r.id = $1
//       LIMIT 1
//     `;

//     const result = await pool.query(query, [rideId, req.user.id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found'
//       });
//     }

//     const ride = result.rows[0];

//     // Get stops for this ride request
//     const stopsQuery = `
//       SELECT * FROM ride_stops
//       WHERE ride_request_id = (
//         SELECT id FROM ride_requests 
//         WHERE rider_id = $1 
//         AND matched_driver_id = (SELECT id FROM drivers WHERE user_id = $2)
//         AND status = 'accepted'
//         LIMIT 1
//       )
//       ORDER BY stop_order ASC
//     `;

//     const stopsResult = await pool.query(stopsQuery, [ride.rider_id, req.user.id]);
//     ride.stops = stopsResult.rows;

//     console.log('✅ Found ride with', stopsResult.rows.length, 'stops');

//     res.status(200).json({
//       success: true,
//       data: ride
//     });

//   } catch (error) {
//     console.error('❌ Error fetching ride details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// // Start ride
// export const startRide = async (req, res) => {
//   try {
//     const { rideId } = req.params;
//     const driverId = req.user.id;

//     console.log('🚗 Starting ride:', rideId);

//     // Get driver's database ID
//     const driverResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [driverId]
//     );

//     if (driverResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Driver not found'
//       });
//     }

//     const driverDbId = driverResult.rows[0].id;

//     // Update ride status
//     const result = await pool.query(
//       `UPDATE rides 
//        SET status = 'started', 
//            started_at = NOW()
//        WHERE id = $1 AND driver_id = $2 AND status = 'accepted'
//        RETURNING *`,
//       [rideId, driverDbId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found or cannot be started'
//       });
//     }

//     console.log('✅ Ride started');

//     res.status(200).json({
//       success: true,
//       message: 'RIDE_STARTED',
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error starting ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// // Arrive at stop
// export const arriveAtStop = async (req, res) => {
//   try {
//     const { rideId, stopId } = req.params;

//     console.log('🚩 Arriving at stop:', stopId);

//     const result = await pool.query(
//       `UPDATE ride_stops 
//        SET actual_arrival_time = NOW(),
//            status = 'arrived'
//        WHERE id = $1
//        RETURNING *`,
//       [stopId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Stop not found'
//       });
//     }

//     console.log('✅ Arrived at stop');

//     res.status(200).json({
//       success: true,
//       message: 'ARRIVED_AT_STOP',
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error arriving at stop:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// // Depart from stop
// export const departFromStop = async (req, res) => {
//   try {
//     const { rideId, stopId } = req.params;

//     console.log('🚀 Departing from stop:', stopId);

//     const result = await pool.query(
//       `UPDATE ride_stops 
//        SET actual_departure_time = NOW(),
//            status = 'completed'
//        WHERE id = $1
//        RETURNING *`,
//       [stopId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Stop not found'
//       });
//     }

//     console.log('✅ Departed from stop');

//     res.status(200).json({
//       success: true,
//       message: 'DEPARTED_FROM_STOP',
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error departing from stop:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// // Complete ride
// export const completeRide = async (req, res) => {
//   try {
//     const { rideId } = req.params;
//     const driverId = req.user.id;

//     console.log('🏁 Completing ride:', rideId);

//     // Get driver's database ID
//     const driverResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [driverId]
//     );

//     if (driverResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Driver not found'
//       });
//     }

//     const driverDbId = driverResult.rows[0].id;

//     // Update ride status
//     const result = await pool.query(
//       `UPDATE rides 
//        SET status = 'completed', 
//            completed_at = NOW()
//        WHERE id = $1 AND driver_id = $2 AND status = 'started'
//        RETURNING *`,
//       [rideId, driverDbId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found or cannot be completed'
//       });
//     }

//     const ride = result.rows[0];

//     console.log('✅ Ride completed');

//     // TODO: Emit socket event to rider for real-time notification
//     // TODO: Create payment transaction
//     // TODO: Notify rider to leave review

//     res.status(200).json({
//       success: true,
//       message: 'RIDE_COMPLETED',
//       data: ride
//     });

//   } catch (error) {
//     console.error('❌ Error completing ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// // Cancel ride
// export const cancelRide = async (req, res) => {
//   try {
//     const { rideId } = req.params;
//     const { reason } = req.body;
//     const userId = req.user.id;

//     console.log('❌ Cancelling ride:', rideId);

//     // Get driver's database ID if user is driver
//     let driverDbId = null;
//     const driverResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [userId]
//     );
//     if (driverResult.rows.length > 0) {
//       driverDbId = driverResult.rows[0].id;
//     }

//     // Update ride status
//     const result = await pool.query(
//       `UPDATE rides 
//        SET status = 'cancelled', 
//            cancelled_at = NOW()
//        WHERE id = $1 
//        AND (driver_id = $2 OR rider_id = $3)
//        AND status IN ('accepted', 'started')
//        RETURNING *`,
//       [rideId, driverDbId, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found or cannot be cancelled'
//       });
//     }

//     console.log('✅ Ride cancelled');

//     res.status(200).json({
//       success: true,
//       message: 'RIDE_CANCELLED',
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error cancelling ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// export default {
//   acceptRideRequest,
//   getRideDetails,
//   startRide,
//   arriveAtStop,
//   departFromStop,
//   completeRide,
//   cancelRide
// };


import { pool } from '../database/DBConnection.js';
import { notifyBidAccepted, notifyRideStatusChange } from '../realtime/socketServer.js';

// Accept a ride request (for fixed price rides)
export const acceptRideRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const driverId = req.user.id;

    console.log('✅ Driver accepting ride request:', requestId);

    // Get driver's database ID
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [driverId]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const driverDbId = driverResult.rows[0].id;

    // Get ride request details
    const requestResult = await pool.query(
      'SELECT * FROM ride_requests WHERE id = $1 AND status = $2',
      [requestId, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found or already accepted'
      });
    }

    const request = requestResult.rows[0];

    // Create ride
    const rideQuery = `
      INSERT INTO rides (
        rider_id,
        driver_id,
        fare_amount,
        currency,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const rideResult = await pool.query(rideQuery, [
      request.rider_id,
      driverDbId,
      request.estimated_fare_max || 0,
      'NPR',
      'accepted'
    ]);

    const ride = rideResult.rows[0];

    // Update ride request status
    await pool.query(
      `UPDATE ride_requests 
       SET status = 'accepted', 
           matched_driver_id = $1
       WHERE id = $2`,
      [driverDbId, requestId]
    );

    console.log('✅ Ride created:', ride.id);

    res.status(201).json({
      success: true,
      message: 'RIDE_ACCEPTED',
      data: {
        ride_id: ride.id,
        ride: ride
      }
    });

  } catch (error) {
    console.error('❌ Error accepting ride:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

export const getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;

    console.log('📋 Getting ride:', rideId);

    const query = `
      SELECT 
        r.id,
        r.rider_id,
        r.driver_id,
        r.status,
        r.fare_amount,
        r.currency,
        r.request_id,
        r.created_at,
        r.started_at,
        r.completed_at,
        
        -- Request info
        rr.pickup_address,
        rr.dropoff_address,
        rr.pickup_location,
        rr.dropoff_location,
        rr.estimated_distance_km,
        rr.estimated_duration_minutes,
        rr.passenger_count,
        rr.luggage_count,
        rr.vehicle_preference,
        
        -- Rider info - Use email if no name
        COALESCE(
          NULLIF(TRIM(CONCAT(rp.first_name, ' ', rp.last_name)), ''), 
          SPLIT_PART(ra.email, '@', 1),
          'Rider'
        ) as rider_name,
        ra.phone as rider_phone,
        ra.email as rider_email,
        
        -- Driver info - Use email if no name
        COALESCE(
          NULLIF(TRIM(CONCAT(dp.first_name, ' ', dp.last_name)), ''), 
          SPLIT_PART(da.email, '@', 1),
          'Driver'
        ) as driver_name,
        da.phone as driver_phone,
        da.email as driver_email,
        d.user_id as driver_user_id,
        
        -- Vehicle info
        v.vehicle_type,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.color as vehicle_color,
        v.license_plate
        
      FROM rides r
      LEFT JOIN ride_requests rr ON r.request_id = rr.id
      
      -- Rider
      LEFT JOIN users ru ON r.rider_id = ru.id
      LEFT JOIN user_profiles rp ON ru.id = rp.user_id
      LEFT JOIN auth_credentials ra ON ru.id = ra.user_id
      
      -- Driver
      LEFT JOIN drivers d ON r.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      LEFT JOIN user_profiles dp ON du.id = dp.user_id
      LEFT JOIN auth_credentials da ON du.id = da.user_id
      LEFT JOIN vehicles v ON d.id = v.driver_id
      
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [rideId]);

    if (result.rows.length === 0) {
      console.log('❌ No ride found');
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const ride = result.rows[0];
    
    console.log('✅ Ride found!');
    console.log('Rider:', ride.rider_name, '(', ride.rider_email, ')');
    console.log('Driver:', ride.driver_name, '(', ride.driver_email, ')');
    console.log('Pickup:', ride.pickup_address);
    console.log('Dropoff:', ride.dropoff_address);

    // Get stops
    if (ride.request_id) {
      const stopsQuery = `
        SELECT 
          id,
          ride_request_id,
          stop_order,
          stop_type,
          address,
          location,
          arrived_at as actual_arrival_time,
          departed_at as actual_departure_time,
          max_wait_seconds,
          created_at
        FROM ride_stops 
        WHERE ride_request_id = $1 
        ORDER BY stop_order ASC
      `;
      const stopsResult = await pool.query(stopsQuery, [ride.request_id]);
      ride.stops = stopsResult.rows;
      console.log('Found', stopsResult.rows.length, 'stops');
    } else {
      ride.stops = [];
    }

    res.status(200).json({
      success: true,
      data: ride
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// export const getRideDetails = async (req, res) => {
//   try {
//     const { rideId } = req.params;

//     console.log('📋 Getting ride:', rideId);

//     // Simple query that matches your exact database structure
//     const query = `
//       SELECT 
//         r.id,
//         r.rider_id,
//         r.driver_id,
//         r.status,
//         r.fare_amount,
//         r.currency,
//         r.request_id,
//         r.created_at,
//         r.started_at,
//         r.completed_at,
        
//         -- Request info
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pickup_location,
//         rr.dropoff_location,
//         rr.estimated_distance_km,
//         rr.estimated_duration_minutes,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.vehicle_preference,
        
//         -- Rider name and phone
//         CONCAT(rp.first_name, ' ', rp.last_name) as rider_name,
//         ra.phone as rider_phone,
        
//         -- Driver name and phone  
//         CONCAT(dp.first_name, ' ', dp.last_name) as driver_name,
//         da.phone as driver_phone,
        
//         -- Vehicle info
//         v.vehicle_type,
//         v.make as vehicle_make,
//         v.model as vehicle_model,
//         v.color as vehicle_color,
//         v.license_plate
        
//       FROM rides r
//       LEFT JOIN ride_requests rr ON r.request_id = rr.id
//       LEFT JOIN users ru ON r.rider_id = ru.id
//       LEFT JOIN user_profiles rp ON ru.id = rp.user_id
//       LEFT JOIN auth_credentials ra ON ru.id = ra.user_id
//       LEFT JOIN drivers d ON r.driver_id = d.id
//       LEFT JOIN users du ON d.user_id = du.id
//       LEFT JOIN user_profiles dp ON du.id = dp.user_id
//       LEFT JOIN auth_credentials da ON du.id = da.user_id
//       LEFT JOIN vehicles v ON d.id = v.driver_id
//       WHERE r.id = $1
//     `;

//     const result = await pool.query(query, [rideId]);

//     if (result.rows.length === 0) {
//       console.log('❌ No ride found with ID:', rideId);
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found'
//       });
//     }

//     const ride = result.rows[0];
//     console.log('✅ Ride found!');
//     console.log('Status:', ride.status);
//     console.log('Pickup:', ride.pickup_address);
//     console.log('Dropoff:', ride.dropoff_address);

//     // Get stops
//     if (ride.request_id) {
//       const stopsQuery = `SELECT * FROM ride_stops WHERE ride_request_id = $1 ORDER BY stop_order ASC`;
//       const stopsResult = await pool.query(stopsQuery, [ride.request_id]);
//       ride.stops = stopsResult.rows;
//       console.log('Found', stopsResult.rows.length, 'stops');
//     } else {
//       ride.stops = [];
//     }

//     res.status(200).json({
//       success: true,
//       data: ride
//     });

//   } catch (error) {
//     console.error('❌ Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };



// Start ride



export const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    console.log('🚗 Starting ride:', rideId);

    // Get driver's database ID
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [driverId]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const driverDbId = driverResult.rows[0].id;

    // Update ride status
    const result = await pool.query(
      `UPDATE rides 
       SET status = 'started', 
           started_at = NOW()
       WHERE id = $1 AND driver_id = $2 AND status = 'accepted'
       RETURNING *`,
      [rideId, driverDbId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or cannot be started'
      });
    }

    console.log('✅ Ride started');

    res.status(200).json({
      success: true,
      message: 'RIDE_STARTED',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error starting ride:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// Arrive at stop
export const arriveAtStop = async (req, res) => {
  try {
    const { rideId, stopId } = req.params;

    console.log('🚩 Arriving at stop:', stopId);

    const result = await pool.query(
      `UPDATE ride_stops 
       SET actual_arrival_time = NOW(),
           status = 'arrived'
       WHERE id = $1
       RETURNING *`,
      [stopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    console.log('✅ Arrived at stop');

    res.status(200).json({
      success: true,
      message: 'ARRIVED_AT_STOP',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error arriving at stop:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// Depart from stop
export const departFromStop = async (req, res) => {
  try {
    const { rideId, stopId } = req.params;

    console.log('🚀 Departing from stop:', stopId);

    const result = await pool.query(
      `UPDATE ride_stops 
       SET actual_departure_time = NOW(),
           status = 'completed'
       WHERE id = $1
       RETURNING *`,
      [stopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    console.log('✅ Departed from stop');

    res.status(200).json({
      success: true,
      message: 'DEPARTED_FROM_STOP',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error departing from stop:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// // Complete ride
// export const completeRide = async (req, res) => {
//   try {
//     const { rideId } = req.params;
//     const driverId = req.user.id;

//     console.log('🏁 Completing ride:', rideId);

//     // Get driver's database ID
//     const driverResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [driverId]
//     );

//     if (driverResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Driver not found'
//       });
//     }

//     const driverDbId = driverResult.rows[0].id;

//     // Update ride status
//     const result = await pool.query(
//       `UPDATE rides 
//        SET status = 'completed', 
//            completed_at = NOW()
//        WHERE id = $1 AND driver_id = $2 AND status = 'started'
//        RETURNING *`,
//       [rideId, driverDbId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found or cannot be completed'
//       });
//     }

//     const ride = result.rows[0];

//     console.log('✅ Ride completed');

//     // TODO: Emit socket event to rider for real-time notification
//     // TODO: Create payment transaction
//     // TODO: Notify rider to leave review

//     res.status(200).json({
//       success: true,
//       message: 'RIDE_COMPLETED',
//       data: ride
//     });

//   } catch (error) {
//     console.error('❌ Error completing ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };


// Replace the completeRide function in rideController.js

export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    console.log('🏁 Completing ride:', rideId);

    // Get driver's database ID
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [driverId]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const driverDbId = driverResult.rows[0].id;

    // Update ride status
    const result = await pool.query(
      `UPDATE rides 
       SET status = 'completed', 
           completed_at = NOW()
       WHERE id = $1 AND driver_id = $2 AND status = 'started'
       RETURNING *`,
      [rideId, driverDbId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or cannot be completed'
      });
    }

    const ride = result.rows[0];

    console.log('✅ Ride completed');

    // ═══════════════════════════════════════════════════
    // EMIT SOCKET EVENT TO RIDER TO SHOW REVIEW FORM
    // ═══════════════════════════════════════════════════
    const { emitToUser } = await import('../realtime/socketServer.js');
    
    emitToUser(ride.rider_id, 'ride:completed', {
      rideId: ride.id,
      message: 'Ride completed! Please rate your driver.',
      redirectTo: `/rating/${ride.id}`
    });

    console.log('📢 Socket notification sent to rider:', ride.rider_id);

    res.status(200).json({
      success: true,
      message: 'RIDE_COMPLETED',
      data: ride
    });

  } catch (error) {
    console.error('❌ Error completing ride:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};



// Cancel ride
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    console.log('❌ Cancelling ride:', rideId);

    // Get driver's database ID if user is driver
    let driverDbId = null;
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [userId]
    );
    if (driverResult.rows.length > 0) {
      driverDbId = driverResult.rows[0].id;
    }

    // Update ride status
    const result = await pool.query(
      `UPDATE rides 
       SET status = 'cancelled', 
           cancelled_at = NOW()
       WHERE id = $1 
       AND (driver_id = $2 OR rider_id = $3)
       AND status IN ('accepted', 'started')
       RETURNING *`,
      [rideId, driverDbId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or cannot be cancelled'
      });
    }

    console.log('✅ Ride cancelled');

    res.status(200).json({
      success: true,
      message: 'RIDE_CANCELLED',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error cancelling ride:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

export default {
  acceptRideRequest,
  getRideDetails,
  startRide,
  arriveAtStop,
  departFromStop,
  completeRide,
  cancelRide
};