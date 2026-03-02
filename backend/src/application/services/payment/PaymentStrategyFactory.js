import { WalletStrategy } from "./WalletStrategy.js";
import { GatewayStrategy } from "./GatewayStrategy.js";
import { GiftStrategy } from "./GiftStrategy.js";
import { BNPLStrategy } from "./BNPLStrategy.js";
import { AppError } from "../../../utils/AppError.js";

export class PaymentStrategyFactory {

  static getStrategy(paymentSource) {

    switch (paymentSource) {
      case "wallet":
        return new WalletStrategy();

      case "gateway":
      case "card":
        return new GatewayStrategy();

      case "gift":
        return new GiftStrategy();

      case "bnpl":
        return new BNPLStrategy();

      default:
        throw new AppError("UNSUPPORTED_PAYMENT_SOURCE", 400);
    }
  }
}