import { String } from "../../utils/Constant.js";

export const WalletQueryManager = {
  createWalletTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.WALLET_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      balance NUMERIC(12,2) DEFAULT 0.00,
      currency VARCHAR(10) DEFAULT 'USD',

      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createWalletTableQueryIndex:`
  -- One wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_user
ON wallets (user_id);
`
};
