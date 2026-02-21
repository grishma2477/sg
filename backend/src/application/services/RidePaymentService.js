// import { pool } from "../../database/DBConnection.js";
// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import RidePayment from "../../models/finance/ride_payment/RidePayment.js";
// import Transaction from "../../models/finance/transaction/Transaction.js";
// import Wallet from "../../models/finance/transaction/wallet/Wallet.js";
// import { PaymentHoldService } from "./PaymentHoldService.js";
// import { AppError } from "../../utils/AppError.js";
// import { v4 as uuidv4 } from 'uuid';

// export class RidePaymentService {

//   // ═══════════════════════════════════════════════════════════
//   // INITIATE RIDE PAYMENT (When Bid is Accepted)
//   // ═══════════════════════════════════════════════════════════

//   static async initiateRidePayment({
//     rideId,
//     riderId,
//     driverId,
//     baseFare,
//     paymentMethod,
//     platformFee = 0,
//     promoCodeId = null,
//     giftCardId = null,
//     discountAmount = 0
//   }) {
//     const totalAmount = baseFare + platformFee - discountAmount;

//     if (totalAmount <= 0) {
//       throw new AppError('INVALID_PAYMENT_AMOUNT', 400, { totalAmount });
//     }

//     return await withTransaction(async (client) => {
//       const existing = await RidePayment.findOne({ ride_id: rideId }, client);
//       if (existing) {
//         throw new AppError('PAYMENT_ALREADY_EXISTS', 409, { rideId });
//       }

//       let paymentHoldId = null;
//       let paymentStatus = 'pending';

//       if (paymentMethod === 'wallet' || paymentMethod === 'mixed') {
//         try {
//           const hold = await PaymentHoldService.createHold({
//             userId: riderId,
//             rideId,
//             amount: totalAmount,
//             reason: 'ride_payment',
//             description: `Payment hold for ride ${rideId}`
//           });

//           paymentHoldId = hold.id;
//           paymentStatus = 'authorized';
          
//           console.log(`✅ Payment hold created for ride ${rideId}`);
//         } catch (error) {
//           if (error.code === 'INSUFFICIENT_FUNDS_FOR_HOLD') {
//             throw new AppError('INSUFFICIENT_WALLET_BALANCE', 400, {
//               required: totalAmount,
//               message: 'Please top up your wallet or choose a different payment method'
//             });
//           }
//           throw error;
//         }
//       }

//       const ridePayment = await RidePayment.create({
//         ride_id: rideId,
//         payer_id: riderId,
//         payee_id: driverId,
//         base_fare: baseFare.toFixed(2),
//         platform_fee: platformFee.toFixed(2),
//         discount_amount: discountAmount.toFixed(2),
//         total_amount: totalAmount.toFixed(2),
//         promo_code_id: promoCodeId,
//         gift_card_id: giftCardId,
//         payment_method: paymentMethod,
//         payment_status: paymentStatus,
//         payment_hold_id: paymentHoldId
//       }, client);

//       console.log(`💳 Ride payment initiated: ${rideId} - ₹${totalAmount} (${paymentMethod})`);

//       return ridePayment;
//     });
//   }

//   // ═══════════════════════════════════════════════════════════
//   // COMPLETE RIDE PAYMENT (When Ride is Completed)
//   // ═══════════════════════════════════════════════════════════

//   static async completeRidePayment(rideId) {
//     return await withTransaction(async (client) => {
//       const ridePayment = await RidePayment.findOne({ ride_id: rideId }, client);
//       if (!ridePayment) {
//         throw new AppError('PAYMENT_NOT_FOUND', 404, { rideId });
//       }

//       if (ridePayment.payment_status === 'completed') {
//         throw new AppError('PAYMENT_ALREADY_COMPLETED', 409, { rideId });
//       }

//       let transaction = null;

//       if (ridePayment.payment_method === 'wallet') {
//         if (!ridePayment.payment_hold_id) {
//           throw new AppError('PAYMENT_HOLD_NOT_FOUND', 404, { rideId });
//         }

//         await PaymentHoldService.captureHold(
//           ridePayment.payment_hold_id,
//           parseFloat(ridePayment.total_amount)
//         );

//         const riderWallet = await Wallet.findOne({ user_id: ridePayment.payer_id }, client);

//         transaction = await Transaction.create({
//           user_id: ridePayment.payer_id,
//           related_user_id: ridePayment.payee_id,
//           type: 'debit',
//           category: 'ride_payment',
//           amount: ridePayment.total_amount,
//           currency: 'NPR',
//           balance_before: (parseFloat(riderWallet.balance) + parseFloat(ridePayment.total_amount)).toFixed(2),
//           balance_after: riderWallet.balance,
//           status: 'completed',
//           ride_id: rideId,
//           payment_method: 'wallet',
//           description: `Payment for ride ${rideId}`,
//           idempotency_key: uuidv4()
//         }, client);

//         const driverPayout = parseFloat(ridePayment.total_amount) - parseFloat(ridePayment.platform_fee);
//         const driverWallet = await Wallet.findOne({ user_id: ridePayment.payee_id }, client);
//         const newDriverBalance = parseFloat(driverWallet.balance) + driverPayout;
        
//         await Wallet.updateOne(
//           { user_id: ridePayment.payee_id },
//           { balance: newDriverBalance.toFixed(2) },
//           client
//         );

//         await Transaction.create({
//           user_id: ridePayment.payee_id,
//           related_user_id: ridePayment.payer_id,
//           type: 'credit',
//           category: 'ride_payment',
//           amount: driverPayout.toFixed(2),
//           currency: 'NPR',
//           balance_before: driverWallet.balance,
//           balance_after: newDriverBalance.toFixed(2),
//           status: 'completed',
//           ride_id: rideId,
//           reference_id: transaction.id,
//           payment_method: 'wallet',
//           description: `Payout for ride ${rideId}`,
//           idempotency_key: uuidv4()
//         }, client);

//         console.log(`✅ Wallet payment completed: Rider -₹${ridePayment.total_amount}, Driver +₹${driverPayout}`);
//       }

//       else if (ridePayment.payment_method === 'cash') {
//         transaction = await Transaction.create({
//           user_id: ridePayment.payer_id,
//           related_user_id: ridePayment.payee_id,
//           type: 'debit',
//           category: 'ride_payment',
//           amount: ridePayment.total_amount,
//           currency: 'NPR',
//           status: 'completed',
//           ride_id: rideId,
//           payment_method: 'cash',
//           description: `Cash payment for ride ${rideId}`,
//           idempotency_key: uuidv4()
//         }, client);

//         console.log(`✅ Cash payment recorded: ₹${ridePayment.total_amount}`);
//       }

//       await RidePayment.updateOne(
//         { ride_id: rideId },
//         { 
//           payment_status: 'completed',
//           payment_completed_at: new Date(),
//           transaction_id: transaction.id
//         },
//         client
//       );

//       console.log(`💰 Ride payment completed: ${rideId}`);

//       return {
//         ridePayment: await RidePayment.findOne({ ride_id: rideId }, client),
//         transaction
//       };
//     });
//   }

//   // ═══════════════════════════════════════════════════════════
//   // CANCEL RIDE PAYMENT (When Ride is Cancelled)
//   // ═══════════════════════════════════════════════════════════

//   static async cancelRidePayment(rideId, refundReason = 'Ride cancelled') {
//     return await withTransaction(async (client) => {
//       const ridePayment = await RidePayment.findOne({ ride_id: rideId }, client);
//       if (!ridePayment) {
//         throw new AppError('PAYMENT_NOT_FOUND', 404, { rideId });
//       }

//       if (ridePayment.payment_hold_id) {
//         await PaymentHoldService.releaseHold(ridePayment.payment_hold_id);
//         console.log(`🔓 Payment hold released for cancelled ride ${rideId}`);
//       }

//       if (ridePayment.payment_status === 'completed' && ridePayment.payment_method === 'wallet') {
//         const riderWallet = await Wallet.findOne({ user_id: ridePayment.payer_id }, client);
//         const newBalance = parseFloat(riderWallet.balance) + parseFloat(ridePayment.total_amount);
        
//         await Wallet.updateOne(
//           { user_id: ridePayment.payer_id },
//           { balance: newBalance.toFixed(2) },
//           client
//         );

//         await Transaction.create({
//           user_id: ridePayment.payer_id,
//           type: 'credit',
//           category: 'ride_refund',
//           amount: ridePayment.total_amount,
//           currency: 'NPR',
//           balance_before: riderWallet.balance,
//           balance_after: newBalance.toFixed(2),
//           status: 'completed',
//           ride_id: rideId,
//           reference_id: ridePayment.transaction_id,
//           description: refundReason,
//           idempotency_key: uuidv4()
//         }, client);

//         console.log(`💸 Refund processed: ₹${ridePayment.total_amount} to rider`);
//       }

//       await RidePayment.updateOne(
//         { ride_id: rideId },
//         { payment_status: 'refunded' },
//         client
//       );

//       console.log(`❌ Ride payment cancelled: ${rideId}`);

//       return await RidePayment.findOne({ ride_id: rideId }, client);
//     });
//   }

//   // ═══════════════════════════════════════════════════════════
//   // GET PAYMENT DETAILS
//   // ═══════════════════════════════════════════════════════════

//   static async getPaymentDetails(rideId) {
//     try {
//       const payment = await RidePayment.findOne({ ride_id: rideId });
//       if (!payment) {
//         throw new AppError('PAYMENT_NOT_FOUND', 404, { rideId });
//       }

//       const transactions = await Transaction.find({ ride_id: rideId });

//       return {
//         payment,
//         transactions
//       };
//     } catch (error) {
//       if (error instanceof AppError) throw error;
//       console.error('Error fetching payment details:', error);
//       throw new AppError('FETCH_PAYMENT_ERROR', 500, { rideId });
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   // GET USER PAYMENT HISTORY
//   // ═══════════════════════════════════════════════════════════

//   static async getUserPaymentHistory(userId, role, filters = {}) {
//     try {
//       const column = role === 'rider' ? 'payer_id' : 'payee_id';
//       const payments = await RidePayment.find({ [column]: userId });

//       let filtered = payments;
//       if (filters.status) {
//         filtered = filtered.filter(p => p.payment_status === filters.status);
//       }
//       if (filters.method) {
//         filtered = filtered.filter(p => p.payment_method === filters.method);
//       }

//       return filtered
//         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//         .slice(0, filters.limit || 50);
        
//     } catch (error) {
//       console.error('Error fetching payment history:', error);
//       throw new AppError('FETCH_HISTORY_ERROR', 500, { userId });
//     }
//   }
// }



import { pool } from "../../database/DBConnection.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import RidePayment from "../../models/finance/ride_payment/RidePayment.js";
import Transaction from "../../models/finance/transaction/Transaction.js";
import Wallet from "../../models/finance/transaction/wallet/Wallet.js";
import { PaymentHoldService } from "./PaymentHoldService.js";
import { PromoCodeService } from "./PromoCodeService.js";
import { GiftCardService } from "./GiftCardService.js";
import { AppError } from "../../utils/AppError.js";
import { v4 as uuidv4 } from 'uuid';

export class RidePaymentService {

  // ═══════════════════════════════════════════════════════════
  // INITIATE RIDE PAYMENT (WITH PROMO & GIFT CARD SUPPORT)
  // ═══════════════════════════════════════════════════════════

  static async initiateRidePayment({
    rideId,
    riderId,
    driverId,
    baseFare,
    paymentMethod,
    platformFee = 0,
    promoCode = null,
    giftCardCode = null
  }) {
    return await withTransaction(async (client) => {
      let totalAmount = baseFare + platformFee;
      let discountAmount = 0;
      let promoCodeId = null;
      let giftCardId = null;

      // Apply promo code if provided
      if (promoCode) {
        try {
          const promoResult = await PromoCodeService.applyPromoCode({
            code: promoCode,
            userId: riderId,
            rideId,
            originalAmount: totalAmount
          });

          discountAmount = promoResult.discountAmount;
          totalAmount = promoResult.finalAmount;
          promoCodeId = promoResult.redemption.promo_code_id;

          console.log(`✅ Promo applied: ${promoCode} - ₹${discountAmount} discount`);
        } catch (error) {
          console.error(`❌ Promo code failed: ${error.message}`);
        }
      }

      // Use gift card if provided
      if (giftCardCode && totalAmount > 0) {
        try {
          const giftCardResult = await GiftCardService.useForRidePayment({
            code: giftCardCode,
            userId: riderId,
            rideId,
            amount: Math.min(totalAmount, 5000)
          });

          const giftCardAmount = parseFloat(giftCardResult.redemption.amount_used);
          discountAmount += giftCardAmount;
          totalAmount = Math.max(0, totalAmount - giftCardAmount);
          giftCardId = giftCardResult.redemption.gift_card_id;

          console.log(`✅ Gift card applied: ${giftCardCode} - ₹${giftCardAmount}`);
        } catch (error) {
          console.error(`❌ Gift card failed: ${error.message}`);
        }
      }

      let paymentHoldId = null;
      let paymentStatus = 'pending';

      if (totalAmount > 0 && (paymentMethod === 'wallet' || paymentMethod === 'mixed')) {
        try {
          const hold = await PaymentHoldService.createHold({
            userId: riderId,
            rideId,
            amount: totalAmount,
            reason: 'ride_payment',
            description: `Payment hold for ride ${rideId}`
          });

          paymentHoldId = hold.id;
          paymentStatus = 'authorized';
        } catch (error) {
          if (error.code === 'INSUFFICIENT_FUNDS_FOR_HOLD') {
            throw new AppError('INSUFFICIENT_WALLET_BALANCE', 400, {
              required: totalAmount,
              message: 'Please top up your wallet'
            });
          }
          throw error;
        }
      }

      const ridePayment = await RidePayment.create({
        ride_id: rideId,
        payer_id: riderId,
        payee_id: driverId,
        base_fare: baseFare.toFixed(2),
        platform_fee: platformFee.toFixed(2),
        discount_amount: discountAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        promo_code_id: promoCodeId,
        gift_card_id: giftCardId,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        payment_hold_id: paymentHoldId
      }, client);

      console.log(`💳 Ride payment initiated: ${rideId} - ₹${totalAmount} (after ₹${discountAmount} discount)`);

      return ridePayment;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // COMPLETE RIDE PAYMENT
  // ═══════════════════════════════════════════════════════════

  static async completeRidePayment(rideId) {
    return await withTransaction(async (client) => {
      const ridePayment = await RidePayment.findOne({ ride_id: rideId }, client);
      if (!ridePayment) {
        throw new AppError('PAYMENT_NOT_FOUND', 404, { rideId });
      }

      if (ridePayment.payment_status === 'completed') {
        throw new AppError('PAYMENT_ALREADY_COMPLETED', 409, { rideId });
      }

      let transaction = null;

      if (ridePayment.payment_method === 'wallet' && parseFloat(ridePayment.total_amount) > 0) {
        if (!ridePayment.payment_hold_id) {
          throw new AppError('PAYMENT_HOLD_NOT_FOUND', 404, { rideId });
        }

        await PaymentHoldService.captureHold(
          ridePayment.payment_hold_id,
          parseFloat(ridePayment.total_amount)
        );

        const riderWallet = await Wallet.findOne({ user_id: ridePayment.payer_id }, client);

        transaction = await Transaction.create({
          user_id: ridePayment.payer_id,
          related_user_id: ridePayment.payee_id,
          type: 'debit',
          category: 'ride_payment',
          amount: ridePayment.total_amount,
          currency: 'NPR',
          balance_before: (parseFloat(riderWallet.balance) + parseFloat(ridePayment.total_amount)).toFixed(2),
          balance_after: riderWallet.balance,
          status: 'completed',
          ride_id: rideId,
          payment_method: 'wallet',
          description: `Payment for ride ${rideId}`,
          idempotency_key: uuidv4()
        }, client);

        const driverPayout = parseFloat(ridePayment.total_amount) - parseFloat(ridePayment.platform_fee);
        const driverWallet = await Wallet.findOne({ user_id: ridePayment.payee_id }, client);
        const newDriverBalance = parseFloat(driverWallet.balance) + driverPayout;
        
        await Wallet.updateOne(
          { user_id: ridePayment.payee_id },
          { balance: newDriverBalance.toFixed(2) },
          client
        );

        await Transaction.create({
          user_id: ridePayment.payee_id,
          related_user_id: ridePayment.payer_id,
          type: 'credit',
          category: 'ride_payment',
          amount: driverPayout.toFixed(2),
          currency: 'NPR',
          balance_before: driverWallet.balance,
          balance_after: newDriverBalance.toFixed(2),
          status: 'completed',
          ride_id: rideId,
          reference_id: transaction.id,
          payment_method: 'wallet',
          description: `Payout for ride ${rideId}`,
          idempotency_key: uuidv4()
        }, client);
      }

      else if (ridePayment.payment_method === 'cash') {
        transaction = await Transaction.create({
          user_id: ridePayment.payer_id,
          related_user_id: ridePayment.payee_id,
          type: 'debit',
          category: 'ride_payment',
          amount: ridePayment.total_amount,
          currency: 'NPR',
          status: 'completed',
          ride_id: rideId,
          payment_method: 'cash',
          description: `Cash payment for ride ${rideId}`,
          idempotency_key: uuidv4()
        }, client);
      }

      // Mark promo as used
      if (ridePayment.promo_code_id) {
        await PromoCodeService.markPromoAsUsed(rideId);
      }

      await RidePayment.updateOne(
        { ride_id: rideId },
        { 
          payment_status: 'completed',
          payment_completed_at: new Date(),
          transaction_id: transaction ? transaction.id : null
        },
        client
      );

      console.log(`💰 Ride payment completed: ${rideId}`);

      return {
        ridePayment: await RidePayment.findOne({ ride_id: rideId }, client),
        transaction
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CANCEL RIDE PAYMENT
  // ═══════════════════════════════════════════════════════════

  static async cancelRidePayment(rideId, refundReason = 'Ride cancelled') {
    return await withTransaction(async (client) => {
      const ridePayment = await RidePayment.findOne({ ride_id: rideId }, client);
      if (!ridePayment) {
        throw new AppError('PAYMENT_NOT_FOUND', 404, { rideId });
      }

      if (ridePayment.payment_hold_id) {
        await PaymentHoldService.releaseHold(ridePayment.payment_hold_id);
      }

      if (ridePayment.promo_code_id) {
        await PromoCodeService.refundPromo(rideId);
      }

      if (ridePayment.payment_status === 'completed' && ridePayment.payment_method === 'wallet') {
        const riderWallet = await Wallet.findOne({ user_id: ridePayment.payer_id }, client);
        const newBalance = parseFloat(riderWallet.balance) + parseFloat(ridePayment.total_amount);
        
        await Wallet.updateOne(
          { user_id: ridePayment.payer_id },
          { balance: newBalance.toFixed(2) },
          client
        );

        await Transaction.create({
          user_id: ridePayment.payer_id,
          type: 'credit',
          category: 'ride_refund',
          amount: ridePayment.total_amount,
          currency: 'NPR',
          balance_before: riderWallet.balance,
          balance_after: newBalance.toFixed(2),
          status: 'completed',
          ride_id: rideId,
          reference_id: ridePayment.transaction_id,
          description: refundReason,
          idempotency_key: uuidv4()
        }, client);
      }

      await RidePayment.updateOne(
        { ride_id: rideId },
        { payment_status: 'refunded' },
        client
      );

      console.log(`❌ Ride payment cancelled: ${rideId}`);

      return await RidePayment.findOne({ ride_id: rideId }, client);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET PAYMENT DETAILS
  // ═══════════════════════════════════════════════════════════

  static async getPaymentDetails(rideId) {
    try {
      const payment = await RidePayment.findOne({ ride_id: rideId });
      if (!payment) {
        throw new AppError('PAYMENT_NOT_FOUND', 404, { rideId });
      }

      const transactions = await Transaction.find({ ride_id: rideId });

      return {
        payment,
        transactions
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching payment details:', error);
      throw new AppError('FETCH_PAYMENT_ERROR', 500, { rideId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET USER PAYMENT HISTORY
  // ═══════════════════════════════════════════════════════════

  static async getUserPaymentHistory(userId, role, filters = {}) {
    try {
      const column = role === 'rider' ? 'payer_id' : 'payee_id';
      const payments = await RidePayment.find({ [column]: userId });

      let filtered = payments;
      if (filters.status) {
        filtered = filtered.filter(p => p.payment_status === filters.status);
      }
      if (filters.method) {
        filtered = filtered.filter(p => p.payment_method === filters.method);
      }

      return filtered
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, filters.limit || 50);
        
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new AppError('FETCH_HISTORY_ERROR', 500, { userId });
    }
  }
}