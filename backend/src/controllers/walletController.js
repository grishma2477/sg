import { WalletService } from "../application/services/WalletService.js";
import { PaymentHoldService } from "../application/services/PaymentHoldService.js";

// ═══════════════════════════════════════════════════════════
// GET WALLET BALANCE
// ═══════════════════════════════════════════════════════════

export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const balance = await WalletService.getWalletBalance(userId);

    // Also get active holds
    const activeHolds = await PaymentHoldService.getActiveHolds(userId);
    const totalLockedAmount = await PaymentHoldService.getTotalActiveHolds(userId);

    res.status(200).json({
      success: true,
      data: {
        ...balance,
        activeHolds: activeHolds.length,
        totalLockedAmount,
        holds: activeHolds
      }
    });
  } catch (error) {
    console.error('Error in getWalletBalance:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'WALLET_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// TOP-UP WALLET
// ═══════════════════════════════════════════════════════════

export const topUpWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      amount,
      paymentMethod, // 'card', 'khalti', 'esewa'
      paymentGateway,
      gatewayTransactionId,
      metadata
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'INVALID_AMOUNT',
        error: 'Amount must be greater than 0'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'PAYMENT_METHOD_REQUIRED'
      });
    }

    const result = await WalletService.topUpWallet({
      userId,
      amount,
      paymentMethod,
      paymentGateway,
      gatewayTransactionId,
      metadata
    });

    res.status(200).json({
      success: true,
      message: 'WALLET_TOPPED_UP',
      data: result
    });
  } catch (error) {
    console.error('Error in topUpWallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'TOP_UP_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// WITHDRAW FROM WALLET
// ═══════════════════════════════════════════════════════════

export const withdrawFromWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      amount,
      bankDetails, // { accountNumber, bankName, accountHolder }
      metadata
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'INVALID_AMOUNT'
      });
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankName) {
      return res.status(400).json({
        success: false,
        message: 'BANK_DETAILS_REQUIRED'
      });
    }

    const result = await WalletService.withdrawFromWallet({
      userId,
      amount,
      bankDetails,
      metadata
    });

    res.status(200).json({
      success: true,
      message: 'WITHDRAWAL_INITIATED',
      data: result
    });
  } catch (error) {
    console.error('Error in withdrawFromWallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'WITHDRAWAL_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// TRANSFER FUNDS
// ═══════════════════════════════════════════════════════════

export const transferFunds = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const {
      toUserId,
      amount,
      description,
      metadata
    } = req.body;

    // Validation
    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: 'RECIPIENT_REQUIRED'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'INVALID_AMOUNT'
      });
    }

    const result = await WalletService.transferFunds({
      fromUserId,
      toUserId,
      amount,
      description,
      metadata
    });

    res.status(200).json({
      success: true,
      message: 'TRANSFER_COMPLETED',
      data: result
    });
  } catch (error) {
    console.error('Error in transferFunds:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'TRANSFER_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET TRANSACTION HISTORY
// ═══════════════════════════════════════════════════════════

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      category,
      status,
      type,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      category,
      status,
      type,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const transactions = await WalletService.getTransactionHistory(userId, filters);

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'HISTORY_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: LOCK WALLET
// ═══════════════════════════════════════════════════════════

export const lockWallet = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'LOCK_REASON_REQUIRED'
      });
    }

    const wallet = await WalletService.lockWallet(userId, reason, adminId);

    res.status(200).json({
      success: true,
      message: 'WALLET_LOCKED',
      data: wallet
    });
  } catch (error) {
    console.error('Error in lockWallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'LOCK_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN: UNLOCK WALLET
// ═══════════════════════════════════════════════════════════

export const unlockWallet = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId } = req.params;

    const wallet = await WalletService.unlockWallet(userId, adminId);

    res.status(200).json({
      success: true,
      message: 'WALLET_UNLOCKED',
      data: wallet
    });
  } catch (error) {
    console.error('Error in unlockWallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'UNLOCK_ERROR',
      error: error.message
    });
  }
};