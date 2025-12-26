import { String } from "../../utils/Constant.js";


export const RideStopQueryManager = {
  createRideStopTableQuery: `
    CREATE TABLE ${String.RIDE_STOP_MODEL} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,

    stop_type VARCHAR(10) NOT NULL CHECK (
    (stop_type = 'DROPOFF' AND max_wait_seconds IS NULL)
    OR (stop_type IN ('PICKUP','STOP') AND max_wait_seconds = 120),

    stop_order INTEGER NOT NULL UNIQUE, -- 0 = pickup, 1 = stop1, 2 = stop2, 3 = dropoff

    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,

    arrived_at TIMESTAMP,
    departed_at TIMESTAMP,

    max_wait_seconds INTEGER, -- NULL for dropoff

    created_at TIMESTAMP DEFAULT NOW()
);
  `,

};


//TODO: 
`At application level:

pickup → stop_order = 0

stop 1 → stop_order = 1

stop 2 → stop_order = 2

dropoff → stop_order = 3

Reject if stop_order > 3
`