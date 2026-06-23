import { getDirections } from "../../infrastructure/mapsClient.js";
import { VEHICLE_PRICING, String as C } from "../../utils/Constant.js";

const ALL_VEHICLE_TYPES = Object.keys(VEHICLE_PRICING);

export class PricingCalculationService {

  /**
   * Calculate fare for a single vehicle type given road distance + duration.
   * Does NOT call Maps — pure math from already-fetched route data.
   */
  static calculateFare({ distanceKm, durationMinutes, vehicleType, surgeMultiplier = 1.0 }) {
    const rates = VEHICLE_PRICING[vehicleType] ?? VEHICLE_PRICING.car;
    const surge = surgeMultiplier ?? rates.surgeMultiplier;

    const raw =
      rates.baseFare +
      distanceKm * rates.ratePerKm +
      durationMinutes * rates.ratePerMin;

    const fare = Math.round(raw * surge);
    return Math.max(fare, rates.minFare);
  }

  /**
   * Full estimate: calls Google Maps (or Haversine fallback), returns real distance +
   * fare breakdown for every vehicle type simultaneously.
   *
   * @param {{ lat: number, lng: number }} pickup
   * @param {{ lat: number, lng: number }} dropoff
   * @param {Array<{ lat: number, lng: number }>} stops
   * @param {number} surgeMultiplier
   */
  static async estimateAllVehicles({ pickup, dropoff, stops = [], surgeMultiplier = 1.0 }) {
    const { distanceMeters, durationSeconds, polyline } = await getDirections(
      pickup,
      dropoff,
      stops
    );

    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;

    const estimates = ALL_VEHICLE_TYPES.map((vehicleType) => {
      const fare = this.calculateFare({ distanceKm, durationMinutes, vehicleType, surgeMultiplier });
      const rates = VEHICLE_PRICING[vehicleType];
      // ±10% range shown to rider
      return {
        vehicleType,
        fareMin: Math.round(fare * 0.9),
        fareMax: Math.round(fare * 1.1),
        baseFare: rates.baseFare,
      };
    });

    return {
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMinutes: Math.round(durationMinutes),
      polyline,
      estimates,
    };
  }

  // Legacy scalar API — kept so existing callers don't break
  static calculateEstimatedFare({
    distanceKm,
    durationMinutes,
    vehicleType = "car",
    surgeMultiplier = 1.0,
  }) {
    const fare = this.calculateFare({ distanceKm, durationMinutes, vehicleType, surgeMultiplier });
    const platformFee = Math.round(fare * (C.PLATFORM_FEE_PERCENTAGE / 100));
    return {
      baseFare: fare,
      platformFee,
      total: fare,
    };
  }

  static calculateFinalFare({ actualDistanceKm, actualDurationMinutes, vehicleType = "car", ...rest }) {
    return this.calculateEstimatedFare({
      distanceKm: actualDistanceKm,
      durationMinutes: actualDurationMinutes,
      vehicleType,
      ...rest,
    });
  }
}
