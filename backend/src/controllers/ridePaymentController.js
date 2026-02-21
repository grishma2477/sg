import { RidePaymentService } from "../application/services/RidePaymentService.js";

// ═══════════════════════════════════════════════════════════
// GET RIDE PAYMENT DETAILS
// ═══════════════════════════════════════════════════════════

export const getRidePaymentDetails = async (req, res) => {
  try {
    const { rideId } = req.params;

    const paymentDetails = await RidePaymentService.getPaymentDetails(rideId);

    res.status(200).json({
      success: true,
      data: paymentDetails
    });
  } catch (error) {
    console.error('Error in getRidePaymentDetails:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'FETCH_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET USER PAYMENT HISTORY
// ═══════════════════════════════════════════════════════════

export const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { limit = 50, status, method } = req.query;

    const filters = {
      limit: parseInt(limit),
      status,
      method
    };

    const payments = await RidePaymentService.getUserPaymentHistory(userId, role, filters);

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error in getUserPaymentHistory:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'HISTORY_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET PAYMENT STATS
// ═══════════════════════════════════════════════════════════

export const getPaymentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const stats = await RidePaymentService.getPaymentStats(userId, role);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getPaymentStats:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'STATS_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// CANCEL RIDE PAYMENT (Used by ride cancellation)
// ═══════════════════════════════════════════════════════════

export const cancelRidePayment = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const payment = await RidePaymentService.cancelRidePayment(
      rideId,
      reason || 'Ride cancelled'
    );

    res.status(200).json({
      success: true,
      message: 'PAYMENT_CANCELLED',
      data: payment
    });
  } catch (error) {
    console.error('Error in cancelRidePayment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'CANCEL_ERROR',
      error: error.message
    });
  }
};