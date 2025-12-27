import { String } from "../../utils/Constant.js";

export const VehicleQueryManager = {
  createVehicleTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.VEHICLE_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      driver_id UUID NOT NULL REFERENCES ${String.DRIVER_MODEL}(id) ON DELETE CASCADE,

      vehicle_type VARCHAR(50) NOT NULL,
      make VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL,
      color VARCHAR(50),

      license_plate VARCHAR(20) UNIQUE NOT NULL,

      seat_capacity INTEGER DEFAULT 4,
      has_ac BOOLEAN DEFAULT TRUE,

      is_active BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createVehicleTableQueryIndex:`
  -- Join with drivers
CREATE INDEX IF NOT EXISTS idx_vehicle_driver
ON vehicles (driver_id);`
};
