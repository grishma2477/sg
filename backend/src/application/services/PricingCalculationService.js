export class PricingCalculationService {

  static calculateEstimatedFare({
    distanceKm,
    durationMinutes,
    baseRatePerKm = 20,
    baseRatePerMinute = 3,
    baseFare = 50,
    surgeMultiplier = 1.0,
    taxRate = 0.13,
    platformFeeRate = 0.20
  }) {

    const rawFare =
      baseFare +
      (distanceKm * baseRatePerKm) +
      (durationMinutes * baseRatePerMinute);

    const surgedFare = rawFare * surgeMultiplier;

    const tax = surgedFare * taxRate;
    const platformFee = surgedFare * platformFeeRate;

    const total = surgedFare + tax;

    return {
      baseFare: surgedFare,
      tax,
      platformFee,
      total
    };
  }

  static calculateFinalFare({
    actualDistanceKm,
    actualDurationMinutes,
    ...rest
  }) {
    return this.calculateEstimatedFare({
      distanceKm: actualDistanceKm,
      durationMinutes: actualDurationMinutes,
      ...rest
    });
  }
}