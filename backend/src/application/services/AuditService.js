// import { SafetyAudit } from "../../domain/safety/SafetyAudit.js";

// export class AuditService {
//   record({ driverId, reviewId, before, after }) {
//     return new SafetyAudit({
//       driverId,
//       reviewId,
//       beforePoints: before,
//       afterPoints: after,
//       reason: "REVIEW_IMPACT",
//       createdAt: new Date()
//     });
//   }
// }



import SafetyAuditModel from "../../models/safety/SafetyAudit.js";

export class AuditService {
  async record({ driverId, reviewId, before, after }) {
    await SafetyAuditModel.create({
      driver_id: driverId,
      review_id: reviewId,
      before_points: before,
      after_points: after,
      reason: "REVIEW_IMPACT",
      createdAt: new Date()
    });
  }
}
