import { String } from "../../utils/Constant.js";

export const VehicleApplicationQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.VEHICLE_APPLICATION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      driver_application_id UUID NOT NULL REFERENCES ${String.DRIVER_APPLICATION_MODEL}(id) ON DELETE CASCADE,

      -- Vehicle Information
      vehicle_type VARCHAR(50) NOT NULL, -- bike, scooter, car
      make VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL,
      color VARCHAR(50),
      license_plate VARCHAR(20) NOT NULL UNIQUE,
      
      -- Vehicle Documents
      registration_url TEXT NOT NULL,
      insurance_url TEXT NOT NULL,
      photo_front_url TEXT NOT NULL,
      photo_back_url TEXT,

      -- Seat capacity (optional, defaults set)
      seat_capacity INTEGER,
      has_ac BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

    `
    -- Index for driver application lookups
    CREATE INDEX IF NOT EXISTS idx_vehicle_application_driver_app
    ON ${String.VEHICLE_APPLICATION_MODEL} (driver_application_id);
  `,

    `
    -- Trigger to update updated_at
    CREATE OR REPLACE FUNCTION update_vehicle_application_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_vehicle_application_updated_at ON ${String.VEHICLE_APPLICATION_MODEL};
    CREATE TRIGGER trigger_vehicle_application_updated_at
    BEFORE UPDATE ON ${String.VEHICLE_APPLICATION_MODEL}
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_application_updated_at();
  `,
  ],
};