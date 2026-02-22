import { String } from "../../../utils/Constant.js";

export const BNPLAccountQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.BNPL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- One BNPL account per user
      user_id UUID UNIQUE NOT NULL 
        REFERENCES ${String.USER_MODEL}(id) 
        ON DELETE CASCADE,
      
      -- Credit limit (default 100 SG for all users)
      credit_limit DECIMAL(10,2) DEFAULT 100.00 NOT NULL,
      
      -- Currently used amount
      used_amount DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
      
      -- Account status
      status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'suspended', 'blocked')
      ),
      
      -- Track defaults
      missed_payments_count INTEGER DEFAULT 0,
      last_missed_payment_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_bnpl_user 
    ON ${String.BNPL}(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_bnpl_status 
    ON ${String.BNPL}(status);
    
    -- Index for finding overdue accounts
    CREATE INDEX IF NOT EXISTS idx_bnpl_missed_payments 
    ON ${String.BNPL}(missed_payments_count) 
    WHERE missed_payments_count > 0;
  `],
  
  triggers: [`
    -- Update updated_at trigger
    CREATE OR REPLACE FUNCTION update_bnpl_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS bnpl_update_timestamp ON ${String.BNPL};
    CREATE TRIGGER bnpl_update_timestamp
    BEFORE UPDATE ON ${String.BNPL}
    FOR EACH ROW
    EXECUTE FUNCTION update_bnpl_timestamp();
  `]
};