CREATE TABLE IF NOT EXISTS driver_restrictions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,

      restriction_type VARCHAR(50) NOT NULL,
      visibility_multiplier DECIMAL(3,2) DEFAULT 1.0,
      is_active BOOLEAN DEFAULT TRUE,

      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- Active restriction lookup
CREATE INDEX IF NOT EXISTS idx_driver_restrictions_active
ON driver_restrictions (driver_id)
WHERE is_active = TRUE;