import { SafetyPoints } from "../shared/valueObjects/SafetyPoints.js";

export class SafetyImpact {
  constructor({
    starImpact,
    positiveImpact,
    negativeImpact,
    totalImpact,
    breakdown
  }) {
    this.starImpact = starImpact;
    this.positiveImpact = positiveImpact;
    this.negativeImpact = negativeImpact;
    this.totalImpact = totalImpact;
    this.breakdown = breakdown;
  }
}
