import { String } from "../../utils/Constant.js";

export const DriverLocationQueryManager = {
  createDriverLocationTableQuery: `
    CREATE TABLE ${String.DRIVER_LOCATION_MODEL} (
      driver_id UUID PRIMARY KEY REFERENCES ${String.DRIVER_MODEL}(id),
      location GEOGRAPHY(POINT, 4326),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  createDriverLocationIndexQuery: `
    CREATE INDEX idx_driver_locations_location
    ON ${String.DRIVER_LOCATION_MODEL}
    USING GIST (location);
  `
};

