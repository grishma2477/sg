-- ═══════════════════════════════════════════════════════════════════════════════
-- CREATE MISSING TABLES
-- Run this to add the tables that didn't get created from init.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. RIDE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS ride_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  pickup_location GEOGRAPHY(Point, 4326) NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_location GEOGRAPHY(Point, 4326) NOT NULL,
  dropoff_address TEXT NOT NULL,
  
  pricing_mode VARCHAR(20) NOT NULL DEFAULT 'bidding',
  vehicle_preference VARCHAR(20) NOT NULL DEFAULT 'sedan',
  passenger_count INTEGER NOT NULL DEFAULT 1,
  luggage_count INTEGER NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
  
  requires_wheelchair_accessible BOOLEAN DEFAULT FALSE,
  requires_pet_friendly BOOLEAN DEFAULT FALSE,
  requires_child_seat BOOLEAN DEFAULT FALSE,
  special_instructions TEXT,
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  estimated_distance_km NUMERIC(10,2),
  estimated_duration_minutes INTEGER,
  estimated_fare_min NUMERIC(10,2),
  estimated_fare_max NUMERIC(10,2),
  actual_fare NUMERIC(10,2),
  
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_bid_id UUID,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  matched_driver_id UUID REFERENCES drivers(id),
  
  CONSTRAINT ride_requests_passenger_count_check CHECK (passenger_count > 0),
  CONSTRAINT ride_requests_luggage_count_check CHECK (luggage_count >= 0),
  CONSTRAINT ride_requests_payment_method_check CHECK (payment_method IN ('cash', 'card', 'wallet')),
  CONSTRAINT ride_requests_pricing_mode_check CHECK (pricing_mode IN ('fixed', 'bidding')),
  CONSTRAINT ride_requests_status_check CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT ride_requests_vehicle_preference_check CHECK (vehicle_preference IN ('bike', 'sedan', 'suv', 'luxury', 'van'))
);

CREATE INDEX IF NOT EXISTS idx_ride_requests_rider_id ON ride_requests (rider_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_driver_id ON ride_requests (driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests (status);
CREATE INDEX IF NOT EXISTS idx_ride_requests_pickup_location ON ride_requests USING GIST (pickup_location);
CREATE INDEX IF NOT EXISTS idx_ride_requests_dropoff_location ON ride_requests USING GIST (dropoff_location);

-- 2. RIDE BIDS TABLE
CREATE TABLE IF NOT EXISTS ride_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  ride_request_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  
  bid_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  
  estimated_arrival_minutes INTEGER,
  driver_message TEXT,
  
  vehicle_type VARCHAR(50),
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_color VARCHAR(50),
  license_plate VARCHAR(20),
  
  driver_rating NUMERIC(3, 2),
  driver_completed_rides INTEGER,
  driver_safety_points INTEGER,
  
  status VARCHAR(20) DEFAULT 'pending',
  
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_driver_bid UNIQUE (ride_request_id, driver_id),
  CONSTRAINT positive_bid CHECK (bid_amount > 0),
  CONSTRAINT valid_eta CHECK (estimated_arrival_minutes > 0)
);

CREATE INDEX IF NOT EXISTS idx_ride_bids_request ON ride_bids(ride_request_id, bid_amount);
CREATE INDEX IF NOT EXISTS idx_ride_bids_driver ON ride_bids(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_bids_status ON ride_bids(status);

-- 3. DRIVER VISIBILITY TABLE
CREATE TABLE IF NOT EXISTS driver_visibility (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  
  visibility_multiplier NUMERIC(3, 2) DEFAULT 1.00,
  max_request_radius_km NUMERIC(6, 2) DEFAULT 5.00,
  max_concurrent_requests INTEGER DEFAULT 10,
  
  is_restricted BOOLEAN DEFAULT FALSE,
  restriction_reason TEXT,
  restricted_until TIMESTAMPTZ,
  
  auto_calculated BOOLEAN DEFAULT TRUE,
  manual_override BOOLEAN DEFAULT FALSE,
  override_set_by UUID REFERENCES users(id),
  override_reason TEXT,
  
  performance_tier VARCHAR(20) DEFAULT 'standard',
  
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_multiplier CHECK (visibility_multiplier BETWEEN 0.0 AND 2.0),
  CONSTRAINT valid_radius CHECK (max_request_radius_km BETWEEN 1.0 AND 50.0),
  CONSTRAINT valid_tier CHECK (performance_tier IN ('probation', 'standard', 'silver', 'gold', 'platinum'))
);

-- 4. SAFETY COMMENTS TABLE
CREATE TABLE IF NOT EXISTS safety_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  review_id UUID NOT NULL REFERENCES ride_reviews(id) ON DELETE CASCADE,
  
  commenter_id UUID NOT NULL REFERENCES users(id),
  commenter_role VARCHAR(20) NOT NULL,
  
  comment_text TEXT NOT NULL,
  
  safety_category VARCHAR(50),
  severity_level VARCHAR(20) DEFAULT 'low',
  
  evidence_urls JSONB DEFAULT '[]',
  
  admin_reviewed BOOLEAN DEFAULT FALSE,
  admin_reviewed_by UUID REFERENCES users(id),
  admin_reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  admin_action_taken VARCHAR(100),
  
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  is_public BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  
  requires_follow_up BOOLEAN DEFAULT FALSE,
  follow_up_completed BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_comments_review ON safety_comments (review_id);
CREATE INDEX IF NOT EXISTS idx_safety_comments_flagged ON safety_comments (is_flagged) WHERE is_flagged = TRUE;

-- Verify tables were created
SELECT 'Missing tables created successfully!' as result;

SELECT 
  'ride_requests' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ride_requests') as exists
UNION ALL
SELECT 'ride_bids',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ride_bids')
UNION ALL
SELECT 'driver_visibility',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'driver_visibility')
UNION ALL
SELECT 'safety_comments',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'safety_comments');