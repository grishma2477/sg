import { String } from "../../utils/Constant.js";

export const DriverApplicationQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_APPLICATION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      -- Driver License Information ONLY
      license_number VARCHAR(100) NOT NULL UNIQUE,
      license_issued_date DATE NOT NULL,
      license_expiry_date DATE NOT NULL,
      license_category VARCHAR(50) NOT NULL, -- A (Bike), B (Scooter), B-C (Car)
      
      -- License Documents
      license_front_url TEXT NOT NULL,
      license_back_url TEXT,

      -- Application Status
      status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
      admin_remarks TEXT,
      reviewed_by UUID REFERENCES ${String.USER_MODEL}(id),
      reviewed_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

    `
    -- Index for user lookups
    CREATE INDEX IF NOT EXISTS idx_driver_application_user
    ON ${String.DRIVER_APPLICATION_MODEL} (user_id);
  `,

    `
    -- Index for status filtering
    CREATE INDEX IF NOT EXISTS idx_driver_application_status
    ON ${String.DRIVER_APPLICATION_MODEL} (status);
  `,

    `
    -- Trigger to update updated_at
    CREATE OR REPLACE FUNCTION update_driver_application_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_driver_application_updated_at ON ${String.DRIVER_APPLICATION_MODEL};
    CREATE TRIGGER trigger_driver_application_updated_at
    BEFORE UPDATE ON ${String.DRIVER_APPLICATION_MODEL}
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_application_updated_at();
  `,
  ],
};