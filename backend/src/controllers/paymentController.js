import { PaymentService } from "../application/services/PaymentService.js";
import { LedgerService } from "../application/services/LedgerService.js";

// ═══════════════════════════════════════════════════════════
// GET WALLET BALANCE
// ═══════════════════════════════════════════════════════════

export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role === 'driver' ? 'driver' : 'user';

    const balance = await LedgerService.getUserWalletBalance(userId, userType);

    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_BALANCE_ERROR',
      error: error.message,
      details: error.details
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET PAYMENT DETAILS
// ═══════════════════════════════════════════════════════════

export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const details = await PaymentService.getPaymentDetails(paymentId);

    res.status(200).json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_PAYMENT_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// HANDLE GATEWAY WEBHOOK (eSewa/Khalti)
// ═══════════════════════════════════════════════════════════

export const handleGatewayWebhook = async (req, res) => {
  try {
    const { gatewayTransactionId, status, response } = req.body;

    if (!gatewayTransactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'MISSING_REQUIRED_FIELDS'
      });
    }

    await PaymentService.handleGatewayWebhook({
      gatewayTransactionId,
      status,
      response
    });

    res.status(200).json({
      success: true,
      message: 'WEBHOOK_PROCESSED'
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'WEBHOOK_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET ACCOUNT HISTORY
// ═══════════════════════════════════════════════════════════

export const getAccountHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role === 'driver' ? 'driver' : 'user';
    const { limit = 50 } = req.query;

    const walletInfo = await LedgerService.getUserWalletBalance(userId, userType);
    const history = await LedgerService.getAccountHistory(walletInfo.accountId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        balance: walletInfo.balance,
        history
      }
    });
  } catch (error) {
    console.error('Error getting account history:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_HISTORY_ERROR',
      error: error.message
    });
  }
};