import { String } from "../../utils/Constant.js";

export const RideLocationQueryManager = {
  createRideLocationTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.RIDE_LOCATION_MODEL} (
      ride_id UUID PRIMARY KEY REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

      pickup_location GEOGRAPHY(Point,4326),
      pickup_address TEXT,

      dropoff_location GEOGRAPHY(Point,4326),
      dropoff_address TEXT
    );
  `,

  createRideLocationTableQueryIndex:`
  
  -- Spatial queries if needed later
CREATE INDEX IF NOT EXISTS idx_ride_pickup_geo
ON ride_locations
USING GIST (pickup_location);

CREATE INDEX IF NOT EXISTS idx_ride_dropoff_geo
ON ride_locations
USING GIST (dropoff_location);
`
};
