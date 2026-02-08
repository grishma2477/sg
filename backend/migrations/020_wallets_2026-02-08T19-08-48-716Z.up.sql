CREATE TABLE IF NOT EXISTS wallets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      balance NUMERIC(12,2) DEFAULT 0.00,
      currency VARCHAR(10) DEFAULT 'USD',

      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- One wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_user
ON wallets (user_id);