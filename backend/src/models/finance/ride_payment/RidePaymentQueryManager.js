// import { String } from "../../../utils/Constant.js";

// export const RidePaymentQueryManager = {
//   schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.RIDE_PAYMENT_MODEL} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

//       ride_id UUID UNIQUE NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

//       -- Payment parties
//       payer_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
//       payee_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),

//       -- Amount breakdown
//       base_fare DECIMAL(10,2) NOT NULL CHECK (base_fare > 0),
//       platform_fee DECIMAL(10,2) DEFAULT 0.00,
//       discount_amount DECIMAL(10,2) DEFAULT 0.00,
//       total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),

//       -- Promo/discount tracking
//       promo_code_id UUID,
//       gift_card_id UUID,
//       reward_points_used INTEGER DEFAULT 0,

//       -- Payment details
//       payment_method VARCHAR(50) NOT NULL CHECK (
//         payment_method IN ('wallet', 'cash', 'card', 'bnpl', 'mixed')
//       ),
//       payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
//         payment_status IN ('pending', 'authorized', 'completed', 'failed', 'refunded', 'partially_refunded')
//       ),

//       -- Transaction references
//       transaction_id UUID REFERENCES ${String.TRANSACTION_MODEL}(id),
//       payment_hold_id UUID REFERENCES payment_holds(id),

//       -- BNPL tracking
//       is_bnpl BOOLEAN DEFAULT FALSE,
//       bnpl_plan_id UUID,

//       -- Timestamps
//       payment_initiated_at TIMESTAMPTZ DEFAULT NOW(),
//       payment_completed_at TIMESTAMPTZ,
//       created_at TIMESTAMPTZ DEFAULT NOW(),
//       updated_at TIMESTAMPTZ DEFAULT NOW()
//     );
//   `,
//   `
//     -- Indexes
//     CREATE INDEX IF NOT EXISTS idx_ride_payment_ride 
//     ON ride_payments(ride_id);

//     CREATE INDEX IF NOT EXISTS idx_ride_payment_payer 
//     ON ride_payments(payer_id);

//     CREATE INDEX IF NOT EXISTS idx_ride_payment_payee 
//     ON ride_payments(payee_id);

//     CREATE INDEX IF NOT EXISTS idx_ride_payment_status 
//     ON ride_payments(payment_status);

//     CREATE INDEX IF NOT EXISTS idx_ride_payment_method 
//     ON ride_payments(payment_method);

//     CREATE INDEX IF NOT EXISTS idx_ride_payment_bnpl 
//     ON ride_payments(is_bnpl) 
//     WHERE is_bnpl = TRUE;
//   `],

//   triggers: [`
//     -- Update updated_at trigger
//     CREATE OR REPLACE FUNCTION update_ride_payment_timestamp()
//     RETURNS TRIGGER AS $$
//     BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
//     END;
//     $$ LANGUAGE plpgsql;

//     DROP TRIGGER IF EXISTS ride_payment_update_timestamp ON ride_payments;
//     CREATE TRIGGER ride_payment_update_timestamp
//     BEFORE UPDATE ON ride_payments
//     FOR EACH ROW
//     EXECUTE FUNCTION update_ride_payment_timestamp();
//   `]
// };


import { String } from "../../../utils/Constant.js";

export const RidePaymentQueryManager = {

  schema: [`

CREATE TABLE IF NOT EXISTS ${String.RIDE_PAYMENT_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ride reference
  ride_id UUID UNIQUE NOT NULL
  REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

  -- Payment parties
  payer_id UUID NOT NULL
  REFERENCES ${String.USER_MODEL}(id),

  payee_id UUID NOT NULL
  REFERENCES ${String.USER_MODEL}(id),

  -- Fare breakdown
  base_fare DECIMAL(10,2) NOT NULL CHECK (base_fare >= 0),
  platform_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,

  total_amount DECIMAL(10,2) NOT NULL CHECK (
  total_amount >= 0 AND
  total_amount = base_fare + tax_amount + platform_fee - discount_amount
),

  currency VARCHAR(3) DEFAULT 'NPR',

  -- Discounts / rewards
  promo_code_id UUID,
  gift_card_id UUID,
  reward_points_used INTEGER DEFAULT 0,

  -- Payment method
  payment_method VARCHAR(30) NOT NULL CHECK (
    payment_method IN (
      'wallet',
      'cash',
      'gateway',
      'bnpl',
      'gift',
      'mixed'
    )
  ),

  -- Escrow lifecycle
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (
    payment_status IN (
      'pending',
      'authorized',
      'escrowed',
      'settled',
      'cancelled',
      'refunded',
      'disputed'
    )
  ),

-- Ledger references
authorization_ledger_entry UUID
REFERENCES ${String.LEDGER_ENTRY}(id),

settlement_ledger_entry UUID
REFERENCES ${String.LEDGER_ENTRY}(id),

refund_ledger_entry UUID
REFERENCES ${String.LEDGER_ENTRY}(id),
  -- BNPL
  is_bnpl BOOLEAN DEFAULT FALSE,
  bnpl_plan_id UUID,

  -- timestamps
  payment_initiated_at TIMESTAMPTZ DEFAULT NOW(),
  payment_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()

);

`,

    `
CREATE INDEX IF NOT EXISTS idx_ride_payment_ride
ON ride_payments(ride_id);

CREATE INDEX IF NOT EXISTS idx_ride_payment_payer
ON ride_payments(payer_id);

CREATE INDEX IF NOT EXISTS idx_ride_payment_payee
ON ride_payments(payee_id);

CREATE INDEX IF NOT EXISTS idx_ride_payment_status
ON ride_payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_ride_payment_method
ON ride_payments(payment_method);

CREATE INDEX IF NOT EXISTS idx_ride_payment_bnpl
ON ride_payments(is_bnpl)
WHERE is_bnpl = TRUE;

`
  ],

  triggers: [

    `
CREATE OR REPLACE FUNCTION update_ride_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ride_payment_update_timestamp
ON ride_payments;

CREATE TRIGGER ride_payment_update_timestamp
BEFORE UPDATE ON ride_payments
FOR EACH ROW
EXECUTE FUNCTION update_ride_payment_timestamp();
`

  ]

};