import { PaymentStrategy } from "./PaymentStrategy.js";

export class BNPLStrategy extends PaymentStrategy {

  async authorize({ userId, amount }) {
    // Reserve BNPL credit
    return { authorized: true };
  }

  async capture() {
    return { captured: true };
  }

  async refund() {
    return { refunded: true };
  }
}