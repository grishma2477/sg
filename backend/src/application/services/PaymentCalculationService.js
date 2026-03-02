import { AppError } from "../../utils/AppError.js";

export class PaymentCalculationService {

  static calculateFare({
    baseFare,
    distanceKm,
    durationMinutes,
    surgeMultiplier = 1,
    platformFee = 0,
    taxPercentage = 0,
    discountAmount = 0
  }) {

    if (baseFare < 0 || distanceKm < 0 || durationMinutes < 0) {
      throw new AppError("INVALID_PRICING_INPUT", 400);
    }

    const PER_KM_RATE = 15;       // TODO: Move to DB config later
    const PER_MIN_RATE = 5;       // TODO: Move to DB config later

    // Step 1 — Distance + Time
    const distanceCost = distanceKm * PER_KM_RATE;
    const timeCost = durationMinutes * PER_MIN_RATE;

    // Step 2 — Subtotal
    const subtotal = baseFare + distanceCost + timeCost;

    // Step 3 — Surge
    const surgedAmount = subtotal * surgeMultiplier;

    // Step 4 — Tax
    const taxAmount = (surgedAmount * taxPercentage) / 100;

    // Step 5 — Final total
    const total =
      surgedAmount +
      platformFee +
      taxAmount -
      discountAmount;

    const finalAmount = Math.max(total, 0);

    return {
      breakdown: {
        baseFare,
        distanceCost,
        timeCost,
        surgeMultiplier,
        surgedAmount,
        platformFee,
        taxAmount,
        discountAmount
      },
      totalAmount: parseFloat(finalAmount.toFixed(2)),
      currency: "NPR"
    };
  }
}