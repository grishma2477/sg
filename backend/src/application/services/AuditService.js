

// import SafetyAuditModel from "../../models/safety/SafetyAuditLog.js";

// export class AuditService {
//   async record({ driverId, reviewId, before, after }) {
//     await SafetyAuditModel.create({
//       driver_id: driverId,
//       review_id: reviewId,
//       before_points: before,
//       after_points: after,
//       reason: "REVIEW_IMPACT",
//       createdAt: new Date()
//     });
//   }
// }


import SafetyAuditLog from "../../models/safety/SafetyAuditLog.js";

/**
 * Audit Service
 * 
 * Records safety-related audit logs for compliance and debugging.
 */
export class AuditService {
  /**
   * Record a safety point change audit
   * 
   * @param {string} driverId - Driver record ID
   * @param {string} reviewId - Review that triggered the change
   * @param {number} before - Points before change
   * @param {number} after - Points after change
   * @param {string} reason - Reason for the change
   */
  async record({ driverId, reviewId, before, after, reason = "REVIEW_IMPACT" }) {
    await SafetyAuditLog.create({
      driver_id: driverId,
      event_type: reason,
      points_before: before,
      points_after: after,
      points_delta: after - before,
      triggered_by_review_id: reviewId,
      reason: `Points changed from ${before} to ${after} (${after - before >= 0 ? '+' : ''}${after - before})`,
      created_at: new Date()
    });
  }

  /**
   * Record an admin-triggered safety change
   */
  async recordAdminAction({ driverId, adminId, before, after, reason }) {
    await SafetyAuditLog.create({
      driver_id: driverId,
      event_type: "ADMIN_OVERRIDE",
      points_before: before,
      points_after: after,
      points_delta: after - before,
      triggered_by_admin_id: adminId,
      reason,
      created_at: new Date()
    });
  }
}