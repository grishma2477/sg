import { String } from "../../utils/Constant.js";

export const TransactionQueryManager = {
  createTransactionTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.TRANSACTION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      wallet_id UUID NOT NULL REFERENCES ${String.WALLET_MODEL}(id) ON DELETE CASCADE,
      ride_id UUID REFERENCES ${String.RIDE_MODEL}(id),

      transaction_type VARCHAR(30) NOT NULL,
      -- debit, credit, commission, payout, refund

      amount NUMERIC(12,2) NOT NULL,
      balance_after NUMERIC(12,2) NOT NULL,

      description TEXT,

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createTransactionTableQueryIndex: `
  -- Wallet ledger queries
CREATE INDEX IF NOT EXISTS idx_transactions_wallet
ON transactions (wallet_id);

-- Ride-based financial audits
CREATE INDEX IF NOT EXISTS idx_transactions_ride
ON transactions (ride_id);

-- Time-based statements
CREATE INDEX IF NOT EXISTS idx_transactions_created
ON transactions (created_at);

  `
};
