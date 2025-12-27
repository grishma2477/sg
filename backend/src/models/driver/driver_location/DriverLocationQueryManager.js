import { String } from "../../utils/Constant.js";

export const DriverLocationQueryManager = {
  createDriverLocationTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_LOCATION_MODEL} (
      driver_id UUID PRIMARY KEY
        REFERENCES ${String.DRIVER_MODEL}(id)
        ON DELETE CASCADE,

      location GEOGRAPHY(POINT, 4326) NOT NULL,

      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createDriverLocationIndexQuery: `

    CREATE INDEX IF NOT EXISTS idx_driver_location_gist
    ON ${String.DRIVER_LOCATION_MODEL}
    USING GIST (location);

    -- Spatial search 
CREATE INDEX IF NOT EXISTS idx_driver_location_geo
ON driver_locations
USING GIST (location);
  `
};
