import { String } from "../../../../utils/Constant.js";

export const WalletQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.WALLET_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,
      
      balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
      locked_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (locked_balance >= 0),
      
      currency VARCHAR(3) DEFAULT 'NPR',
      
      is_locked BOOLEAN DEFAULT FALSE,
      lock_reason TEXT,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- One wallet per user
    CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_user 
    ON ${String.WALLET_MODEL}(user_id);
    
    -- Index for balance queries
    CREATE INDEX IF NOT EXISTS idx_wallet_balance 
    ON ${String.WALLET_MODEL}(balance) 
    WHERE balance > 0;
    
    -- Index for locked wallets
    CREATE INDEX IF NOT EXISTS idx_wallet_locked 
    ON ${String.WALLET_MODEL}(is_locked) 
    WHERE is_locked = TRUE;
  `],
  
  // Triggers
  triggers: [`
    -- Update updated_at on every update
    CREATE OR REPLACE FUNCTION update_wallet_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS wallet_update_timestamp ON ${String.WALLET_MODEL};
    CREATE TRIGGER wallet_update_timestamp
    BEFORE UPDATE ON ${String.WALLET_MODEL}
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_timestamp();
  `,
  `
    -- Reset daily withdrawal counter
    CREATE OR REPLACE FUNCTION reset_daily_withdrawal()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.last_withdrawal_date IS NULL OR NEW.last_withdrawal_date < CURRENT_DATE THEN
        NEW.today_withdrawn = 0;
        NEW.last_withdrawal_date = CURRENT_DATE;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS wallet_reset_daily_withdrawal ON ${String.WALLET_MODEL};
    CREATE TRIGGER wallet_reset_daily_withdrawal
    BEFORE UPDATE ON ${String.WALLET_MODEL}
    FOR EACH ROW
    WHEN (OLD.today_withdrawn IS DISTINCT FROM NEW.today_withdrawn)
    EXECUTE FUNCTION reset_daily_withdrawal();
  `]
};