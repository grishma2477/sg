import { String } from "../../../utils/Constant.js";

export const PayoutBatchQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PAYOUT_BATCH} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Total amount in this batch
      total_amount DECIMAL(12,2) NOT NULL,
      
      -- Number of payout requests in this batch
      request_count INTEGER DEFAULT 0,
      
      -- Batch status
      status VARCHAR(20) DEFAULT 'created' CHECK (
        status IN ('created', 'processing', 'completed', 'failed')
      ),
      
      -- Who created/approved this batch
      created_by UUID 
        REFERENCES ${String.USER_MODEL}(id),
      
      -- Batch metadata
      notes TEXT,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_payout_batch_status 
    ON ${String.PAYOUT_BATCH}(status);
    
    CREATE INDEX IF NOT EXISTS idx_payout_batch_created 
    ON ${String.PAYOUT_BATCH}(created_at DESC);
  `]
};