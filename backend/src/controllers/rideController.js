


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



























// import { pool } from '../database/DBConnection.js';
// import { notifyBidAccepted, notifyRideStatusChange } from '../realtime/socketServer.js';


// /**
//  * Accept a ride request
//  * POST /api/rides/accept/:requestId
//  * 
//  * Middleware: verifyuser, ensureDriverProfile
//  * Body: { fareAmount: number } - optional, defaults to estimated_fare_max
//  */
// export const acceptRideRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const { fareAmount } = req.body; // Get fare from request body
//     const userId = req.user.id;
//     const driverId = req.driverId; 

//     console.log('✅ Driver accepting ride request:', requestId);
//     console.log('Driver ID:', driverId);

//     // ─────────────────────────────────────────────────────────────────────────
//     // Get ride request details
//     // ─────────────────────────────────────────────────────────────────────────
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

//     // ─────────────────────────────────────────────────────────────────────────
//     // Validate fare amount (if provided)
//     // ─────────────────────────────────────────────────────────────────────────
//     let finalFare = fareAmount || request.estimated_fare_max || 0;

//     // Ensure fare is within min/max range
//     if (request.estimated_fare_min && finalFare < request.estimated_fare_min) {
//       return res.status(400).json({
//         success: false,
//         message: `Fare amount must be at least ₹${request.estimated_fare_min}`
//       });
//     }

//     if (request.estimated_fare_max && finalFare > request.estimated_fare_max) {
//       return res.status(400).json({
//         success: false,
//         message: `Fare amount cannot exceed ₹${request.estimated_fare_max}`
//       });
//     }

//     console.log('💰 Final fare amount:', finalFare);

//     // ─────────────────────────────────────────────────────────────────────────
//     // Create ride in a transaction
//     // ─────────────────────────────────────────────────────────────────────────
//     const client = await pool.connect();

//     try {
//       await client.query('BEGIN');

//       // Create ride
//       const rideQuery = `
//         INSERT INTO rides (
//           rider_id,
//           driver_id,
//           fare_amount,
//           currency,
//           status,
//           request_id,
//           created_at,
//           accepted_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
//         RETURNING *
//       `;

//       const rideResult = await client.query(rideQuery, [
//         request.rider_id,
//         driverId,
//         finalFare,
//         'NPR',
//         'accepted',
//         requestId
//       ]);

//       const ride = rideResult.rows[0];
//       console.log('✅ Ride created:', ride.id);

//       // Update ride request status
//       await client.query(
//         `UPDATE ride_requests 
//          SET status = 'accepted', 
//              matched_driver_id = $1,
//              actual_fare = $2,
//              updated_at = NOW()
//          WHERE id = $3`,
//         [driverId, finalFare, requestId]
//       );

//       console.log('✅ Ride request updated');

//       // Copy ride stops from request to ride (if any)
//       const stopsResult = await client.query(
//         `UPDATE ride_stops 
//          SET id = $1 
//          WHERE ride_request_id = $2
//          RETURNING *`,
//         [ride.id, requestId]
//       );

//       console.log('✅ Stops linked to ride:', stopsResult.rows.length);

//       await client.query('COMMIT');

//       // ─────────────────────────────────────────────────────────────────────
//       // Send socket notification to rider (optional)
//       // ─────────────────────────────────────────────────────────────────────
//       try {
//         const { emitToUser } = await import('../realtime/socketServer.js');

//         emitToUser(request.rider_id, 'ride:accepted', {
//           rideId: ride.id,
//           message: 'A driver has accepted your ride!',
//           driverName: req.user.firstName || 'Your driver',
//           fareAmount: finalFare,
//           redirectTo: `/rider/active-ride/${ride.id}`
//         });

//         console.log('📢 Socket notification sent to rider');
//       } catch (socketError) {
//         console.error('⚠️ Socket notification failed:', socketError.message);
//         // Continue even if socket fails
//       }

//       // ─────────────────────────────────────────────────────────────────────
//       // Return success response
//       // ─────────────────────────────────────────────────────────────────────
//       res.status(201).json({
//         success: true,
//         message: 'RIDE_ACCEPTED',
//         data: {
//           ride_id: ride.id,
//           fare_amount: finalFare,
//           status: 'accepted',
//           rider_id: request.rider_id,
//           pickup_address: request.pickup_address,
//           dropoff_address: request.dropoff_address,
//           ride: ride
//         }
//       });

//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }

//   } catch (error) {
//     console.error('❌ Error accepting ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// export const getRideDetails = async (req, res) => {
//   try {
//     const { rideId } = req.params;

//     console.log('📋 Getting ride:', rideId);

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

//         -- Rider info - Use email if no name
//         COALESCE(
//           NULLIF(TRIM(CONCAT(rp.first_name, ' ', rp.last_name)), ''), 
//           SPLIT_PART(ra.email, '@', 1),
//           'Rider'
//         ) as rider_name,
//         ra.phone as rider_phone,
//         ra.email as rider_email,

//         -- Driver info - Use email if no name
//         COALESCE(
//           NULLIF(TRIM(CONCAT(dp.first_name, ' ', dp.last_name)), ''), 
//           SPLIT_PART(da.email, '@', 1),
//           'Driver'
//         ) as driver_name,
//         da.phone as driver_phone,
//         da.email as driver_email,
//         d.user_id as driver_user_id,

//         -- Vehicle info
//         v.vehicle_type,
//         v.make as vehicle_make,
//         v.model as vehicle_model,
//         v.color as vehicle_color,
//         v.license_plate

//       FROM rides r
//       LEFT JOIN ride_requests rr ON r.request_id = rr.id

//       -- Rider
//       LEFT JOIN users ru ON r.rider_id = ru.id
//       LEFT JOIN user_profiles rp ON ru.id = rp.user_id
//       LEFT JOIN auth_credentials ra ON ru.id = ra.user_id

//       -- Driver
//       LEFT JOIN drivers d ON r.driver_id = d.id
//       LEFT JOIN users du ON d.user_id = du.id
//       LEFT JOIN user_profiles dp ON du.id = dp.user_id
//       LEFT JOIN auth_credentials da ON du.id = da.user_id
//       LEFT JOIN vehicles v ON d.id = v.driver_id

//       WHERE r.id = $1
//     `;

//     const result = await pool.query(query, [rideId]);

//     if (result.rows.length === 0) {
//       console.log('❌ No ride found');
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found'
//       });
//     }

//     const ride = result.rows[0];

//     console.log('✅ Ride found!');
//     console.log('Rider:', ride.rider_name, '(', ride.rider_email, ')');
//     console.log('Driver:', ride.driver_name, '(', ride.driver_email, ')');
//     console.log('Pickup:', ride.pickup_address);
//     console.log('Dropoff:', ride.dropoff_address);

//     // Get stops
//     if (ride.request_id) {
//       const stopsQuery = `
//         SELECT 
//           id,
//           ride_request_id,
//           stop_order,
//           stop_type,
//           address,
//           location,
//           arrived_at as actual_arrival_time,
//           departed_at as actual_departure_time,
//           max_wait_seconds,
//           created_at
//         FROM ride_stops 
//         WHERE ride_request_id = $1 
//         ORDER BY stop_order ASC
//       `;
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

// // export const getRideDetails = async (req, res) => {
// //   try {
// //     const { rideId } = req.params;

// //     console.log('📋 Getting ride:', rideId);

// //     // Simple query that matches your exact database structure
// //     const query = `
// //       SELECT 
// //         r.id,
// //         r.rider_id,
// //         r.driver_id,
// //         r.status,
// //         r.fare_amount,
// //         r.currency,
// //         r.request_id,
// //         r.created_at,
// //         r.started_at,
// //         r.completed_at,

// //         -- Request info
// //         rr.pickup_address,
// //         rr.dropoff_address,
// //         rr.pickup_location,
// //         rr.dropoff_location,
// //         rr.estimated_distance_km,
// //         rr.estimated_duration_minutes,
// //         rr.passenger_count,
// //         rr.luggage_count,
// //         rr.vehicle_preference,

// //         -- Rider name and phone
// //         CONCAT(rp.first_name, ' ', rp.last_name) as rider_name,
// //         ra.phone as rider_phone,

// //         -- Driver name and phone  
// //         CONCAT(dp.first_name, ' ', dp.last_name) as driver_name,
// //         da.phone as driver_phone,

// //         -- Vehicle info
// //         v.vehicle_type,
// //         v.make as vehicle_make,
// //         v.model as vehicle_model,
// //         v.color as vehicle_color,
// //         v.license_plate

// //       FROM rides r
// //       LEFT JOIN ride_requests rr ON r.request_id = rr.id
// //       LEFT JOIN users ru ON r.rider_id = ru.id
// //       LEFT JOIN user_profiles rp ON ru.id = rp.user_id
// //       LEFT JOIN auth_credentials ra ON ru.id = ra.user_id
// //       LEFT JOIN drivers d ON r.driver_id = d.id
// //       LEFT JOIN users du ON d.user_id = du.id
// //       LEFT JOIN user_profiles dp ON du.id = dp.user_id
// //       LEFT JOIN auth_credentials da ON du.id = da.user_id
// //       LEFT JOIN vehicles v ON d.id = v.driver_id
// //       WHERE r.id = $1
// //     `;

// //     const result = await pool.query(query, [rideId]);

// //     if (result.rows.length === 0) {
// //       console.log('❌ No ride found with ID:', rideId);
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Ride not found'
// //       });
// //     }

// //     const ride = result.rows[0];
// //     console.log('✅ Ride found!');
// //     console.log('Status:', ride.status);
// //     console.log('Pickup:', ride.pickup_address);
// //     console.log('Dropoff:', ride.dropoff_address);

// //     // Get stops
// //     if (ride.request_id) {
// //       const stopsQuery = `SELECT * FROM ride_stops WHERE ride_request_id = $1 ORDER BY stop_order ASC`;
// //       const stopsResult = await pool.query(stopsQuery, [ride.request_id]);
// //       ride.stops = stopsResult.rows;
// //       console.log('Found', stopsResult.rows.length, 'stops');
// //     } else {
// //       ride.stops = [];
// //     }

// //     res.status(200).json({
// //       success: true,
// //       data: ride
// //     });

// //   } catch (error) {
// //     console.error('❌ Error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'INTERNAL_SERVER_ERROR',
// //       error: error.message
// //     });
// //   }
// // };



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



//     /// update the client side as well using socket



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

// // // Complete ride
// // export const completeRide = async (req, res) => {
// //   try {
// //     const { rideId } = req.params;
// //     const driverId = req.user.id;

// //     console.log('🏁 Completing ride:', rideId);

// //     // Get driver's database ID
// //     const driverResult = await pool.query(
// //       'SELECT id FROM drivers WHERE user_id = $1',
// //       [driverId]
// //     );

// //     if (driverResult.rows.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Driver not found'
// //       });
// //     }

// //     const driverDbId = driverResult.rows[0].id;

// //     // Update ride status
// //     const result = await pool.query(
// //       `UPDATE rides 
// //        SET status = 'completed', 
// //            completed_at = NOW()
// //        WHERE id = $1 AND driver_id = $2 AND status = 'started'
// //        RETURNING *`,
// //       [rideId, driverDbId]
// //     );

// //     if (result.rows.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Ride not found or cannot be completed'
// //       });
// //     }

// //     const ride = result.rows[0];

// //     console.log('✅ Ride completed');

// //     // TODO: Emit socket event to rider for real-time notification
// //     // TODO: Create payment transaction
// //     // TODO: Notify rider to leave review

// //     res.status(200).json({
// //       success: true,
// //       message: 'RIDE_COMPLETED',
// //       data: ride
// //     });

// //   } catch (error) {
// //     console.error('❌ Error completing ride:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'INTERNAL_SERVER_ERROR',
// //       error: error.message
// //     });
// //   }
// // };


// // Replace the completeRide function in rideController.js

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

//     // ═══════════════════════════════════════════════════
//     // EMIT SOCKET EVENT TO RIDER TO SHOW REVIEW FORM
//     // ═══════════════════════════════════════════════════
//     const { emitToUser } = await import('../realtime/socketServer.js');

//     emitToUser(ride.rider_id, 'ride:completed', {
//       rideId: ride.id,
//       message: 'Ride completed! Please rate your driver.',
//       redirectTo: `/rating/${ride.id}`
//     });

//     console.log('📢 Socket notification sent to rider:', ride.rider_id);

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






// -------------------------------------------------















import { RidePaymentService } from '../application/services/RidePaymentService.js';
import { pool } from '../database/DBConnection.js';
import { withTransaction } from '../infrastructure/transactions/withTransaction.js';
import { emitToUser } from '../realtime/socketServer.js';
import PaymentMethod from "../models/finance/payment_method/PaymentMethod.js";
import PaymentProvider from "../models/finance/payment_method/payment_provider/PaymentProvider.js";
import Ride from "../models/ride/Ride.js";
import RideRequest from "../models/ride/RideRequest.js";
import { AppError } from "../utils/AppError.js";

/**
 * ✅ FIXED: Accept a ride request with Socket.io notification to rider
 * POST /api/rides/accept/:requestId
 */
// export const acceptRideRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const { fareAmount } = req.body;
//     const userId = req.user.id;
//     const driverId = req.driverId;

//     console.log('✅ Driver accepting ride request:', requestId);
//     console.log('Driver ID:', driverId);

//     // ─────────────────────────────────────────────────────────────────────────
//     // Get ride request details
//     // ─────────────────────────────────────────────────────────────────────────
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

//     // ─────────────────────────────────────────────────────────────────────────
//     // Validate fare amount
//     // ─────────────────────────────────────────────────────────────────────────
//     let finalFare = fareAmount || request.estimated_fare_max || 0;

//     if (request.estimated_fare_min && finalFare < request.estimated_fare_min) {
//       return res.status(400).json({
//         success: false,
//         message: `Fare amount must be at least ₹${request.estimated_fare_min}`
//       });
//     }

//     if (request.estimated_fare_max && finalFare > request.estimated_fare_max) {
//       return res.status(400).json({
//         success: false,
//         message: `Fare amount cannot exceed ₹${request.estimated_fare_max}`
//       });
//     }

//     console.log('💰 Final fare amount:', finalFare);

//     // ─────────────────────────────────────────────────────────────────────────
//     // Create ride in a transaction
//     // ─────────────────────────────────────────────────────────────────────────
//     const client = await pool.connect();

//     try {
//       await client.query('BEGIN');

//       // Create ride
//       const rideQuery = `
//         INSERT INTO rides (
//           rider_id,
//           driver_id,
//           fare_amount,
//           currency,
//           status,
//           request_id,
//           created_at,
//           accepted_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
//         RETURNING *
//       `;

//       const rideResult = await client.query(rideQuery, [
//         request.rider_id,
//         driverId,
//         finalFare,
//         'NPR',
//         'accepted',
//         requestId
//       ]);

//       const ride = rideResult.rows[0];
//       console.log('✅ Ride created:', ride.id);

//       // Update ride request status
//       await client.query(
//         `UPDATE ride_requests 
//          SET status = 'accepted', 
//              matched_driver_id = $1,
//              actual_fare = $2,
//              updated_at = NOW()
//          WHERE id = $3`,
//         [driverId, finalFare, requestId]
//       );

//       console.log('✅ Ride request updated');

//       // Get driver details for notification
//       const driverInfoQuery = `
//         SELECT 
//           u.id as user_id,
//           COALESCE(
//             NULLIF(TRIM(CONCAT(up.first_name, ' ', up.last_name)), ''),
//             SPLIT_PART(ac.email, '@', 1),
//             'Driver'
//           ) as driver_name,
//           ac.phone as driver_phone,
//           v.vehicle_type,
//           v.make,
//           v.model,
//           v.license_plate
//         FROM drivers d
//         LEFT JOIN users u ON d.user_id = u.id
//         LEFT JOIN user_profiles up ON u.id = up.user_id
//         LEFT JOIN auth_credentials ac ON u.id = ac.user_id
//         LEFT JOIN vehicles v ON d.id = v.driver_id
//         WHERE d.id = $1
//         LIMIT 1
//       `;

//       const driverInfo = await client.query(driverInfoQuery, [driverId]);
//       const driver = driverInfo.rows[0] || {};

//       await client.query('COMMIT');

//       // ═══════════════════════════════════════════════════════════════════════
//       // 🔥 SOCKET.IO: NOTIFY RIDER THAT DRIVER ACCEPTED THE RIDE
//       // ═══════════════════════════════════════════════════════════════════════
//       console.log('📢 Sending Socket notification to rider:', request.rider_id);

//       emitToUser(request.rider_id, 'ride:accepted', {
//         rideId: ride.id,
//         requestId: requestId,
//         status: 'accepted',
//         message: '🎉 A driver has accepted your ride!',
//         driver: {
//           id: driverId,
//           name: driver.driver_name || 'Driver',
//           phone: driver.driver_phone || '',
//           vehicle: driver.vehicle_type || '',
//           vehicleModel: driver.make && driver.model ? `${driver.make} ${driver.model}` : '',
//           licensePlate: driver.license_plate || ''
//         },
//         fareAmount: finalFare,
//         pickup: request.pickup_address,
//         dropoff: request.dropoff_address,
//         timestamp: new Date().toISOString()
//       });

//       console.log('✅ Socket notification sent!');

//       // ─────────────────────────────────────────────────────────────────────
//       // Return success response
//       // ─────────────────────────────────────────────────────────────────────
//       res.status(201).json({
//         success: true,
//         message: 'RIDE_ACCEPTED',
//         data: {
//           ride_id: ride.id,
//           fare_amount: finalFare,
//           status: 'accepted',
//           rider_id: request.rider_id,
//           pickup_address: request.pickup_address,
//           dropoff_address: request.dropoff_address,
//           ride: ride
//         }
//       });

//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }

//   } catch (error) {
//     console.error('❌ Error accepting ride:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };


export const acceptRideRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const driverId = req.driverId;

    const result = await withTransaction(async (client) => {

      const request = await RideRequest.findOne(
        { id: requestId, status: "pending" },
        client
      );

      if (!request) {
        throw new AppError("REQUEST_NOT_FOUND", 404);
      }

      // Use estimated_fare_max for authorization (Uber style buffer)
      const estimatedFare = parseFloat(request.estimated_fare_max);

      // 1️⃣ Create ride with copied estimated values
      const ride = await Ride.create({
        rider_id: request.rider_id,
        driver_id: driverId,
        status: "accepted",
        accepted_at: new Date(),
        estimated_distance_km: request.estimated_distance_km,
        estimated_duration_minutes: request.estimated_duration_minutes,
        estimated_fare: estimatedFare
      }, client);

      // 2️⃣ Mark request accepted
      await RideRequest.updateOne(
        { id: requestId },
        {
          status: "accepted",
          matched_driver_id: driverId
        },
        client
      );

      // 3️⃣ Fetch rider default payment method
      const paymentMethod = await PaymentMethod.findOne({
        user_id: request.rider_id,
        is_default: true,
        is_active: true,
        is_deleted: false
      }, client);

      if (!paymentMethod) {
        throw new AppError("DEFAULT_PAYMENT_METHOD_NOT_SET", 400);
      }

      const provider = await PaymentProvider.findOne(
        { id: paymentMethod.provider_id, is_active: true },
        client
      );

      if (!provider) {
        throw new AppError("INVALID_PAYMENT_PROVIDER", 400);
      }

      // 4️⃣ Map provider type → paymentSource
      let paymentSource = "gateway";
      if (provider.type === "WALLET") {
        paymentSource = "wallet";
      }

      // 5️⃣ Authorize payment immediately (Uber behavior)
      await RidePaymentService.authorizeRidePayment({
        rideId: ride.id,
        riderId: request.rider_id,
        driverId: driverId,
        amount: estimatedFare,
        platformFee: estimatedFare * 0.03,
        paymentSource
      });

      return {
        ride,
        riderId: request.rider_id
      };
    });

    // Emit after commit
    emitToUser(result.riderId, "ride:accepted", {
      rideId: result.ride.id,
      status: "accepted"
    });

    res.status(201).json({
      success: true,
      message: "RIDE_ACCEPTED",
      data: result.ride
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




/**
 * Get ride details with proper null checks
 */
// export const getRideDetails = async (req, res) => {
//   try {
//     const { rideId } = req.params;

//     console.log('📋 Getting ride:', rideId);

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

//         -- Rider info
//         COALESCE(
//           NULLIF(TRIM(CONCAT(rp.first_name, ' ', rp.last_name)), ''), 
//           SPLIT_PART(ra.email, '@', 1),
//           'Rider'
//         ) as rider_name,
//         ra.phone as rider_phone,
//         ra.email as rider_email,

//         -- Driver info
//         COALESCE(
//           NULLIF(TRIM(CONCAT(dp.first_name, ' ', dp.last_name)), ''), 
//           SPLIT_PART(da.email, '@', 1),
//           'Driver'
//         ) as driver_name,
//         da.phone as driver_phone,
//         da.email as driver_email,
//         d.user_id as driver_user_id,

//         -- Vehicle info
//         v.vehicle_type,
//         v.make as vehicle_make,
//         v.model as vehicle_model,
//         v.color as vehicle_color,
//         v.license_plate

//       FROM rides r
//       LEFT JOIN ride_requests rr ON r.request_id = rr.id

//       -- Rider
//       LEFT JOIN users ru ON r.rider_id = ru.id
//       LEFT JOIN user_profiles rp ON ru.id = rp.user_id
//       LEFT JOIN auth_credentials ra ON ru.id = ra.user_id

//       -- Driver
//       LEFT JOIN drivers d ON r.driver_id = d.id
//       LEFT JOIN users du ON d.user_id = du.id
//       LEFT JOIN user_profiles dp ON du.id = dp.user_id
//       LEFT JOIN auth_credentials da ON du.id = da.user_id
//       LEFT JOIN vehicles v ON d.id = v.driver_id

//       WHERE r.id = $1
//     `;

//     const result = await pool.query(query, [rideId]);

//     if (result.rows.length === 0) {
//       console.log('❌ No ride found');
//       return res.status(404).json({
//         success: false,
//         message: 'Ride not found'
//       });
//     }

//     const ride = result.rows[0];

//     console.log('✅ Ride found!');

//     // Get stops
//     if (ride.request_id) {
//       const stopsQuery = `
//         SELECT 
//           id,
//           ride_request_id,
//           stop_order,
//           stop_type,
//           address,
//           location,
//           arrived_at as actual_arrival_time,
//           departed_at as actual_departure_time,
//           max_wait_seconds,
//           created_at
//         FROM ride_stops 
//         WHERE ride_request_id = $1 
//         ORDER BY stop_order ASC
//       `;
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



// FIXED getRideDetails query (rideController.js around line 250-350)

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
        r.created_at,
        r.started_at,
        r.completed_at,
        
        -- Request info
        rr.id as request_id,
        rr.pickup_address,
        rr.dropoff_address,
        rr.pickup_location,
        rr.dropoff_location,
        rr.estimated_distance_km,
        rr.estimated_duration_minutes,
        rr.passenger_count,
        rr.luggage_count,
        rr.vehicle_preference,
        
        -- Rider info
        COALESCE(
          NULLIF(TRIM(CONCAT(k_rider.first_name, ' ', k_rider.last_name)), ''), 
          SPLIT_PART(ra.email, '@', 1),
          'Rider'
        ) as rider_name,
        ra.phone as rider_phone,
        ra.email as rider_email,
        
        -- Driver info
        COALESCE(
          NULLIF(TRIM(CONCAT(k_driver.first_name, ' ', k_driver.last_name)), ''), 
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
      LEFT JOIN ride_requests rr ON rr.created_ride_id = r.id
      
      -- Rider
      LEFT JOIN users ru ON r.rider_id = ru.id
      LEFT JOIN kyc k_rider ON ru.id = k_rider.user_id
      LEFT JOIN auth_credentials ra ON ru.id = ra.user_id
      
      -- Driver
      LEFT JOIN drivers d ON r.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      LEFT JOIN kyc k_driver ON du.id = k_driver.user_id
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
    actual_arrival_time,
    actual_departure_time,
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
/**
 * ✅ FIXED: Start ride with Socket.io notification
 */
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

    const ride = result.rows[0];
    console.log('✅ Ride started');

    // ═══════════════════════════════════════════════════════════════════════
    // 🔥 SOCKET.IO: NOTIFY RIDER THAT RIDE HAS STARTED
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📢 Sending ride started notification to rider:', ride.rider_id);

    emitToUser(ride.rider_id, 'ride:started', {
      rideId: ride.id,
      status: 'started',
      message: '🚗 Your ride has started!',
      timestamp: new Date().toISOString()
    });

    console.log('✅ Socket notification sent!');

    res.status(200).json({
      success: true,
      message: 'RIDE_STARTED',
      data: ride
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

/**
 * Arrive at stop
 */
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

/**
 * Depart from stop
 */
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

/**
 * ✅ FIXED: Complete ride with Socket.io notification
 */
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

    // ═══════════════════════════════════════════════════════════════════════
    // 🔥 SOCKET.IO: NOTIFY RIDER TO SHOW REVIEW FORM
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📢 Sending ride completed notification to rider:', ride.rider_id);

    emitToUser(ride.rider_id, 'ride:completed', {
      rideId: ride.id,
      status: 'completed',
      message: '✅ Ride completed! Please rate your driver.',
      redirectTo: `/rating/${ride.id}`,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Socket notification sent!');

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

/**
 * Cancel ride
 */
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