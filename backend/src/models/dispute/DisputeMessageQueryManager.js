import { String } from "../../utils/Constant.js";

export const DisputeMessageQueryManager = {

schema: [`

CREATE TABLE IF NOT EXISTS ${String.DISPUTE_MESSAGE_MODEL} (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  dispute_id UUID NOT NULL
  REFERENCES ${String.DISPUTE_CASE_MODEL}(id)
  ON DELETE CASCADE,

  sender_id UUID NOT NULL,

  message TEXT NOT NULL,

  is_admin BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()

);

`,

`

CREATE INDEX IF NOT EXISTS idx_dispute_message_dispute
ON ${String.DISPUTE_MESSAGE_MODEL}(dispute_id);

`

]

};