import { String } from "../../../utils/Constant";


export const PaymentAttemptQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PAYMENT_ATTEMPT} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Link to payment
      payment_id UUID NOT NULL 
        REFERENCES ${String.PAYMENT}(id) 
        ON DELETE CASCADE,
      
      -- Payment gateway used (eSewa, Khalti, etc.)
      provider_id UUID NOT NULL 
        REFERENCES ${String.PAYMENT_PROVIDER_MODEL}(id),
      
      -- Gateway's transaction ID
      gateway_transaction_id TEXT,
      
      -- Attempt status
      status VARCHAR(20) CHECK (
        status IN ('initiated', 'success', 'failed')
      ),
      
      -- Raw response from gateway (for debugging/reconciliation)
      gateway_response JSONB,
      
      -- Webhook verification
      webhook_verified BOOLEAN DEFAULT FALSE,
      webhook_received_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_payment_attempt_payment 
    ON ${String.PAYMENT_ATTEMPT}(payment_id);
    
    CREATE INDEX IF NOT EXISTS idx_payment_attempt_provider 
    ON ${String.PAYMENT_ATTEMPT}(provider_id);
    
    CREATE INDEX IF NOT EXISTS idx_payment_attempt_status 
    ON ${String.PAYMENT_ATTEMPT}(status);
    
    CREATE INDEX IF NOT EXISTS idx_payment_attempt_gateway_txn 
    ON ${String.PAYMENT_ATTEMPT}(gateway_transaction_id);
  `]
};