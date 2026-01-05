// import { BiddingService } from "../application/services/BiddingService.js";
// import { notifyBidSubmitted, notifyBidAccepted, notifyBidRejected } from "../realtime/socketServer.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import RideBidModel from "../models/ride/RideBid.js";
// import RideRequestModel from "../models/ride/RideRequest.js";

// const service = new BiddingService();

// export const submitBid = async (req, res, next) => {
//   try {
//     const result = await service.submitBid({
//       rideRequestId: req.params.id,
//       driverId: req.user.driverId,
//       ...req.body
//     });

//     // Get request to notify rider
//     const request = await RideRequestModel.findById(req.params.id);
    
//     notifyBidSubmitted(request.rider_id, {
//       bidId: result.bidId,
//       requestId: req.params.id,
//       amount: result.bidAmount,
//       driverId: req.user.driverId
//     });

//     res.status(201).json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };

// export const getBidsForRequest = async (req, res, next) => {
//   try {
//     const bids = await service.getBidsForRequest(req.params.id, req.user.id);
//     res.json(ApiResponse.success(bids));
//   } catch (err) {
//     next(err);
//   }
// };

// export const acceptBid = async (req, res, next) => {
//   try {
//     const result = await service.acceptBid(req.params.bidId, req.user.id);

//     // Notify accepted driver
//     notifyBidAccepted(result.driverId, {
//       bidId: req.params.bidId,
//       accepted: true
//     });

//     // Notify rejected drivers
//     const allBids = await RideBidModel.find({
//       ride_request_id: req.params.requestId,
//       status: 'rejected'
//     });
    
//     allBids.forEach(bid => {
//       notifyBidRejected(bid.driver_id, req.params.requestId);
//     });

//     res.json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };

// export const withdrawBid = async (req, res, next) => {
//   try {
//     const result = await service.withdrawBid(req.params.id, req.user.driverId);
//     res.json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };

// export const getDriverBids = async (req, res, next) => {
//   try {
//     const bids = await service.getDriverBids(req.user.driverId);
//     res.json(ApiResponse.success(bids));
//   } catch (err) {
//     next(err);
//   }
// };



import { pool } from '../database/DBConnection.js';

// Submit a bid
export const submitBid = async (req, res) => {
  try {
    const { requestId } = req.params;
    const driverId = req.user.id;
    const {
      bidAmount,
      estimatedArrivalMinutes,
      driverMessage
    } = req.body;

    console.log('💰 Submitting bid:', { requestId, driverId, bidAmount });

    // Get driver info
    const driverInfo = await pool.query(
      `SELECT d.id, v.vehicle_type, v.make, v.model, v.color, v.license_plate
       FROM drivers d
       LEFT JOIN vehicles v ON d.id = v.driver_id
       WHERE d.user_id = $1
       LIMIT 1`,
      [driverId]
    );

    if (driverInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const driver = driverInfo.rows[0];

    // Insert bid
    const query = `
      INSERT INTO ride_bids (
        ride_request_id,
        driver_id,
        bid_amount,
        estimated_arrival_minutes,
        driver_message,
        vehicle_type,
        vehicle_make,
        vehicle_model,
        vehicle_color,
        license_plate,
        status,
        expires_at,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW() + INTERVAL '15 minutes', NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      requestId,
      driver.id,
      bidAmount,
      estimatedArrivalMinutes || 10,
      driverMessage || null,
      driver.vehicle_type || null,
      driver.make || null,
      driver.model || null,
      driver.color || null,
      driver.license_plate || null
    ]);

    console.log('✅ Bid submitted:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'BID_SUBMITTED',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error submitting bid:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// Get all bids for a ride request
export const getRideRequestBids = async (req, res) => {
  try {
    const { requestId } = req.params;

    console.log('📋 Fetching bids for request:', requestId);

    const query = `
      SELECT 
        rb.*,
        d.user_id as driver_user_id,
        dss.current_points as driver_safety_points,
        dss.average_rating as driver_rating,
        dss.completed_rides as driver_completed_rides
      FROM ride_bids rb
      JOIN drivers d ON rb.driver_id = d.id
      LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
      WHERE rb.ride_request_id = $1
      AND rb.status = 'pending'
      AND rb.expires_at > NOW()
      ORDER BY rb.bid_amount ASC, rb.created_at ASC
    `;

    const result = await pool.query(query, [requestId]);

    console.log(`✅ Found ${result.rows.length} bids`);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching bids:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// Accept a bid
export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const riderId = req.user.id;

    console.log('✅ Accepting bid:', bidId);

    // Get bid details
    const bidResult = await pool.query(
      'SELECT * FROM ride_bids WHERE id = $1',
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const bid = bidResult.rows[0];

    // Update bid status
    await pool.query(
      `UPDATE ride_bids 
       SET status = 'accepted', accepted_at = NOW()
       WHERE id = $1`,
      [bidId]
    );

    // Update ride request
    await pool.query(
      `UPDATE ride_requests
       SET status = 'accepted',
           matched_driver_id = $1,
           matched_bid_id = $2,
           accepted_at = NOW()
       WHERE id = $3`,
      [bid.driver_id, bidId, bid.ride_request_id]
    );

    // Reject other bids
    await pool.query(
      `UPDATE ride_bids
       SET status = 'rejected'
       WHERE ride_request_id = $1 AND id != $2`,
      [bid.ride_request_id, bidId]
    );

    console.log('✅ Bid accepted successfully');

    res.status(200).json({
      success: true,
      message: 'BID_ACCEPTED',
      data: bid
    });

  } catch (error) {
    console.error('❌ Error accepting bid:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};