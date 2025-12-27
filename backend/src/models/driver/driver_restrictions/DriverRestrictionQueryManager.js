import { String } from "../../utils/Constant.js";

export const DriverRestrictionQueryManager = {
  createDriverRestrictionTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_RESTRICTION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      driver_id UUID NOT NULL REFERENCES ${String.DRIVER_MODEL}(id) ON DELETE CASCADE,

      restriction_type VARCHAR(50) NOT NULL,
      visibility_multiplier DECIMAL(3,2) DEFAULT 1.0,
      is_active BOOLEAN DEFAULT TRUE,

      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createDriverRestrictionTableQueryIndex:`
  -- Active restriction lookup
CREATE INDEX IF NOT EXISTS idx_driver_restrictions_active
ON driver_restrictions (driver_id)
WHERE is_active = TRUE;
`
};
