// import RideRequestModel from "../../models/ride/RideRequest.js";
// import RideStopModel from "../../models/ride_stop/RideStop.js";
// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import { AppError } from "../../utils/AppError.js";
// import { String } from "../../utils/Constant.js";
// import moment from "moment";
// import { PricingCalculationService } from "./PricingCalculationService.js";

// /**
//  * Ride Request Service
//  * 
//  * Handles creation and management of ride requests with:
//  * - Multi-stop support
//  * - PostGIS location handling
//  * - Route calculation
//  * - Fare estimation
//  */
// export class RideRequestService {
  
//   /**
//    * Create a new ride request with optional intermediate stops
//    * 
//    * @param {Object} params
//    * @param {string} params.riderId - User ID requesting the ride
//    * @param {Object} params.pickup - { lat, lng, address }
//    * @param {Object} params.dropoff - { lat, lng, address }
//    * @param {Array} params.stops - Optional intermediate stops [{ lat, lng, address, notes }]
//    * @param {Object} params.preferences - Ride preferences
//    * @param {string} params.pricingMode - 'fixed' or 'bidding'
//    * @param {Date} params.scheduledTime - Optional scheduled pickup time
//    */
//   async createRideRequest({
//     riderId,
//     pickup,
//     dropoff,
//     stops = [],
//     preferences = {},
//     pricingMode = 'fixed',
//     scheduledTime = null
//   }) {
    
//     // ═══════════════════════════════════════════════════
//     // 1️⃣ VALIDATE INPUT
//     // ═══════════════════════════════════════════════════
//     this._validateLocations(pickup, dropoff, stops);
    
//     if (scheduledTime && moment(scheduledTime).isBefore(moment())) {
//       throw new AppError("SCHEDULED_TIME_IN_PAST", 400);
//     }
    
//     // ═══════════════════════════════════════════════════
//     // 2️⃣ CALCULATE ROUTE & ESTIMATE FARE
//     // ═══════════════════════════════════════════════════
//     const routeData = await this._calculateRoute(pickup, dropoff, stops);
// const pricing = PricingCalculationService.calculateEstimatedFare({
//   distanceKm: routeData.distanceKm,
//   durationMinutes: routeData.durationMinutes
// });    
    
//     // ═══════════════════════════════════════════════════
//     // 3️⃣ DETERMINE EXPIRATION
//     // ═══════════════════════════════════════════════════
//     const expiresAt = scheduledTime 
//       ? moment(scheduledTime).add(30, 'minutes').toDate()
//       : moment().add(String.REQUEST_EXPIRY_MINUTES, 'minutes').toDate();
    
//     // ═══════════════════════════════════════════════════
//     // 4️⃣ CREATE REQUEST & STOPS IN TRANSACTION
//     // ═══════════════════════════════════════════════════
//     let rideRequest;
    
//     await withTransaction(async (client) => {
      
//       // Create ride request
//       rideRequest = await RideRequestModel.create({
//         rider_id: riderId,
        
//         // PostGIS locations (stored as GEOGRAPHY)
//         pickup_location: `POINT(${pickup.lng} ${pickup.lat})`,
//         pickup_address: pickup.address,
//         dropoff_location: `POINT(${dropoff.lng} ${dropoff.lat})`,
//         dropoff_address: dropoff.address,
        
//         // Route data
//         estimated_distance_km: routeData.distanceKm,
//         estimated_duration_minutes: routeData.durationMinutes,
//         estimated_fare_min: fareEstimate.min,
//         estimated_fare_max: fareEstimate.max,
        
//         // Preferences
//         passenger_count: preferences.passengerCount || 1,
//         luggage_count: preferences.luggageCount || 0,
//         vehicle_preference: preferences.vehicleType || null,
//         requires_wheelchair_accessible: preferences.wheelchairAccessible || false,
//         requires_pet_friendly: preferences.petFriendly || false,
//         requires_child_seat: preferences.childSeat || false,
//         special_instructions: preferences.specialInstructions || null,
        
//         // Pricing
//         pricing_mode: pricingMode,
        
//         // Timing
//         requested_pickup_time: scheduledTime,
//         expires_at: expiresAt,
        
//         // Status
//         status: scheduledTime ? 'scheduled' : 'pending'
//       }, client);
      
//       // Create intermediate stops
//       if (stops && stops.length > 0) {
//         for (let i = 0; i < stops.length; i++) {
//           const stop = stops[i];
          
//           await RideStopModel.create({
//             ride_request_id: rideRequest.id,
//             stop_order: i + 1,  // 1-indexed (0 is pickup, last is dropoff)
//             stop_type: stop.type || 'intermediate',
//             location: `POINT(${stop.lng} ${stop.lat})`,
//             address: stop.address,
//             contact_name: stop.contactName || null,
//             contact_phone: stop.contactPhone || null,
//             notes: stop.notes || null,
//             max_wait_seconds: stop.maxWaitSeconds || 120,
//             status: 'pending'
//           }, client);
//         }
//       }
//     });
    
//     console.log("✅ Ride request created:", rideRequest.id);
    
//     // ═══════════════════════════════════════════════════
//     // 5️⃣ TRIGGER DRIVER MATCHING (if immediate)
//     // ═══════════════════════════════════════════════════
//     if (!scheduledTime) {
//       // Broadcast to nearby drivers based on their visibility settings
//       await this._broadcastToDrivers(rideRequest);
//     }
    
//     return {
//       requestId: rideRequest.id,
//       status: rideRequest.status,
//       estimatedFare: fareEstimate,
//       routeData,
//       expiresAt
//     };
//   }
  
//   /**
//    * Get ride request details with stops
//    */
//   async getRideRequestDetails(requestId) {
//     const request = await RideRequestModel.findById(requestId);
    
//     if (!request) {
//       throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
//     }
    
//     // Get stops
//     const stops = await RideStopModel.find({
//       ride_request_id: requestId
//     });
    
//     return {
//       ...request,
//       stops: stops.sort((a, b) => a.stop_order - b.stop_order)
//     };
//   }
  
//   /**
//    * List rider's ride requests
//    */
//   async getRiderRequests(riderId, status = null) {
//     const conditions = { rider_id: riderId };
    
//     if (status) {
//       conditions.status = status;
//     }
    
//     const requests = await RideRequestModel.find(conditions);
    
//     // Attach stops to each request
//     const requestsWithStops = await Promise.all(
//       requests.map(async (req) => {
//         const stops = await RideStopModel.find({
//           ride_request_id: req.id
//         });
        
//         return {
//           ...req,
//           stops: stops.sort((a, b) => a.stop_order - b.stop_order)
//         };
//       })
//     );
    
//     return requestsWithStops;
//   }
  
//   /**
//    * Cancel a ride request
//    */
//   async cancelRideRequest(requestId, riderId) {
//     const request = await RideRequestModel.findById(requestId);
    
//     if (!request) {
//       throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
//     }
    
//     if (request.rider_id !== riderId) {
//       throw new AppError("NOT_AUTHORIZED_TO_CANCEL", 403);
//     }
    
//     if (!['pending', 'broadcasting', 'scheduled'].includes(request.status)) {
//       throw new AppError("CANNOT_CANCEL_REQUEST", 400, {
//         currentStatus: request.status
//       });
//     }
    
//     return await RideRequestModel.findByIdAndUpdate(requestId, {
//       status: 'cancelled',
//       updated_at: new Date()
//     });
//   }
  
//   // ═══════════════════════════════════════════════════
//   // PRIVATE HELPER METHODS
//   // ═══════════════════════════════════════════════════
  
//   _validateLocations(pickup, dropoff, stops) {
//     if (!pickup?.lat || !pickup?.lng || !pickup?.address) {
//       throw new AppError("INVALID_PICKUP_LOCATION", 400);
//     }
    
//     if (!dropoff?.lat || !dropoff?.lng || !dropoff?.address) {
//       throw new AppError("INVALID_DROPOFF_LOCATION", 400);
//     }
    
//     // Validate coordinates
//     if (Math.abs(pickup.lat) > 90 || Math.abs(pickup.lng) > 180) {
//       throw new AppError("INVALID_PICKUP_COORDINATES", 400);
//     }
    
//     if (Math.abs(dropoff.lat) > 90 || Math.abs(dropoff.lng) > 180) {
//       throw new AppError("INVALID_DROPOFF_COORDINATES", 400);
//     }
    
//     // Validate stops
//     if (stops && stops.length > 0) {
//       stops.forEach((stop, idx) => {
//         if (!stop?.lat || !stop?.lng || !stop?.address) {
//           throw new AppError("INVALID_STOP_LOCATION", 400, { stopIndex: idx });
//         }
//       });
//     }
//   }
  
//   /**
//    * Calculate route using PostGIS or external routing service
//    */
//   async _calculateRoute(pickup, dropoff, stops) {
//     // TODO: Integrate with OSRM, Google Maps, or Mapbox routing
//     // For now, return estimated values
    
//     // Simple haversine distance calculation as fallback
//     const directDistance = this._haversineDistance(
//       pickup.lat, pickup.lng,
//       dropoff.lat, dropoff.lng
//     );
    
//     // Add ~30% for actual road distance
//     const estimatedRoadDistance = directDistance * 1.3;
    
//     // Add extra distance for stops
//     let totalDistance = estimatedRoadDistance;
//     if (stops && stops.length > 0) {
//       // Rough estimate: add 20% per stop
//       totalDistance *= (1 + (stops.length * 0.2));
//     }
    
//     // Estimate duration (average 30 km/h in city)
//     const estimatedDuration = (totalDistance / 30) * 60;  // in minutes
    
//     return {
//       distanceKm: Math.round(totalDistance * 100) / 100,
//       durationMinutes: Math.round(estimatedDuration),
//       waypoints: [pickup, ...stops, dropoff]
//     };
//   }
  
//   /**
//    * Estimate fare based on distance and preferences
//    */
//   async _estimateFare(routeData, preferences) {
//     // TODO: Get from pricing model/service
//     const baseFare = 5.00;
//     const perKmRate = 2.50;
//     const perMinuteRate = 0.50;
    
//     // Vehicle type multiplier
//     const vehicleMultipliers = {
//       'sedan': 1.0,
//       'suv': 1.3,
//       'luxury': 1.8,
//       'van': 1.4
//     };
    
//     const vehicleMultiplier = vehicleMultipliers[preferences.vehicleType] || 1.0;
    
//     // Calculate base estimate
//     const distanceFare = routeData.distanceKm * perKmRate;
//     const timeFare = routeData.durationMinutes * perMinuteRate;
//     const subtotal = baseFare + distanceFare + timeFare;
    
//     // Apply multipliers
//     const total = subtotal * vehicleMultiplier;
    
//     // Return range (±15%)
//     return {
//       min: Math.round((total * 0.85) * 100) / 100,
//       max: Math.round((total * 1.15) * 100) / 100,
//       estimated: Math.round(total * 100) / 100
//     };
//   }
  
//   /**
//    * Haversine distance formula (returns km)
//    */
//   _haversineDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Earth's radius in km
//     const dLat = this._toRad(lat2 - lat1);
//     const dLon = this._toRad(lon2 - lon1);
    
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
//               Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   }
  
//   _toRad(degrees) {
//     return degrees * (Math.PI / 180);
//   }
  
//   /**
//    * Broadcast request to nearby drivers (based on visibility multiplier)
//    */
//   async _broadcastToDrivers(rideRequest) {
//     // This will be implemented in DriverMatchingService
//     // For now, just update status
//     await RideRequestModel.findByIdAndUpdate(rideRequest.id, {
//       status: 'broadcasting',
//       updated_at: new Date()
//     });
    
//     console.log("📢 Broadcasting ride request to drivers:", rideRequest.id);
//   }
// }




import RideRequestModel from "../../models/ride/RideRequest.js";
import RideStopModel from "../../models/ride_stop/RideStop.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import { AppError } from "../../utils/AppError.js";
import { String } from "../../utils/Constant.js";
import moment from "moment";
import { PricingCalculationService } from "./PricingCalculationService.js";
import { LedgerService } from "./LedgerService.js";

export class RideRequestService {

  async createRideRequest({
    riderId,
    pickup,
    dropoff,
    stops = [],
    preferences = {},
    pricingMode = 'fixed',
    scheduledTime = null,
    paymentSource = "wallet"
  }) {

    // 1️⃣ VALIDATION
    this._validateLocations(pickup, dropoff, stops);

    if (scheduledTime && moment(scheduledTime).isBefore(moment())) {
      throw new AppError("SCHEDULED_TIME_IN_PAST", 400);
    }

    // 2️⃣ ROUTE CALCULATION
    const routeData = await this._calculateRoute(pickup, dropoff, stops);

    // 3️⃣ PRICE CALCULATION
    const pricing = PricingCalculationService.calculateEstimatedFare({
      distanceKm: routeData.distanceKm,
      durationMinutes: routeData.durationMinutes
    });

    const estimatedTotal = pricing.total;

    // 4️⃣ REQUEST EXPIRY
    const expiresAt = scheduledTime
      ? moment(scheduledTime).add(30, 'minutes').toDate()
      : moment().add(String.REQUEST_EXPIRY_MINUTES, 'minutes').toDate();

    let rideRequest;

    await withTransaction(async (client) => {

      // 5️⃣ CREATE RIDE REQUEST
      rideRequest = await RideRequestModel.create({
        rider_id: riderId,

        pickup_location: `POINT(${pickup.lng} ${pickup.lat})`,
        pickup_address: pickup.address,

        dropoff_location: `POINT(${dropoff.lng} ${dropoff.lat})`,
        dropoff_address: dropoff.address,

        estimated_distance_km: routeData.distanceKm,
        estimated_duration_minutes: routeData.durationMinutes,

        estimated_total: estimatedTotal,
        platform_fee: pricing.platformFee,
        tax_amount: pricing.tax,

        passenger_count: preferences.passengerCount || 1,
        luggage_count: preferences.luggageCount || 0,
        vehicle_preference: preferences.vehicleType || null,

        requires_wheelchair_accessible: preferences.wheelchairAccessible || false,
        requires_pet_friendly: preferences.petFriendly || false,
        requires_child_seat: preferences.childSeat || false,

        special_instructions: preferences.specialInstructions || null,

        pricing_mode: pricingMode,

        requested_pickup_time: scheduledTime,
        expires_at: expiresAt,

        status: scheduledTime ? 'scheduled' : 'pending'

      }, client);

      // 6️⃣ CREATE STOPS
      if (stops && stops.length > 0) {

        for (let i = 0; i < stops.length; i++) {

          const stop = stops[i];

          await RideStopModel.create({
            ride_request_id: rideRequest.id,
            stop_order: i + 1,
            stop_type: stop.type || 'intermediate',

            location: `POINT(${stop.lng} ${stop.lat})`,
            address: stop.address,

            contact_name: stop.contactName || null,
            contact_phone: stop.contactPhone || null,

            notes: stop.notes || null,
            max_wait_seconds: stop.maxWaitSeconds || 120,

            status: 'pending'

          }, client);

        }

      }

      // 7️⃣ AUTHORIZE PAYMENT (WALLET → ESCROW)

      await LedgerService.authorizePayment({
        userId: riderId,
        amount: estimatedTotal,
        rideId: rideRequest.id,
        paymentSource
      });

    });

    console.log("✅ Ride request created:", rideRequest.id);

    // 8️⃣ BROADCAST TO DRIVERS

    if (!scheduledTime) {
      await this._broadcastToDrivers(rideRequest);
    }

    return {
      requestId: rideRequest.id,
      status: rideRequest.status,
      pricing,
      routeData,
      expiresAt
    };

  }

  async getRideRequestDetails(requestId) {

    const request = await RideRequestModel.findById(requestId);

    if (!request) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }

    const stops = await RideStopModel.find({
      ride_request_id: requestId
    });

    return {
      ...request,
      stops: stops.sort((a, b) => a.stop_order - b.stop_order)
    };

  }

  async cancelRideRequest(requestId, riderId) {

    const request = await RideRequestModel.findById(requestId);

    if (!request) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }

    if (request.rider_id !== riderId) {
      throw new AppError("NOT_AUTHORIZED_TO_CANCEL", 403);
    }

    if (!['pending', 'broadcasting', 'scheduled'].includes(request.status)) {
      throw new AppError("CANNOT_CANCEL_REQUEST", 400, {
        currentStatus: request.status
      });
    }

    return await RideRequestModel.findByIdAndUpdate(requestId, {
      status: 'cancelled',
      updated_at: new Date()
    });

  }

  _validateLocations(pickup, dropoff, stops) {

    if (!pickup?.lat || !pickup?.lng || !pickup?.address) {
      throw new AppError("INVALID_PICKUP_LOCATION", 400);
    }

    if (!dropoff?.lat || !dropoff?.lng || !dropoff?.address) {
      throw new AppError("INVALID_DROPOFF_LOCATION", 400);
    }

    if (Math.abs(pickup.lat) > 90 || Math.abs(pickup.lng) > 180) {
      throw new AppError("INVALID_PICKUP_COORDINATES", 400);
    }

    if (Math.abs(dropoff.lat) > 90 || Math.abs(dropoff.lng) > 180) {
      throw new AppError("INVALID_DROPOFF_COORDINATES", 400);
    }

    if (stops && stops.length > 0) {

      stops.forEach((stop, idx) => {

        if (!stop?.lat || !stop?.lng || !stop?.address) {
          throw new AppError("INVALID_STOP_LOCATION", 400, { stopIndex: idx });
        }

      });

    }

  }

  async _calculateRoute(pickup, dropoff, stops) {

    const directDistance = this._haversineDistance(
      pickup.lat, pickup.lng,
      dropoff.lat, dropoff.lng
    );

    const estimatedRoadDistance = directDistance * 1.3;

    let totalDistance = estimatedRoadDistance;

    if (stops && stops.length > 0) {
      totalDistance *= (1 + (stops.length * 0.2));
    }

    const estimatedDuration = (totalDistance / 30) * 60;

    return {
      distanceKm: Math.round(totalDistance * 100) / 100,
      durationMinutes: Math.round(estimatedDuration),
      waypoints: [pickup, ...stops, dropoff]
    };

  }

  _haversineDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) *
      Math.cos(this._toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

  }

  _toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  async _broadcastToDrivers(rideRequest) {

    await RideRequestModel.findByIdAndUpdate(rideRequest.id, {
      status: 'broadcasting',
      updated_at: new Date()
    });

    console.log("📢 Broadcasting ride request to drivers:", rideRequest.id);

  }

}