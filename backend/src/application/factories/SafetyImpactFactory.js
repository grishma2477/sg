import { SafetyImpact } from "../../domain/safety/SafetyImpact.js";

export class SafetyImpactFactory {
  static create({ rating, taps }) {
    const starImpactMap = {
      5: 2,
      4: 1,
      3: 0,
      2: -5,
      1: -10
    };

    const starImpact = starImpactMap[rating.stars] ?? 0;

    const positiveImpact = taps
      .filter(t => t.category === "positive")
      .reduce((s, t) => s + t.pointValue, 0);

    const negativeImpact = taps
      .filter(t => t.category === "negative")
      .reduce((s, t) => s + t.pointValue, 0);

    const totalImpact =
      starImpact + positiveImpact + negativeImpact;

    // return new SafetyImpact({
    //   starImpact,
    //   positiveImpact,
    //   negativeImpact,
    //   totalImpact,
    //   breakdown: { starImpact, positiveImpact, negativeImpact }
    // });
    return {
      starImpact,
      positiveImpact,
      negativeImpact,
      totalImpact
    };

  }
}
