import { String } from "../../utils/Constant.js";

export const DisputeEvidenceQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.DISPUTE_EVIDENCE_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  dispute_id UUID NOT NULL
  REFERENCES ${String.DISPUTE_CASE_MODEL}(id)
  ON DELETE CASCADE,

  uploaded_by UUID NOT NULL,

  file_url TEXT NOT NULL,

  file_type VARCHAR(20),

  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()

);

`,

`

CREATE INDEX IF NOT EXISTS idx_dispute_evidence
ON ${String.DISPUTE_EVIDENCE_MODEL}(dispute_id);

`

]

};