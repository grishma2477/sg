import { GiftCardService } from "../application/services/GiftCardService.js";

// ═══════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════

export const purchaseGiftCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, message, validityDays, paymentMethod } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'AMOUNT_REQUIRED'
      });
    }

    const giftCard = await GiftCardService.purchaseGiftCard({
      userId,
      amount: parseFloat(amount),
      message,
      validityDays,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'GIFT_CARD_PURCHASED',
      data: giftCard
    });
  } catch (error) {
    console.error('Error in purchaseGiftCard:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'PURCHASE_ERROR',
      error: error.message,
      details: error.details
    });
  }
};

export const checkBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.params;

    const balance = await GiftCardService.checkBalance(code, userId);

    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error in checkBalance:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'CHECK_BALANCE_ERROR',
      error: error.message
    });
  }
};

export const redeemToWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'CODE_REQUIRED'
      });
    }

    const result = await GiftCardService.redeemToWallet(
      code,
      userId,
      amount ? parseFloat(amount) : null
    );

    res.status(200).json({
      success: true,
      message: 'GIFT_CARD_REDEEMED',
      data: result
    });
  } catch (error) {
    console.error('Error in redeemToWallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'REDEEM_ERROR',
      error: error.message,
      details: error.details
    });
  }
};

export const transferGiftCard = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { code, toUserId } = req.body;

    if (!code || !toUserId) {
      return res.status(400).json({
        success: false,
        message: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const giftCard = await GiftCardService.transferGiftCard(
      code,
      fromUserId,
      toUserId
    );

    res.status(200).json({
      success: true,
      message: 'GIFT_CARD_TRANSFERRED',
      data: giftCard
    });
  } catch (error) {
    console.error('Error in transferGiftCard:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'TRANSFER_ERROR',
      error: error.message
    });
  }
};

export const getUserGiftCards = async (req, res) => {
  try {
    const userId = req.user.id;

    const giftCards = await GiftCardService.getUserGiftCards(userId);

    res.status(200).json({
      success: true,
      data: giftCards
    });
  } catch (error) {
    console.error('Error in getUserGiftCards:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_GIFT_CARDS_ERROR',
      error: error.message
    });
  }
};

export const getRedemptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.params;

    const history = await GiftCardService.getRedemptionHistory(code, userId);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error in getRedemptionHistory:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_HISTORY_ERROR',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

export const getAllGiftCards = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;

    const filters = { status };
    const giftCards = await GiftCardService.getAllGiftCards(filters);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = giftCards.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: giftCards.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(giftCards.length / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllGiftCards:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_GIFT_CARDS_ERROR',
      error: error.message
    });
  }
};

export const getGiftCardStats = async (req, res) => {
  try {
    const stats = await GiftCardService.getGiftCardStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getGiftCardStats:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_STATS_ERROR',
      error: error.message
    });
  }
};

export const getAllGiftCardRedemptions = async (req, res) => {
  try {
    const { code, userId, page = 1, limit = 100 } = req.query;

    const filters = { code, userId };
    const redemptions = await GiftCardService.getAllRedemptions(filters);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = redemptions.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: redemptions.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllGiftCardRedemptions:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_REDEMPTIONS_ERROR',
      error: error.message
    });
  }
};

export const cancelGiftCard = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { code } = req.params;
    const { reason } = req.body;

    const giftCard = await GiftCardService.cancelGiftCard(code, reason, adminId);

    res.status(200).json({
      success: true,
      message: 'GIFT_CARD_CANCELLED',
      data: giftCard
    });
  } catch (error) {
    console.error('Error in cancelGiftCard:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'CANCEL_ERROR',
      error: error.message
    });
  }
};