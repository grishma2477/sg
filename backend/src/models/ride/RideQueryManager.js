import { String } from "../../utils/Constant.js";
export const RideQueryManager = {
  createRideTableQuery: `
    CREATE TABLE ${String.RIDE_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rider_id UUID REFERENCES ${String.USER_MODEL}(id),
      driver_id UUID REFERENCES ${String.DRIVER_MODEL}(id),
      vehicle_id UUID REFERENCES ${String.VEHICLE_MODEL}(id),
      location_id UUID REFERENCES ${String.RIDE_LOCATION_MODEL}(id),

      status VARCHAR(20) CHECK (
        status IN ('REQUESTED', 'ACCEPTED', 'ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED')
      ),

      distance_km NUMERIC(6,2),
      duration_min INTEGER,
      fare NUMERIC(10,2),

      requested_at TIMESTAMP DEFAULT NOW(),
      started_at TIMESTAMP,
      completed_at TIMESTAMP
    );
  `,
  getDistanceByLocationIdQuery: `
    SELECT
      ST_Distance(pickup_location, drop_location) / 1000 AS distance_km
    FROM ${String.RIDE_LOCATION_MODEL}
    WHERE id = $1;
  `
};

