// import { String } from "../../../utils/Constant.js";

// export const PaymentHoldQueryManager = {
//   schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.PAYMENT_HOLD_MODEL} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
//       user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,
//       ride_id UUID NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,
      
//       amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
//       currency VARCHAR(3) DEFAULT 'NPR',
      
//       status VARCHAR(20) DEFAULT 'active' CHECK (
//         status IN ('active', 'captured', 'released', 'expired')
//       ),
      
//       reason VARCHAR(100) DEFAULT 'ride_payment',
//       description TEXT,
      
//       expires_at TIMESTAMPTZ NOT NULL,
//       captured_at TIMESTAMPTZ,
//       released_at TIMESTAMPTZ,
      
//       created_at TIMESTAMPTZ DEFAULT NOW(),
//       updated_at TIMESTAMPTZ DEFAULT NOW()
//     );
//   `,
//   `
//     -- Indexes
//     CREATE INDEX IF NOT EXISTS idx_hold_user 
//     ON payment_holds(user_id, status);
    
//     CREATE INDEX IF NOT EXISTS idx_hold_ride 
//     ON payment_holds(ride_id);
    
//     CREATE INDEX IF NOT EXISTS idx_hold_status 
//     ON payment_holds(status, expires_at);
    
//     CREATE INDEX IF NOT EXISTS idx_hold_expires 
//     ON payment_holds(expires_at) 
//     WHERE status = 'active';
//   `],
  
//   triggers: [`
//     -- Update updated_at trigger
//     CREATE OR REPLACE FUNCTION update_payment_hold_timestamp()
//     RETURNS TRIGGER AS $$
//     BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
//     END;
//     $$ LANGUAGE plpgsql;

//     DROP TRIGGER IF EXISTS payment_hold_update_timestamp ON payment_holds;
//     CREATE TRIGGER payment_hold_update_timestamp
//     BEFORE UPDATE ON payment_holds
//     FOR EACH ROW
//     EXECUTE FUNCTION update_payment_hold_timestamp();
//   `]
// };


import { String } from "../../../utils/Constant.js";

export const PaymentHoldQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.PAYMENT_HOLD_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who initiated hold
  user_id UUID NOT NULL
  REFERENCES ${String.USER_MODEL}(id)
  ON DELETE CASCADE,

  -- Ride request that triggered authorization
  ride_request_id UUID NOT NULL
  REFERENCES ${String.RIDE_REQUEST_MODEL}(id)
  ON DELETE CASCADE,

  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'NPR',

  -- Payment source
  payment_method VARCHAR(30) CHECK (
    payment_method IN (
      'wallet',
      'gateway',
      'gift',
      'bnpl'
    )
  ),

  -- Authorization lifecycle
  status VARCHAR(20) DEFAULT 'authorized' CHECK (
    status IN (
      'authorized',
      'captured',
      'released',
      'expired'
    )
  ),

  -- Ledger reference (important)
  authorization_ledger_entry UUID,

  reason VARCHAR(100) DEFAULT 'ride_payment',
  description TEXT,

  expires_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()

);

`,

`

CREATE INDEX IF NOT EXISTS idx_hold_user
ON payment_holds(user_id);

CREATE INDEX IF NOT EXISTS idx_hold_request
ON payment_holds(ride_request_id);

CREATE INDEX IF NOT EXISTS idx_hold_status
ON payment_holds(status);

CREATE INDEX IF NOT EXISTS idx_hold_expiry
ON payment_holds(expires_at)
WHERE status = 'authorized';

`

],

triggers: [

`
CREATE OR REPLACE FUNCTION update_payment_hold_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_hold_update_timestamp
ON payment_holds;

CREATE TRIGGER payment_hold_update_timestamp
BEFORE UPDATE ON payment_holds
FOR EACH ROW
EXECUTE FUNCTION update_payment_hold_timestamp();
`

]

};