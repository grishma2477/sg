import DriverModel from "../../models/driver/Driver.js";
import DriverLocationModel from "../../models/driver/driver_location/DriverLocation.js";
import DriverSafetyStatsModel from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
import DriverVisibilityModel from "../../models/driver/driver_visibility/DriverVisibility.js";
import RideRequestModel from "../../models/ride/RideRequest.js";
import { pool } from "../../database/DBConnection.js";
import { AppError } from "../../utils/AppError.js";
import { String } from "../../utils/Constant.js";

/**
 * Driver Matching Service
 * 
 * Matches ride requests to drivers based on:
 * - Geographic proximity (PostGIS)
 * - Driver visibility multiplier
 * - Driver availability
 * - Safety points
 */
export class DriverMatchingService {
  
  /**
   * Find eligible drivers for a ride request
   * 
   * Uses PostGIS to find nearby drivers within their visibility radius
   * 
   * @param {string} rideRequestId - The ride request ID
   * @returns {Array} List of eligible drivers with their scores
   */
  async findEligibleDrivers(rideRequestId) {
    
    const rideRequest = await RideRequestModel.findById(rideRequestId);
    
    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }
    
    // ═══════════════════════════════════════════════════
    // 1️⃣ FIND NEARBY DRIVERS USING POSTGIS
    // ═══════════════════════════════════════════════════
    
    /**
     * This query:
     * - Finds online/available drivers
     * - Within their visibility-adjusted radius
     * - Sorted by proximity and multiplier
     * - Respects driver's max concurrent requests
     */
    const query = `
      WITH request_location AS (
        SELECT pickup_location 
        FROM ${String.RIDE_REQUEST_MODEL}
        WHERE id = $1
      ),
      driver_visibility_info AS (
        SELECT 
          d.id as driver_id,
          d.user_id,
          dl.location as driver_location,
          dv.visibility_multiplier,
          dv.max_request_radius_km,
          dv.max_concurrent_requests,
          dv.performance_tier,
          dss.current_points as safety_points,
          dss.average_rating,
          dss.completed_rides,
          -- Calculate distance in km
          ST_Distance(
            dl.location::geography,
            rl.pickup_location::geography
          ) / 1000.0 as distance_km
        FROM ${String.DRIVER_MODEL} d
        INNER JOIN ${String.DRIVER_LOCATION_MODEL} dl ON d.id = dl.driver_id
        INNER JOIN ${String.DRIVER_VISIBILITY_MODEL} dv ON d.id = dv.driver_id
        INNER JOIN ${String.DRIVER_SAFETY_STATS_MODEL} dss ON d.id = dss.driver_id
        CROSS JOIN request_location rl
        WHERE 
          d.is_online = TRUE
          AND d.is_available = TRUE
          AND d.status = 'available'
          AND dv.is_restricted = FALSE
          -- Driver must be within their visibility-adjusted radius
          AND ST_DWithin(
            dl.location::geography,
            rl.pickup_location::geography,
            dv.max_request_radius_km * 1000  -- Convert km to meters
          )
      ),
      driver_current_requests AS (
        -- Count current active requests per driver
        SELECT 
          matched_driver_id as driver_id,
          COUNT(*) as active_requests
        FROM ${String.RIDE_REQUEST_MODEL}
        WHERE matched_driver_id IS NOT NULL
          AND status IN ('matched', 'accepted')
        GROUP BY matched_driver_id
      )
      SELECT 
        dvi.*,
        COALESCE(dcr.active_requests, 0) as current_requests,
        -- Calculate match score
        (
          (1.0 / (1.0 + dvi.distance_km)) * 0.3 +  -- 30% proximity
          (dvi.visibility_multiplier / 2.0) * 0.3 +  -- 30% visibility
          (dvi.average_rating / 5.0) * 0.2 +  -- 20% rating
          (LEAST(dvi.safety_points, 1500) / 1500.0) * 0.2  -- 20% safety
        ) * 100 as match_score
      FROM driver_visibility_info dvi
      LEFT JOIN driver_current_requests dcr ON dvi.driver_id = dcr.driver_id
      WHERE 
        -- Respect max concurrent requests
        COALESCE(dcr.active_requests, 0) < dvi.max_concurrent_requests
        -- Minimum safety threshold
        AND dvi.safety_points >= 500
      ORDER BY match_score DESC
      LIMIT 50;  -- Top 50 candidates
    `;
    
    const result = await pool.query(query, [rideRequestId]);
    
    console.log(`📍 Found ${result.rows.length} eligible drivers for request ${rideRequestId}`);
    
    // ═══════════════════════════════════════════════════
    // 2️⃣ APPLY VISIBILITY MULTIPLIER FILTERING
    // ═══════════════════════════════════════════════════
    
    /**
     * Visibility multiplier determines how many requests a driver sees:
     * - 0.5x (probation): sees 50% of requests
     * - 1.0x (standard): sees 100% of requests
     * - 1.5x (gold): sees 150% of requests (gets priority)
     * - 2.0x (platinum): sees 200% of requests (highest priority)
     */
    const filteredDrivers = this._applyVisibilityFilter(result.rows);
    
    return filteredDrivers.map(driver => ({
      driverId: driver.driver_id,
      userId: driver.user_id,
      distanceKm: parseFloat(driver.distance_km).toFixed(2),
      matchScore: parseFloat(driver.match_score).toFixed(2),
      visibilityMultiplier: parseFloat(driver.visibility_multiplier),
      performanceTier: driver.performance_tier,
      safetyPoints: driver.safety_points,
      averageRating: parseFloat(driver.average_rating),
      completedRides: driver.completed_rides,
      currentRequests: driver.current_requests,
      maxRequests: driver.max_concurrent_requests
    }));
  }
  
  /**
   * Get nearby ride requests for a driver
   * 
   * Shows requests within driver's visibility radius
   * Number of requests shown depends on visibility multiplier
   * 
   * @param {string} driverId - Driver ID
   * @returns {Array} List of nearby ride requests
   */
  async getNearbyRequestsForDriver(driverId) {
    
    // Get driver's location and visibility settings
    const driverData = await this._getDriverVisibilityData(driverId);
    
    if (!driverData) {
      throw new AppError("DRIVER_NOT_FOUND", 404);
    }
    
    if (!driverData.is_online || !driverData.is_available) {
      return [];  // Driver offline/unavailable
    }
    
    // ═══════════════════════════════════════════════════
    // 1️⃣ FIND NEARBY REQUESTS USING POSTGIS
    // ═══════════════════════════════════════════════════
    
    const query = `
      SELECT 
        rr.id,
        rr.rider_id,
        rr.pickup_address,
        rr.dropoff_address,
        rr.estimated_distance_km,
        rr.estimated_duration_minutes,
        rr.estimated_fare_min,
        rr.estimated_fare_max,
        rr.pricing_mode,
        rr.passenger_count,
        rr.vehicle_preference,
        rr.requested_pickup_time,
        rr.expires_at,
        rr.created_at,
        -- Calculate distance from driver to pickup
        ST_Distance(
          dl.location::geography,
          rr.pickup_location::geography
        ) / 1000.0 as distance_to_pickup_km,
        -- Calculate time to reach pickup (assume 30 km/h avg)
        (ST_Distance(
          dl.location::geography,
          rr.pickup_location::geography
        ) / 1000.0 / 30.0 * 60.0) as eta_minutes
      FROM ${String.RIDE_REQUEST_MODEL} rr
      CROSS JOIN ${String.DRIVER_LOCATION_MODEL} dl
      WHERE dl.driver_id = $1
        AND rr.status IN ('pending', 'broadcasting')
        AND rr.matched_driver_id IS NULL
        -- Within driver's visibility radius
        AND ST_DWithin(
          dl.location::geography,
          rr.pickup_location::geography,
          $2 * 1000  -- max_request_radius_km in meters
        )
        -- Not expired
        AND rr.expires_at > NOW()
      ORDER BY distance_to_pickup_km ASC;
    `;
    
    const result = await pool.query(query, [
      driverId,
      driverData.max_request_radius_km
    ]);
    
    // ═══════════════════════════════════════════════════
    // 2️⃣ APPLY VISIBILITY MULTIPLIER LIMIT
    // ═══════════════════════════════════════════════════
    
    /**
     * Limit number of requests shown based on multiplier:
     * - 0.5x: show 5 requests
     * - 1.0x: show 10 requests (default)
     * - 1.5x: show 15 requests
     * - 2.0x: show 20 requests
     */
    const baseLimit = 10;
    const adjustedLimit = Math.floor(
      baseLimit * driverData.visibility_multiplier
    );
    
    const limitedRequests = result.rows.slice(0, adjustedLimit);
    
    console.log(`📱 Showing ${limitedRequests.length} requests to driver ${driverId} (multiplier: ${driverData.visibility_multiplier})`);
    
    return limitedRequests.map(req => ({
      requestId: req.id,
      riderId: req.rider_id,
      pickup: {
        address: req.pickup_address
      },
      dropoff: {
        address: req.dropoff_address
      },
      estimatedDistance: parseFloat(req.estimated_distance_km),
      estimatedDuration: req.estimated_duration_minutes,
      estimatedFare: {
        min: parseFloat(req.estimated_fare_min),
        max: parseFloat(req.estimated_fare_max)
      },
      pricingMode: req.pricing_mode,
      passengerCount: req.passenger_count,
      vehiclePreference: req.vehicle_preference,
      scheduledTime: req.requested_pickup_time,
      expiresAt: req.expires_at,
      distanceToPickup: parseFloat(req.distance_to_pickup_km).toFixed(2),
      estimatedArrival: Math.round(req.eta_minutes),
      createdAt: req.created_at
    }));
  }
  
  /**
   * Update driver's visibility settings based on safety points
   * 
   * Auto-adjusts tier and multiplier
   */
  async updateDriverVisibility(driverId) {
    
    const stats = await DriverSafetyStatsModel.findOne({
      driver_id: driverId
    });
    
    if (!stats) {
      console.log(`⚠️ No safety stats found for driver ${driverId}`);
      return;
    }
    
    // Determine tier based on safety points
    const tier = this._calculateTier(stats.current_points);
    const multiplier = this._getMultiplierForTier(tier);
    const radius = this._getRadiusForTier(tier);
    const maxRequests = this._getMaxRequestsForTier(tier);
    
    // Update visibility settings
    await DriverVisibilityModel.findOneAndUpdate(
      { driver_id: driverId },
      {
        visibility_multiplier: multiplier,
        performance_tier: tier,
        max_request_radius_km: radius,
        max_concurrent_requests: maxRequests,
        last_calculated_at: new Date(),
        updated_at: new Date()
      }
    );
    
    console.log(`✅ Updated driver ${driverId} visibility: tier=${tier}, multiplier=${multiplier}`);
  }
  
  // ═══════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════
  
  /**
   * Apply probabilistic filtering based on visibility multiplier
   */
  _applyVisibilityFilter(drivers) {
    return drivers.filter(driver => {
      // Higher multiplier = higher chance of seeing request
      const threshold = Math.random();
      const multiplier = parseFloat(driver.visibility_multiplier);
      
      // Platinum (2.0x) always sees requests
      if (multiplier >= 2.0) return true;
      
      // Others have probability based on multiplier
      return threshold <= (multiplier / 2.0);
    });
  }
  
  /**
   * Get driver's visibility data
   */
  async _getDriverVisibilityData(driverId) {
    const query = `
      SELECT 
        d.id,
        d.is_online,
        d.is_available,
        dv.visibility_multiplier,
        dv.max_request_radius_km,
        dv.max_concurrent_requests,
        dv.performance_tier
      FROM ${String.DRIVER_MODEL} d
      LEFT JOIN ${String.DRIVER_VISIBILITY_MODEL} dv ON d.id = dv.driver_id
      WHERE d.id = $1;
    `;
    
    const result = await pool.query(query, [driverId]);
    return result.rows[0] || null;
  }
  
  /**
   * Calculate tier based on safety points
   */
  _calculateTier(safetyPoints) {
    if (safetyPoints >= 1300) return 'platinum';
    if (safetyPoints >= 1100) return 'gold';
    if (safetyPoints >= 900) return 'silver';
    if (safetyPoints >= 700) return 'standard';
    return 'probation';
  }
  
  /**
   * Get multiplier for tier
   */
  _getMultiplierForTier(tier) {
    const multipliers = {
      'probation': 0.5,
      'standard': 1.0,
      'silver': 1.2,
      'gold': 1.5,
      'platinum': 2.0
    };
    return multipliers[tier] || 1.0;
  }
  
  /**
   * Get radius for tier
   */
  _getRadiusForTier(tier) {
    const radii = {
      'probation': 3.0,
      'standard': 5.0,
      'silver': 7.0,
      'gold': 10.0,
      'platinum': 15.0
    };
    return radii[tier] || 5.0;
  }
  
  /**
   * Get max concurrent requests for tier
   */
  _getMaxRequestsForTier(tier) {
    const maxRequests = {
      'probation': 5,
      'standard': 10,
      'silver': 15,
      'gold': 20,
      'platinum': 30
    };
    return maxRequests[tier] || 10;
  }
}
