import { PaymentStrategy } from "./PaymentStrategy.js";
import { AppError } from "../../../utils/AppError.js";

export class GatewayStrategy extends PaymentStrategy {

  async authorize({ amount, provider, paymentMethod }) {

    if (!provider) {
      throw new AppError("PROVIDER_NOT_AVAILABLE", 400);
    }

    // Placeholder for real gateway integration
    const paymentIntent = await GatewayService.createPaymentIntent({
      amount,
      token: paymentMethod.provider_token
    });

    return {
      authorized: false,
      requiresAction: true,
      externalReference: paymentIntent.id,
      redirectUrl: paymentIntent.redirect_url
    };
  }

  async capture({ externalReference }) {
    // Real gateway capture call later
    return { captured: true };
  }

  async refund({ externalReference }) {
    // Real gateway refund later
    return { refunded: true };
  }
}