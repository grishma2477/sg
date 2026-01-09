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

-- =====================================================
-- USER PROFILE / VERIFICATION / WALLET
-- =====================================================
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

CREATE INDEX idx_user_verification_status
  ON user_verifications(identity_verified);

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

CREATE INDEX idx_drivers_online
  ON drivers(is_online) WHERE is_online = true;
CREATE INDEX idx_drivers_status ON drivers(status);

-- =====================================================
-- DRIVER RELATED
-- =====================================================
CREATE TABLE driver_safety_stats (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  current_points INTEGER DEFAULT 1000,
  average_rating NUMERIC(3,2) DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  total_safety_concerns INTEGER DEFAULT 0,
  verified_safe_badge BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_safety_points
  ON driver_safety_stats(current_points);
CREATE INDEX idx_driver_verified_safe
  ON driver_safety_stats(verified_safe_badge)
  WHERE verified_safe_badge = true;

CREATE TABLE driver_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  restriction_type VARCHAR(50) NOT NULL,
  visibility_multiplier NUMERIC(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_restrictions_active
  ON driver_restrictions(driver_id)
  WHERE is_active = true;

CREATE TABLE driver_locations (
  driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  location GEOGRAPHY(Point,4326) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_location_gist
  ON driver_locations USING gist(location);

-- =====================================================
-- RIDES
-- =====================================================
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID,
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
CREATE INDEX idx_rides_completed_at
  ON rides(completed_at) WHERE completed_at IS NOT NULL;

-- =====================================================
-- RIDE LOCATIONS / STOPS
-- =====================================================
CREATE TABLE ride_locations (
  ride_id UUID PRIMARY KEY REFERENCES rides(id) ON DELETE CASCADE,
  pickup_location GEOGRAPHY(Point,4326),
  pickup_address TEXT,
  dropoff_location GEOGRAPHY(Point,4326),
  dropoff_address TEXT
);

CREATE INDEX idx_ride_pickup_geo
  ON ride_locations USING gist(pickup_location);
CREATE INDEX idx_ride_dropoff_geo
  ON ride_locations USING gist(dropoff_location);

CREATE TABLE ride_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  stop_type VARCHAR(10) NOT NULL,
  stop_order INTEGER NOT NULL,
  location GEOGRAPHY(Point,4326) NOT NULL,
  address TEXT,
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  max_wait_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uniq_ride_stop_order UNIQUE (ride_id, stop_order),
  CONSTRAINT ride_stops_check CHECK (
    (stop_type = 'DROPOFF' AND max_wait_seconds IS NULL)
    OR
    (stop_type IN ('PICKUP','STOP') AND max_wait_seconds = 120)
  )
);

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
    (reviewee_driver_id IS NOT NULL AND reviewee_user_id IS NULL)
    OR
    (reviewee_driver_id IS NULL AND reviewee_user_id IS NOT NULL)
  )
);

CREATE INDEX idx_reviews_driver ON ride_reviews(reviewee_driver_id);
CREATE INDEX idx_reviews_safety_concern
  ON ride_reviews(has_safety_concern)
  WHERE has_safety_concern = true;

-- =====================================================
-- SAFETY AUDIT LOGS
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
-- VEHICLES / PRICING / TRANSACTIONS / TAPS / ADMIN
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
