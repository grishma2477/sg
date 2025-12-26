import { String } from "../../utils/Constant.js";

export const RideLocationQueryManager = {
  createRideLocationTableQuery: `
    CREATE TABLE ${String.RIDE_LOCATION_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pickup_location GEOGRAPHY(POINT, 4326),
      drop_location GEOGRAPHY(POINT, 4326),
      pickup_address TEXT,
      drop_address TEXT
    );
  `,

};

