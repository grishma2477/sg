// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import RidePayment from "../../models/finance/ride_payment/RidePayment.js";
// import Settlement from "../../models/finance/settlement/Settlement.js";
// import { LedgerService } from "./LedgerService.js";
// import { AppError } from "../../utils/AppError.js";

// export class RidePaymentService {

//   // ==========================================================
//   // AUTHORIZE PAYMENT (USER → ESCROW)
//   // ==========================================================

//   static async authorizeRidePayment({
//     rideId,
//     riderId,
//     driverId,
//     amount,
//     platformFee,
//     paymentSource
//   }) {

//     return await withTransaction(async (client) => {

//       if (amount <= 0) {
//         throw new AppError("INVALID_AMOUNT", 400);
//       }

//       if (!["wallet", "gift", "bnpl", "gateway"].includes(paymentSource)) {
//         throw new AppError("INVALID_PAYMENT_SOURCE", 400);
//       }

//       // Prevent duplicate
//       const existing = await RidePayment.findOne(
//         { ride_id: rideId },
//         client
//       );

//       if (existing) {
//         throw new AppError("PAYMENT_ALREADY_EXISTS", 409);
//       }

//       // 1️⃣ Ledger authorization
//       const ledgerEntry = await LedgerService.authorizePayment({
//         userId: riderId,
//         amount,
//         rideId,
//         paymentSource
//       });

//       // 2️⃣ Create payment record

//       const payment = await RidePayment.create({
//         ride_id: rideId,
//         payer_id: riderId,
//         payee_id: driverId,

//         base_fare: amount,
//         platform_fee: platformFee,
//         tax_amount: 0,
//         discount_amount: 0,

//         total_amount: amount,

//         payment_method: paymentSource,
//         payment_status: "authorized",

//         authorization_ledger_entry: ledgerEntry?.id

//       }, client);

//       return payment;

//     });

//   }

//   // ==========================================================
//   // COMPLETE PAYMENT (ESCROW → DRIVER + PLATFORM)
//   // ==========================================================

//   static async completeRidePayment(rideId) {

//     return await withTransaction(async (client) => {

//       const payment = await RidePayment.findOne(
//         { ride_id: rideId },
//         client
//       );

//       if (!payment) {
//         throw new AppError("PAYMENT_NOT_FOUND", 404);
//       }

//       if (payment.payment_status !== "authorized") {
//         throw new AppError("INVALID_PAYMENT_STATE", 400);
//       }

//       const totalAmount = parseFloat(payment.total_amount);
//       const platformFee = parseFloat(payment.platform_fee);

//       const driverAmount = totalAmount - platformFee;

//       // 1️⃣ Ledger settlement

//       const settlement = await LedgerService.settlePayment({
//         rideId,
//         driverId: payment.payee_id,
//         totalAmount,
//         platformFee
//       });

//       // 2️⃣ Create settlement record (payout layer)

//       await Settlement.create({
//         payment_id: payment.id,
//         driver_id: payment.payee_id,
//         amount: driverAmount,
//         platform_commission: platformFee,
//         status: "pending"
//       }, client);

//       // 3️⃣ Update payment state

//       await RidePayment.updateOne(
//         { ride_id: rideId },
//         {
//           payment_status: "settled",
//           payment_completed_at: new Date()
//         },
//         client
//       );

//       return {
//         message: "PAYMENT_SETTLED",
//         driverAmount,
//         platformFee
//       };

//     });

//   }

//   // ==========================================================
//   // CANCEL PAYMENT (ESCROW → RIDER)
//   // ==========================================================

//   static async cancelRidePayment(
//     rideId,
//     reason = "Ride cancelled"
//   ) {

//     return await withTransaction(async (client) => {

//       const payment = await RidePayment.findOne(
//         { ride_id: rideId },
//         client
//       );

//       if (!payment) {
//         throw new AppError("PAYMENT_NOT_FOUND", 404);
//       }

//       if (payment.payment_status !== "authorized") {
//         throw new AppError("CANNOT_CANCEL_COMPLETED_PAYMENT", 400);
//       }

//       const totalAmount = parseFloat(payment.total_amount);

//       // 1️⃣ Refund ledger

//       const refundEntry = await LedgerService.refundPayment({
//         userId: payment.payer_id,
//         amount: totalAmount,
//         rideId,
//         paymentSource: payment.payment_method
//       });

//       // 2️⃣ Update payment state

//       await RidePayment.updateOne(
//         { ride_id: rideId },
//         {
//           payment_status: "refunded",
//           refund_ledger_entry: refundEntry?.id
//         },
//         client
//       );

//       return {
//         message: "PAYMENT_REFUNDED"
//       };

//     });

//   }

// }




import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import RidePayment from "../../models/finance/ride_payment/RidePayment.js";
import Settlement from "../../models/finance/settlement/Settlement.js";
import { LedgerService } from "./LedgerService.js";
import { AppError } from "../../utils/AppError.js";

export class RidePaymentService {

  // ==========================================================
  // AUTHORIZE PAYMENT (USER → ESCROW)
  // ==========================================================

  static async authorizeRidePayment({
    rideId,
    riderId,
    driverId,
    amount,
    platformFee,
    paymentSource
  }) {

    return await withTransaction(async (client) => {

      if (!rideId) throw new AppError("RIDE_ID_REQUIRED", 400);

      if (amount <= 0) {
        throw new AppError("INVALID_AMOUNT", 400);
      }

      if (!["wallet", "gift", "bnpl", "gateway"].includes(paymentSource)) {
        throw new AppError("INVALID_PAYMENT_SOURCE", 400);
      }

      // 🔒 Lock payment row (prevents duplicate authorization)
      const existing = await RidePayment.findOne(
        { ride_id: rideId },
        client
      );

      if (existing) {
        if (existing.payment_status === "authorized") {
          throw new AppError("PAYMENT_ALREADY_AUTHORIZED", 409);
        }

        if (existing.payment_status === "settled") {
          throw new AppError("PAYMENT_ALREADY_SETTLED", 409);
        }
      }

      // 1️⃣ Ledger authorization (User → Escrow)

      const ledgerEntry = await LedgerService.authorizePayment({
        userId: riderId,
        amount,
        rideId,
        paymentSource,
        client
      });

      // 2️⃣ Create payment record

      const payment = await RidePayment.create({
        ride_id: rideId,
        payer_id: riderId,
        payee_id: driverId,

        base_fare: amount,
        platform_fee: platformFee,
        tax_amount: 0,
        discount_amount: 0,

        total_amount: amount,

        payment_method: paymentSource,
        payment_status: "authorized",

        authorization_ledger_entry: ledgerEntry?.id

      }, client);

      return payment;

    });

  }


  // ==========================================================
  // COMPLETE PAYMENT (ESCROW → DRIVER + PLATFORM)
  // ==========================================================

  static async completeRidePayment(rideId) {

    return await withTransaction(async (client) => {

      const payment = await RidePayment.findOne(
        { ride_id: rideId },
        client
      );

      if (!payment) {
        throw new AppError("PAYMENT_NOT_FOUND", 404);
      }

      if (payment.payment_status === "settled") {
        throw new AppError("PAYMENT_ALREADY_SETTLED", 409);
      }

      if (payment.payment_status !== "authorized") {
        throw new AppError("INVALID_PAYMENT_STATE", 400);
      }

      const totalAmount = parseFloat(payment.total_amount);
      const platformFee = parseFloat(payment.platform_fee);
      const driverAmount = totalAmount - platformFee;

      // 1️⃣ Ledger settlement (Escrow → Driver + Platform)

      const ledgerSettlement = await LedgerService.settlePayment({
        rideId,
        driverId: payment.payee_id,
        totalAmount,
        platformFee,
        client
      });

      // 2️⃣ Create settlement record (payout layer)

      await Settlement.create({
        payment_id: payment.id,
        driver_id: payment.payee_id,
        amount: driverAmount,
        platform_commission: platformFee,
        status: "pending"
      }, client);

      // 3️⃣ Update payment state

      await RidePayment.updateOne(
        { ride_id: rideId },
        {
          payment_status: "settled",
          payment_completed_at: new Date(),
          settlement_ledger_entry: ledgerSettlement?.id
        },
        client
      );

      return {
        message: "PAYMENT_SETTLED",
        driverAmount,
        platformFee
      };

    });

  }


  // ==========================================================
  // CANCEL PAYMENT (ESCROW → RIDER)
  // ==========================================================

  static async cancelRidePayment(
    rideId,
    reason = "Ride cancelled"
  ) {

    return await withTransaction(async (client) => {

      const payment = await RidePayment.findOne(
        { ride_id: rideId },
        client
      );

      if (!payment) {
        throw new AppError("PAYMENT_NOT_FOUND", 404);
      }

      if (payment.payment_status === "settled") {
        throw new AppError("CANNOT_REFUND_SETTLED_PAYMENT", 400);
      }

      if (payment.payment_status !== "authorized") {
        throw new AppError("INVALID_PAYMENT_STATE", 400);
      }

      const totalAmount = parseFloat(payment.total_amount);

      // 1️⃣ Refund ledger (Escrow → Rider)

      const refundEntry = await LedgerService.refundPayment({
        userId: payment.payer_id,
        amount: totalAmount,
        rideId,
        paymentSource: payment.payment_method,
        client
      });

      // 2️⃣ Update payment state

      await RidePayment.updateOne(
        { ride_id: rideId },
        {
          payment_status: "refunded",
          refund_ledger_entry: refundEntry?.id,
          refund_reason: reason,
          refunded_at: new Date()
        },
        client
      );

      return {
        message: "PAYMENT_REFUNDED"
      };

    });

  }

}