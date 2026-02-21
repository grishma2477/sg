import { String } from "../../../utils/Constant.js";

export const TransactionQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.TRANSACTION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Transaction parties
      user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      related_user_id UUID REFERENCES ${String.USER_MODEL}(id),
      
      -- Transaction details
      type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit')),
      category VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
      currency VARCHAR(3) DEFAULT 'NPR',
      
      -- Balance tracking
      balance_before DECIMAL(10,2),
      balance_after DECIMAL(10,2),
      
      -- Status
      status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'reversed', 'cancelled')
      ),
      
      -- References
      ride_id UUID REFERENCES ${String.RIDE_MODEL}(id),
      reference_id TEXT,
      
      -- Payment details
      payment_method VARCHAR(50),
      payment_gateway VARCHAR(50),
      gateway_transaction_id TEXT,
      gateway_response JSONB,
      
      -- Metadata
      description TEXT,
      metadata JSONB,
      
      -- Idempotency
      idempotency_key VARCHAR(255) UNIQUE,
      
      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      failed_at TIMESTAMPTZ
    );
  `,
  `
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_transaction_user 
    ON ${String.TRANSACTION_MODEL}(user_id, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_transaction_ride 
    ON ${String.TRANSACTION_MODEL}(ride_id) 
    WHERE ride_id IS NOT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_transaction_status 
    ON ${String.TRANSACTION_MODEL}(status, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_transaction_category 
    ON ${String.TRANSACTION_MODEL}(category, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_transaction_idempotency 
    ON ${String.TRANSACTION_MODEL}(idempotency_key) 
    WHERE idempotency_key IS NOT NULL;
    
    -- Composite index for common queries
    CREATE INDEX IF NOT EXISTS idx_transaction_user_status_date 
    ON ${String.TRANSACTION_MODEL}(user_id, status, created_at DESC);
  `]
};