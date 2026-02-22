import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import PayoutRequest from "../../models/finance/payout/PayoutRequest.js";
import PayoutBatch from "../../models/finance/payout/PayoutBatch.js";
import PayoutAttempt from "../../models/finance/payout/PayoutAttempt.js";
import { LedgerService } from "./LedgerService.js";
import { AppError } from "../../utils/AppError.js";

export class PayoutService {

  // ═══════════════════════════════════════════════════════════
  // CREATE PAYOUT REQUEST
  // ═══════════════════════════════════════════════════════════

  static async requestPayout({
    driverId,
    amount,
    payoutMethodId
  }) {
    try {
      // Verify driver has sufficient balance
      const walletBalance = await LedgerService.getUserWalletBalance(driverId, 'driver');
      
      if (walletBalance.balance < amount) {
        throw new AppError('INSUFFICIENT_PAYOUT_BALANCE', 400, {
          available: walletBalance.balance,
          required: amount
        });
      }

      const request = await PayoutRequest.create({
        driver_id: driverId,
        amount: amount.toFixed(2),
        payout_method_id: payoutMethodId,
        status: 'pending'
      });

      console.log(`💸 Payout requested: ${request.id} - ₹${amount}`);

      return request;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error creating payout request:', error);
      throw new AppError('CREATE_PAYOUT_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN: APPROVE PAYOUT REQUEST
  // ═══════════════════════════════════════════════════════════

  static async approvePayoutRequest(requestId, adminId, notes = null) {
    try {
      const request = await PayoutRequest.findById(requestId);
      if (!request) {
        throw new AppError('PAYOUT_REQUEST_NOT_FOUND', 404);
      }

      if (request.status !== 'pending') {
        throw new AppError('PAYOUT_ALREADY_PROCESSED', 400);
      }

      await PayoutRequest.updateOne(
        { id: requestId },
        {
          status: 'approved',
          reviewed_by: adminId,
          review_notes: notes,
          approved_at: new Date()
        }
      );

      console.log(`✅ Payout approved: ${requestId}`);

      return await PayoutRequest.findById(requestId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error approving payout:', error);
      throw new AppError('APPROVE_PAYOUT_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN: REJECT PAYOUT REQUEST
  // ═══════════════════════════════════════════════════════════

  static async rejectPayoutRequest(requestId, adminId, reason) {
    try {
      const request = await PayoutRequest.findById(requestId);
      if (!request) {
        throw new AppError('PAYOUT_REQUEST_NOT_FOUND', 404);
      }

      if (request.status !== 'pending') {
        throw new AppError('PAYOUT_ALREADY_PROCESSED', 400);
      }

      await PayoutRequest.updateOne(
        { id: requestId },
        {
          status: 'rejected',
          reviewed_by: adminId,
          review_notes: reason
        }
      );

      console.log(`❌ Payout rejected: ${requestId}`);

      return await PayoutRequest.findById(requestId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error rejecting payout:', error);
      throw new AppError('REJECT_PAYOUT_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN: CREATE PAYOUT BATCH
  // ═══════════════════════════════════════════════════════════

  static async createPayoutBatch(adminId, requestIds, notes = null) {
    return await withTransaction(async (client) => {
      const requests = await Promise.all(
        requestIds.map(id => PayoutRequest.findById(id, client))
      );

      // Validate all requests
      for (const request of requests) {
        if (!request) {
          throw new AppError('PAYOUT_REQUEST_NOT_FOUND', 404);
        }
        if (request.status !== 'approved') {
          throw new AppError('PAYOUT_NOT_APPROVED', 400, { id: request.id });
        }
      }

      const totalAmount = requests.reduce((sum, r) => sum + parseFloat(r.amount), 0);

      // Create batch
      const batch = await PayoutBatch.create({
        total_amount: totalAmount.toFixed(2),
        request_count: requests.length,
        created_by: adminId,
        status: 'created',
        notes
      }, client);

      // Update requests to processing
      for (const request of requests) {
        await PayoutRequest.updateOne(
          { id: request.id },
          { status: 'processing' },
          client
        );

        // Process via ledger
        await LedgerService.processPayout({
          driverId: request.driver_id,
          amount: parseFloat(request.amount),
          payoutRequestId: request.id
        });
      }

      // Mark batch as processing
      await PayoutBatch.updateOne(
        { id: batch.id },
        { status: 'processing' },
        client
      );

      console.log(`📦 Payout batch created: ${batch.id} - ${requests.length} requests`);

      return batch;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PROCESS PAYOUT ATTEMPT
  // ═══════════════════════════════════════════════════════════

  static async processPayoutAttempt({
    payoutRequestId,
    batchId,
    bankReference,
    success,
    failureReason = null
  }) {
    return await withTransaction(async (client) => {
      const request = await PayoutRequest.findById(payoutRequestId, client);
      if (!request) {
        throw new AppError('PAYOUT_REQUEST_NOT_FOUND', 404);
      }

      const attempt = await PayoutAttempt.create({
        payout_request_id: payoutRequestId,
        batch_id: batchId,
        bank_reference: bankReference,
        status: success ? 'success' : 'failed',
        failure_reason: failureReason
      }, client);

      if (success) {
        await PayoutRequest.updateOne(
          { id: payoutRequestId },
          {
            status: 'completed',
            completed_at: new Date()
          },
          client
        );

        console.log(`✅ Payout completed: ${payoutRequestId}`);
      } else {
        // TODO: Reverse ledger entry
        // This would require implementing reversal logic in LedgerService
        
        await PayoutRequest.updateOne(
          { id: payoutRequestId },
          {
            status: 'failed',
            failure_reason: failureReason,
            retry_count: request.retry_count + 1,
            next_retry_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
          },
          client
        );

        console.log(`❌ Payout failed: ${payoutRequestId} - ${failureReason}`);
      }

      return attempt;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET DRIVER PAYOUT HISTORY
  // ═══════════════════════════════════════════════════════════

  static async getDriverPayoutHistory(driverId, limit = 50) {
    try {
      const requests = await PayoutRequest.find({ driver_id: driverId });
      return requests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting payout history:', error);
      throw new AppError('GET_HISTORY_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET PENDING PAYOUTS (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async getPendingPayouts() {
    try {
      return await PayoutRequest.find({ status: 'pending' });
    } catch (error) {
      console.error('Error getting pending payouts:', error);
      throw new AppError('GET_PAYOUTS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET APPROVED PAYOUTS (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async getApprovedPayouts() {
    try {
      return await PayoutRequest.find({ status: 'approved' });
    } catch (error) {
      console.error('Error getting approved payouts:', error);
      throw new AppError('GET_PAYOUTS_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET PAYOUT BATCHES (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async getPayoutBatches(limit = 50) {
    try {
      const batches = await PayoutBatch.findAll();
      return batches
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting payout batches:', error);
      throw new AppError('GET_BATCHES_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET BATCH DETAILS (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async getBatchDetails(batchId) {
    try {
      const batch = await PayoutBatch.findById(batchId);
      if (!batch) {
        throw new AppError('BATCH_NOT_FOUND', 404);
      }

      const attempts = await PayoutAttempt.find({ batch_id: batchId });

      return {
        batch,
        attempts
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting batch details:', error);
      throw new AppError('GET_BATCH_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RETRY FAILED PAYOUT
  // ═══════════════════════════════════════════════════════════

  static async retryFailedPayout(requestId) {
    return await withTransaction(async (client) => {
      const request = await PayoutRequest.findById(requestId, client);
      if (!request) {
        throw new AppError('PAYOUT_REQUEST_NOT_FOUND', 404);
      }

      if (request.status !== 'failed') {
        throw new AppError('PAYOUT_NOT_FAILED', 400);
      }

      // Reset status to processing
      await PayoutRequest.updateOne(
        { id: requestId },
        {
          status: 'processing',
          next_retry_at: null
        },
        client
      );

      console.log(`🔄 Retrying payout: ${requestId}`);

      return await PayoutRequest.findById(requestId, client);
    });
  }
}