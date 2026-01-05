import { String } from "../../utils/Constant.js";

/**
 * Ride Request Query Manager
 * 
 * Manages ride requests with:
 * - Multi-stop support (pickup → stops → dropoff)
 * - PostGIS location data
 * - Bidding system
 * - Estimated fare and distance
 */
export const RideRequestQueryManager = {
  createRideRequestTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.RIDE_REQUEST_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Requestor
      rider_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      
      -- Route Information (PostGIS)
      pickup_location GEOGRAPHY(Point, 4326) NOT NULL,
      pickup_address TEXT NOT NULL,
      dropoff_location GEOGRAPHY(Point, 4326) NOT NULL,
      dropoff_address TEXT NOT NULL,
      
      -- Calculated route info
      estimated_distance_km NUMERIC(10, 2),  -- from routing service
      estimated_duration_minutes INTEGER,
      estimated_fare_min NUMERIC(10, 2),
      estimated_fare_max NUMERIC(10, 2),
      
      -- Request details
      passenger_count INTEGER DEFAULT 1 CHECK (passenger_count BETWEEN 1 AND 8),
      luggage_count INTEGER DEFAULT 0,
      vehicle_preference VARCHAR(50),  -- 'sedan', 'suv', 'luxury', etc.
      
      -- Request status
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      -- pending, broadcasting, matched, accepted, cancelled, expired
      
      -- Pricing mode
      pricing_mode VARCHAR(20) DEFAULT 'fixed',  -- 'fixed', 'bidding'
      
      -- Time constraints
      requested_pickup_time TIMESTAMPTZ,  -- NULL = immediate, otherwise scheduled
      expires_at TIMESTAMPTZ,  -- When request expires if not matched
      
      -- Matched driver (when accepted)
      matched_driver_id UUID REFERENCES ${String.DRIVER_MODEL}(id),
      matched_bid_id UUID,  -- References ride_bids.id
      accepted_at TIMESTAMPTZ,
      
      -- Ride creation
      created_ride_id UUID REFERENCES ${String.RIDE_MODEL}(id),
      
      -- Special requirements
      requires_wheelchair_accessible BOOLEAN DEFAULT FALSE,
      requires_pet_friendly BOOLEAN DEFAULT FALSE,
      requires_child_seat BOOLEAN DEFAULT FALSE,
      special_instructions TEXT,
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT valid_pickup_time CHECK (
        requested_pickup_time IS NULL OR requested_pickup_time > NOW()
      )
    );
  `,

  createRideRequestIndexes: `
    -- Status queries
    CREATE INDEX IF NOT EXISTS idx_ride_requests_status 
    ON ${String.RIDE_REQUEST_MODEL}(status);
    
    -- Pending/broadcasting requests
    CREATE INDEX IF NOT EXISTS idx_ride_requests_active 
    ON ${String.RIDE_REQUEST_MODEL}(status, created_at)
    WHERE status IN ('pending', 'broadcasting');
    
    -- Rider history
    CREATE INDEX IF NOT EXISTS idx_ride_requests_rider 
    ON ${String.RIDE_REQUEST_MODEL}(rider_id, created_at DESC);
    
    -- Geospatial index for pickup locations
    CREATE INDEX IF NOT EXISTS idx_ride_requests_pickup_geo 
    ON ${String.RIDE_REQUEST_MODEL} USING GIST(pickup_location);
    
    -- Geospatial index for dropoff locations
    CREATE INDEX IF NOT EXISTS idx_ride_requests_dropoff_geo 
    ON ${String.RIDE_REQUEST_MODEL} USING GIST(dropoff_location);
    
    -- Expiration cleanup
    CREATE INDEX IF NOT EXISTS idx_ride_requests_expires 
    ON ${String.RIDE_REQUEST_MODEL}(expires_at)
    WHERE status IN ('pending', 'broadcasting');
    
    -- Scheduled rides
    CREATE INDEX IF NOT EXISTS idx_ride_requests_scheduled 
    ON ${String.RIDE_REQUEST_MODEL}(requested_pickup_time)
    WHERE requested_pickup_time IS NOT NULL;
  `
};
