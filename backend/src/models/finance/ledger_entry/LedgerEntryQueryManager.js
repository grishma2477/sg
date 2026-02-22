import { String } from "../../../utils/Constant.js";

export const LedgerEntryQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.LEDGER_ENTRY} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Double-entry accounting: every transaction has debit and credit
      debit_account_id UUID NOT NULL REFERENCES ${String.LEDGER_ACCOUNT}(id),
      credit_account_id UUID NOT NULL REFERENCES ${String.LEDGER_ACCOUNT}(id),
      
      amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
      currency VARCHAR(3) DEFAULT 'NPR',
      
      -- What caused this entry
      reference_type VARCHAR(30) CHECK (
        reference_type IN (
          'ride_authorization',    -- Funds locked for ride
          'ride_completion',       -- Ride payment completed
          'ride_cancellation',     -- Ride cancelled, refund
          'settlement',            -- Escrow to driver
          'commission',            -- Platform commission
          'payout',                -- Driver withdrawal
          'bnpl_charge',           -- BNPL used
          'bnpl_repayment',        -- BNPL repaid
          'gift_card_use',         -- Gift card used
          'gateway_settlement'     -- Gateway cleared
        )
      ),
      
      -- Reference to the entity (ride_id, payment_id, payout_id, etc.)
      reference_id UUID,
      
      description TEXT,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_ledger_entry_debit 
    ON ${String.LEDGER_ENTRY}(debit_account_id);
    
    CREATE INDEX IF NOT EXISTS idx_ledger_entry_credit 
    ON ${String.LEDGER_ENTRY}(credit_account_id);
    
    CREATE INDEX IF NOT EXISTS idx_ledger_entry_reference 
    ON ${String.LEDGER_ENTRY}(reference_type, reference_id);
    
    CREATE INDEX IF NOT EXISTS idx_ledger_entry_date 
    ON ${String.LEDGER_ENTRY}(created_at DESC);
    
    -- Composite index for account balance queries
    CREATE INDEX IF NOT EXISTS idx_ledger_entry_account_date 
    ON ${String.LEDGER_ENTRY}(debit_account_id, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_ledger_entry_account_credit_date 
    ON ${String.LEDGER_ENTRY}(credit_account_id, created_at DESC);
  `]
};