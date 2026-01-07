

// import { pool } from '../database/DBConnection.js';

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
//         ride_request_id,
//         rider_id,
//         driver_id,
//         pickup_location,
//         pickup_address,
//         dropoff_location,
//         dropoff_address,
//         fare_amount,
//         payment_method,
//         status,
//         created_at
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
//       RETURNING *
//     `;

//     const rideResult = await pool.query(rideQuery, [
//       requestId,
//       request.rider_id,
//       driverDbId,
//       request.pickup_location,
//       request.pickup_address,
//       request.dropoff_location,
//       request.dropoff_address,
//       request.estimated_fare_max || 0,
//       request.payment_method || 'cash',
//       'accepted'
//     ]);

//     const ride = rideResult.rows[0];

//     // Update ride request status
//     await pool.query(
//       `UPDATE ride_requests 
//        SET status = 'accepted', 
//            matched_driver_id = $1, 
//            accepted_at = NOW(),
//            created_ride_id = $2
//        WHERE id = $3`,
//       [driverDbId, ride.id, requestId]
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

// // Get ride details
// // export const getRideDetails = async (req, res) => {
// //   try {
// //     const { rideId } = req.params;
// //     const userId = req.user.id;

// //     console.log('📋 Fetching ride details:', rideId);

// //     const query = `
// //       SELECT 
// //         r.*,
// //         CONCAT(up.first_name, ' ', up.last_name) as rider_name,
// //         ac.phone as rider_phone,
// //         (
// //           SELECT json_agg(
// //             json_build_object(
// //               'address', rs.address,
// //               'stop_order', rs.stop_order
// //             ) ORDER BY rs.stop_order
// //           )
// //           FROM ride_stops rs
// //           WHERE rs.ride_id = r.id
// //         ) as stops
// //       FROM rides r
// //       JOIN users u ON r.rider_id = u.id
// //       LEFT JOIN user_profiles up ON u.id = up.user_id
// //       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
// //       WHERE r.id = $1
// //     `;

// //     const result = await pool.query(query, [rideId]);

// //     if (result.rows.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Ride not found'
// //       });
// //     }

// //     console.log('✅ Found ride');

// //     res.status(200).json({
// //       success: true,
// //       data: result.rows[0]
// //     });

// //   } catch (error) {
// //     console.error('❌ Error fetching ride details:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'INTERNAL_SERVER_ERROR',
// //       error: error.message
// //     });
// //   }
// // };

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
//         ac.phone as rider_phone,
//         (
//           SELECT json_agg(
//             json_build_object(
//               'address', rs.address,
//               'stop_order', rs.stop_order
//             ) ORDER BY rs.stop_order
//           )
//           FROM ride_stops rs
//           WHERE rs.ride_request_id = rr.id
//         ) as stops
//       FROM rides r
//       JOIN ride_requests rr ON r.id = rr.created_ride_id
//       JOIN users u ON r.rider_id = u.id
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       LEFT JOIN auth_credentials ac ON u.id = ac.user_id
//       WHERE r.id = $1
//     `;

//     const result = await pool.query(query, [rideId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found'
//       });
//     }

//     console.log('✅ Found ride');

//     res.status(200).json({
//       success: true,
//       data: result.rows[0]
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
//     // socket.to(ride.rider_id).emit('ride:completed', { rideId });

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
//            cancelled_at = NOW(),
//            cancellation_reason = $1
//        WHERE id = $2 
//        AND (driver_id = $3 OR rider_id = $4)
//        AND status IN ('accepted', 'started')
//        RETURNING *`,
//       [reason || 'No reason provided', rideId, driverDbId, userId]
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

// Get ride details with stops
export const getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;

    console.log('📋 Fetching ride details:', rideId);

    const query = `
      SELECT 
        r.*,
        rr.pickup_address,
        rr.dropoff_address,
        rr.pickup_location,
        rr.dropoff_location,
        CONCAT(up.first_name, ' ', up.last_name) as rider_name,
        ac.phone as rider_phone
      FROM rides r
      LEFT JOIN ride_requests rr ON rr.rider_id = r.rider_id
        AND rr.matched_driver_id = (SELECT id FROM drivers WHERE user_id = $2)
        AND rr.status = 'accepted'
      JOIN users u ON r.rider_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN auth_credentials ac ON u.id = ac.user_id
      WHERE r.id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [rideId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const ride = result.rows[0];

    // Get stops for this ride request
    const stopsQuery = `
      SELECT * FROM ride_stops
      WHERE ride_request_id = (
        SELECT id FROM ride_requests 
        WHERE rider_id = $1 
        AND matched_driver_id = (SELECT id FROM drivers WHERE user_id = $2)
        AND status = 'accepted'
        LIMIT 1
      )
      ORDER BY stop_order ASC
    `;

    const stopsResult = await pool.query(stopsQuery, [ride.rider_id, req.user.id]);
    ride.stops = stopsResult.rows;

    console.log('✅ Found ride with', stopsResult.rows.length, 'stops');

    res.status(200).json({
      success: true,
      data: ride
    });

  } catch (error) {
    console.error('❌ Error fetching ride details:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

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

// Complete ride
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

    // TODO: Emit socket event to rider for real-time notification
    // TODO: Create payment transaction
    // TODO: Notify rider to leave review

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