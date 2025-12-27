import { Money } from "../shared/valueObjects/Money.js";

export class Wallet {
  constructor({ userId, balance }) {
    this.userId = userId;
    this.balance = balance; 
  }
}
