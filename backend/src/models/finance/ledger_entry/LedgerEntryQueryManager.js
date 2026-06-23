// import { String } from "../../../utils/Constant.js";

// export const LedgerEntryQueryManager = {
//   schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.LEDGER_ENTRY} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
//       -- Double-entry accounting: every transaction has debit and credit
//       debit_account_id UUID NOT NULL REFERENCES ${String.LEDGER_ACCOUNT}(id),
//       credit_account_id UUID NOT NULL REFERENCES ${String.LEDGER_ACCOUNT}(id),

//       -- Prevent transferring money to the same account
//       CONSTRAINT no_self_transfer CHECK (debit_account_id <> credit_account_id),

//       amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
//       currency VARCHAR(3) DEFAULT 'NPR',
      
//       -- What caused this entry
//       reference_type VARCHAR(30) CHECK (
//         reference_type IN (
//           'ride_authorization',    -- Funds locked for ride
//           'ride_completion',       -- Ride payment completed
//           'ride_cancellation',     -- Ride cancelled, refund
//           'settlement',            -- Escrow → driver
//           'commission',            -- Platform commission
//           'payout',                -- Driver withdrawal
//           'bnpl_charge',           -- BNPL used
//           'bnpl_repayment',        -- BNPL repaid
//           'gift_card_use',         -- Gift card used
//           'gateway_settlement',    -- Gateway cleared
//           'reversal'               -- Reverse incorrect ledger entry
//         )
//       ),
      
//       -- Reference to entity (ride_id, payment_id, payout_id, etc.)
//       reference_id UUID,

//       description TEXT,
      
//       created_at TIMESTAMPTZ DEFAULT NOW()
//     );
//   `,
//   `
//     -- ============================================================
//     -- PERFORMANCE INDEXES
//     -- ============================================================

//     CREATE INDEX IF NOT EXISTS idx_ledger_entry_debit 
//     ON ${String.LEDGER_ENTRY}(debit_account_id);
    
//     CREATE INDEX IF NOT EXISTS idx_ledger_entry_credit 
//     ON ${String.LEDGER_ENTRY}(credit_account_id);
    
//     CREATE INDEX IF NOT EXISTS idx_ledger_entry_reference 
//     ON ${String.LEDGER_ENTRY}(reference_type, reference_id);

//     CREATE INDEX IF NOT EXISTS idx_ledger_entry_date 
//     ON ${String.LEDGER_ENTRY}(created_at DESC);

//     CREATE INDEX IF NOT EXISTS idx_ledger_entry_account_date 
//     ON ${String.LEDGER_ENTRY}(debit_account_id, created_at DESC);
    
//     CREATE INDEX IF NOT EXISTS idx_ledger_entry_account_credit_date 
//     ON ${String.LEDGER_ENTRY}(credit_account_id, created_at DESC);


//     -- ============================================================
//     -- FINANCIAL SAFETY CONSTRAINTS (CRITICAL)
//     -- Prevent duplicate ledger entries
//     -- ============================================================

//     -- Prevent duplicate ride authorization
//     CREATE UNIQUE INDEX IF NOT EXISTS uniq_ride_authorization
//     ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
//     WHERE reference_type = 'ride_authorization';

//     -- Prevent duplicate ride settlement
//     CREATE UNIQUE INDEX IF NOT EXISTS uniq_ride_settlement
//     ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
//     WHERE reference_type = 'settlement';

//     -- Prevent duplicate ride refund
//     CREATE UNIQUE INDEX IF NOT EXISTS uniq_ride_refund
//     ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
//     WHERE reference_type = 'ride_cancellation';

//   `]
// };


import { String } from "../../../utils/Constant.js";

export const LedgerEntryQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.LEDGER_ENTRY} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Double-entry accounting
      debit_account_id UUID NOT NULL 
        REFERENCES ${String.LEDGER_ACCOUNT}(id),

      credit_account_id UUID NOT NULL 
        REFERENCES ${String.LEDGER_ACCOUNT}(id),

      -- Prevent transferring to the same account
      CONSTRAINT no_self_transfer 
      CHECK (debit_account_id <> credit_account_id),

      amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),

      currency VARCHAR(3) DEFAULT 'NPR',

      -- Financial event type
      reference_type VARCHAR(30) CHECK (
        reference_type IN (
          'ride_authorization',    -- Funds locked for ride
          'ride_completion',       -- Ride completed
          'ride_cancellation',     -- Ride cancelled → refund
          'settlement',            -- Escrow → driver
          'commission',            -- Platform revenue
          'payout',                -- Driver withdrawal
          'bnpl_charge',           -- BNPL usage
          'bnpl_repayment',        -- BNPL repayment
          'gift_card_use',         -- Gift card payment
          'gateway_settlement',    -- Payment gateway settlement
          'reversal'               -- Ledger correction
        )
      ),

      -- Every ledger entry MUST reference something
      reference_id UUID NOT NULL,

      description TEXT,

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- ============================================================
    -- PERFORMANCE INDEXES
    -- ============================================================

    CREATE INDEX IF NOT EXISTS idx_ledger_entry_debit
    ON ${String.LEDGER_ENTRY}(debit_account_id);

    CREATE INDEX IF NOT EXISTS idx_ledger_entry_credit
    ON ${String.LEDGER_ENTRY}(credit_account_id);

    CREATE INDEX IF NOT EXISTS idx_ledger_entry_reference
    ON ${String.LEDGER_ENTRY}(reference_type, reference_id);

    CREATE INDEX IF NOT EXISTS idx_ledger_entry_date
    ON ${String.LEDGER_ENTRY}(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_ledger_entry_account_date
    ON ${String.LEDGER_ENTRY}(debit_account_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_ledger_entry_account_credit_date
    ON ${String.LEDGER_ENTRY}(credit_account_id, created_at DESC);


    -- ============================================================
    -- FINANCIAL SAFETY CONSTRAINTS
    -- Prevent duplicate financial events
    -- ============================================================

    -- Prevent duplicate ride authorization
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_ride_authorization
    ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
    WHERE reference_type = 'ride_authorization';

    -- Prevent duplicate ride settlement
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_ride_settlement
    ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
    WHERE reference_type = 'settlement';

    -- Prevent duplicate ride refund
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_ride_refund
    ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
    WHERE reference_type = 'ride_cancellation';

    -- Prevent duplicate driver payout
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_driver_payout
    ON ${String.LEDGER_ENTRY}(reference_type, reference_id)
    WHERE reference_type = 'payout';
  `]
};