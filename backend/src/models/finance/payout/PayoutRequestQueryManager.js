import { String } from "../../../utils/Constant";

export const PayoutRequestQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PAYOUT_REQUEST} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Driver requesting payout
      driver_id UUID NOT NULL 
        REFERENCES ${String.USER_MODEL}(id),
      
      -- Amount requested
      amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
      
      -- Payout destination (bank account details stored in payment_methods)
      payout_method_id UUID 
        REFERENCES ${String.PAYMENT_METHOD_MODEL}(id),
      
      -- Request status
      status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
          'pending',      -- Waiting admin review
          'approved',     -- Approved, waiting batch
          'processing',   -- Included in payout batch
          'completed',    -- Money sent successfully
          'failed',       -- Transfer failed
          'rejected'      -- Rejected by admin
        )
      ),
      
      -- Admin review
      reviewed_by UUID 
        REFERENCES ${String.USER_MODEL}(id),
      review_notes TEXT,
      
      -- Failure tracking
      failure_reason TEXT,
      retry_count INTEGER DEFAULT 0,
      next_retry_at TIMESTAMPTZ,
      
      -- Timestamps
      requested_at TIMESTAMPTZ DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_payout_request_driver 
    ON ${String.PAYOUT_REQUEST}(driver_id);
    
    CREATE INDEX IF NOT EXISTS idx_payout_request_status 
    ON ${String.PAYOUT_REQUEST}(status);
    
    CREATE INDEX IF NOT EXISTS idx_payout_request_pending 
    ON ${String.PAYOUT_REQUEST}(requested_at DESC) 
    WHERE status = 'pending';
    
    CREATE INDEX IF NOT EXISTS idx_payout_request_retry 
    ON ${String.PAYOUT_REQUEST}(next_retry_at) 
    WHERE status = 'failed' AND next_retry_at IS NOT NULL;
  `],
  
  triggers: [`
    CREATE OR REPLACE FUNCTION update_payout_request_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS payout_request_update_timestamp ON ${String.PAYOUT_REQUEST};
    CREATE TRIGGER payout_request_update_timestamp
    BEFORE UPDATE ON ${String.PAYOUT_REQUEST}
    FOR EACH ROW
    EXECUTE FUNCTION update_payout_request_timestamp();
  `]
};