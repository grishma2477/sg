CREATE TABLE IF NOT EXISTS rides (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      rider_id UUID NOT NULL REFERENCES users(id),
      driver_id UUID REFERENCES drivers(id),
      vehicle_id UUID REFERENCES vehicles(id),

      status VARCHAR(20) NOT NULL DEFAULT 'requested',
      is_paid BOOLEAN DEFAULT FALSE,

      -- Pricing info (optional, can be in separate table)
      fare_amount NUMERIC(10,2),
      currency VARCHAR(10) DEFAULT 'USD',

      -- Lifecycle timestamps
      requested_at TIMESTAMPTZ DEFAULT NOW(),
      accepted_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,

      -- Admin fields
      forced_by_admin BOOLEAN DEFAULT FALSE,
      deleted BOOLEAN DEFAULT FALSE,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

-- Rider history
    CREATE INDEX IF NOT EXISTS idx_rides_rider
    ON rides (rider_id);

    -- Driver history
    CREATE INDEX IF NOT EXISTS idx_rides_driver
    ON rides (driver_id);

    -- Matching / lifecycle queries
    CREATE INDEX IF NOT EXISTS idx_rides_status
    ON rides (status);

    -- Time-based queries (analytics, audits)
    CREATE INDEX IF NOT EXISTS idx_rides_completed_at
    ON rides (completed_at)
    WHERE completed_at IS NOT NULL;

    -- Active rides (not deleted)
    CREATE INDEX IF NOT EXISTS idx_rides_active
    ON rides (id)
    WHERE deleted = FALSE;