import { ModelManager } from "../../database/utils/ModelManager.js";
import { SafetyAuditLogQueryManager } from "./SafetyAuditLogQueryManager.js";
import { String } from "../../utils/Constant.js";

const SafetyAuditLog = ModelManager.createModel(SafetyAuditLogQueryManager.schema,
  String.SAFETY_AUDIT_MODEL
);

export default SafetyAuditLog;
