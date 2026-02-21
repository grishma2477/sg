import { pool } from "../../database/DBConnection.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import PromoCode from "../../models/finance/promo_code/PromoCode.js";
import PromoRedemption from "../../models/finance/promo_redemption/PromoRedemption.js";
import { AppError } from "../../utils/AppError.js";

export class PromoCodeService {

  // ═══════════════════════════════════════════════════════════
  // CREATE PROMO CODE (ADMIN ONLY)
  // ═══════════════════════════════════════════════════════════

  static async createPromoCode({
    code,
    description,
    discountType,
    discountValue,
    maxDiscountAmount = null,
    minRideAmount = 0,
    totalUsageLimit = null,
    usagePerUserLimit = 1,
    validFrom = new Date(),
    validUntil,
    createdBy
  }) {
    try {
      const cleanCode = code.toUpperCase().trim();
      if (cleanCode.length < 3) {
        throw new AppError('CODE_TOO_SHORT', 400);
      }

      const existing = await PromoCode.findOne({ code: cleanCode });
      if (existing) {
        throw new AppError('CODE_ALREADY_EXISTS', 409, { code: cleanCode });
      }

      if (discountType === 'percentage' && discountValue > 100) {
        throw new AppError('INVALID_PERCENTAGE', 400);
      }

      const promoCode = await PromoCode.create({
        code: cleanCode,
        description,
        discount_type: discountType,
        discount_value: discountValue,
        max_discount_amount: maxDiscountAmount,
        min_ride_amount: minRideAmount,
        total_usage_limit: totalUsageLimit,
        usage_per_user_limit: usagePerUserLimit,
        valid_from: validFrom,
        valid_until: validUntil,
        created_by: createdBy
      });

      console.log(`✅ Promo code created: ${cleanCode}`);

      return promoCode;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error creating promo code:', error);
      throw new AppError('CREATE_PROMO_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDATE PROMO CODE
  // ═══════════════════════════════════════════════════════════

  static async validatePromoCode(code, userId, rideAmount) {
    try {
      const cleanCode = code.toUpperCase().trim();
      const promo = await PromoCode.findOne({ code: cleanCode });

      if (!promo) {
        throw new AppError('PROMO_NOT_FOUND', 404);
      }

      if (!promo.is_active) {
        throw new AppError('PROMO_INACTIVE', 400);
      }

      const now = new Date();
      if (new Date(promo.valid_from) > now) {
        throw new AppError('PROMO_NOT_YET_VALID', 400);
      }

      if (promo.valid_until && new Date(promo.valid_until) < now) {
        throw new AppError('PROMO_EXPIRED', 400);
      }

      if (rideAmount < promo.min_ride_amount) {
        throw new AppError('AMOUNT_TOO_LOW', 400, {
          required: promo.min_ride_amount,
          provided: rideAmount
        });
      }

      if (promo.total_usage_limit && promo.current_usage_count >= promo.total_usage_limit) {
        throw new AppError('PROMO_USAGE_LIMIT_REACHED', 400);
      }

      const userRedemptions = await PromoRedemption.find({
        promo_code_id: promo.id,
        user_id: userId,
        status: 'used'
      });

      if (userRedemptions.length >= promo.usage_per_user_limit) {
        throw new AppError('USER_USAGE_LIMIT_REACHED', 400, {
          limit: promo.usage_per_user_limit
        });
      }

      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (rideAmount * promo.discount_value) / 100;
        if (promo.max_discount_amount) {
          discountAmount = Math.min(discountAmount, promo.max_discount_amount);
        }
      } else {
        discountAmount = promo.discount_value;
      }

      discountAmount = Math.min(discountAmount, rideAmount);

      return {
        valid: true,
        promo,
        discountAmount,
        finalAmount: rideAmount - discountAmount
      };

    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error validating promo code:', error);
      throw new AppError('VALIDATE_PROMO_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // APPLY PROMO CODE TO RIDE
  // ═══════════════════════════════════════════════════════════

  static async applyPromoCode({
    code,
    userId,
    rideId,
    originalAmount
  }) {
    return await withTransaction(async (client) => {
      const validation = await this.validatePromoCode(code, userId, originalAmount);

      const redemption = await PromoRedemption.create({
        promo_code_id: validation.promo.id,
        user_id: userId,
        ride_id: rideId,
        original_amount: originalAmount,
        discount_amount: validation.discountAmount,
        final_amount: validation.finalAmount,
        status: 'applied'
      }, client);

      await PromoCode.updateOne(
        { id: validation.promo.id },
        { current_usage_count: validation.promo.current_usage_count + 1 },
        client
      );

      console.log(`✅ Promo ${code} applied to ride ${rideId}: -₹${validation.discountAmount}`);

      return {
        redemption,
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // MARK PROMO AS USED
  // ═══════════════════════════════════════════════════════════

  static async markPromoAsUsed(rideId) {
    try {
      const redemption = await PromoRedemption.findOne({ ride_id: rideId });
      
      if (redemption && redemption.status === 'applied') {
        await PromoRedemption.updateOne(
          { id: redemption.id },
          { status: 'used' }
        );
        
        console.log(`✅ Promo marked as used for ride ${rideId}`);
      }

      return redemption;
    } catch (error) {
      console.error('Error marking promo as used:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // REFUND PROMO
  // ═══════════════════════════════════════════════════════════

  static async refundPromo(rideId) {
    return await withTransaction(async (client) => {
      const redemption = await PromoRedemption.findOne({ ride_id: rideId }, client);
      
      if (!redemption) return null;

      await PromoRedemption.updateOne(
        { id: redemption.id },
        { status: 'refunded' },
        client
      );

      const promo = await PromoCode.findById(redemption.promo_code_id, client);
      await PromoCode.updateOne(
        { id: promo.id },
        { current_usage_count: Math.max(0, promo.current_usage_count - 1) },
        client
      );

      console.log(`✅ Promo refunded for ride ${rideId}`);

      return redemption;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET PROMO CODE
  // ═══════════════════════════════════════════════════════════

  static async getPromoCode(code) {
    try {
      const cleanCode = code.toUpperCase().trim();
      const promo = await PromoCode.findOne({ code: cleanCode });

      if (!promo) {
        throw new AppError('PROMO_NOT_FOUND', 404);
      }

      return promo;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting promo code:', error);
      throw new AppError('GET_PROMO_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // LIST PROMO CODES (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async listPromoCodes(filters = {}) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.is_active = filters.isActive;
      }

      const promos = await PromoCode.find(query);

      return promos.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (error) {
      console.error('Error listing promo codes:', error);
      throw new AppError('LIST_PROMOS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE PROMO CODE (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async updatePromoCode(code, updates, adminId) {
    try {
      const cleanCode = code.toUpperCase().trim();
      
      const allowedUpdates = {
        description: updates.description,
        max_discount_amount: updates.maxDiscountAmount,
        min_ride_amount: updates.minRideAmount,
        total_usage_limit: updates.totalUsageLimit,
        usage_per_user_limit: updates.usagePerUserLimit,
        valid_until: updates.validUntil,
        is_active: updates.isActive
      };

      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );

      const promo = await PromoCode.updateOne(
        { code: cleanCode },
        allowedUpdates
      );

      console.log(`✏️ Promo code updated: ${cleanCode} by admin ${adminId}`);

      return promo;
    } catch (error) {
      console.error('Error updating promo code:', error);
      throw new AppError('UPDATE_PROMO_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DEACTIVATE PROMO CODE (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async deactivatePromoCode(code, adminId) {
    try {
      const cleanCode = code.toUpperCase().trim();
      
      const promo = await PromoCode.updateOne(
        { code: cleanCode },
        { is_active: false }
      );

      console.log(`🔒 Promo code deactivated: ${cleanCode} by admin ${adminId}`);

      return promo;
    } catch (error) {
      console.error('Error deactivating promo code:', error);
      throw new AppError('DEACTIVATE_PROMO_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET PROMO STATS (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async getPromoStats() {
    try {
      const allPromos = await PromoCode.findAll();
      const allRedemptions = await PromoRedemption.findAll();

      const stats = {
        totalPromos: allPromos.length,
        activePromos: allPromos.filter(p => p.is_active).length,
        inactivePromos: allPromos.filter(p => !p.is_active).length,
        totalRedemptions: allRedemptions.length,
        usedRedemptions: allRedemptions.filter(r => r.status === 'used').length,
        totalDiscountGiven: allRedemptions
          .filter(r => r.status === 'used')
          .reduce((sum, r) => sum + parseFloat(r.discount_amount), 0),
        averageDiscount: 0
      };

      if (stats.usedRedemptions > 0) {
        stats.averageDiscount = stats.totalDiscountGiven / stats.usedRedemptions;
      }

      return stats;
    } catch (error) {
      console.error('Error getting promo stats:', error);
      throw new AppError('GET_STATS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET ALL REDEMPTIONS (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async getAllRedemptions(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      let redemptions = await PromoRedemption.find(query);

      if (filters.code) {
        const promo = await PromoCode.findOne({ code: filters.code.toUpperCase() });
        if (promo) {
          redemptions = redemptions.filter(r => r.promo_code_id === promo.id);
        } else {
          return [];
        }
      }

      return redemptions.sort((a, b) => 
        new Date(b.redeemed_at) - new Date(a.redeemed_at)
      );
    } catch (error) {
      console.error('Error getting redemptions:', error);
      throw new AppError('GET_REDEMPTIONS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET USER PROMO HISTORY
  // ═══════════════════════════════════════════════════════════

  static async getUserPromoHistory(userId) {
    try {
      const redemptions = await PromoRedemption.find({ user_id: userId });

      return redemptions.sort((a, b) => 
        new Date(b.redeemed_at) - new Date(a.redeemed_at)
      );
    } catch (error) {
      console.error('Error getting promo history:', error);
      throw new AppError('GET_HISTORY_ERROR', 500, { userId });
    }
  }
}