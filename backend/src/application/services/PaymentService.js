import { Transaction } from "../../domain/finance/Transaction.js";

export class PaymentService {
  settlePayment({ wallet, pricing }) {
    if (wallet.balance.amount < pricing.totalFare.amount) {
      throw new Error("Insufficient balance");
    }

    const newBalance =
      wallet.balance.amount - pricing.totalFare.amount;

    return {
      updatedWallet: {
        ...wallet,
        balance: wallet.balance.constructor(
          newBalance,
          wallet.balance.currency
        )
      },
      transaction: new Transaction({
        walletId: wallet.userId,
        rideId: pricing.rideId,
        amount: pricing.totalFare,
        type: "debit",
        createdAt: new Date()
      })
    };
  }
}
