CREATE TABLE IF NOT EXISTS user_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,

      is_kyc_verified BOOLEAN DEFAULT FALSE,
      kyc_verified_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );