-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- USERS & AUTH
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE TABLE auth_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_photo_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_verifications (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMPTZ,
  background_check_status VARCHAR(20),
  background_check_at TIMESTAMPTZ,
  documents JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_verification_status ON user_verifications(identity_verified);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- DRIVERS
-- =====================================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'offline',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_drivers_online ON drivers(is_online) WHERE is_online = true;
CREATE INDEX idx_drivers_status ON drivers(status);

CREATE TABLE driver_safety_stats (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  current_points INTEGER DEFAULT 1000,
  average_rating NUMERIC(3,2) DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  total_safety_concerns INTEGER DEFAULT 0,
  verified_safe_badge BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_safety_points ON driver_safety_stats(current_points);
CREATE INDEX idx_driver_verified_safe ON driver_safety_stats(verified_safe_badge) WHERE verified_safe_badge = true;

CREATE TABLE driver_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  restriction_type VARCHAR(50) NOT NULL,
  visibility_multiplier NUMERIC(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_restrictions_active ON driver_restrictions(driver_id) WHERE is_active = true;

CREATE TABLE driver_locations (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  location GEOGRAPHY(Point,4326) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_location_gist ON driver_locations USING gist(location);

-- NEW: Driver visibility settings
CREATE TABLE driver_visibility_settings (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  visibility_multiplier NUMERIC(3,2) DEFAULT 1.00,
  max_request_radius_km NUMERIC(6,2) DEFAULT 5.00,
  max_concurrent_requests INTEGER DEFAULT 10,
  is_restricted BOOLEAN DEFAULT false,
  restriction_reason TEXT,
  restricted_until TIMESTAMPTZ,
  auto_calculated BOOLEAN DEFAULT true,
  manual_override BOOLEAN DEFAULT false,
  override_set_by UUID REFERENCES users(id),
  override_reason TEXT,
  performance_tier VARCHAR(20) DEFAULT 'standard',
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_multiplier CHECK (visibility_multiplier BETWEEN 0.0 AND 2.0),
  CONSTRAINT valid_radius CHECK (max_request_radius_km BETWEEN 1.0 AND 50.0),
  CONSTRAINT valid_tier CHECK (performance_tier IN ('probation','standard','silver','gold','platinum'))
);

CREATE INDEX idx_driver_visibility_multiplier ON driver_visibility_settings(visibility_multiplier DESC) WHERE is_restricted = FALSE;
CREATE INDEX idx_driver_visibility_tier ON driver_visibility_settings(performance_tier);

-- =====================================================
-- VEHICLES
-- =====================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50),
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  seat_capacity INTEGER DEFAULT 4,
  has_ac BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RIDE REQUESTS (NEW)
-- =====================================================
CREATE TABLE ride_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES users(id),
  pickup_location GEOGRAPHY(Point,4326) NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_location GEOGRAPHY(Point,4326) NOT NULL,
  dropoff_address TEXT NOT NULL,
  estimated_distance_km NUMERIC(10,2),
  estimated_duration_minutes INTEGER,
  estimated_fare_min NUMERIC(10,2),
  estimated_fare_max NUMERIC(10,2),
  passenger_count INTEGER DEFAULT 1 CHECK (passenger_count BETWEEN 1 AND 8),
  luggage_count INTEGER DEFAULT 0,
  vehicle_preference VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  pricing_mode VARCHAR(20) DEFAULT 'fixed',
  requested_pickup_time TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  matched_driver_id UUID REFERENCES drivers(id),
  matched_bid_id UUID,
  accepted_at TIMESTAMPTZ,
  created_ride_id UUID REFERENCES rides(id),
  requires_wheelchair_accessible BOOLEAN DEFAULT FALSE,
  requires_pet_friendly BOOLEAN DEFAULT FALSE,
  requires_child_seat BOOLEAN DEFAULT FALSE,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ride_requests_status ON ride_requests(status);
CREATE INDEX idx_ride_requests_rider ON ride_requests(rider_id, created_at DESC);
CREATE INDEX idx_ride_requests_pickup_geo ON ride_requests USING GIST(pickup_location);
CREATE INDEX idx_ride_requests_dropoff_geo ON ride_requests USING GIST(dropoff_location);
CREATE INDEX idx_ride_requests_active ON ride_requests(status, created_at) WHERE status IN ('pending','broadcasting');

-- =====================================================
-- RIDE STOPS (ENHANCED)
-- =====================================================
CREATE TABLE ride_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_request_id UUID REFERENCES ride_requests(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  stop_type VARCHAR(20) NOT NULL,
  location GEOGRAPHY(Point,4326) NOT NULL,
  address TEXT NOT NULL,
  estimated_arrival_time TIMESTAMPTZ,
  actual_arrival_time TIMESTAMPTZ,
  actual_departure_time TIMESTAMPTZ,
  max_wait_seconds INTEGER DEFAULT 120,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_stop_type CHECK (stop_type IN ('intermediate','detour'))
);

CREATE INDEX idx_ride_stops_request ON ride_stops(ride_request_id, stop_order);
CREATE INDEX idx_ride_stops_ride ON ride_stops(ride_id, stop_order);
CREATE INDEX idx_ride_stops_location ON ride_stops USING GIST(location);

-- =====================================================
-- RIDE BIDS (NEW)
-- =====================================================
CREATE TABLE ride_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_request_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  bid_amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  estimated_arrival_minutes INTEGER,
  driver_message TEXT,
  vehicle_type VARCHAR(50),
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_color VARCHAR(50),
  license_plate VARCHAR(20),
  driver_rating NUMERIC(3,2),
  driver_completed_rides INTEGER,
  driver_safety_points INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_driver_bid UNIQUE (ride_request_id, driver_id),
  CONSTRAINT positive_bid CHECK (bid_amount > 0),
  CONSTRAINT valid_eta CHECK (estimated_arrival_minutes > 0)
);

CREATE INDEX idx_ride_bids_request ON ride_bids(ride_request_id, bid_amount ASC, created_at DESC);
CREATE INDEX idx_ride_bids_driver ON ride_bids(driver_id, created_at DESC);
CREATE INDEX idx_ride_bids_pending ON ride_bids(status, expires_at) WHERE status = 'pending';

-- =====================================================
-- RIDES
-- =====================================================
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  status VARCHAR(20) NOT NULL DEFAULT 'requested',
  is_paid BOOLEAN DEFAULT false,
  fare_amount NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  requested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  forced_by_admin BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_rider ON rides(rider_id);
CREATE INDEX idx_rides_completed_at ON rides(completed_at) WHERE completed_at IS NOT NULL;

CREATE TABLE ride_locations (
  ride_id UUID PRIMARY KEY REFERENCES rides(id) ON DELETE CASCADE,
  pickup_location GEOGRAPHY(Point,4326),
  pickup_address TEXT,
  dropoff_location GEOGRAPHY(Point,4326),
  dropoff_address TEXT
);

CREATE INDEX idx_ride_pickup_geo ON ride_locations USING gist(pickup_location);
CREATE INDEX idx_ride_dropoff_geo ON ride_locations USING gist(dropoff_location);

-- =====================================================
-- REVIEWS
-- =====================================================
CREATE TABLE ride_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_driver_id UUID REFERENCES drivers(id),
  reviewee_user_id UUID REFERENCES users(id),
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  positive_taps JSONB DEFAULT '[]',
  negative_taps JSONB DEFAULT '[]',
  has_safety_concern BOOLEAN DEFAULT false,
  safety_concern_details TEXT,
  calculated_impact INTEGER,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uniq_ride_reviewer UNIQUE (ride_id, reviewer_id),
  CONSTRAINT chk_single_review_target CHECK (
    (reviewee_driver_id IS NOT NULL AND reviewee_user_id IS NULL) OR
    (reviewee_driver_id IS NULL AND reviewee_user_id IS NOT NULL)
  )
);

CREATE INDEX idx_reviews_driver ON ride_reviews(reviewee_driver_id);
CREATE INDEX idx_reviews_safety_concern ON ride_reviews(has_safety_concern) WHERE has_safety_concern = true;

-- NEW: Safety comments
CREATE TABLE safety_comments (
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_commenter_role CHECK (commenter_role IN ('rider','driver','admin','system')),
  CONSTRAINT valid_severity CHECK (severity_level IN ('low','medium','high','critical')),
  CONSTRAINT comment_not_empty CHECK (LENGTH(TRIM(comment_text)) > 0)
);

CREATE INDEX idx_safety_comments_review ON safety_comments(review_id, created_at ASC);
CREATE INDEX idx_safety_comments_unresolved ON safety_comments(is_resolved, severity_level DESC, created_at ASC) WHERE is_resolved = FALSE;
CREATE INDEX idx_safety_comments_admin_queue ON safety_comments(admin_reviewed, severity_level DESC, created_at ASC) WHERE admin_reviewed = FALSE;

-- =====================================================
-- SAFETY & AUDIT
-- =====================================================
CREATE TABLE safety_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  event_type VARCHAR(50) NOT NULL,
  points_before INTEGER,
  points_after INTEGER,
  points_delta INTEGER,
  triggered_by_review_id UUID REFERENCES ride_reviews(id),
  triggered_by_admin_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_driver ON safety_audit_logs(driver_id);
CREATE INDEX idx_audit_created_at ON safety_audit_logs(created_at);

-- =====================================================
-- FINANCE
-- =====================================================
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
  base_fare NUMERIC(10,2) NOT NULL,
  distance_fare NUMERIC(10,2) NOT NULL,
  time_fare NUMERIC(10,2) NOT NULL,
  surge_multiplier NUMERIC(4,2) DEFAULT 1.0,
  total_fare NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id),
  transaction_type VARCHAR(30) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- REFERENCE
-- =====================================================
CREATE TABLE tap_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tap_category VARCHAR(20) CHECK (tap_category IN ('positive','negative')),
  tap_key VARCHAR(50) UNIQUE NOT NULL,
  tap_label VARCHAR(100) NOT NULL,
  point_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
