// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import RideModel from "../../models/ride/Ride.js";
// import DriverModel from "../../models/driver/Driver.js";
// import RidePayment from "../../models/finance/ride_payment/RidePayment.js";
// import { LedgerService } from "./LedgerService.js";
// import { AppError } from "../../utils/AppError.js";
// import { notifyRideStatusChange } from "../../realtime/socketServer.js";

// export class RideStartService {

//   async startRide({ rideId }) {

//     const result = await withTransaction(async (client) => {

//       const ride = await RideModel.findById(rideId, client);
//       if (!ride) {
//         throw new AppError("RIDE_NOT_FOUND", 404);
//       }

//       if (ride.status !== "accepted") {
//         throw new AppError("RIDE_NOT_READY_TO_START", 400, {
//           currentStatus: ride.status
//         });
//       }

//       const driver = await DriverModel.findById(ride.driver_id, client);
//       if (!driver) {
//         throw new AppError("DRIVER_NOT_FOUND", 404);
//       }

//       const payment = await RidePayment.findOne(
//         { ride_id: rideId },
//         client
//       );

//       if (!payment) {
//         throw new AppError("RIDE_PAYMENT_NOT_INITIALIZED", 400);
//       }

//       if (payment.payment_status !== "pending") {
//         throw new AppError("PAYMENT_ALREADY_PROCESSED", 400);
//       }

//       // 1️⃣ AUTHORIZE FUNDS (Ledger Escrow)
//       if (payment.payment_method !== "cash") {
//         await LedgerService.authorizePayment({
//           userId: ride.rider_id,
//           amount: parseFloat(payment.total_amount),
//           rideId,
//           paymentSource: payment.payment_method
//         });

//         await RidePayment.updateOne(
//           { id: payment.id },
//           {
//             payment_status: "authorized"
//           },
//           client
//         );
//       }

//       // 2️⃣ UPDATE RIDE STATUS
//       const updatedRide = await RideModel.findByIdAndUpdate(
//         rideId,
//         {
//           status: "started",
//           started_at: new Date()
//         },
//         client
//       );

//       return {
//         ride: updatedRide,
//         riderId: ride.rider_id,
//         driverId: ride.driver_id
//       };
//     });

//     // 3️⃣ SOCKET EMIT (after commit)
//     notifyRideStatusChange(
//       result.riderId,
//       result.driverId,
//       "started",
//       result.ride
//     );

//     return result;
//   }
// }
export class RideStartService {

  async startRide({ rideId }) {

    const result = await withTransaction(async (client) => {

      const ride = await RideModel.findById(rideId, client);
      if (!ride) {
        throw new AppError("RIDE_NOT_FOUND", 404);
      }

      if (ride.status !== "accepted") {
        throw new AppError("RIDE_NOT_READY_TO_START", 400);
      }

      const updatedRide = await RideModel.findByIdAndUpdate(
        rideId,
        {
          status: "started",
          started_at: new Date()
        },
        client
      );

      return {
        ride: updatedRide,
        riderId: ride.rider_id,
        driverId: ride.driver_id
      };
    });

    notifyRideStatusChange(
      result.riderId,
      result.driverId,
      "started",
      result.ride
    );

    return result;
  }
}