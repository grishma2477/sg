// import { String } from "../../utils/Constant.js";

// export const SafetyAuditLogQueryManager = {
// schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.SAFETY_AUDIT_MODEL} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

//       driver_id UUID NOT NULL REFERENCES ${String.DRIVER_MODEL}(id),
//       event_type VARCHAR(50) NOT NULL,

//       points_before INTEGER,
//       points_after INTEGER,
//       points_delta INTEGER,

//       triggered_by_review_id UUID REFERENCES ${String.REVIEW_MODEL}(id),
//       triggered_by_admin_id UUID REFERENCES ${String.USER_MODEL}(id),

//       reason TEXT,
//       created_at TIMESTAMPTZ DEFAULT NOW()
//     );
//   `,
// `
  
//   -- Driver audit trail
// CREATE INDEX IF NOT EXISTS idx_audit_driver
// ON safety_audit_logs (driver_id);

// -- Time-based audit review
// CREATE INDEX IF NOT EXISTS idx_audit_created_at
// ON safety_audit_logs (created_at);
// ` ]
// };

import { String } from "../../utils/Constant.js";

export const SafetyAuditLogQueryManager = {
schema: [`
    CREATE TABLE IF NOT EXISTS ${String.SAFETY_AUDIT_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      driver_id UUID REFERENCES ${String.DRIVER_MODEL}(id),
      user_id UUID REFERENCES ${String.USER_MODEL}(id),
      event_type VARCHAR(50) NOT NULL,

      points_before INTEGER,
      points_after INTEGER,
      points_delta INTEGER,

      triggered_by_review_id UUID REFERENCES ${String.REVIEW_MODEL}(id),
      triggered_by_admin_id UUID REFERENCES ${String.USER_MODEL}(id),

      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      CONSTRAINT chk_driver_or_user CHECK (
        (driver_id IS NOT NULL AND user_id IS NULL) OR
        (driver_id IS NULL AND user_id IS NOT NULL)
      )
    );
    
    -- Add user_id column if table exists but column doesn't
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'safety_audit_logs'
        AND column_name = 'user_id'
      ) THEN
        ALTER TABLE safety_audit_logs
        ADD COLUMN user_id UUID REFERENCES users(id);
      END IF;
    END $$;
    
    -- Add constraint if missing
    DO $$
    BEGIN
      ALTER TABLE safety_audit_logs
      ADD CONSTRAINT chk_driver_or_user CHECK (
        (driver_id IS NOT NULL AND user_id IS NULL) OR
        (driver_id IS NULL AND user_id IS NOT NULL)
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `,
`
  
  -- Driver audit trail
CREATE INDEX IF NOT EXISTS idx_audit_driver
ON ${String.SAFETY_AUDIT_MODEL} (driver_id);

-- Rider audit trail (NEW)
CREATE INDEX IF NOT EXISTS idx_audit_rider
ON ${String.SAFETY_AUDIT_MODEL} (user_id);

-- Time-based audit review
CREATE INDEX IF NOT EXISTS idx_audit_created_at
ON ${String.SAFETY_AUDIT_MODEL} (created_at);
` ]
};