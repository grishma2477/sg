import RideBidModel from "../../models/ride/RideBid.js";
import RideRequestModel from "../../models/ride/RideRequest.js";
import DriverModel from "../../models/driver/Driver.js";
import DriverSafetyStatsModel from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
import VehicleModel from "../../models/vehicle/Vehicle.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import { AppError } from "../../utils/AppError.js";
import { String } from "../../utils/Constant.js";
import moment from "moment";

/**
 * Bidding Service
 * 
 * Manages driver bidding on ride requests:
 * - Drivers submit bids with their price
 * - Riders see all bids and choose
 * - Auto-expire bids after X minutes
 */
export class BiddingService {
  
  /**
   * Driver submits a bid on a ride request
   * 
   * @param {Object} params
   * @param {string} params.rideRequestId - Ride request ID
   * @param {string} params.driverId - Driver ID
   * @param {number} params.bidAmount - Bid amount in currency
   * @param {number} params.estimatedArrivalMinutes - ETA to pickup
   * @param {string} params.message - Optional message to rider
   */
  async submitBid({
    rideRequestId,
    driverId,
    bidAmount,
    estimatedArrivalMinutes,
    message = null
  }) {
    
    // ═══════════════════════════════════════════════════
    // 1️⃣ VALIDATE RIDE REQUEST
    // ═══════════════════════════════════════════════════
    const rideRequest = await RideRequestModel.findById(rideRequestId);
    
    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }
    
    if (rideRequest.status !== 'broadcasting') {
      throw new AppError("RIDE_REQUEST_NOT_ACCEPTING_BIDS", 400, {
        currentStatus: rideRequest.status
      });
    }
    
    if (rideRequest.pricing_mode !== 'bidding') {
      throw new AppError("RIDE_REQUEST_NOT_IN_BIDDING_MODE", 400);
    }
    
    // Check if request expired
    if (moment(rideRequest.expires_at).isBefore(moment())) {
      throw new AppError("RIDE_REQUEST_EXPIRED", 400);
    }
    
    // ═══════════════════════════════════════════════════
    // 2️⃣ VALIDATE DRIVER
    // ═══════════════════════════════════════════════════
    const driver = await DriverModel.findById(driverId);
    
    if (!driver) {
      throw new AppError("DRIVER_NOT_FOUND", 404);
    }
    
    if (!driver.is_online || !driver.is_available) {
      throw new AppError("DRIVER_NOT_AVAILABLE", 400);
    }
    
    // ═══════════════════════════════════════════════════
    // 3️⃣ CHECK FOR EXISTING BID
    // ═══════════════════════════════════════════════════
    const existingBid = await RideBidModel.findOne({
      ride_request_id: rideRequestId,
      driver_id: driverId
    });
    
    if (existingBid && existingBid.status === 'pending') {
      throw new AppError("BID_ALREADY_SUBMITTED", 400);
    }
    
    // ═══════════════════════════════════════════════════
    // 4️⃣ VALIDATE BID AMOUNT
    // ═══════════════════════════════════════════════════
    if (bidAmount <= 0) {
      throw new AppError("INVALID_BID_AMOUNT", 400);
    }
    
    // Check if bid is within reasonable range of estimate
    const minAcceptable = rideRequest.estimated_fare_min * 0.7;  // 30% below
    const maxAcceptable = rideRequest.estimated_fare_max * 1.5;  // 50% above
    
    if (bidAmount < minAcceptable) {
      throw new AppError("BID_TOO_LOW", 400, {
        minimumBid: minAcceptable
      });
    }
    
    if (bidAmount > maxAcceptable) {
      throw new AppError("BID_TOO_HIGH", 400, {
        maximumBid: maxAcceptable
      });
    }
    
    // ═══════════════════════════════════════════════════
    // 5️⃣ GET DRIVER STATS & VEHICLE INFO
    // ═══════════════════════════════════════════════════
    const safetyStats = await DriverSafetyStatsModel.findOne({
      driver_id: driverId
    });
    
    const vehicle = await VehicleModel.findOne({
      driver_id: driverId,
      is_active: true
    });
    
    // ═══════════════════════════════════════════════════
    // 6️⃣ CREATE BID
    // ═══════════════════════════════════════════════════
    const expiresAt = moment()
      .add(String.BID_EXPIRY_MINUTES, 'minutes')
      .toDate();
    
    const bid = await RideBidModel.create({
      ride_request_id: rideRequestId,
      driver_id: driverId,
      bid_amount: bidAmount,
      currency: 'USD',
      estimated_arrival_minutes: estimatedArrivalMinutes,
      driver_message: message,
      
      // Vehicle info snapshot
      vehicle_type: vehicle?.vehicle_type,
      vehicle_make: vehicle?.make,
      vehicle_model: vehicle?.model,
      vehicle_color: vehicle?.color,
      license_plate: vehicle?.license_plate,
      
      // Driver stats snapshot
      driver_rating: safetyStats?.average_rating || 0,
      driver_completed_rides: safetyStats?.completed_rides || 0,
      driver_safety_points: safetyStats?.current_points || String.INITIAL_POINTS,
      
      status: 'pending',
      expires_at: expiresAt
    });
    
    console.log(`✅ Bid submitted: ${bid.id} by driver ${driverId} for $${bidAmount}`);
    
    // TODO: Notify rider via Socket.io about new bid
    
    return {
      bidId: bid.id,
      bidAmount,
      expiresAt,
      status: 'pending'
    };
  }
  
  /**
   * Get all bids for a ride request
   * 
   * @param {string} rideRequestId
   * @param {string} riderId - Validates that requester is the rider
   */
  async getBidsForRequest(rideRequestId, riderId) {
    
    const rideRequest = await RideRequestModel.findById(rideRequestId);
    
    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }
    
    if (rideRequest.rider_id !== riderId) {
      throw new AppError("NOT_AUTHORIZED", 403);
    }
    
    // Get all pending bids, sorted by amount (lowest first)
    const bids = await RideBidModel.find({
      ride_request_id: rideRequestId,
      status: 'pending'
    });
    
    // Filter out expired bids
    const now = moment();
    const activeBids = bids.filter(bid => 
      moment(bid.expires_at).isAfter(now)
    );
    
    // Sort by bid amount (lowest first) and rating
    const sortedBids = activeBids.sort((a, b) => {
      // Primary: lowest price
      if (a.bid_amount !== b.bid_amount) {
        return a.bid_amount - b.bid_amount;
      }
      // Secondary: highest rating
      return b.driver_rating - a.driver_rating;
    });
    
    return sortedBids.map(bid => ({
      bidId: bid.id,
      driverId: bid.driver_id,
      bidAmount: parseFloat(bid.bid_amount),
      estimatedArrival: bid.estimated_arrival_minutes,
      message: bid.driver_message,
      vehicle: {
        type: bid.vehicle_type,
        make: bid.vehicle_make,
        model: bid.vehicle_model,
        color: bid.vehicle_color,
        plate: bid.license_plate
      },
      driver: {
        rating: parseFloat(bid.driver_rating),
        completedRides: bid.driver_completed_rides,
        safetyPoints: bid.driver_safety_points
      },
      expiresAt: bid.expires_at,
      createdAt: bid.created_at
    }));
  }
  
  /**
   * Rider accepts a bid
   * 
   * @param {string} bidId - Bid ID to accept
   * @param {string} riderId - Validates that accepter is the rider
   */
  async acceptBid(bidId, riderId) {
    
    const bid = await RideBidModel.findById(bidId);
    
    if (!bid) {
      throw new AppError("BID_NOT_FOUND", 404);
    }
    
    if (bid.status !== 'pending') {
      throw new AppError("BID_NOT_PENDING", 400, {
        currentStatus: bid.status
      });
    }
    
    // Check if bid expired
    if (moment(bid.expires_at).isBefore(moment())) {
      throw new AppError("BID_EXPIRED", 400);
    }
    
    // Validate rider
    const rideRequest = await RideRequestModel.findById(bid.ride_request_id);
    
    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }
    
    if (rideRequest.rider_id !== riderId) {
      throw new AppError("NOT_AUTHORIZED", 403);
    }
    
    // ═══════════════════════════════════════════════════
    // ACCEPT BID IN TRANSACTION
    // ═══════════════════════════════════════════════════
    await withTransaction(async (client) => {
      
      // 1. Accept the bid
      await RideBidModel.findByIdAndUpdate(bid.id, {
        status: 'accepted',
        accepted_at: new Date()
      }, client);
      
      // 2. Reject all other bids
      await RideBidModel.updateMany(
        {
          ride_request_id: bid.ride_request_id,
          id: { $ne: bid.id },
          status: 'pending'
        },
        {
          status: 'rejected',
          rejected_at: new Date()
        },
        client
      );
      
      // 3. Update ride request
      await RideRequestModel.findByIdAndUpdate(bid.ride_request_id, {
        status: 'matched',
        matched_driver_id: bid.driver_id,
        matched_bid_id: bid.id,
        accepted_at: new Date()
      }, client);
      
    });
    
    console.log(`✅ Bid accepted: ${bidId} for request ${bid.ride_request_id}`);
    
    // TODO: Notify driver via Socket.io
    // TODO: Create actual ride from request
    
    return {
      bidId: bid.id,
      driverId: bid.driver_id,
      amount: parseFloat(bid.bid_amount),
      status: 'accepted'
    };
  }
  
  /**
   * Driver withdraws their bid
   */
  async withdrawBid(bidId, driverId) {
    
    const bid = await RideBidModel.findById(bidId);
    
    if (!bid) {
      throw new AppError("BID_NOT_FOUND", 404);
    }
    
    if (bid.driver_id !== driverId) {
      throw new AppError("NOT_AUTHORIZED", 403);
    }
    
    if (bid.status !== 'pending') {
      throw new AppError("BID_CANNOT_BE_WITHDRAWN", 400, {
        currentStatus: bid.status
      });
    }
    
    await RideBidModel.findByIdAndUpdate(bidId, {
      status: 'withdrawn',
      updated_at: new Date()
    });
    
    console.log(`🔙 Bid withdrawn: ${bidId}`);
    
    return { success: true };
  }
  
  /**
   * Auto-expire old bids (run as cron job)
   */
  async expireBids() {
    
    const result = await RideBidModel.updateMany(
      {
        status: 'pending',
        expires_at: { $lt: new Date() }
      },
      {
        status: 'expired',
        updated_at: new Date()
      }
    );
    
    console.log(`⏰ Expired ${result.modifiedCount} old bids`);
    
    return result.modifiedCount;
  }
  
  /**
   * Get driver's active bids
   */
  async getDriverBids(driverId) {
    
    const bids = await RideBidModel.find({
      driver_id: driverId,
      status: 'pending'
    });
    
    // Filter out expired
    const now = moment();
    const activeBids = bids.filter(bid => 
      moment(bid.expires_at).isAfter(now)
    );
    
    // Get request details for each bid
    const bidsWithRequests = await Promise.all(
      activeBids.map(async (bid) => {
        const request = await RideRequestModel.findById(bid.ride_request_id);
        
        return {
          bidId: bid.id,
          requestId: bid.ride_request_id,
          bidAmount: parseFloat(bid.bid_amount),
          status: bid.status,
          expiresAt: bid.expires_at,
          request: request ? {
            pickup: request.pickup_address,
            dropoff: request.dropoff_address,
            estimatedDistance: request.estimated_distance_km
          } : null,
          createdAt: bid.created_at
        };
      })
    );
    
    return bidsWithRequests;
  }
}
