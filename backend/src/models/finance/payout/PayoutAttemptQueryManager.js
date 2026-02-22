import { String } from "../../../utils/Constant";


export const PayoutAttemptQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PAYOUT_ATTEMPT} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Link to payout request
      payout_request_id UUID NOT NULL 
        REFERENCES ${String.PAYOUT_REQUEST}(id) 
        ON DELETE CASCADE,
      
      -- Link to batch (if part of batch)
      batch_id UUID 
        REFERENCES ${String.PAYOUT_BATCH}(id),
      
      -- Bank/payment reference
      bank_reference TEXT,
      provider_transaction_id TEXT,
      
      -- Attempt status
      status VARCHAR(20) CHECK (
        status IN ('initiated', 'success', 'failed')
      ),
      
      -- Failure details
      failure_reason TEXT,
      provider_response JSONB,
      
      attempted_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_payout_attempt_request 
    ON ${String.PAYOUT_ATTEMPT}(payout_request_id);
    
    CREATE INDEX IF NOT EXISTS idx_payout_attempt_batch 
    ON ${String.PAYOUT_ATTEMPT}(batch_id);
    
    CREATE INDEX IF NOT EXISTS idx_payout_attempt_status 
    ON ${String.PAYOUT_ATTEMPT}(status);
  `]
};