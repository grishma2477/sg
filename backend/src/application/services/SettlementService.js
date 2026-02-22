import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import Settlement from "../../models/finance/settlement/Settlement.js";
import Payment from "../../models/finance/payment/Payment.js";
import { LedgerService } from "./LedgerService.js";
import { AppError } from "../../utils/AppError.js";

export class SettlementService {

  // ═══════════════════════════════════════════════════════════
  // CREATE SETTLEMENT
  // ═══════════════════════════════════════════════════════════

  static async createSettlement({
    paymentId,
    driverId,
    amount,
    platformCommission
  }) {
    return await withTransaction(async (client) => {
      const payment = await Payment.findById(paymentId, client);
      if (!payment) {
        throw new AppError('PAYMENT_NOT_FOUND', 404);
      }

      if (payment.is_settled) {
        throw new AppError('ALREADY_SETTLED', 409);
      }

      const settlement = await Settlement.create({
        payment_id: paymentId,
        driver_id: driverId,
        amount: amount.toFixed(2),
        platform_commission: platformCommission.toFixed(2),
        status: 'pending'
      }, client);

      console.log(`📋 Settlement created: ${settlement.id}`);

      return settlement;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PROCESS SETTLEMENT
  // ═══════════════════════════════════════════════════════════

  static async processSettlement(settlementId) {
    return await withTransaction(async (client) => {
      const settlement = await Settlement.findById(settlementId, client);
      if (!settlement) {
        throw new AppError('SETTLEMENT_NOT_FOUND', 404);
      }

      if (settlement.status === 'completed') {
        throw new AppError('ALREADY_SETTLED', 409);
      }

      const payment = await Payment.findById(settlement.payment_id, client);
      const totalAmount = parseFloat(settlement.amount) + parseFloat(settlement.platform_commission);

      // Settle via ledger
      await LedgerService.settlePayment({
        rideId: payment.ride_id,
        driverId: settlement.driver_id,
        totalAmount,
        platformFee: parseFloat(settlement.platform_commission)
      });

      // Update settlement
      await Settlement.updateOne(
        { id: settlementId },
        {
          status: 'completed',
          completed_at: new Date()
        },
        client
      );

      // Mark payment as settled
      await Payment.updateOne(
        { id: payment.id },
        {
          is_settled: true,
          settled_at: new Date()
        },
        client
      );

      console.log(`✅ Settlement completed: ${settlementId}`);

      return await Settlement.findById(settlementId, client);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET SETTLEMENT DETAILS
  // ═══════════════════════════════════════════════════════════

  static async getSettlementDetails(settlementId) {
    try {
      const settlement = await Settlement.findById(settlementId);
      if (!settlement) {
        throw new AppError('SETTLEMENT_NOT_FOUND', 404);
      }

      const payment = await Payment.findById(settlement.payment_id);

      return {
        settlement,
        payment
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting settlement details:', error);
      throw new AppError('GET_SETTLEMENT_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET DRIVER SETTLEMENTS
  // ═══════════════════════════════════════════════════════════

  static async getDriverSettlements(driverId, limit = 50) {
    try {
      const settlements = await Settlement.find({ driver_id: driverId });

      return settlements
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting driver settlements:', error);
      throw new AppError('GET_SETTLEMENTS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET PENDING SETTLEMENTS
  // ═══════════════════════════════════════════════════════════

  static async getPendingSettlements() {
    try {
      return await Settlement.find({ status: 'pending' });
    } catch (error) {
      console.error('Error getting pending settlements:', error);
      throw new AppError('GET_SETTLEMENTS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RETRY FAILED SETTLEMENT
  // ═══════════════════════════════════════════════════════════

  static async retryFailedSettlement(settlementId) {
    return await withTransaction(async (client) => {
      const settlement = await Settlement.findById(settlementId, client);
      if (!settlement) {
        throw new AppError('SETTLEMENT_NOT_FOUND', 404);
      }

      if (settlement.status !== 'failed') {
        throw new AppError('SETTLEMENT_NOT_FAILED', 400);
      }

      // Increment retry count
      await Settlement.updateOne(
        { id: settlementId },
        {
          status: 'pending',
          retry_count: (settlement.retry_count || 0) + 1
        },
        client
      );

      // Process settlement
      return await this.processSettlement(settlementId);
    });
  }
}