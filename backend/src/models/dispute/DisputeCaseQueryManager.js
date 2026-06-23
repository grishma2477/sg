import { String } from "../../utils/Constant.js";

export const DisputeCaseQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.DISPUTE_CASE_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What is being disputed
  reference_type VARCHAR(30) NOT NULL CHECK (
    reference_type IN (
      'ride',
      'ride_payment',
      'settlement'
    )
  ),

  reference_id UUID NOT NULL,

  -- Who opened dispute
  opened_by UUID NOT NULL
  REFERENCES ${String.USER_MODEL}(id),

  -- Opposing party
  against_user_id UUID
  REFERENCES ${String.USER_MODEL}(id),

  dispute_type VARCHAR(40) CHECK (
    dispute_type IN (
      'fare_issue',
      'driver_behavior',
      'rider_behavior',
      'payment_issue',
      'payout_issue',
      'fraud',
      'other'
    )
  ),

  description TEXT,

  status VARCHAR(20) DEFAULT 'open' CHECK (
    status IN (
      'open',
      'under_review',
      'resolved',
      'rejected'
    )
  ),

  priority VARCHAR(10) DEFAULT 'normal' CHECK (
    priority IN (
      'low',
      'normal',
      'high'
    )
  ),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ

);

`,

`

CREATE INDEX IF NOT EXISTS idx_dispute_reference
ON ${String.DISPUTE_CASE_MODEL}(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_dispute_opened_by
ON ${String.DISPUTE_CASE_MODEL}(opened_by);

CREATE INDEX IF NOT EXISTS idx_dispute_status
ON ${String.DISPUTE_CASE_MODEL}(status);

`

]

};