


// import { String } from "../../utils/Constant.js";

// export const RideQueryManager = {

// schema: [`

// CREATE TABLE IF NOT EXISTS ${String.RIDE_MODEL} (

//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

//   -- link to ride request
//   ride_request_id UUID NOT NULL
//   REFERENCES ${String.RIDE_REQUEST_MODEL}(id),

//   rider_id UUID NOT NULL
//   REFERENCES ${String.USER_MODEL}(id),

//   driver_id UUID
//   REFERENCES ${String.DRIVER_MODEL}(id),

//   vehicle_id UUID
//   REFERENCES ${String.VEHICLE_APPLICATION_MODEL}(id),

//   status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (
//     status IN (
//       'requested',
//       'accepted',
//       'started',
//       'completed',
//       'cancelled',
//       'disputed'
//     )
//   ),

//   -- Lifecycle timestamps
//   requested_at TIMESTAMPTZ DEFAULT NOW(),
//   accepted_at TIMESTAMPTZ,
//   started_at TIMESTAMPTZ,
//   completed_at TIMESTAMPTZ,

//   cancelled_at TIMESTAMPTZ,
//   cancelled_by UUID,
//   cancellation_reason TEXT,

//   -- Estimated metrics
//   estimated_distance_km NUMERIC(8,2),
//   estimated_duration_minutes INTEGER,
//   estimated_fare NUMERIC(10,2),

//   -- Actual metrics
//   actual_distance_km NUMERIC(8,2),
//   actual_duration_minutes INTEGER,
//   final_fare NUMERIC(10,2),

//   -- Admin flags
//   forced_by_admin BOOLEAN DEFAULT FALSE,
//   deleted BOOLEAN DEFAULT FALSE,

//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()

// );

// `,

// `

// -- Rider history
// CREATE INDEX IF NOT EXISTS idx_rides_rider
// ON rides (rider_id);

// -- Driver history
// CREATE INDEX IF NOT EXISTS idx_rides_driver
// ON rides (driver_id);

// -- Ride request linkage
// CREATE INDEX IF NOT EXISTS idx_rides_request
// ON rides (ride_request_id);

// -- Lifecycle status
// CREATE INDEX IF NOT EXISTS idx_rides_status
// ON rides (status);

// -- Completed rides analytics
// CREATE INDEX IF NOT EXISTS idx_rides_completed_at
// ON rides (completed_at)
// WHERE completed_at IS NOT NULL;

// -- Active rides
// CREATE INDEX IF NOT EXISTS idx_rides_active
// ON rides (id)
// WHERE deleted = FALSE;

// `

// ]

// };



import { String } from "../../utils/Constant.js";

export const RideQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.RIDE_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  ride_request_id UUID NOT NULL
  REFERENCES ${String.RIDE_REQUEST_MODEL}(id),

  rider_id UUID NOT NULL
  REFERENCES ${String.USER_MODEL}(id),

  driver_id UUID
  REFERENCES ${String.DRIVER_MODEL}(id),

  vehicle_id UUID
  REFERENCES ${String.VEHICLE_APPLICATION_MODEL}(id),

  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (
    status IN (
      'requested',
      'accepted',
      'started',
      'completed',
      'cancelled',
      'disputed'
    )
  ),

  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancellation_reason TEXT,

  estimated_distance_km NUMERIC(8,2),
  estimated_duration_minutes INTEGER,
  estimated_fare NUMERIC(10,2),

  actual_distance_km NUMERIC(8,2),
  actual_duration_minutes INTEGER,
  final_fare NUMERIC(10,2),

  forced_by_admin BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()

);

`,

`

CREATE INDEX IF NOT EXISTS idx_rides_rider
ON rides (rider_id);

CREATE INDEX IF NOT EXISTS idx_rides_driver
ON rides (driver_id);

CREATE INDEX IF NOT EXISTS idx_rides_status
ON rides (status);

CREATE INDEX IF NOT EXISTS idx_rides_completed_at
ON rides (completed_at)
WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rides_active
ON rides (id)
WHERE deleted = FALSE;

`

]

};