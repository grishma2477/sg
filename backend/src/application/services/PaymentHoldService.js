import { pool } from "../../database/DBConnection.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import PaymentHold from "../../models/finance/payment_hold/PaymentHold.js";
import Wallet from "../../models/finance/transaction/wallet/Wallet.js";
import { AppError } from "../../utils/AppError.js";

export class PaymentHoldService {

  // ═══════════════════════════════════════════════════════════
  // CREATE PAYMENT HOLD (Lock Funds for Ride)
  // ═══════════════════════════════════════════════════════════

  static async createHold({
    userId,
    rideId,
    amount,
    expiresAt = null,
    reason = 'ride_payment',
    description = null
  }) {
    if (amount <= 0) {
      throw new AppError('INVALID_HOLD_AMOUNT', 400, { amount });
    }

    return await withTransaction(async (client) => {
      const wallet = await Wallet.findOne({ user_id: userId }, client);
      if (!wallet) {
        throw new AppError('WALLET_NOT_FOUND', 404, { userId });
      }

      const availableBalance = wallet.balance - wallet.locked_balance;
      if (availableBalance < amount) {
        throw new AppError('INSUFFICIENT_FUNDS_FOR_HOLD', 400, { 
          available: availableBalance,
          required: amount
        });
      }

      const existingHold = await PaymentHold.findOne({ 
        ride_id: rideId, 
        status: 'active' 
      }, client);
      
      if (existingHold) {
        throw new AppError('HOLD_ALREADY_EXISTS', 409, { 
          rideId,
          existingHoldId: existingHold.id 
        });
      }

      const newLockedBalance = parseFloat(wallet.locked_balance) + amount;
      await Wallet.updateOne(
        { user_id: userId },
        { locked_balance: newLockedBalance.toFixed(2) },
        client
      );

      const hold = await PaymentHold.create({
        user_id: userId,
        ride_id: rideId,
        amount: amount.toFixed(2),
        currency: 'NPR',
        expires_at: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
        reason,
        description
      }, client);

      console.log(`🔒 Payment hold created: ${hold.id} for ride ${rideId} - ₹${amount}`);

      return hold;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CAPTURE HOLD (Deduct Locked Funds)
  // ═══════════════════════════════════════════════════════════

  static async captureHold(holdId, actualAmount = null) {
    return await withTransaction(async (client) => {
      const hold = await PaymentHold.findById(holdId, client);
      if (!hold) {
        throw new AppError('HOLD_NOT_FOUND', 404, { holdId });
      }

      if (hold.status !== 'active') {
        throw new AppError('HOLD_CANNOT_BE_CAPTURED', 400, { status: hold.status });
      }

      if (new Date(hold.expires_at) <= new Date()) {
        throw new AppError('HOLD_EXPIRED', 400);
      }

      const captureAmount = actualAmount || parseFloat(hold.amount);
      if (captureAmount > parseFloat(hold.amount)) {
        throw new AppError('CAPTURE_AMOUNT_EXCEEDS_HOLD', 400);
      }

      const wallet = await Wallet.findOne({ user_id: hold.user_id }, client);

      const newBalance = parseFloat(wallet.balance) - captureAmount;
      const newLockedBalance = parseFloat(wallet.locked_balance) - parseFloat(hold.amount);

      await Wallet.updateOne(
        { user_id: hold.user_id },
        { 
          balance: newBalance.toFixed(2),
          locked_balance: Math.max(0, newLockedBalance).toFixed(2)
        },
        client
      );

      await PaymentHold.updateOne(
        { id: holdId },
        { 
          status: 'captured',
          captured_at: new Date()
        },
        client
      );

      console.log(`✅ Payment hold captured: ${holdId} - ₹${captureAmount}`);

      return {
        hold: await PaymentHold.findById(holdId, client),
        capturedAmount: captureAmount,
        releasedAmount: parseFloat(hold.amount) - captureAmount
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // RELEASE HOLD (Unlock Funds)
  // ═══════════════════════════════════════════════════════════

  static async releaseHold(holdId) {
    return await withTransaction(async (client) => {
      const hold = await PaymentHold.findById(holdId, client);
      if (!hold) {
        throw new AppError('HOLD_NOT_FOUND', 404, { holdId });
      }

      if (hold.status !== 'active') {
        throw new AppError('HOLD_CANNOT_BE_RELEASED', 400, { status: hold.status });
      }

      const wallet = await Wallet.findOne({ user_id: hold.user_id }, client);
      const newLockedBalance = Math.max(0, parseFloat(wallet.locked_balance) - parseFloat(hold.amount));

      await Wallet.updateOne(
        { user_id: hold.user_id },
        { locked_balance: newLockedBalance.toFixed(2) },
        client
      );

      await PaymentHold.updateOne(
        { id: holdId },
        { 
          status: 'released',
          released_at: new Date()
        },
        client
      );

      console.log(`🔓 Payment hold released: ${holdId} - ₹${hold.amount}`);

      return await PaymentHold.findById(holdId, client);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET ACTIVE HOLDS
  // ═══════════════════════════════════════════════════════════

  static async getActiveHolds(userId) {
    try {
      const holds = await PaymentHold.find({ 
        user_id: userId, 
        status: 'active' 
      });
      
      return holds.filter(h => new Date(h.expires_at) > new Date());
    } catch (error) {
      console.error('Error fetching active holds:', error);
      throw new AppError('FETCH_HOLDS_ERROR', 500, { userId });
    }
  }

  static async getTotalActiveHolds(userId) {
    try {
      const holds = await this.getActiveHolds(userId);
      return holds.reduce((sum, h) => sum + parseFloat(h.amount), 0);
    } catch (error) {
      console.error('Error calculating total holds:', error);
      throw new AppError('CALCULATE_HOLDS_ERROR', 500, { userId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // EXPIRE OLD HOLDS (Scheduled Job)
  // ═══════════════════════════════════════════════════════════

  static async expireOldHolds() {
    return await withTransaction(async (client) => {
      const holds = await PaymentHold.find({ status: 'active' }, client);
      const expiredHolds = holds.filter(h => new Date(h.expires_at) <= new Date());

      for (const hold of expiredHolds) {
        const wallet = await Wallet.findOne({ user_id: hold.user_id }, client);
        const newLockedBalance = Math.max(0, parseFloat(wallet.locked_balance) - parseFloat(hold.amount));

        await Wallet.updateOne(
          { user_id: hold.user_id },
          { locked_balance: newLockedBalance.toFixed(2) },
          client
        );

        await PaymentHold.updateOne(
          { id: hold.id },
          { 
            status: 'expired',
            released_at: new Date()
          },
          client
        );
      }

      console.log(`⏰ Expired ${expiredHolds.length} payment holds`);

      return expiredHolds;
    });
  }
}