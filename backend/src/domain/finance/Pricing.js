import { Money } from "../shared/valueObjects/Money.js";

export class Pricing {
  constructor({ rideId, totalFare }) {
    this.rideId = rideId;
    this.totalFare = totalFare; 
  }
}
