import { String } from "../../utils/Constant.js";

export const AdminAuditQueryManager = {
  createAdminAuditTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.ADMIN_AUDIT_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id UUID NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
};
