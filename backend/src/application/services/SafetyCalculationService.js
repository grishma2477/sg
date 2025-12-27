import { SafetyImpactFactory } from "../factories/SafetyImpactFactory.js";

export class SafetyCalculationService {
  calculate(review) {
    return SafetyImpactFactory.create({
      rating: review.rating,
      taps: review.taps
    });
  }
}
