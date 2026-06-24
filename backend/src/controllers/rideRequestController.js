// import { RideRequestService } from "../application/services/RideRequestService.js";
// import { DriverMatchingService } from "../application/services/DriverMatchingService.js";
// import { broadcastRideRequest } from "../realtime/socketServer.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { pool } from '../database/DBConnection.js';
// const requestService = new RideRequestService();
// const matchingService = new DriverMatchingService();

// // export const createRideRequest = async (req, res, next) => {
// //   try {
// //     const result = await requestService.createRideRequest({
// //       riderId: req.user.id,
// //       ...req.body
// //     });

// //     // Find eligible drivers and broadcast
// //     const drivers = await matchingService.findEligibleDrivers(result.requestId);
// //     const driverIds = drivers.map(d => d.driverId);

// //     broadcastRideRequest({
// //       requestId: result.requestId,
// //       pickup: req.body.pickup,
// //       dropoff: req.body.dropoff,
// //       estimatedFare: result.estimatedFare,
// //       pricingMode: req.body.pricingMode
// //     }, driverIds);

// //     res.status(201).json(ApiResponse.success(result));
// //   } catch (err) {
// //     next(err);
// //   }
// // };
// // In your backend controller file (e.g., controllers/rideRequestController.js)





// // export const createRideRequest = async (req, res) => {
// //   try {
// //     const {
// //       pickupLocation,
// //       pickupAddress,
// //       dropoffLocation,
// //       dropoffAddress,
// //       stops,
// //       pricingMode,
// //       vehiclePreference,
// //       passengerCount,
// //       luggageCount
// //     } = req.body;

// //     const userId = req.user.id;

// //     console.log('📝 Creating ride request for user:', userId);
// //     console.log('📍 Pickup:', pickupAddress);
// //     console.log('📍 Dropoff:', dropoffAddress);

// //     // Format coordinates for PostGIS
// //     const pickupCoords = `POINT(${pickupLocation.coordinates[0]} ${pickupLocation.coordinates[1]})`;
// //     const dropoffCoords = `POINT(${dropoffLocation.coordinates[0]} ${dropoffLocation.coordinates[1]})`;

// //     const query = `
// //       INSERT INTO ride_requests (
// //         rider_id,
// //         pickup_location,
// //         pickup_address,
// //         dropoff_location,
// //         dropoff_address,
// //         pricing_mode,
// //         vehicle_preference,
// //         passenger_count,
// //         luggage_count,
// //         status,
// //         created_at
// //       ) VALUES ($1, ST_GeomFromText($2, 4326), $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9, $10, NOW())
// //       RETURNING *
// //     `;

// //     const values = [
// //       userId,
// //       pickupCoords,
// //       pickupAddress,
// //       dropoffCoords,
// //       dropoffAddress,
// //       pricingMode || 'bidding',
// //       vehiclePreference || 'sedan',
// //       passengerCount || 1,
// //       luggageCount || 0,
// //       'pending'
// //     ];

// //     const result = await pool.query(query, values);
// //     const rideRequest = result.rows[0];

// //     console.log('✅ Ride request created:', rideRequest.id);

// //     // Insert stops if any (max 2)
// //     if (stops && stops.length > 0) {
// //       const maxStops = Math.min(stops.length, 2);
// //       console.log(`📍 Adding ${maxStops} stops...`);

// //       for (let i = 0; i < maxStops; i++) {
// //         const stop = stops[i];
// //         const stopCoords = `POINT(${stop.location.coordinates[0]} ${stop.location.coordinates[1]})`;

// //         await pool.query(
// //           `INSERT INTO ride_stops (
// //             ride_request_id,
// //             location,
// //             address,
// //             stop_order,
// //             stop_type,
// //             max_wait_seconds,
// //             created_at
// //           ) VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5, $6, NOW())`,
// //           [
// //             rideRequest.id,
// //             stopCoords,
// //             stop.address,
// //             i + 1,
// //             'detour',
// //             stop.maxWaitSeconds || 120
// //           ]
// //         );
// //       }

// //       console.log('✅ Stops added successfully');
// //     }

// //     res.status(201).json({
// //       success: true,
// //       message: 'Ride request created successfully',
// //       data: rideRequest
// //     });

// //   } catch (error) {
// //     console.error('❌ Error creating ride request:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'INTERNAL_SERVER_ERROR',
// //       error: error.message,
// //       code: 500,
// //       data: {}
// //     });
// //   }
// // };

// export const createRideRequest = async (req, res) => {
//   try {
//     const {
//       pickupLocation,
//       pickupAddress,
//       dropoffLocation,
//       dropoffAddress,
//       stops,
//       pricingMode,
//       vehiclePreference,
//       passengerCount,
//       luggageCount
//     } = req.body;

//     const userId = req.user.id;

//     console.log('📝 Creating ride request for user:', userId);
//     console.log('📍 Pickup:', pickupAddress);
//     console.log('📍 Dropoff:', dropoffAddress);

//     // Calculate distance using Haversine formula
//     const toRadians = (degrees) => degrees * (Math.PI / 180);

//     const lat1 = pickupLocation.coordinates[1];
//     const lon1 = pickupLocation.coordinates[0];
//     const lat2 = dropoffLocation.coordinates[1];
//     const lon2 = dropoffLocation.coordinates[0];

//     const R = 6371; // Earth's radius in km
//     const dLat = toRadians(lat2 - lat1);
//     const dLon = toRadians(lon2 - lon1);

//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//               Math.sin(dLon / 2) * Math.sin(dLon / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // Distance in km

//     // Calculate fare: ₹20 per km
//     const baseFare = Math.round(distance * 20);
//     const estimatedFareMin = Math.round(baseFare * 0.9); // 10% lower
//     const estimatedFareMax = Math.round(baseFare * 1.1); // 10% higher
//     const estimatedDuration = Math.round(distance * 3); // Rough estimate: 3 min per km

//     console.log(`📏 Distance: ${distance.toFixed(2)} km`);
//     console.log(`💰 Estimated fare: ₹${estimatedFareMin} - ₹${estimatedFareMax}`);

//     // Format coordinates for PostGIS
//     const pickupCoords = `POINT(${pickupLocation.coordinates[0]} ${pickupLocation.coordinates[1]})`;
//     const dropoffCoords = `POINT(${dropoffLocation.coordinates[0]} ${dropoffLocation.coordinates[1]})`;

//     const query = `
//       INSERT INTO ride_requests (
//         rider_id,
//         pickup_location,
//         pickup_address,
//         dropoff_location,
//         dropoff_address,
//         pricing_mode,
//         vehicle_preference,
//         passenger_count,
//         luggage_count,
//         estimated_distance_km,
//         estimated_duration_minutes,
//         estimated_fare_min,
//         estimated_fare_max,
//         status,
//         created_at
//       ) VALUES ($1, ST_GeomFromText($2, 4326), $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
//       RETURNING *
//     `;

//     const values = [
//       userId,
//       pickupCoords,
//       pickupAddress,
//       dropoffCoords,
//       dropoffAddress,
//       pricingMode || 'bidding',
//       vehiclePreference || 'sedan',
//       passengerCount || 1,
//       luggageCount || 0,
//       distance.toFixed(2),
//       estimatedDuration,
//       estimatedFareMin,
//       estimatedFareMax,
//       'pending'
//     ];

//     const result = await pool.query(query, values);
//     const rideRequest = result.rows[0];

//     console.log('✅ Ride request created:', rideRequest.id);

//     // Insert stops if any (max 2)
//     if (stops && stops.length > 0) {
//       const maxStops = Math.min(stops.length, 2);
//       console.log(`📍 Adding ${maxStops} stops...`);

//       for (let i = 0; i < maxStops; i++) {
//         const stop = stops[i];
//         const stopCoords = `POINT(${stop.location.coordinates[0]} ${stop.location.coordinates[1]})`;

//         await pool.query(
//           `INSERT INTO ride_stops (
//             ride_request_id,
//             location,
//             address,
//             stop_order,
//             stop_type,
//             max_wait_seconds,
//             created_at
//           ) VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5, $6, NOW())`,
//           [
//             rideRequest.id,
//             stopCoords,
//             stop.address,
//             i + 1,
//             'detour',
//             stop.maxWaitSeconds || 120
//           ]
//         );
//       }

//       console.log('✅ Stops added successfully');
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Ride request created successfully',
//       data: rideRequest
//     });

//   } catch (error) {
//     console.error('❌ Error creating ride request:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message,
//       code: 500,
//       data: {}
//     });
//   }
// };


// // // export const getRiderRequests = async (req, res, next) => {

// // //   try {
// // //     const requests = await requestService.getRiderRequests(
// // //       req.user.id,
// // //       req.query.status
// // //     );
// // //     res.json(ApiResponse.success(requests));
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };
// // // Get rider's ride requests
// // export const getRiderRequests = async (req, res) => {
// //   try {
// //     const riderId = req.user.id;
// //     const { status } = req.query;

// //     console.log('📋 Fetching ride requests for rider:', riderId);

// //     let query = `
// //       SELECT 
// //         rr.id,
// //         rr.rider_id,
// //         rr.pickup_address,
// //         rr.dropoff_address,
// //         rr.pricing_mode,
// //         rr.vehicle_preference,
// //         rr.passenger_count,
// //         rr.luggage_count,
// //         rr.special_instructions,
// //         rr.status,
// //         rr.created_at,
// //         rr.estimated_distance_km,
// //         rr.estimated_duration_minutes,
// //         rr.estimated_fare_min,
// //         rr.estimated_fare_max
// //       FROM ride_requests rr
// //       WHERE rr.rider_id = $1
// //     `;

// //     const params = [riderId];

// //     if (status) {
// //       query += ` AND rr.status = $2`;
// //       params.push(status);
// //     }

// //     query += ` ORDER BY rr.created_at DESC LIMIT 20`;

// //     const result = await pool.query(query, params);

// //     console.log(`✅ Found ${result.rows.length} ride requests`);

// //     res.status(200).json({
// //       success: true,
// //       data: result.rows
// //     });

// //   } catch (error) {
// //     console.error('❌ Error fetching ride requests:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'INTERNAL_SERVER_ERROR',
// //       error: error.message
// //     });
// //   }
// // };
// // export const getRideRequestDetails = async (req, res, next) => {
// //   try {
// //     const details = await requestService.getRideRequestDetails(req.params.id);
// //     res.json(ApiResponse.success(details));
// //   } catch (err) {
// //     next(err);
// //   }
// // };
// // Get single ride request details
// export const getRideRequestDetails = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log('📋 Fetching ride request details:', id);

//     const query = `
//       SELECT 
//         rr.id,
//         rr.rider_id,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pricing_mode,
//         rr.vehicle_preference,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.special_instructions,
//         rr.status,
//         rr.created_at,
//         rr.estimated_distance_km,
//         rr.estimated_duration_minutes,
//         rr.estimated_fare_min,
//         rr.estimated_fare_max
//       FROM ride_requests rr
//       WHERE rr.id = $1
//     `;

//     const result = await pool.query(query, [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ride request not found'
//       });
//     }

//     console.log('✅ Found ride request');

//     res.status(200).json({
//       success: true,
//       data: result.rows[0]
//     });

//   } catch (error) {
//     console.error('❌ Error fetching ride request details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };

// export const getRiderRequests = async (req, res) => {
//   try {
//     const riderId = req.user.id;
//     const { status } = req.query;

//     console.log('📋 Fetching ride requests for rider:', riderId);

//     let query = `
//       SELECT 
//         rr.id,
//         rr.rider_id,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pricing_mode,
//         rr.vehicle_preference,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.special_instructions,
//         rr.status,
//         rr.created_at,
//         rr.estimated_distance_km,
//         rr.estimated_duration_minutes,
//         rr.estimated_fare_min,
//         rr.estimated_fare_max
//       FROM ride_requests rr
//       WHERE rr.rider_id = $1
//     `;

//     const params = [riderId];

//     if (status) {
//       query += ` AND rr.status = $2`;
//       params.push(status);
//     }

//     query += ` ORDER BY rr.created_at DESC LIMIT 20`;

//     const result = await pool.query(query, params);

//     console.log(`✅ Found ${result.rows.length} ride requests`);

//     res.status(200).json({
//       success: true,
//       data: result.rows
//     });

//   } catch (error) {
//     console.error('❌ Error fetching ride requests:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };


// export const cancelRideRequest = async (req, res, next) => {
//   try {
//     const result = await requestService.cancelRideRequest(
//       req.params.id,
//       req.user.id
//     );
//     res.json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };


// export const getNearbyRideRequests = async (req, res) => {
//   try {
//     const driverId = req.user.id;

//     console.log('📍 Fetching nearby requests for driver:', driverId);

//     const query = `
//       SELECT 
//         rr.id,
//         rr.rider_id,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pricing_mode,
//         rr.vehicle_preference,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.special_instructions,
//         rr.status,
//         rr.created_at,
//         rr.estimated_distance_km,
//         rr.estimated_duration_minutes,
//         rr.estimated_fare_min,
//         rr.estimated_fare_max,
//         CONCAT(up.first_name, ' ', up.last_name) as rider_name,
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
//       FROM ride_requests rr
//       JOIN users u ON rr.rider_id = u.id
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       WHERE rr.status = 'pending'
//       AND rr.pricing_mode = 'bidding'
//       ORDER BY rr.created_at DESC
//       LIMIT 20
//     `;

//     const result = await pool.query(query);

//     console.log(`✅ Found ${result.rows.length} pending requests`);

//     return res.status(200).json({
//       success: true,
//       data: result.rows
//     });

//   } catch (error) {
//     console.error('❌ Error fetching nearby requests:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };
// // export const getNearbyRequests = async (req, res, next) => {
// //   try {
// //     const requests = await matchingService.getNearbyRequestsForDriver(
// //       req.user.driverId
// //     );
// //     res.json(ApiResponse.success(requests));
// //   } catch (err) {
// //     next(err);
// //   }
// // };




// // // Get nearby ride requests for drivers
// // export const getNearbyRideRequests = async (req, res) => {
// //   try {
// //     const driverId = req.user.id;

// //     console.log('📍 Fetching nearby requests for driver:', driverId);

// //     // Just return all pending requests (simpler approach)
// //     const query = `
// //       SELECT 
// //         rr.id,
// //         rr.rider_id,
// //         rr.pickup_address,
// //         rr.dropoff_address,
// //         rr.pricing_mode,
// //         rr.vehicle_preference,
// //         rr.passenger_count,
// //         rr.luggage_count,
// //         rr.payment_method,
// //         rr.special_instructions,
// //         rr.status,
// //         rr.created_at,
// //         u.full_name as rider_name,
// //         u.phone as rider_phone
// //       FROM ride_requests rr
// //       JOIN users u ON rr.rider_id = u.id
// //       WHERE rr.status = 'pending'
// //       AND rr.pricing_mode = 'bidding'
// //       ORDER BY rr.created_at DESC
// //       LIMIT 20
// //     `;

// //     const result = await pool.query(query);

// //     console.log(`✅ Found ${result.rows.length} pending requests`);

// //     return res.status(200).json({
// //       success: true,
// //       data: result.rows,
// //       message: 'NEARBY_REQUESTS_FETCHED'
// //     });

// //   } catch (error) {
// //     console.error('❌ Error fetching nearby requests:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'INTERNAL_SERVER_ERROR',
// //       error: error.message,
// //       code: 500,
// //       data: {}
// //     });
// //   }
// // };


// // Get nearby ride requests for drivers

// // Update driver location - simplified
// export const updateDriverLocation = async (req, res) => {
//   try {
//     const driverId = req.user.id;
//     const { lat, lng } = req.body;

//     console.log(`📍 Updating location for driver ${driverId}:`, lat, lng);

//     // Check if driver record exists
//     const driverCheck = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [driverId]
//     );

//     if (driverCheck.rows.length === 0) {
//       console.log('⚠️ Driver record not found, creating one...');

//       // Create driver record if it doesn't exist
//       await pool.query(
//         'INSERT INTO drivers (user_id, is_online, is_available, created_at) VALUES ($1, true, true, NOW())',
//         [driverId]
//       );
//     }

//     // Update location using driver_locations table
//     const locationPoint = `POINT(${lng} ${lat})`;

//     // Check if location record exists
//     const locationCheck = await pool.query(
//       'SELECT driver_id FROM driver_locations WHERE driver_id = (SELECT id FROM drivers WHERE user_id = $1)',
//       [driverId]
//     );

//     const driverIdResult = await pool.query(
//       'SELECT id FROM drivers WHERE user_id = $1',
//       [driverId]
//     );
//     const driverDbId = driverIdResult.rows[0].id;

//     if (locationCheck.rows.length === 0) {
//       // Insert new location record
//       await pool.query(
//         `INSERT INTO driver_locations (driver_id, location, updated_at)
//          VALUES ($1, ST_GeomFromText($2, 4326), NOW())`,
//         [driverDbId, locationPoint]
//       );
//     } else {
//       // Update existing location
//       await pool.query(
//         `UPDATE driver_locations 
//          SET location = ST_GeomFromText($1, 4326),
//              updated_at = NOW()
//          WHERE driver_id = $2`,
//         [locationPoint, driverDbId]
//       );
//     }

//     console.log('✅ Location updated');

//     res.status(200).json({
//       success: true,
//       message: 'LOCATION_UPDATED'
//     });

//   } catch (error) {
//     console.error('❌ Error updating location:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };


// the upper one is just a backup in case any mistake i might make







import { RideRequestService } from "../application/services/RideRequestService.js";
import { DriverMatchingService } from "../application/services/DriverMatchingService.js";
import { broadcastRideRequest, emitToUser } from "../realtime/socketServer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { pool } from '../database/DBConnection.js';
import redis from "../infrastructure/redisClient.js";
import { PricingCalculationService } from "../application/services/PricingCalculationService.js";
import { PromoCodeService } from "../application/services/PromoCodeService.js";
import { GiftCardService } from "../application/services/GiftCardService.js";
import { NotificationService } from "../application/services/NotificationService.js";
import { SurgeService } from "../application/services/SurgeService.js";
const requestService = new RideRequestService();
const matchingService = new DriverMatchingService();

// ─── GET /api/ride-requests/estimate ─────────────────────────────────────────
export const estimateFare = async (req, res, next) => {
  try {
    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, stops } = req.query;

    if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
      return res.status(400).json(
        ApiResponse.error("pickup_lat, pickup_lng, dropoff_lat, dropoff_lng are required", 400)
      );
    }

    const pickup = { lat: parseFloat(pickup_lat), lng: parseFloat(pickup_lng) };
    const dropoff = { lat: parseFloat(dropoff_lat), lng: parseFloat(dropoff_lng) };
    const waypointList = stops ? JSON.parse(stops) : [];

    const result = await PricingCalculationService.estimateAllVehicles({
      pickup,
      dropoff,
      stops: waypointList,
    });

    const surge = await SurgeService.getMultiplier(pickup.lat, pickup.lng);

    if (surge.multiplier > 1.0) {
      result.estimates = result.estimates.map(e => ({
        ...e,
        fareMin:       Math.round(e.fareMin * surge.multiplier),
        fareMax:       Math.round(e.fareMax * surge.multiplier),
        surgeMultiplier: surge.multiplier,
        surgeArea:       surge.surgeArea,
        surgeReason:     surge.reason,
      }));
    }
    result.surge = surge;

    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ride-requests ──────────────────────────────────────────────────
export const createRideRequest = async (req, res, next) => {
  try {
    const {
      pickupLocation,
      pickupAddress,
      dropoffLocation,
      dropoffAddress,
      stops,
      pricingMode,
      vehiclePreference,
      passengerCount,
      luggageCount,
      promo_code,
      gift_card_code,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(ApiResponse.error("UNAUTHORIZED", 401));
    }

    const lat1 = Number(pickupLocation.coordinates[1]);
    const lon1 = Number(pickupLocation.coordinates[0]);
    const lat2 = Number(dropoffLocation.coordinates[1]);
    const lon2 = Number(dropoffLocation.coordinates[0]);

    const vehicleType = vehiclePreference || "car";

    // Use real road-based distance + fare via mapsClient (Haversine fallback if no key)
    const routeData = await PricingCalculationService.estimateAllVehicles({
      pickup: { lat: lat1, lng: lon1 },
      dropoff: { lat: lat2, lng: lon2 },
      stops: (stops || []).map((s) => ({
        lat: s.location.coordinates[1],
        lng: s.location.coordinates[0],
      })),
    });

    const vehicleEstimate = routeData.estimates.find((e) => e.vehicleType === vehicleType)
      ?? routeData.estimates.find((e) => e.vehicleType === "car");

    const surge = await SurgeService.getMultiplier(lat1, lon1);
    const estimatedTotal = Math.round(vehicleEstimate.fareMin * surge.multiplier);

    // ── Promo code validation ──────────────────────────────────────────────
    let discountAmount  = 0;
    let appliedPromo    = null;
    if (promo_code) {
      try {
        const promoResult = await PromoCodeService.validatePromoCode(promo_code, userId, estimatedTotal);
        discountAmount = promoResult.discountAmount;
        appliedPromo   = promo_code.toUpperCase().trim();
      } catch (promoErr) {
        return res.status(400).json(ApiResponse.error(promoErr.code || "INVALID_PROMO_CODE", 400));
      }
    }

    // ── Gift card validation ───────────────────────────────────────────────
    let giftCardAmount  = 0;
    let appliedGiftCard = null;
    if (gift_card_code) {
      try {
        const gcResult = await GiftCardService.validateGiftCard(gift_card_code, userId);
        giftCardAmount  = Math.min(gcResult.balance, estimatedTotal - discountAmount);
        appliedGiftCard = gift_card_code.toUpperCase().trim();
      } catch (gcErr) {
        return res.status(400).json(ApiResponse.error(gcErr.code || "INVALID_GIFT_CARD", 400));
      }
    }

    console.log(`📏 Distance: ${routeData.distanceKm} km | Duration: ${routeData.durationMinutes} min | Fare: NPR ${estimatedTotal} | Discount: NPR ${discountAmount + giftCardAmount}`);

    const pickupCoords  = `POINT(${lon1} ${lat1})`;
    const dropoffCoords = `POINT(${lon2} ${lat2})`;

    const query = `
      INSERT INTO ride_requests (
        rider_id,
        pickup_location,
        pickup_address,
        dropoff_location,
        dropoff_address,
        pricing_mode,
        vehicle_preference,
        passenger_count,
        luggage_count,
        estimated_distance_km,
        estimated_duration_minutes,
        estimated_total,
        promo_code,
        discount_amount,
        gift_card_code,
        gift_card_amount,
        status,
        created_at
      )
      VALUES (
        $1,
        ST_GeomFromText($2,4326),
        $3,
        ST_GeomFromText($4,4326),
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        NOW()
      )
      RETURNING *
    `;

    const values = [
      userId,
      pickupCoords,
      pickupAddress,
      dropoffCoords,
      dropoffAddress,
      pricingMode || "bidding",
      vehicleType,
      passengerCount || 1,
      luggageCount || 0,
      routeData.distanceKm,
      routeData.durationMinutes,
      estimatedTotal,
      appliedPromo    ?? null,
      discountAmount,
      appliedGiftCard ?? null,
      giftCardAmount,
      "pending",
    ];

    const result = await pool.query(query, values);
    const rideRequest = result.rows[0];

    console.log("✅ Ride request created:", rideRequest.id);

    if (stops && stops.length > 0) {
      const maxStops = Math.min(stops.length, 2);

      for (let i = 0; i < maxStops; i++) {
        const stop = stops[i];

        const stopCoords = `POINT(${stop.location.coordinates[0]} ${stop.location.coordinates[1]})`;

        await pool.query(
          `
          INSERT INTO ride_stops (
            ride_request_id,
            location,
            address,
            stop_order,
            stop_type,
            max_wait_seconds,
            created_at
          )
          VALUES ($1,ST_GeomFromText($2,4326),$3,$4,$5,$6,NOW())
          `,
          [
            rideRequest.id,
            stopCoords,
            stop.address,
            i + 1,
            "detour",
            stop.maxWaitSeconds || 120
          ]
        );
      }
    }

    // Broadcast new_ride_request to nearby online drivers (5 km radius)
    try {
      const nearbyResult = await pool.query(
        `SELECT d.id FROM drivers d
         INNER JOIN driver_locations dl ON d.id = dl.driver_id
         WHERE d.is_online = true AND d.is_available = true
         AND ST_DWithin(
           dl.location::geography,
           ST_MakePoint($1,$2)::geography,
           5000
         )`,
        [lon1, lat1]
      );
      if (nearbyResult.rows.length > 0) {
        const driverIds = nearbyResult.rows.map((r) => r.id);
        broadcastRideRequest(
          {
            id: rideRequest.id,
            pickup_address: pickupAddress,
            dropoff_address: dropoffAddress,
            pickup_lat: lat1,
            pickup_lng: lon1,
            vehicle_preference: vehicleType,
            estimated_total: estimatedTotal,
            estimated_distance_km: routeData.distanceKm,
            estimated_duration_minutes: routeData.durationMinutes,
            pricing_mode: pricingMode || "bidding",
          },
          driverIds
        );

        // Notify each nearby driver's user account
        const driverUserResult = await pool.query(
          `SELECT user_id FROM drivers WHERE id = ANY($1::int[])`,
          [driverIds]
        );
        NotificationService.notifyMany(
          driverUserResult.rows.map((r) => r.user_id),
          {
            title: "New Ride Request",
            body: `NPR ${estimatedTotal} — ${pickupAddress} to ${dropoffAddress}`,
            data: { requestId: String(rideRequest.id) },
            type: "ride"
          }
        );
      }
    } catch (_) {
      // Non-critical — ride request was already created
    }

    res.status(201).json(ApiResponse.success(rideRequest, "RIDE_REQUEST_CREATED"));
  } catch (error) {
    next(error);
  }
};




// export const createRideRequest = async (req, res) => {
  
//   try {
//     const {
//       pickupLocation,
//       pickupAddress,
//       dropoffLocation,
//       dropoffAddress,
//       stops,
//       pricingMode,
//       vehiclePreference,
//       passengerCount,
//       luggageCount
//     } = req.body;

//    //TODO JWT malfunction no error -> request goes infinitely

//     const userId = req.user.id;

//     console.log('📝 Creating ride request for user:', userId);
//     console.log('📍 Pickup:', pickupAddress);
//     console.log('📍 Dropoff:', dropoffAddress);

//     // Calculate distance using Haversine formula
//     const toRadians = (degrees) => degrees * (Math.PI / 180);

//     const lat1 = Number(pickupLocation.coordinates[1]);
//     const lon1 = Number(pickupLocation.coordinates[0]);
//     const lat2 = Number(dropoffLocation.coordinates[1]);
//     const lon2 = Number(dropoffLocation.coordinates[0]);

//     const R = 6371; // Earth's radius in km
//     const dLat = toRadians(lat2 - lat1);
//     const dLon = toRadians(lon2 - lon1);

//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // Distance in km

//     console.log("Payload:", req.body);

    

//     // Calculate fare: ₹20 per km
//     const baseFare = Math.round(distance * 20);
//     const estimatedFareMin = Math.round(baseFare * 0.9); // 10% lower
//     const estimatedFareMax = Math.round(baseFare * 1.1); // 10% higher
//     const estimatedDuration = Math.round(distance * 3); // Rough estimate: 3 min per km

//     console.log(`📏 Distance: ${Number(distance.toFixed(2))} km`);
//     console.log(`💰 Estimated fare: ₹${estimatedFareMin} - ₹${estimatedFareMax}`);
    

//     // Format coordinates for PostGIS
//     const pickupCoords = `POINT(${pickupLocation.coordinates[0]} ${pickupLocation.coordinates[1]})`;
//     const dropoffCoords = `POINT(${dropoffLocation.coordinates[0]} ${dropoffLocation.coordinates[1]})`;

//     const query = `
//       INSERT INTO ride_requests (
//         rider_id,
//         pickup_location,
//         pickup_address,
//         dropoff_location,
//         dropoff_address,
//         pricing_mode,
//         vehicle_preference,
//         passenger_count,
//         luggage_count,
//         estimated_distance_km,
//         estimated_duration_minutes,
//         estimated_fare_min,
//         estimated_fare_max,
//         status,
//         created_at
//       ) VALUES ($1, ST_GeomFromText($2, 4326), $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
//       RETURNING *
//     `;

//     const values = [
//       userId,
//       pickupCoords,
//       pickupAddress,
//       dropoffCoords,
//       dropoffAddress,
//       pricingMode || 'bidding',
//       vehiclePreference || 'sedan',
//       passengerCount || 1,
//       luggageCount || 0,
//       distance.toFixed(2),
//       estimatedDuration,
//       estimatedFareMin,
//       estimatedFareMax,
//       'pending'
//     ];

//     const result = await pool.query(query, values);
//     const rideRequest = result.rows[0];

//     console.log('✅ Ride request created:', rideRequest.id);

//     // Insert stops if any (max 2)
//     if (stops && stops.length > 0) {
//       const maxStops = Math.min(stops.length, 2);
//       console.log(`📍 Adding ${maxStops} stops...`);

//       for (let i = 0; i < maxStops; i++) {
//         const stop = stops[i];
//         const stopCoords = `POINT(${stop.location.coordinates[0]} ${stop.location.coordinates[1]})`;

//         await pool.query(
//           `INSERT INTO ride_stops (
//             ride_request_id,
//             location,
//             address,
//             stop_order,
//             stop_type,
//             max_wait_seconds,
//             created_at
//           ) VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5, $6, NOW())`,
//           [
//             rideRequest.id,
//             stopCoords,
//             stop.address,
//             i + 1,
//             'detour',
//             stop.maxWaitSeconds || 120
//           ]
//         );
//       }

//       console.log('✅ Stops added successfully');
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Ride request created successfully',
//       data: rideRequest
//     });

//   } catch (error) {
//     console.error('❌ Error creating ride request:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message,
//       code: 500,
//       data: {}
//     });
//   }
// };


// // export const getRiderRequests = async (req, res, next) => {

// //   try {
// //     const requests = await requestService.getRiderRequests(
// //       req.user.id,
// //       req.query.status
// //     );
// //     res.json(ApiResponse.success(requests));
// //   } catch (err) {
// //     next(err);
// //   }
// // };
// // Get rider's ride requests
// export const getRiderRequests = async (req, res) => {
//   try {
//     const riderId = req.user.id;
//     const { status } = req.query;

//     console.log('📋 Fetching ride requests for rider:', riderId);

//     let query = `
//       SELECT 
//         rr.id,
//         rr.rider_id,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pricing_mode,
//         rr.vehicle_preference,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.special_instructions,
//         rr.status,
//         rr.created_at,
//         rr.estimated_distance_km,
//         rr.estimated_duration_minutes,
//         rr.estimated_fare_min,
//         rr.estimated_fare_max
//       FROM ride_requests rr
//       WHERE rr.rider_id = $1
//     `;

//     const params = [riderId];

//     if (status) {
//       query += ` AND rr.status = $2`;
//       params.push(status);
//     }

//     query += ` ORDER BY rr.created_at DESC LIMIT 20`;

//     const result = await pool.query(query, params);

//     console.log(`✅ Found ${result.rows.length} ride requests`);

//     res.status(200).json({
//       success: true,
//       data: result.rows
//     });

//   } catch (error) {
//     console.error('❌ Error fetching ride requests:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };
// export const getRideRequestDetails = async (req, res, next) => {
//   try {
//     const details = await requestService.getRideRequestDetails(req.params.id);
//     res.json(ApiResponse.success(details));
//   } catch (err) {
//     next(err);
//   }
// };
// Get single ride request details
export const getRideRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📋 Fetching ride request details:', id);

    const query = `
      SELECT
        rr.id,
        rr.rider_id,
        rr.pickup_address,
        rr.dropoff_address,
        rr.pricing_mode,
        rr.vehicle_preference,
        rr.passenger_count,
        rr.luggage_count,
        rr.special_instructions,
        rr.status,
        rr.created_at,
        rr.estimated_distance_km,
        rr.estimated_duration_minutes,
        rr.estimated_total,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', rs.id,
                'name', rs.address,
                'latitude', ST_Y(rs.location::geometry),
                'longitude', ST_X(rs.location::geometry),
                'order', rs.stop_order,
                'arrived_at', rs.actual_arrival_time,
                'departed_at', rs.actual_departure_time
              ) ORDER BY rs.stop_order
            ) FILTER (WHERE rs.id IS NOT NULL),
            '[]'::json
          )
          FROM ride_stops rs WHERE rs.ride_request_id = rr.id
        ) as stops
      FROM ride_requests rr
      WHERE rr.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }

    console.log('✅ Found ride request');

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching ride request details:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

export const getRiderRequests = async (req, res) => {
  try {
    const riderId = req.user.id;
    const { status } = req.query;

    console.log('📋 Fetching ride requests for rider:', riderId);

    let query = `
      SELECT
        rr.id,
        rr.rider_id,
        rr.pickup_address,
        rr.dropoff_address,
        rr.pricing_mode,
        rr.vehicle_preference,
        rr.passenger_count,
        rr.luggage_count,
        rr.special_instructions,
        rr.status,
        rr.created_at,
        rr.estimated_distance_km,
        rr.estimated_duration_minutes,
        rr.estimated_total,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', rs.id,
                'name', rs.address,
                'latitude', ST_Y(rs.location::geometry),
                'longitude', ST_X(rs.location::geometry),
                'order', rs.stop_order,
                'arrived_at', rs.actual_arrival_time,
                'departed_at', rs.actual_departure_time
              ) ORDER BY rs.stop_order
            ) FILTER (WHERE rs.id IS NOT NULL),
            '[]'::json
          )
          FROM ride_stops rs WHERE rs.ride_request_id = rr.id
        ) as stops
      FROM ride_requests rr
      WHERE rr.rider_id = $1
    `;

    const params = [riderId];

    if (status) {
      query += ` AND rr.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY rr.created_at DESC LIMIT 20`;

    const result = await pool.query(query, params);

    console.log(`✅ Found ${result.rows.length} ride requests`);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching ride requests:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};


export const cancelRideRequest = async (req, res, next) => {
  try {
    const result = await requestService.cancelRideRequest(
      req.params.id,
      req.user.id
    );
    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};
export const getNearbyRideRequests = async (req, res) => {
  try {
    const driverId = req.user.id;

    console.log('📍 Fetching nearby requests for driver:', driverId);
    const query = `
  SELECT 
    rr.id,
    rr.rider_id,
    rr.pickup_address,
    rr.dropoff_address,
    rr.pricing_mode,
    rr.vehicle_preference,
    rr.passenger_count,
    rr.luggage_count,
    rr.special_instructions,
    rr.status,
    rr.created_at,
    rr.estimated_distance_km,
    rr.estimated_duration_minutes,
    rr.estimated_total,
    CONCAT(k.first_name, ' ', k.last_name) as rider_name,
    (
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'id', rs.id,
            'name', rs.address,
            'latitude', ST_Y(rs.location::geometry),
            'longitude', ST_X(rs.location::geometry),
            'order', rs.stop_order,
            'arrived_at', rs.actual_arrival_time,
            'departed_at', rs.actual_departure_time
          ) ORDER BY rs.stop_order
        ) FILTER (WHERE rs.id IS NOT NULL),
        '[]'::json
      )
      FROM ride_stops rs
      WHERE rs.ride_request_id = rr.id
    ) as stops
  FROM ride_requests rr
  JOIN users u ON rr.rider_id = u.id
  LEFT JOIN kyc k ON u.id = k.user_id
  WHERE rr.status = 'pending'
  AND rr.pricing_mode = 'bidding'
  ORDER BY rr.created_at DESC
  LIMIT 20
`;


    const result = await pool.query(query);

    console.log(`✅ Found ${result.rows.length} pending requests`);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching nearby requests:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// export const getNearbyRideRequests = async (req, res) => {
//   try {
//     const driverId = req.user.id;

//     console.log('📍 Fetching nearby requests for driver:', driverId);

//     const query = `
//       SELECT 
//         rr.id,
//         rr.rider_id,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pricing_mode,
//         rr.vehicle_preference,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.special_instructions,
//         rr.status,
//         rr.created_at,
//         rr.estimated_distance_km,
//         rr.estimated_duration_minutes,
//         rr.estimated_fare_min,
//         rr.estimated_fare_max,
//         CONCAT(up.first_name, ' ', up.last_name) as rider_name,
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
//       FROM ride_requests rr
//       JOIN users u ON rr.rider_id = u.id
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       WHERE rr.status = 'pending'
//       AND rr.pricing_mode = 'bidding'
//       ORDER BY rr.created_at DESC
//       LIMIT 20
//     `;

//     const result = await pool.query(query);

//     console.log(`✅ Found ${result.rows.length} pending requests`);

//     return res.status(200).json({
//       success: true,
//       data: result.rows
//     });

//   } catch (error) {
//     console.error('❌ Error fetching nearby requests:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message
//     });
//   }
// };
// export const getNearbyRequests = async (req, res, next) => {
//   try {
//     const requests = await matchingService.getNearbyRequestsForDriver(
//       req.user.driverId
//     );
//     res.json(ApiResponse.success(requests));
//   } catch (err) {
//     next(err);
//   }
// };




// // Get nearby ride requests for drivers
// export const getNearbyRideRequests = async (req, res) => {
//   try {
//     const driverId = req.user.id;

//     console.log('📍 Fetching nearby requests for driver:', driverId);

//     // Just return all pending requests (simpler approach)
//     const query = `
//       SELECT 
//         rr.id,
//         rr.rider_id,
//         rr.pickup_address,
//         rr.dropoff_address,
//         rr.pricing_mode,
//         rr.vehicle_preference,
//         rr.passenger_count,
//         rr.luggage_count,
//         rr.payment_method,
//         rr.special_instructions,
//         rr.status,
//         rr.created_at,
//         u.full_name as rider_name,
//         u.phone as rider_phone
//       FROM ride_requests rr
//       JOIN users u ON rr.rider_id = u.id
//       WHERE rr.status = 'pending'
//       AND rr.pricing_mode = 'bidding'
//       ORDER BY rr.created_at DESC
//       LIMIT 20
//     `;

//     const result = await pool.query(query);

//     console.log(`✅ Found ${result.rows.length} pending requests`);

//     return res.status(200).json({
//       success: true,
//       data: result.rows,
//       message: 'NEARBY_REQUESTS_FETCHED'
//     });

//   } catch (error) {
//     console.error('❌ Error fetching nearby requests:', error);
//     res.status(500).json({
//       success: false,
//       message: 'INTERNAL_SERVER_ERROR',
//       error: error.message,
//       code: 500,
//       data: {}
//     });
//   }
// };


// Get nearby ride requests for drivers

// Update driver location - simplified
export const updateDriverLocation = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { lat, lng } = req.body;

    console.log(`📍 Updating location for driver ${driverId}:`, lat, lng);

    // Check if driver record exists
    const driverCheck = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [driverId]
    );

    if (driverCheck.rows.length === 0) {
      console.log('⚠️ Driver record not found, creating one...');

      // Create driver record if it doesn't exist
      await pool.query(
        'INSERT INTO drivers (user_id, is_online, is_available, created_at) VALUES ($1, true, true, NOW())',
        [driverId]
      );
    }

    // Update location using driver_locations table
    const locationPoint = `POINT(${lng} ${lat})`;

    // Check if location record exists
    const locationCheck = await pool.query(
      'SELECT driver_id FROM driver_locations WHERE driver_id = (SELECT id FROM drivers WHERE user_id = $1)',
      [driverId]
    );

    const driverIdResult = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [driverId]
    );
    const driverDbId = driverIdResult.rows[0].id;

    if (locationCheck.rows.length === 0) {
      // Insert new location record
      await pool.query(
        `INSERT INTO driver_locations (driver_id, location, updated_at)
         VALUES ($1, ST_GeomFromText($2, 4326), NOW())`,
        [driverDbId, locationPoint]
      );
    } else {
      // Update existing location
      await pool.query(
        `UPDATE driver_locations 
         SET location = ST_GeomFromText($1, 4326),
             updated_at = NOW()
         WHERE driver_id = $2`,
        [locationPoint, driverDbId]
      );
    }

    // Cache last known position in Redis (30s TTL)
    try {
      await redis.set(
        `driver:location:${driverDbId}`,
        JSON.stringify({ lat, lng, updatedAt: Date.now() }),
        "EX",
        30
      );
    } catch (_) { /* non-critical */ }

    // Emit driver_en_route to rider if driver has an active ride
    const activeRide = await pool.query(
      `SELECT rider_id FROM rides WHERE driver_id = $1 AND status IN ('accepted','started') LIMIT 1`,
      [driverDbId]
    );
    if (activeRide.rows.length > 0) {
      emitToUser(activeRide.rows[0].rider_id, "driver_en_route", {
        lat, lng, driverId: driverDbId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'LOCATION_UPDATED'
    });

  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};
