import { ModelManager } from "../../database/utils/ModelManager.js";
import { AdminAuditQueryManager } from "./AdminAuditQueryManager.js";
import { String } from "../../utils/Constant.js";

const AdminAuditModel = ModelManager.createModel(
  AdminAuditQueryManager.createAdminAuditTableQuery,
  String.ADMIN_AUDIT_MODEL
);

export default AdminAuditModel;
