import { Money } from "../shared/valueObjects/Money.js";

export class Transaction {
  constructor({
    walletId,
    rideId,
    amount,
    type,
    createdAt
  }) {
    this.walletId = walletId;
    this.rideId = rideId;
    this.amount = amount; // Money
    this.type = type; // debit | credit
    this.createdAt = createdAt;
  }
}
