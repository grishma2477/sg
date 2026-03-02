


// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import Payment from "../../models/finance/payment/Payment.js";
// import PaymentMethod from "../../models/finance/payment_method/PaymentMethod.js";
// import PaymentProvider from "../../models/finance/payment_method/payment_provider/PaymentProvider.js";
// import { PaymentStrategyFactory } from "./payment/PaymentStrategyFactory.js";
// import { AppError } from "../../utils/AppError.js";

// export class PaymentService {

//   // ==========================================
//   // 1️⃣ AUTHORIZE PAYMENT (Before Ride Start)
//   // ==========================================
//   static async authorizePayment({
//     rideId,
//     userId,
//     amount,
//     paymentMethodId,
//     paymentSource,
//     idempotencyKey
//   }) {

//     if (!idempotencyKey) {
//       throw new AppError("IDEMPOTENCY_KEY_REQUIRED", 400);
//     }

//     return await withTransaction(async (client) => {

//       // 🔒 Idempotency Check
//       const existing = await Payment.findOne({
//         idempotency_key: idempotencyKey
//       }, client);

//       if (existing) {
//         return existing;
//       }

//       let provider = null;
//       let method = null;

//       // If wallet or gift — no payment method required
//       if (paymentSource === "gateway" || paymentSource === "card") {

//         method = await PaymentMethod.findOne({
//           id: paymentMethodId,
//           user_id: userId,
//           verification_status: "verified",
//           is_active: true,
//           is_deleted: false
//         }, client);

//         if (!method) {
//           throw new AppError("INVALID_PAYMENT_METHOD", 400);
//         }

//         provider = await PaymentProvider.findOne({
//           id: method.provider_id,
//           is_active: true
//         }, client);

//         if (!provider) {
//           throw new AppError("PROVIDER_NOT_AVAILABLE", 400);
//         }
//       }

//       // 🧠 Get Strategy
//       const strategy = PaymentStrategyFactory.getStrategy(paymentSource);

//       // 🏗 Create Payment Record (created state)
//       const payment = await Payment.create({
//         ride_id: rideId,
//         payer_id: userId,
//         amount_authorized: amount,
//         payment_source: paymentSource,
//         status: "created",
//         idempotency_key: idempotencyKey
//       }, client);

//       // 🔐 Authorize via Strategy
//       const authResult = await strategy.authorize({
//         userId,
//         amount,
//         provider,
//         paymentMethod: method,
//         rideId,
//         client
//       });

//       // Update payment to authorized
//       await Payment.updateOne(
//         { id: payment.id },
//         {
//           status: authResult.requiresAction ? "created" : "authorized",
//           authorized_at: new Date()
//         },
//         client
//       );

//       return {
//         paymentId: payment.id,
//         requiresAction: authResult.requiresAction || false,
//         redirectUrl: authResult.redirectUrl || null
//       };
//     });
//   }

//   // ==========================================
//   // 2️⃣ CAPTURE PAYMENT (After Ride Completion)
//   // ==========================================
//   static async capturePayment(rideId) {

//     return await withTransaction(async (client) => {

//       const payment = await Payment.findOne(
//         { ride_id: rideId },
//         client
//       );

//       if (!payment) {
//         throw new AppError("PAYMENT_NOT_FOUND", 404);
//       }

//       if (payment.status !== "authorized") {
//         throw new AppError("INVALID_PAYMENT_STATE", 400);
//       }

//       const strategy = PaymentStrategyFactory.getStrategy(
//         payment.payment_source
//       );

//       await strategy.capture({
//         userId: payment.payer_id,
//         amount: payment.amount_authorized,
//         client
//       });

//       await Payment.updateOne(
//         { id: payment.id },
//         {
//           status: "completed",
//           amount_captured: payment.amount_authorized,
//           completed_at: new Date()
//         },
//         client
//       );

//       return { status: "completed" };
//     });
//   }

//   // ==========================================
//   // 3️⃣ REFUND PAYMENT
//   // ==========================================
//   static async refundPayment(rideId) {

//     return await withTransaction(async (client) => {

//       const payment = await Payment.findOne(
//         { ride_id: rideId },
//         client
//       );

//       if (!payment) {
//         throw new AppError("PAYMENT_NOT_FOUND", 404);
//       }

//       if (payment.status !== "completed") {
//         throw new AppError("CANNOT_REFUND_UNCOMPLETED_PAYMENT", 400);
//       }

//       const strategy = PaymentStrategyFactory.getStrategy(
//         payment.payment_source
//       );

//       await strategy.refund({
//         userId: payment.payer_id,
//         amount: payment.amount_captured,
//         client
//       });

//       await Payment.updateOne(
//         { id: payment.id },
//         {
//           status: "refunded",
//           refunded_amount: payment.amount_captured
//         },
//         client
//       );

//       return { status: "refunded" };
//     });
//   }
// }



import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import Payment from "../../models/finance/payment/Payment.js";
import PaymentMethod from "../../models/finance/payment_method/PaymentMethod.js";
import PaymentProvider from "../../models/finance/payment_method/payment_provider/PaymentProvider.js";
import Wallet from "../../models/finance/transaction/wallet/Wallet.js";
import Transaction from "../../models/finance/transaction/Transaction.js";
import { FinancialPointsService } from "./FinancialPointsService.js";
import { AppError } from "../../utils/AppError.js";
import { v4 as uuidv4 } from "uuid";

export class PaymentService {

  // ==========================================================
  // AUTHORIZE PAYMENT
  // ==========================================================
  static async authorizePayment({
    rideId,
    payerId,
    payeeId,
    amount,
    paymentMethodId,
    paymentSource,
    idempotencyKey
  }) {

    if (!idempotencyKey) {
      throw new AppError("IDEMPOTENCY_KEY_REQUIRED", 400);
    }

    return await withTransaction(async (client) => {

      // Prevent duplicate authorization
      const existing = await Payment.findOne({ ride_id: rideId }, client);
      if (existing) {
        throw new AppError("PAYMENT_ALREADY_EXISTS", 409);
      }

      // ===============================
      // POINTS PAYMENT
      // ===============================
      if (paymentSource === "points") {

        const result = await FinancialPointsService.redeemPoints({
          userId: payerId,
          nprAmount: amount
        });

        const payment = await Payment.create({
          ride_id: rideId,
          payer_id: payerId,
          payee_id: payeeId,
          amount_authorized: amount,
          amount_captured: amount,
          currency: "NPR",
          payment_source: "points",
          status: "completed",
          authorized_at: new Date(),
          completed_at: new Date(),
          idempotency_key: idempotencyKey
        }, client);

        return payment;
      }

      // ===============================
      // WALLET PAYMENT
      // ===============================
      if (paymentSource === "wallet") {

        const wallet = await Wallet.findOneForUpdate(
          { user_id: payerId },
          client
        );

        if (!wallet) {
          throw new AppError("WALLET_NOT_FOUND", 404);
        }

        if (wallet.balance < amount) {
          throw new AppError("INSUFFICIENT_WALLET_BALANCE", 400);
        }

        await Wallet.updateOne(
          { user_id: payerId },
          { balance: wallet.balance - amount },
          client
        );

        await Transaction.create({
          user_id: payerId,
          type: "debit",
          category: "ride_payment",
          amount,
          currency: "NPR",
          status: "completed",
          ride_id: rideId,
          idempotency_key: uuidv4()
        }, client);

        const payment = await Payment.create({
          ride_id: rideId,
          payer_id: payerId,
          payee_id: payeeId,
          amount_authorized: amount,
          amount_captured: amount,
          currency: "NPR",
          payment_source: "wallet",
          status: "completed",
          authorized_at: new Date(),
          completed_at: new Date(),
          idempotency_key: idempotencyKey
        }, client);

        return payment;
      }

      // ===============================
      // GATEWAY PAYMENT
      // ===============================
      if (paymentSource === "gateway") {

        const method = await PaymentMethod.findOne({
          id: paymentMethodId,
          user_id: payerId,
          verification_status: "verified",
          is_active: true,
          is_deleted: false
        }, client);

        if (!method) {
          throw new AppError("INVALID_PAYMENT_METHOD", 400);
        }

        const provider = await PaymentProvider.findOne({
          id: method.provider_id,
          is_active: true
        }, client);

        if (!provider) {
          throw new AppError("PROVIDER_NOT_AVAILABLE", 400);
        }

        const payment = await Payment.create({
          ride_id: rideId,
          payer_id: payerId,
          payee_id: payeeId,
          amount_authorized: amount,
          currency: "NPR",
          payment_source: "gateway",
          provider_id: provider.id,
          status: "pending",
          idempotency_key: idempotencyKey,
          authorized_at: new Date()
        }, client);

        // TODO ! In future mixed payments need to be added

        return payment;
      }

      throw new AppError("UNSUPPORTED_PAYMENT_SOURCE", 400);
    });
  }
}