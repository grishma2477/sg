import { pool } from "../../database/DBConnection.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import GiftCard from "../../models/finance/gift_card/GiftCard.js";
import GiftCardRedemption from "../../models/finance/gift_card_redemption/GiftCardRedemption.js";
import Wallet from "../../models/finance/transaction/wallet/Wallet.js";
import Transaction from "../../models/finance/transaction/Transaction.js";
import { AppError } from "../../utils/AppError.js";
import { v4 as uuidv4 } from 'uuid';

export class GiftCardService {

  // ═══════════════════════════════════════════════════════════
  // GENERATE UNIQUE CODE
  // ═══════════════════════════════════════════════════════════

  static generateGiftCardCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'GC-';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ═══════════════════════════════════════════════════════════
  // PURCHASE GIFT CARD
  // ═══════════════════════════════════════════════════════════

  // static async purchaseGiftCard({
  //   userId,
  //   amount,
  //   message = null,
  //   validityDays = 365,
  //   paymentMethod = 'wallet'
  // }) {
  //   if (amount <= 0 || amount > 50000) {
  //     throw new AppError('INVALID_AMOUNT', 400, { min: 1, max: 50000 });
  //   }

  //   return await withTransaction(async (client) => {
  //     let code;
  //     let isUnique = false;
  //     let attempts = 0;

  //     while (!isUnique && attempts < 10) {
  //       code = this.generateGiftCardCode();
  //       const existing = await GiftCard.findOne({ code }, client);
  //       if (!existing) isUnique = true;
  //       attempts++;
  //     }

  //     if (!isUnique) {
  //       throw new AppError('CODE_GENERATION_FAILED', 500);
  //     }

  //     const wallet = await Wallet.findOne({ user_id: userId }, client);
  //     if (!wallet) {
  //       throw new AppError('WALLET_NOT_FOUND', 404);
  //     }

  //     const availableBalance = wallet.balance - wallet.locked_balance;
  //     if (availableBalance < amount) {
  //       throw new AppError('INSUFFICIENT_BALANCE', 400, {
  //         available: availableBalance,
  //         required: amount
  //       });
  //     }

  //     const newBalance = parseFloat(wallet.balance) - amount;
  //     await Wallet.updateOne(
  //       { user_id: userId },
  //       { balance: newBalance.toFixed(2) },
  //       client
  //     );

  //     const validUntil = new Date();
  //     validUntil.setDate(validUntil.getDate() + validityDays);

  //     const giftCard = await GiftCard.create({
  //       code,
  //       purchased_by: userId,
  //       current_owner_id: userId,
  //       initial_balance: amount.toFixed(2),
  //       current_balance: amount.toFixed(2),
  //       currency: 'NPR',
  //       valid_until: validUntil,
  //       message
  //     }, client);

  //     await Transaction.create({
  //       user_id: userId,
  //       type: 'debit',
  //       category: 'gift_card_purchase',
  //       amount: amount.toFixed(2),
  //       currency: 'NPR',
  //       balance_before: wallet.balance,
  //       balance_after: newBalance.toFixed(2),
  //       status: 'completed',
  //       description: `Purchased gift card ${code}`,
  //       idempotency_key: uuidv4()
  //     }, client);

  //     console.log(`✅ Gift card purchased: ${code} - ₹${amount}`);

  //     return giftCard;
  //   });
  // }

  static async purchaseGiftCard({
    userId,
    amount,
    message,
    validityDays = 365,
    paymentMethodId,
    idempotencyKey
  }) {

    if (amount <= 0 || amount > 50000) {
      throw new AppError("INVALID_AMOUNT", 400);
    }

    if (!idempotencyKey) {
      throw new AppError("IDEMPOTENCY_KEY_REQUIRED", 400);
    }

    // 🔐 Prevent duplicate requests
    const existingTxn = await Transaction.findOne({ idempotency_key: idempotencyKey });
    if (existingTxn) {
      throw new AppError("DUPLICATE_REQUEST", 409);
    }

    // 1️⃣ Validate Payment Method
    const paymentMethod = await PaymentMethod.findOne({
      id: paymentMethodId,
      user_id: userId,
      is_active: true,
      is_deleted: false
    });

    if (!paymentMethod) {
      throw new AppError("INVALID_PAYMENT_METHOD", 400);
    }

    // 2️⃣ Fetch Provider
    const provider = await PaymentProvider.findOne({
      id: paymentMethod.provider_id,
      is_active: true
    });

    if (!provider) {
      throw new AppError("PROVIDER_NOT_AVAILABLE", 400);
    }

    // 3️⃣ Branch by provider type
    switch (provider.type) {
      case "WALLET":
        return await this.handleWalletPurchase({
          userId,
          amount,
          message,
          validityDays,
          idempotencyKey
        });

      case "CARD":
      case "GATEWAY":
        return await this.handleGatewayPurchase({
          userId,
          amount,
          message,
          validityDays,
          paymentMethod,
          provider,
          idempotencyKey
        });

      default:
        throw new AppError("UNSUPPORTED_PROVIDER", 400);
    }
  }


  static async handleWalletPurchase({
    userId,
    amount,
    message,
    validityDays,
    idempotencyKey
  }) {

    return await withTransaction(async (client) => {

      // 🔒 Lock wallet row
      const wallet = await Wallet.findOneForUpdate({ user_id: userId }, client);

      if (!wallet) throw new AppError("WALLET_NOT_FOUND", 404);

      const available = wallet.balance - wallet.locked_balance;

      if (available < amount) {
        throw new AppError("INSUFFICIENT_BALANCE", 400);
      }

      const newBalance = parseFloat(wallet.balance) - amount;

      await Wallet.updateOne(
        { user_id: userId },
        { balance: newBalance.toFixed(2) },
        client
      );

      const giftCard = await this.createGiftCardRecord({
        userId,
        amount,
        message,
        validityDays
      }, client);

      await Transaction.create({
        user_id: userId,
        type: "debit",
        category: "gift_card_purchase",
        amount: amount.toFixed(2),
        balance_before: wallet.balance,
        balance_after: newBalance.toFixed(2),
        currency: "NPR",
        status: "completed",
        idempotency_key: idempotencyKey
      }, client);

      return giftCard;
    });
  }

  static async handleGatewayPurchase({
    userId,
    amount,
    message,
    validityDays,
    paymentMethod,
    provider,
    idempotencyKey
  }) {

    // 1️⃣ Create Pending Record FIRST
    const pending = await PendingGiftCard.create({
      user_id: userId,
      payment_provider_id: provider.id,
      payment_method_id: paymentMethod.id,
      amount,
      message,
      validity_days: validityDays,
      idempotency_key: idempotencyKey,
      status: "pending"
    });

    // 2️⃣ Generate Payment Request
    const paymentPayload = await GatewayService.initializePayment({
      providerName: provider.name,
      amount,
      referenceId: pending.id
    });

    return {
      requiresAction: true,
      redirectUrl: paymentPayload.redirectUrl,
      referenceId: pending.id
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CHECK BALANCE
  // ═══════════════════════════════════════════════════════════

  static async checkBalance(code, userId) {
    try {
      const cleanCode = code.toUpperCase().trim();
      const giftCard = await GiftCard.findOne({ code: cleanCode });

      if (!giftCard) {
        throw new AppError('GIFT_CARD_NOT_FOUND', 404);
      }

      if (giftCard.current_owner_id !== userId) {
        throw new AppError('NOT_CARD_OWNER', 403);
      }

      return {
        code: giftCard.code,
        currentBalance: parseFloat(giftCard.current_balance),
        initialBalance: parseFloat(giftCard.initial_balance),
        status: giftCard.status,
        validUntil: giftCard.valid_until,
        message: giftCard.message
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error checking gift card balance:', error);
      throw new AppError('CHECK_BALANCE_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // REDEEM TO WALLET
  // ═══════════════════════════════════════════════════════════

  static async redeemToWallet(code, userId, amount = null) {
    return await withTransaction(async (client) => {
      const cleanCode = code.toUpperCase().trim();
      const giftCard = await GiftCard.findOne({ code: cleanCode }, client);

      if (!giftCard) {
        throw new AppError('GIFT_CARD_NOT_FOUND', 404);
      }

      if (giftCard.current_owner_id !== userId) {
        throw new AppError('NOT_CARD_OWNER', 403);
      }

      if (giftCard.status !== 'active') {
        throw new AppError('GIFT_CARD_NOT_ACTIVE', 400, { status: giftCard.status });
      }

      if (giftCard.valid_until && new Date(giftCard.valid_until) < new Date()) {
        throw new AppError('GIFT_CARD_EXPIRED', 400);
      }

      const redeemAmount = amount || parseFloat(giftCard.current_balance);

      if (redeemAmount > parseFloat(giftCard.current_balance)) {
        throw new AppError('INSUFFICIENT_GIFT_CARD_BALANCE', 400, {
          available: giftCard.current_balance,
          requested: redeemAmount
        });
      }

      const newCardBalance = parseFloat(giftCard.current_balance) - redeemAmount;
      await GiftCard.updateOne(
        { id: giftCard.id },
        {
          current_balance: newCardBalance.toFixed(2),
          first_redeemed_at: giftCard.first_redeemed_at || new Date()
        },
        client
      );

      const wallet = await Wallet.findOne({ user_id: userId }, client);
      const newWalletBalance = parseFloat(wallet.balance) + redeemAmount;

      await Wallet.updateOne(
        { user_id: userId },
        { balance: newWalletBalance.toFixed(2) },
        client
      );

      await GiftCardRedemption.create({
        gift_card_id: giftCard.id,
        user_id: userId,
        amount_used: redeemAmount.toFixed(2),
        balance_before: giftCard.current_balance,
        balance_after: newCardBalance.toFixed(2),
        redemption_type: 'wallet_topup'
      }, client);

      await Transaction.create({
        user_id: userId,
        type: 'credit',
        category: 'gift_card_redemption',
        amount: redeemAmount.toFixed(2),
        currency: 'NPR',
        balance_before: wallet.balance,
        balance_after: newWalletBalance.toFixed(2),
        status: 'completed',
        description: `Redeemed gift card ${cleanCode}`,
        idempotency_key: uuidv4()
      }, client);

      console.log(`✅ Gift card redeemed to wallet: ${cleanCode} - ₹${redeemAmount}`);

      return {
        giftCard: await GiftCard.findById(giftCard.id, client),
        redeemedAmount: redeemAmount,
        newWalletBalance: newWalletBalance
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // USE FOR RIDE PAYMENT
  // ═══════════════════════════════════════════════════════════

  static async useForRidePayment({
    code,
    userId,
    rideId,
    amount
  }) {
    return await withTransaction(async (client) => {
      const cleanCode = code.toUpperCase().trim();
      const giftCard = await GiftCard.findOne({ code: cleanCode }, client);

      if (!giftCard) {
        throw new AppError('GIFT_CARD_NOT_FOUND', 404);
      }

      if (giftCard.current_owner_id !== userId) {
        throw new AppError('NOT_CARD_OWNER', 403);
      }

      if (giftCard.status !== 'active') {
        throw new AppError('GIFT_CARD_NOT_ACTIVE', 400);
      }

      if (parseFloat(giftCard.current_balance) < amount) {
        throw new AppError('INSUFFICIENT_GIFT_CARD_BALANCE', 400);
      }

      const newCardBalance = parseFloat(giftCard.current_balance) - amount;
      await GiftCard.updateOne(
        { id: giftCard.id },
        {
          current_balance: newCardBalance.toFixed(2),
          first_redeemed_at: giftCard.first_redeemed_at || new Date()
        },
        client
      );

      const redemption = await GiftCardRedemption.create({
        gift_card_id: giftCard.id,
        user_id: userId,
        ride_id: rideId,
        amount_used: amount.toFixed(2),
        balance_before: giftCard.current_balance,
        balance_after: newCardBalance.toFixed(2),
        redemption_type: 'ride_payment'
      }, client);

      console.log(`✅ Gift card used for ride: ${cleanCode} - ₹${amount}`);

      return {
        redemption,
        remainingBalance: newCardBalance
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // TRANSFER GIFT CARD
  // ═══════════════════════════════════════════════════════════

  static async transferGiftCard(code, fromUserId, toUserId) {
    return await withTransaction(async (client) => {
      const cleanCode = code.toUpperCase().trim();
      const giftCard = await GiftCard.findOne({ code: cleanCode }, client);

      if (!giftCard) {
        throw new AppError('GIFT_CARD_NOT_FOUND', 404);
      }

      if (giftCard.current_owner_id !== fromUserId) {
        throw new AppError('NOT_CARD_OWNER', 403);
      }

      if (giftCard.status !== 'active') {
        throw new AppError('CANNOT_TRANSFER_INACTIVE_CARD', 400);
      }

      if (fromUserId === toUserId) {
        throw new AppError('CANNOT_TRANSFER_TO_SELF', 400);
      }

      await GiftCard.updateOne(
        { id: giftCard.id },
        { current_owner_id: toUserId },
        client
      );

      console.log(`✅ Gift card transferred: ${cleanCode} from ${fromUserId} to ${toUserId}`);

      return await GiftCard.findById(giftCard.id, client);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET USER GIFT CARDS
  // ═══════════════════════════════════════════════════════════

  static async getUserGiftCards(userId) {
    try {
      const giftCards = await GiftCard.find({ current_owner_id: userId });

      return giftCards
        .filter(gc => gc.status === 'active' && parseFloat(gc.current_balance) > 0)
        .sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at));
    } catch (error) {
      console.error('Error getting gift cards:', error);
      throw new AppError('GET_GIFT_CARDS_ERROR', 500, { userId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET REDEMPTION HISTORY
  // ═══════════════════════════════════════════════════════════

  static async getRedemptionHistory(code, userId) {
    try {
      const cleanCode = code.toUpperCase().trim();
      const giftCard = await GiftCard.findOne({ code: cleanCode });

      if (!giftCard) {
        throw new AppError('GIFT_CARD_NOT_FOUND', 404);
      }

      if (giftCard.current_owner_id !== userId && giftCard.purchased_by !== userId) {
        throw new AppError('NOT_AUTHORIZED', 403);
      }

      const redemptions = await GiftCardRedemption.find({
        gift_card_id: giftCard.id
      });

      return redemptions.sort((a, b) =>
        new Date(b.redeemed_at) - new Date(a.redeemed_at)
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting redemption history:', error);
      throw new AppError('GET_HISTORY_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN: GET ALL GIFT CARDS
  // ═══════════════════════════════════════════════════════════

  static async getAllGiftCards(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      const giftCards = await GiftCard.find(query);

      return giftCards.sort((a, b) =>
        new Date(b.purchased_at) - new Date(a.purchased_at)
      );
    } catch (error) {
      console.error('Error getting all gift cards:', error);
      throw new AppError('GET_GIFT_CARDS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN: GET STATISTICS
  // ═══════════════════════════════════════════════════════════

  static async getGiftCardStats() {
    try {
      const allCards = await GiftCard.findAll();
      const allRedemptions = await GiftCardRedemption.findAll();

      const stats = {
        totalCards: allCards.length,
        activeCards: allCards.filter(c => c.status === 'active').length,
        redeemedCards: allCards.filter(c => c.status === 'redeemed').length,
        expiredCards: allCards.filter(c => c.status === 'expired').length,
        cancelledCards: allCards.filter(c => c.status === 'cancelled').length,

        totalValueIssued: allCards.reduce((sum, c) =>
          sum + parseFloat(c.initial_balance), 0
        ),
        totalValueRemaining: allCards.reduce((sum, c) =>
          sum + parseFloat(c.current_balance), 0
        ),
        totalValueRedeemed: allRedemptions.reduce((sum, r) =>
          sum + parseFloat(r.amount_used), 0
        ),

        totalRedemptions: allRedemptions.length,
        averageRedemptionAmount: 0
      };

      if (stats.totalRedemptions > 0) {
        stats.averageRedemptionAmount = stats.totalValueRedeemed / stats.totalRedemptions;
      }

      stats.redemptionRate = stats.totalValueIssued > 0
        ? ((stats.totalValueRedeemed / stats.totalValueIssued) * 100).toFixed(2)
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting gift card stats:', error);
      throw new AppError('GET_STATS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN: GET ALL REDEMPTIONS
  // ═══════════════════════════════════════════════════════════

  static async getAllRedemptions(filters = {}) {
    try {
      const query = {};

      if (filters.userId) {
        query.user_id = filters.userId;
      }

      let redemptions = await GiftCardRedemption.find(query);

      if (filters.code) {
        const giftCard = await GiftCard.findOne({ code: filters.code.toUpperCase() });
        if (giftCard) {
          redemptions = redemptions.filter(r => r.gift_card_id === giftCard.id);
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
  // ADMIN: CANCEL GIFT CARD
  // ═══════════════════════════════════════════════════════════

  static async cancelGiftCard(code, reason, adminId) {
    return await withTransaction(async (client) => {
      const cleanCode = code.toUpperCase().trim();
      const giftCard = await GiftCard.findOne({ code: cleanCode }, client);

      if (!giftCard) {
        throw new AppError('GIFT_CARD_NOT_FOUND', 404);
      }

      if (giftCard.status === 'cancelled') {
        throw new AppError('ALREADY_CANCELLED', 400);
      }

      if (parseFloat(giftCard.current_balance) > 0 && giftCard.purchased_by) {
        const refundAmount = parseFloat(giftCard.current_balance);

        const wallet = await Wallet.findOne({ user_id: giftCard.purchased_by }, client);
        const newBalance = parseFloat(wallet.balance) + refundAmount;

        await Wallet.updateOne(
          { user_id: giftCard.purchased_by },
          { balance: newBalance.toFixed(2) },
          client
        );

        await Transaction.create({
          user_id: giftCard.purchased_by,
          type: 'credit',
          category: 'gift_card_refund',
          amount: refundAmount.toFixed(2),
          currency: 'NPR',
          balance_before: wallet.balance,
          balance_after: newBalance.toFixed(2),
          status: 'completed',
          description: `Gift card ${cleanCode} cancelled: ${reason}`,
          idempotency_key: uuidv4()
        }, client);

        console.log(`💸 Refunded ₹${refundAmount} for cancelled gift card ${cleanCode}`);
      }

      await GiftCard.updateOne(
        { id: giftCard.id },
        {
          status: 'cancelled',
          current_balance: 0
        },
        client
      );

      console.log(`❌ Gift card cancelled: ${cleanCode} by admin ${adminId}`);

      return await GiftCard.findById(giftCard.id, client);
    });
  }

  static async confirmGatewayPayment(referenceId, gatewayResponse) {

    return await withTransaction(async (client) => {

      const pending = await PendingGiftCard.findOneForUpdate({
        id: referenceId,
        status: "pending"
      }, client);

      if (!pending) return;

      // 1️⃣ Verify with gateway API
      const verified = await GatewayService.verifyPayment(gatewayResponse);

      if (!verified) {
        await PendingGiftCard.updateOne(
          { id: pending.id },
          { status: "failed" },
          client
        );
        throw new AppError("PAYMENT_VERIFICATION_FAILED", 400);
      }

      // 2️⃣ Create Gift Card
      const giftCard = await this.createGiftCardRecord({
        userId: pending.user_id,
        amount: pending.amount,
        message: pending.message,
        validityDays: pending.validity_days
      }, client);

      // 3️⃣ Mark Pending Completed
      await PendingGiftCard.updateOne(
        { id: pending.id },
        { status: "completed" },
        client
      );

      return giftCard;
    });
  }

  static async createGiftCardRecord(data, client) {

    const code = this.generateGiftCardCode();

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + data.validityDays);

    return await GiftCard.create({
      code,
      purchased_by: data.userId,
      current_owner_id: data.userId,
      initial_balance: data.amount.toFixed(2),
      current_balance: data.amount.toFixed(2),
      currency: "NPR",
      valid_until: validUntil,
      message: data.message
    }, client);
  }


}

