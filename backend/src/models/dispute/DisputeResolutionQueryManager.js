import { String } from "../../utils/Constant.js";

export const DisputeResolutionQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.DISPUTE_RESOLUTION_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  dispute_id UUID NOT NULL
  REFERENCES ${String.DISPUTE_CASE_MODEL}(id)
  ON DELETE CASCADE,

  resolved_by UUID NOT NULL,

  resolution_type VARCHAR(30) CHECK (
    resolution_type IN (
      'refund_rider',
      'pay_driver',
      'partial_refund',
      'reject_dispute'
    )
  ),

  resolution_notes TEXT,

  ledger_reversal_entry UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()

);

`,

`

CREATE INDEX IF NOT EXISTS idx_dispute_resolution
ON ${String.DISPUTE_RESOLUTION_MODEL}(dispute_id);

`

]

};