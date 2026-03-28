import { PaymentStrategy } from "./PaymentStrategy.js";
import { GiftCardService } from "../GiftCardService.js";

export class GiftStrategy extends PaymentStrategy {

  async authorize({ code, userId, rideId, amount }) {

    const result = await GiftCardService.useForRidePayment({
      code,
      userId,
      rideId,
      amount
    });

    return {
      authorized: true,
      giftCardId: result.redemption.gift_card_id
    };
  }

  async capture() {
    return { captured: true };
  }

  async refund() {
    // Optional: implement gift refund logic
    return { refunded: true };
  }
}