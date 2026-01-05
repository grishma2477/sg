import { String } from "../../utils/Constant.js";

/**
 * Ride Bids Query Manager
 * 
 * Handles driver bidding on ride requests
 */
export const RideBidQueryManager = {
  createRideBidTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.RIDE_BID_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- References
      ride_request_id UUID NOT NULL REFERENCES ${String.RIDE_REQUEST_MODEL}(id) ON DELETE CASCADE,
      driver_id UUID NOT NULL REFERENCES ${String.DRIVER_MODEL}(id),
      
      -- Bid details
      bid_amount NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      
      -- Driver proposal
      estimated_arrival_minutes INTEGER,  -- How long to reach pickup
      driver_message TEXT,  -- Optional message to rider
      
      -- Vehicle info snapshot
      vehicle_type VARCHAR(50),
      vehicle_make VARCHAR(100),
      vehicle_model VARCHAR(100),
      vehicle_color VARCHAR(50),
      license_plate VARCHAR(20),
      
      -- Driver stats snapshot (for rider decision)
      driver_rating NUMERIC(3, 2),
      driver_completed_rides INTEGER,
      driver_safety_points INTEGER,
      
      -- Bid status
      status VARCHAR(20) DEFAULT 'pending',
      -- pending, accepted, rejected, withdrawn, expired
      
      -- Timing
      expires_at TIMESTAMPTZ NOT NULL,  -- Auto-expire after X minutes
      accepted_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT unique_driver_bid UNIQUE (ride_request_id, driver_id),
      CONSTRAINT positive_bid CHECK (bid_amount > 0),
      CONSTRAINT valid_eta CHECK (estimated_arrival_minutes > 0)
    );
  `,

  createRideBidIndexes: `
    -- Request bids lookup (sorted by amount)
    CREATE INDEX IF NOT EXISTS idx_ride_bids_request 
    ON ${String.RIDE_BID_MODEL}(ride_request_id, bid_amount ASC, created_at DESC);
    
    -- Driver bids history
    CREATE INDEX IF NOT EXISTS idx_ride_bids_driver 
    ON ${String.RIDE_BID_MODEL}(driver_id, created_at DESC);
    
    -- Active bids (pending)
    CREATE INDEX IF NOT EXISTS idx_ride_bids_pending 
    ON ${String.RIDE_BID_MODEL}(status, expires_at)
    WHERE status = 'pending';
    
    -- Status tracking
    CREATE INDEX IF NOT EXISTS idx_ride_bids_status 
    ON ${String.RIDE_BID_MODEL}(status, created_at DESC);
  `
};
