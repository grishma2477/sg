
// import PaymentProvider from "../../models/finance/payment_method/payment_provider/PaymentProvider.js";
// import PaymentMethod from "../../models/finance/payment_method/PaymentMethod.js";
// import { AppError } from "../../utils/AppError.js";


// export class PaymentMethodService {

//   static async addPaymentMethod({
//     userId,
//     providerId,
//     providerToken,
//     accountIdentifier
//   }) {

//     if (!providerId || !providerToken) {
//       throw new AppError("MISSING_REQUIRED_FIELDS", 400);
//     }

//     const provider = await PaymentProvider.findOne({
//       id: providerId,
//       is_active: true
//     });

//     if (!provider) {
//       throw new AppError("INVALID_PROVIDER", 400);
//     }

//     const method = await PaymentMethod.create({
//       user_id: userId,
//       provider_id: providerId,
//       provider_token: providerToken,
//       account_identifier: accountIdentifier,
//       verification_status: "pending",
//       is_default: false,
//       is_active: true
//     });

//     return method;
//   }

//   static async verifyPaymentMethod(methodId, userId) {

//     const method = await PaymentMethod.findOne({
//       id: methodId,
//       user_id: userId
//     });

//     if (!method) {
//       throw new AppError("PAYMENT_METHOD_NOT_FOUND", 404);
//     }

//     await PaymentMethod.updateOne(
//       { id: methodId },
//       {
//         verification_status: "verified",
//         verified_at: new Date()
//       }
//     );

//     return { message: "PAYMENT_METHOD_VERIFIED" };
//   }

//   static async getUserPaymentMethods(userId) {

//     const methods = await PaymentMethod.find({
//       user_id: userId,
//       is_deleted: false,
//       is_active: true
//     });

//     return methods;
//   }

//   static async deletePaymentMethod(methodId, userId) {

//     const method = await PaymentMethod.findOne({
//       id: methodId,
//       user_id: userId
//     });

//     if (!method) {
//       throw new AppError("PAYMENT_METHOD_NOT_FOUND", 404);
//     }

//     await PaymentMethod.updateOne(
//       { id: methodId },
//       { is_deleted: true }
//     );

//     return { message: "PAYMENT_METHOD_DELETED" };
//   }

//   static async setDefault(methodId, userId) {

//     const method = await PaymentMethod.findOne({
//       id: methodId,
//       user_id: userId
//     });

//     if (!method) {
//       throw new AppError("PAYMENT_METHOD_NOT_FOUND", 404);
//     }

//     await PaymentMethod.updateMany(
//       { user_id: userId },
//       { is_default: false }
//     );

//     await PaymentMethod.updateOne(
//       { id: methodId },
//       { is_default: true }
//     );

//     return { message: "DEFAULT_PAYMENT_METHOD_SET" };
//   }
// }


import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import PaymentProvider from "../../models/finance/payment_method/payment_provider/PaymentProvider.js";
import PaymentMethod from "../../models/finance/payment_method/PaymentMethod.js";
import { AppError } from "../../utils/AppError.js";

export class PaymentMethodService {

  static async addPaymentMethod(data) {

    return await withTransaction(async (client) => {

      const provider = await PaymentProvider.findOne({
        id: data.providerId,
        is_active: true
      }, client);

      if (!provider) {
        throw new AppError("INVALID_PROVIDER", 400);
      }

      // Prevent duplicate token per user
      const existing = await PaymentMethod.findOne({
        user_id: data.userId,
        provider_token: data.providerToken,
        is_deleted: false
      }, client);

      if (existing) {
        throw new AppError("PAYMENT_METHOD_ALREADY_EXISTS", 409);
      }

      const method = await PaymentMethod.create({
        user_id: data.userId,
        provider_id: data.providerId,
        provider_token: data.providerToken,
        account_identifier: data.accountIdentifier,
        verification_status: "pending",
        is_default: false,
        is_active: true
      }, client);

      return method;
    });
  }

  static async setDefault(methodId, userId) {

    return await withTransaction(async (client) => {

      const method = await PaymentMethod.findOne({
        id: methodId,
        user_id: userId,
        is_deleted: false,
        is_active: true
      }, client);

      if (!method) {
        throw new AppError("PAYMENT_METHOD_NOT_FOUND", 404);
      }

      await PaymentMethod.updateMany(
        { user_id: userId },
        { is_default: false },
        client
      );

      await PaymentMethod.updateOne(
        { id: methodId },
        { is_default: true },
        client
      );

      return { message: "DEFAULT_PAYMENT_METHOD_SET" };
    });
  }
}