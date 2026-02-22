import { String } from "../../../utils/Constant.js";

export const LedgerAccountQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.LEDGER_ACCOUNT} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Who owns this account
      owner_type VARCHAR(20) NOT NULL CHECK (
        owner_type IN ('user', 'driver', 'platform')
      ),
      
      -- NULL for platform accounts (escrow, revenue, clearing)
      owner_id UUID,
      
      -- Type of account
      account_type VARCHAR(30) NOT NULL CHECK (
        account_type IN (
          'wallet',      -- User/Driver wallet
          'escrow',      -- Platform escrow for rides
          'revenue',     -- Platform commission
          'bnpl',        -- BNPL liability
          'gift',        -- Gift card account
          'clearing'     -- Payment gateway clearing
        )
      ),
      
      currency VARCHAR(3) DEFAULT 'NPR',
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_ledger_owner 
    ON ${String.LEDGER_ACCOUNT}(owner_type, owner_id);
    
    CREATE INDEX IF NOT EXISTS idx_ledger_account_type 
    ON ${String.LEDGER_ACCOUNT}(account_type);
    
    -- Ensure one wallet per user/driver
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_wallet 
    ON ${String.LEDGER_ACCOUNT}(owner_id) 
    WHERE owner_type = 'user' AND account_type = 'wallet';
    
    CREATE UNIQUE INDEX IF NOT EXISTS unique_driver_wallet 
    ON ${String.LEDGER_ACCOUNT}(owner_id) 
    WHERE owner_type = 'driver' AND account_type = 'wallet';
  `]
};