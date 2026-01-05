import { RideRequestService } from "../application/services/RideRequestService.js";
import { DriverMatchingService } from "../application/services/DriverMatchingService.js";
import { broadcastRideRequest } from "../realtime/socketServer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { pool } from '../database/DBConnection.js';
const requestService = new RideRequestService();
const matchingService = new DriverMatchingService();

// export const createRideRequest = async (req, res, next) => {
//   try {
//     const result = await requestService.createRideRequest({
//       riderId: req.user.id,
//       ...req.body
//     });

//     // Find eligible drivers and broadcast
//     const drivers = await matchingService.findEligibleDrivers(result.requestId);
//     const driverIds = drivers.map(d => d.driverId);
    
//     broadcastRideRequest({
//       requestId: result.requestId,
//       pickup: req.body.pickup,
//       dropoff: req.body.dropoff,
//       estimatedFare: result.estimatedFare,
//       pricingMode: req.body.pricingMode
//     }, driverIds);

//     res.status(201).json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };
// In your backend controller file (e.g., controllers/rideRequestController.js)



export const createRideRequest = async (req, res) => {
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
      paymentMethod,
      requiresWheelchairAccessible,
      requiresPetFriendly,
      requiresChildSeat,
      specialInstructions
    } = req.body;

    const userId = req.user.id;

    console.log('📝 Creating ride request for user:', userId);
    console.log('📍 Pickup:', pickupAddress);
    console.log('📍 Dropoff:', dropoffAddress);

    // Format coordinates for PostGIS
    const pickupCoords = `POINT(${pickupLocation.coordinates[0]} ${pickupLocation.coordinates[1]})`;
    const dropoffCoords = `POINT(${dropoffLocation.coordinates[0]} ${dropoffLocation.coordinates[1]})`;

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
        payment_method,
        requires_wheelchair_accessible,
        requires_pet_friendly,
        requires_child_seat,
        special_instructions,
        status,
        created_at
      ) VALUES ($1, ST_GeomFromText($2, 4326), $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING *
    `;

    const values = [
      userId,
      pickupCoords,
      pickupAddress,
      dropoffCoords,
      dropoffAddress,
      pricingMode || 'bidding',
      vehiclePreference || 'sedan',
      passengerCount || 1,
      luggageCount || 0,
      paymentMethod || 'cash',
      requiresWheelchairAccessible || false,
      requiresPetFriendly || false,
      requiresChildSeat || false,
      specialInstructions || null,
      'pending'
    ];

    const result = await pool.query(query, values);
    const rideRequest = result.rows[0];

    console.log('✅ Ride request created:', rideRequest.id);

    // Insert stops if any
    if (stops && stops.length > 0) {
      console.log(`📍 Adding ${stops.length} stops...`);
      
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const stopCoords = `POINT(${stop.location.coordinates[0]} ${stop.location.coordinates[1]})`;
        
        await pool.query(
          `INSERT INTO ride_stops (
            ride_request_id,
            location,
            address,
            stop_order,
            contact_name,
            contact_phone,
            notes,
            max_wait_seconds
          ) VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5, $6, $7, $8)`,
          [
            rideRequest.id,
            stopCoords,
            stop.address,
            i + 1,
            stop.contactName || null,
            stop.contactPhone || null,
            stop.notes || null,
            stop.maxWaitSeconds || 120
          ]
        );
      }
      
      console.log('✅ Stops added successfully');
    }

    res.status(201).json({
      success: true,
      message: 'Ride request created successfully',
      data: rideRequest
    });

  } catch (error) {
    console.error('❌ Error creating ride request:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message,
      code: 500,
      data: {}
    });
  }
};



// export const getRiderRequests = async (req, res, next) => {
//   try {
//     const requests = await requestService.getRiderRequests(
//       req.user.id,
//       req.query.status
//     );
//     res.json(ApiResponse.success(requests));
//   } catch (err) {
//     next(err);
//   }
// };
// Get rider's ride requests
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
        rr.estimated_fare_min,
        rr.estimated_fare_max
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
        rr.estimated_fare_min,
        rr.estimated_fare_max
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
        rr.estimated_fare_min,
        rr.estimated_fare_max,
        CONCAT(up.first_name, ' ', up.last_name) as rider_name,
        ac.phone as rider_phone
      FROM ride_requests rr
      JOIN users u ON rr.rider_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN auth_credentials ac ON u.id = ac.user_id
      WHERE rr.status = 'pending'
      AND rr.pricing_mode = 'bidding'
      ORDER BY rr.created_at DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    console.log(`✅ Found ${result.rows.length} pending requests`);
    
    return res.status(200).json({
      success: true,
      data: result.rows,
      message: 'NEARBY_REQUESTS_FETCHED'
    });

  } catch (error) {
    console.error('❌ Error fetching nearby requests:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message,
      code: 500,
      data: {}
    });
  }
};
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

    console.log('✅ Location updated');

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