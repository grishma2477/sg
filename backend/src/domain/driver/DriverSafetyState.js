import { SafetyPoints } from "../shared/valueObjects/SafetyPoints";

export class DriverSafetyState {
  constructor({
    driverId,
    points,
    badge,
    lastUpdatedAt
  }) {
    this.driverId = driverId;
    this.points = points; 
    this.badge = badge;
    this.lastUpdatedAt = lastUpdatedAt;
  }
}
