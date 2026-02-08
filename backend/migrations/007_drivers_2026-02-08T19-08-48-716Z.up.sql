CREATE TABLE IF NOT EXISTS drivers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      is_online BOOLEAN DEFAULT FALSE,
      is_available BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'offline',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

-- Join performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_user
ON drivers (user_id);

-- Availability filtering
CREATE INDEX IF NOT EXISTS idx_drivers_status
ON drivers (status);

CREATE INDEX IF NOT EXISTS idx_drivers_online
ON drivers (is_online)
WHERE is_online = TRUE;