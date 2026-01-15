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

-- Admin review queries
CREATE INDEX IF NOT EXISTS idx_user_verification_status
ON user_verifications (identity_verified);