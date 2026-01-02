import AdminAuditModel from "../../models/admin/AdminAudit.js";

export class AdminAuditService {
  static async log({ adminId, action, entityId }) {
    await AdminAuditModel.create({
      admin_id: adminId,
      action,
      entity_id: entityId
    });
  }
}
