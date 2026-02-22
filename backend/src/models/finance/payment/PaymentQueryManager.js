import { String } from "../../../utils/Constant.js";

export const PaymentQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PAYMENT} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Linked ride
      ride_id UUID UNIQUE NOT NULL 
        REFERENCES ${String.RIDE_MODEL}(id) 
        ON DELETE CASCADE,
      
      -- Who is paying
      payer_id UUID NOT NULL 
        REFERENCES ${String.USER_MODEL}(id),
      
      -- Amount authorized (locked) before ride starts
      amount_authorized DECIMAL(10,2) NOT NULL CHECK (amount_authorized > 0),
      
      -- Amount captured after ride completes
      amount_captured DECIMAL(10,2) DEFAULT 0.00,
      
      -- Amount refunded if cancelled
      refunded_amount DECIMAL(10,2) DEFAULT 0.00,
      
      currency VARCHAR(3) DEFAULT 'NPR',
      
      -- Payment source (NO MIXED PAYMENTS)
      payment_source VARCHAR(30) NOT NULL CHECK (
        payment_source IN ('wallet', 'gateway', 'cash', 'gift', 'bnpl')
      ),
      
      -- Payment lifecycle status
      status VARCHAR(20) DEFAULT 'created' CHECK (
        status IN (
          'created',      -- Payment record created
          'authorized',   -- Funds locked in escrow (wallet/bnpl/gift/gateway)
          'completed',    -- Ride completed, funds captured
          'cancelled',    -- Ride cancelled before completion
          'refunded',     -- Funds returned to user
          'failed'        -- Payment failed
        )
      ),
      
      -- Settlement tracking (escrow → driver)
      is_settled BOOLEAN DEFAULT FALSE,
      settled_at TIMESTAMPTZ,
      
      -- Idempotency
      idempotency_key VARCHAR(255) UNIQUE,
      
      -- Timestamps
      authorized_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_payment_status 
    ON ${String.PAYMENT}(status);
    
    CREATE INDEX IF NOT EXISTS idx_payment_source 
    ON ${String.PAYMENT}(payment_source);
    
    CREATE INDEX IF NOT EXISTS idx_payment_payer 
    ON ${String.PAYMENT}(payer_id);
    
    CREATE INDEX IF NOT EXISTS idx_payment_ride 
    ON ${String.PAYMENT}(ride_id);
    
    CREATE INDEX IF NOT EXISTS idx_payment_settlement 
    ON ${String.PAYMENT}(is_settled) 
    WHERE is_settled = FALSE;
    
    CREATE INDEX IF NOT EXISTS idx_payment_created 
    ON ${String.PAYMENT}(created_at DESC);
  `],
  
  triggers: [`
    -- Update updated_at trigger
    CREATE OR REPLACE FUNCTION update_payment_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS payment_update_timestamp ON ${String.PAYMENT};
    CREATE TRIGGER payment_update_timestamp
    BEFORE UPDATE ON ${String.PAYMENT}
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_timestamp();
  `]
};