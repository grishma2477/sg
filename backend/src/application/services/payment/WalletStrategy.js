import { PaymentStrategy } from "./PaymentStrategy.js";
import Wallet from "../../../models/finance/transaction/wallet/Wallet.js";
import { AppError } from "../../../utils/AppError.js";

export class WalletStrategy extends PaymentStrategy {

  async authorize({ userId, amount, client }) {

    const wallet = await Wallet.findOneForUpdate(
      { user_id: userId },
      client
    );

    if (!wallet) {
      throw new AppError("WALLET_NOT_FOUND", 404);
    }

    const available = wallet.balance - wallet.locked_balance;

    if (available < amount) {
      throw new AppError("INSUFFICIENT_WALLET_BALANCE", 400);
    }

    await Wallet.updateOne(
      { user_id: userId },
      { locked_balance: wallet.locked_balance + amount },
      client
    );

    return { authorized: true };
  }

  async capture({ userId, amount, client }) {

    const wallet = await Wallet.findOneForUpdate(
      { user_id: userId },
      client
    );

    const newBalance = wallet.balance - amount;
    const newLocked = wallet.locked_balance - amount;

    await Wallet.updateOne(
      { user_id: userId },
      {
        balance: newBalance,
        locked_balance: newLocked
      },
      client
    );

    return { captured: true };
  }

  async refund({ userId, amount, client }) {

    const wallet = await Wallet.findOneForUpdate(
      { user_id: userId },
      client
    );

    await Wallet.updateOne(
      { user_id: userId },
      { balance: wallet.balance + amount },
      client
    );

    return { refunded: true };
  }
}