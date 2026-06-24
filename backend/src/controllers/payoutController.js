import { PayoutService } from "../application/services/PayoutService.js";
import { LedgerService } from "../application/services/LedgerService.js";
import { NotificationService } from "../application/services/NotificationService.js";
import { pool } from "../database/DBConnection.js";

// ═══════════════════════════════════════════════════════════
// DRIVER: REQUEST PAYOUT
// ═══════════════════════════════════════════════════════════

export const requestPayout = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { amount, payoutMethodId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'INVALID_AMOUNT'
      });
    }

    const request = await PayoutService.requestPayout({
      driverId,
      amount: parseFloat(amount),
      payoutMethodId
    });

    res.status(201).json({
      success: true,
      message: 'PAYOUT_REQUESTED',
      data: request
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'REQUEST_PAYOUT_ERROR',
      error: error.message,
      details: error.details
    });
  }
};

// ═══════════════════════════════════════════════════════════
// DRIVER: GET PAYOUT HISTORY
// ═══════════════════════════════════════════════════════════

export const getMyPayoutHistory = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { limit = 50 } = req.query;

    const history = await PayoutService.getDriverPayoutHistory(driverId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting payout history:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_HISTORY_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// DRIVER: GET AVAILABLE BALANCE
// ═══════════════════════════════════════════════════════════

export const getAvailableBalance = async (req, res) => {
  try {
    const driverId = req.user.id;

    const balance = await LedgerService.getUserWalletBalance(driverId, 'driver');

    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_BALANCE_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: GET PENDING PAYOUTS
// ═══════════════════════════════════════════════════════════

export const getPendingPayouts = async (req, res) => {
  try {
    const payouts = await PayoutService.getPendingPayouts();

    res.status(200).json({
      success: true,
      data: payouts
    });
  } catch (error) {
    console.error('Error getting pending payouts:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_PAYOUTS_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: GET APPROVED PAYOUTS
// ═══════════════════════════════════════════════════════════

export const getApprovedPayouts = async (req, res) => {
  try {
    const payouts = await PayoutService.getApprovedPayouts();

    res.status(200).json({
      success: true,
      data: payouts
    });
  } catch (error) {
    console.error('Error getting approved payouts:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_PAYOUTS_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: APPROVE PAYOUT
// ═══════════════════════════════════════════════════════════

export const approvePayout = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { notes } = req.body;

    const request = await PayoutService.approvePayoutRequest(requestId, adminId, notes);

    // Notify the driver's user account
    const userRow = await pool.query(
      `SELECT user_id FROM drivers WHERE id = $1`,
      [request.driver_id]
    );
    if (userRow.rows.length > 0) {
      NotificationService.notify(userRow.rows[0].user_id, {
        title: 'Payout Approved',
        body: `NPR ${request.amount} will be transferred in 1-2 days`,
        data: { requestId: String(requestId) },
        type: 'payment'
      });
    }

    res.status(200).json({
      success: true,
      message: 'PAYOUT_APPROVED',
      data: request
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'APPROVE_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: REJECT PAYOUT
// ═══════════════════════════════════════════════════════════

export const rejectPayout = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'REASON_REQUIRED'
      });
    }

    const request = await PayoutService.rejectPayoutRequest(requestId, adminId, reason);

    res.status(200).json({
      success: true,
      message: 'PAYOUT_REJECTED',
      data: request
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'REJECT_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: CREATE PAYOUT BATCH
// ═══════════════════════════════════════════════════════════

export const createPayoutBatch = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { requestIds, notes } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'INVALID_REQUEST_IDS'
      });
    }

    const batch = await PayoutService.createPayoutBatch(adminId, requestIds, notes);

    res.status(201).json({
      success: true,
      message: 'BATCH_CREATED',
      data: batch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'CREATE_BATCH_ERROR',
      error: error.message,
      details: error.details
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: GET PAYOUT BATCHES
// ═══════════════════════════════════════════════════════════

export const getPayoutBatches = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const batches = await PayoutService.getPayoutBatches(parseInt(limit));

    res.status(200).json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error('Error getting batches:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_BATCHES_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: GET BATCH DETAILS
// ═══════════════════════════════════════════════════════════

export const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;

    const details = await PayoutService.getBatchDetails(batchId);

    res.status(200).json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error getting batch details:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_BATCH_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: RETRY FAILED PAYOUT
// ═══════════════════════════════════════════════════════════

export const retryFailedPayout = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await PayoutService.retryFailedPayout(requestId);

    res.status(200).json({
      success: true,
      message: 'PAYOUT_RETRY_INITIATED',
      data: request
    });
  } catch (error) {
    console.error('Error retrying payout:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'RETRY_ERROR',
      error: error.message
    });
  }
};