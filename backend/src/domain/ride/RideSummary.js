export class RideSummary {
  constructor({
    rideId,
    riderId,
    driverId,
    status,
    isPaid,
    completedAt
  }) {
    this.rideId = rideId;
    this.riderId = riderId;
    this.driverId = driverId;

    this.status = status;   
    this.isPaid = isPaid;   
    this.completedAt = completedAt;
  }
}
