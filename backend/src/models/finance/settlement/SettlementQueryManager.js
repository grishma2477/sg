// import { String } from "../../../utils/Constant.js";


// export const SettlementQueryManager = {
//   schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.SETTLEMENT} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
//       -- Link to payment
//       payment_id UUID NOT NULL 
//         REFERENCES ${String.PAYMENT}(id) 
//         ON DELETE CASCADE,
      
//       -- Driver receiving funds
//       driver_id UUID NOT NULL 
//         REFERENCES ${String.USER_MODEL}(id),
      
//       -- Amount settled to driver (after platform commission)
//       amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
      
//       -- Platform commission deducted
//       platform_commission DECIMAL(10,2) DEFAULT 0.00,
      
//       -- Settlement status
//       status VARCHAR(20) DEFAULT 'pending' CHECK (
//         status IN ('pending', 'completed', 'failed')
//       ),
      
//       -- Failure tracking
//       failure_reason TEXT,
//       retry_count INTEGER DEFAULT 0,
      
//       created_at TIMESTAMPTZ DEFAULT NOW(),
//       completed_at TIMESTAMPTZ
//     );
//   `,
//   `
//     -- Indexes
//     CREATE INDEX IF NOT EXISTS idx_settlement_payment 
//     ON ${String.SETTLEMENT}(payment_id);
    
//     CREATE INDEX IF NOT EXISTS idx_settlement_driver 
//     ON ${String.SETTLEMENT}(driver_id);
    
//     CREATE INDEX IF NOT EXISTS idx_settlement_status 
//     ON ${String.SETTLEMENT}(status);
    
//     CREATE INDEX IF NOT EXISTS idx_settlement_pending 
//     ON ${String.SETTLEMENT}(created_at DESC) 
//     WHERE status = 'pending';
//   `]
// };




import { String } from "../../../utils/Constant.js";

export const SettlementQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.SETTLEMENT} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to ride payment
  payment_id UUID UNIQUE NOT NULL
  REFERENCES ${String.RIDE_PAYMENT_MODEL}(id)
  ON DELETE CASCADE,

  -- Driver receiving payout
  driver_id UUID NOT NULL
  REFERENCES ${String.DRIVER_MODEL}(id),

  -- Settlement amounts
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  platform_commission DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,

  currency VARCHAR(3) DEFAULT 'NPR',

  -- Ledger reference (important for audit)
  settlement_ledger_entry UUID
  REFERENCES ${String.LEDGER_ENTRY}(id),  

  -- Payout status
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'processing',
      'completed',
      'failed',
      'reversed'
    )
  ),

  -- Retry / failure handling
  retry_count INTEGER DEFAULT 0,
  failure_reason TEXT,

  -- timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ

);

`,

`

CREATE INDEX IF NOT EXISTS idx_settlement_payment
ON ${String.SETTLEMENT}(payment_id);

CREATE INDEX IF NOT EXISTS idx_settlement_driver
ON ${String.SETTLEMENT}(driver_id);

CREATE INDEX IF NOT EXISTS idx_settlement_status
ON ${String.SETTLEMENT}(status);

CREATE INDEX IF NOT EXISTS idx_settlement_pending
ON ${String.SETTLEMENT}(created_at DESC)
WHERE status = 'pending';

`

]

};