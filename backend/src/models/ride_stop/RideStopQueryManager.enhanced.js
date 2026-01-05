import { String } from "../../utils/Constant.js";

/**
 * Enhanced Ride Stops Query Manager
 * 
 * Supports multiple intermediate stops between pickup and dropoff
 */
export const RideStopQueryManager = {
  createRideStopTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.RIDE_STOP_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- References
      ride_request_id UUID NOT NULL REFERENCES ${String.RIDE_REQUEST_MODEL}(id) ON DELETE CASCADE,
      ride_id UUID REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,
      
      -- Stop details
      stop_order INTEGER NOT NULL,  -- 1, 2, 3... (pickup is 0, dropoff is last)
      stop_type VARCHAR(20) NOT NULL,  -- 'intermediate', 'detour'
      
      -- Location (PostGIS)
      location GEOGRAPHY(Point, 4326) NOT NULL,
      address TEXT NOT NULL,
      
      -- Timing
      estimated_arrival_time TIMESTAMPTZ,
      actual_arrival_time TIMESTAMPTZ,
      actual_departure_time TIMESTAMPTZ,
      max_wait_seconds INTEGER DEFAULT 120,  -- 2 minutes default
      
      -- Additional info
      contact_name VARCHAR(100),
      contact_phone VARCHAR(20),
      notes TEXT,
      
      -- Status
      status VARCHAR(20) DEFAULT 'pending',  -- pending, arrived, completed, skipped
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT unique_stop_order UNIQUE (ride_request_id, stop_order),
      CONSTRAINT valid_stop_type CHECK (stop_type IN ('intermediate', 'detour'))
    );
  `,

  createRideStopIndexes: `
    -- Request stops lookup
    CREATE INDEX IF NOT EXISTS idx_ride_stops_request 
    ON ${String.RIDE_STOP_MODEL}(ride_request_id, stop_order);
    
    -- Ride stops lookup
    CREATE INDEX IF NOT EXISTS idx_ride_stops_ride 
    ON ${String.RIDE_STOP_MODEL}(ride_id, stop_order);
    
    -- Geospatial index
    CREATE INDEX IF NOT EXISTS idx_ride_stops_location 
    ON ${String.RIDE_STOP_MODEL} USING GIST(location);
    
    -- Status tracking
    CREATE INDEX IF NOT EXISTS idx_ride_stops_status 
    ON ${String.RIDE_STOP_MODEL}(status, stop_order);
  `
};
