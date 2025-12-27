import { String } from "../../utils/Constant.js";

export const TapDefinitionQueryManager = {
  createTapDefinitionTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.TAP_DEFINITION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      tap_category VARCHAR(20) CHECK (tap_category IN ('positive','negative')),
      tap_key VARCHAR(50) UNIQUE NOT NULL,
      tap_label VARCHAR(100) NOT NULL,
      point_value INTEGER NOT NULL,

      is_active BOOLEAN DEFAULT TRUE,
      display_order INTEGER DEFAULT 0,

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createTapDefinitionTableQueryIndex: `
  
  -- Fast lookup by key
CREATE UNIQUE INDEX IF NOT EXISTS idx_tap_key
ON tap_definitions (tap_key);

-- Ordering for UI
CREATE INDEX IF NOT EXISTS idx_tap_display_order
ON tap_definitions (display_order);
`
};
