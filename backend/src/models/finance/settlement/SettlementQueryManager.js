import { String } from "../../../utils/Constant.js";


export const SettlementQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.SETTLEMENT} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Link to payment
      payment_id UUID NOT NULL 
        REFERENCES ${String.PAYMENT}(id) 
        ON DELETE CASCADE,
      
      -- Driver receiving funds
      driver_id UUID NOT NULL 
        REFERENCES ${String.USER_MODEL}(id),
      
      -- Amount settled to driver (after platform commission)
      amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
      
      -- Platform commission deducted
      platform_commission DECIMAL(10,2) DEFAULT 0.00,
      
      -- Settlement status
      status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'failed')
      ),
      
      -- Failure tracking
      failure_reason TEXT,
      retry_count INTEGER DEFAULT 0,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_settlement_payment 
    ON ${String.SETTLEMENT}(payment_id);
    
    CREATE INDEX IF NOT EXISTS idx_settlement_driver 
    ON ${String.SETTLEMENT}(driver_id);
    
    CREATE INDEX IF NOT EXISTS idx_settlement_status 
    ON ${String.SETTLEMENT}(status);
    
    CREATE INDEX IF NOT EXISTS idx_settlement_pending 
    ON ${String.SETTLEMENT}(created_at DESC) 
    WHERE status = 'pending';
  `]
};