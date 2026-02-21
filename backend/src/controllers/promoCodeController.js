import { PromoCodeService } from "../application/services/PromoCodeService.js";

// ═══════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════

export const validatePromoCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, rideAmount } = req.body;

    if (!code || !rideAmount) {
      return res.status(400).json({
        success: false,
        message: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const validation = await PromoCodeService.validatePromoCode(
      code,
      userId,
      parseFloat(rideAmount)
    );

    res.status(200).json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error in validatePromoCode:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'VALIDATE_PROMO_ERROR',
      error: error.message,
      details: error.details
    });
  }
};

export const getPromoCode = async (req, res) => {
  try {
    const { code } = req.params;

    const promoCode = await PromoCodeService.getPromoCode(code);

    res.status(200).json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    console.error('Error in getPromoCode:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_PROMO_ERROR',
      error: error.message
    });
  }
};

export const getUserPromoHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await PromoCodeService.getUserPromoHistory(userId);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error in getUserPromoHistory:', error);
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

export const createPromoCode = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minRideAmount,
      totalUsageLimit,
      usagePerUserLimit,
      validFrom,
      validUntil
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        message: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const promoCode = await PromoCodeService.createPromoCode({
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minRideAmount,
      totalUsageLimit,
      usagePerUserLimit,
      validFrom,
      validUntil,
      createdBy: adminId
    });

    res.status(201).json({
      success: true,
      message: 'PROMO_CODE_CREATED',
      data: promoCode
    });
  } catch (error) {
    console.error('Error in createPromoCode:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'CREATE_PROMO_ERROR',
      error: error.message
    });
  }
};

export const updatePromoCode = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { code } = req.params;
    const updates = req.body;

    const promoCode = await PromoCodeService.updatePromoCode(code, updates, adminId);

    res.status(200).json({
      success: true,
      message: 'PROMO_CODE_UPDATED',
      data: promoCode
    });
  } catch (error) {
    console.error('Error in updatePromoCode:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'UPDATE_PROMO_ERROR',
      error: error.message
    });
  }
};

export const listPromoCodes = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;

    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const promoCodes = await PromoCodeService.listPromoCodes(filters);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = promoCodes.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: promoCodes.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(promoCodes.length / limit)
      }
    });
  } catch (error) {
    console.error('Error in listPromoCodes:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'LIST_PROMOS_ERROR',
      error: error.message
    });
  }
};

export const deactivatePromoCode = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { code } = req.params;

    const promoCode = await PromoCodeService.deactivatePromoCode(code, adminId);

    res.status(200).json({
      success: true,
      message: 'PROMO_CODE_DEACTIVATED',
      data: promoCode
    });
  } catch (error) {
    console.error('Error in deactivatePromoCode:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'DEACTIVATE_PROMO_ERROR',
      error: error.message
    });
  }
};

export const getPromoStats = async (req, res) => {
  try {
    const stats = await PromoCodeService.getPromoStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getPromoStats:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_STATS_ERROR',
      error: error.message
    });
  }
};

export const getAllPromoRedemptions = async (req, res) => {
  try {
    const { code, status, page = 1, limit = 100 } = req.query;

    const filters = { code, status };
    const redemptions = await PromoCodeService.getAllRedemptions(filters);

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
    console.error('Error in getAllPromoRedemptions:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.code || 'GET_REDEMPTIONS_ERROR',
      error: error.message
    });
  }
};