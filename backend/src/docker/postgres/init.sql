
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. USERS & AUTH
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users table (core entity)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- Auth credentials
CREATE TABLE IF NOT EXISTS auth_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT,
  
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  
  last_login_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_email ON auth_credentials (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_phone ON auth_credentials (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auth_user ON auth_credentials (user_id);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_photo_url TEXT,
  
  date_of_birth DATE,
  gender VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User verifications
CREATE TABLE IF NOT EXISTS user_verifications (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_verified_at TIMESTAMPTZ,
  
  background_check_status VARCHAR(20),
  background_check_at TIMESTAMPTZ,
  
  documents JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_verification_status ON user_verifications (identity_verified);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. DRIVERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'offline',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_user ON drivers (user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers (status);
CREATE INDEX IF NOT EXISTS idx_drivers_online ON drivers (is_online) WHERE is_online = TRUE;

-- Driver locations (PostGIS)
CREATE TABLE IF NOT EXISTS driver_locations (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_location_geo ON driver_locations USING GIST (location);

-- Driver safety stats
CREATE TABLE IF NOT EXISTS driver_safety_stats (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  
  current_points INTEGER DEFAULT 1000,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  completed_rides INTEGER DEFAULT 0,
  total_safety_concerns INTEGER DEFAULT 0,
  
  verified_safe_badge BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_safety_points ON driver_safety_stats (current_points);
CREATE INDEX IF NOT EXISTS idx_driver_verified_safe ON driver_safety_stats (verified_safe_badge) WHERE verified_safe_badge = TRUE;

-- Driver restrictions
CREATE TABLE IF NOT EXISTS driver_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  restriction_type VARCHAR(50) NOT NULL,
  visibility_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_restrictions_active ON driver_restrictions (driver_id) WHERE is_active = TRUE;

-- Driver visibility
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. VEHICLES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  vehicle_type VARCHAR(50) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50),
  
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  
  seat_capacity INTEGER DEFAULT 4,
  has_ac BOOLEAN DEFAULT TRUE,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_driver ON vehicles (driver_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. RIDES & REQUESTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ride requests
CREATE TABLE IF NOT EXISTS ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
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

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  rider_id UUID NOT NULL REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  
  status VARCHAR(20) NOT NULL DEFAULT 'requested',
  is_paid BOOLEAN DEFAULT FALSE,
  
  fare_amount NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  forced_by_admin BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  request_id UUID REFERENCES ride_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_rides_rider ON rides (rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides (driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides (status);
CREATE INDEX IF NOT EXISTS idx_rides_completed_at ON rides (completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rides_active ON rides (id) WHERE deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_rides_request_id ON rides (request_id);

-- Ride stops
CREATE TABLE IF NOT EXISTS ride_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  ride_request_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  
  stop_order INTEGER NOT NULL,
  stop_type VARCHAR(20) NOT NULL,
  
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address TEXT NOT NULL,
  
  estimated_arrival_time TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  max_wait_seconds INTEGER DEFAULT 120,
  
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  notes TEXT,
  
  status VARCHAR(20) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_stop_order UNIQUE (ride_request_id, stop_order),
  CONSTRAINT valid_stop_type CHECK (stop_type IN ('intermediate', 'detour'))
);

CREATE INDEX IF NOT EXISTS idx_ride_stops_request ON ride_stops(ride_request_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_ride_stops_ride ON ride_stops(ride_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_ride_stops_location ON ride_stops USING GIST(location);

-- Ride bids
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

-- Ride locations (PostGIS)
CREATE TABLE IF NOT EXISTS ride_locations (
  ride_id UUID PRIMARY KEY REFERENCES rides(id) ON DELETE CASCADE,
  
  pickup_location GEOGRAPHY(Point,4326),
  pickup_address TEXT,
  
  dropoff_location GEOGRAPHY(Point,4326),
  dropoff_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_ride_pickup_geo ON ride_locations USING GIST (pickup_location);
CREATE INDEX IF NOT EXISTS idx_ride_dropoff_geo ON ride_locations USING GIST (dropoff_location);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. REVIEWS & RATINGS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Tap definitions (reference data)
CREATE TABLE IF NOT EXISTS tap_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  tap_category VARCHAR(20) CHECK (tap_category IN ('positive','negative')),
  tap_key VARCHAR(50) UNIQUE NOT NULL,
  tap_label VARCHAR(100) NOT NULL,
  point_value INTEGER NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tap_key ON tap_definitions (tap_key);
CREATE INDEX IF NOT EXISTS idx_tap_display_order ON tap_definitions (display_order);

-- Reviews
CREATE TABLE IF NOT EXISTS ride_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID UNIQUE NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_user_id UUID REFERENCES users(id),
  reviewee_driver_id UUID NOT NULL REFERENCES drivers(id),
  
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  
  positive_taps JSONB DEFAULT '[]',
  negative_taps JSONB DEFAULT '[]',
  
  has_safety_concern BOOLEAN DEFAULT FALSE,
  safety_concern_details TEXT,
  
  calculated_impact INTEGER,
  is_processed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_driver ON ride_reviews (reviewee_driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON ride_reviews (reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_ride ON ride_reviews (ride_id);
CREATE INDEX IF NOT EXISTS idx_reviews_safety_concern ON ride_reviews (has_safety_concern) WHERE has_safety_concern = TRUE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. SAFETY SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- Safety audit logs
CREATE TABLE IF NOT EXISTS safety_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  driver_id UUID NOT NULL REFERENCES drivers(id),
  event_type VARCHAR(50) NOT NULL,
  
  points_before INTEGER,
  points_after INTEGER,
  points_delta INTEGER,
  
  triggered_by_review_id UUID REFERENCES ride_reviews(id),
  triggered_by_admin_id UUID REFERENCES users(id),
  
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_driver ON safety_audit_logs (driver_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON safety_audit_logs (created_at);

-- Safety comments
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. FINANCE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  balance NUMERIC(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_user ON wallets (user_id);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id),
  
  transaction_type VARCHAR(30) NOT NULL,
  
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ride ON transactions (ride_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions (created_at);

-- Pricing
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID UNIQUE NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  
  base_fare NUMERIC(10,2) NOT NULL,
  distance_fare NUMERIC(10,2) NOT NULL,
  time_fare NUMERIC(10,2) NOT NULL,
  surge_multiplier NUMERIC(4,2) DEFAULT 1.0,
  
  total_fare NUMERIC(10,2) NOT NULL,
  
  currency VARCHAR(10) DEFAULT 'USD',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_ride ON pricing (ride_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA - TAP DEFINITIONS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO tap_definitions (tap_category, tap_key, tap_label, point_value, display_order) VALUES
-- Positive taps
('positive', 'friendly', 'Friendly & Professional', 5, 1),
('positive', 'clean_vehicle', 'Clean Vehicle', 5, 2),
('positive', 'smooth_driving', 'Smooth Driving', 5, 3),
('positive', 'on_time', 'Punctual', 5, 4),
('positive', 'helpful', 'Helpful & Courteous', 5, 5),

-- Negative taps  
('negative', 'rude_behavior', 'Rude Behavior', -20, 10),
('negative', 'unsafe_driving', 'Unsafe Driving', -50, 11),
('negative', 'dirty_vehicle', 'Dirty Vehicle', -10, 12),
('negative', 'wrong_route', 'Wrong Route', -15, 13),
('negative', 'late_arrival', 'Late Arrival', -10, 14)
ON CONFLICT (tap_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF INIT.SQL
-- ═══════════════════════════════════════════════════════════════════════════════