import { String } from "../../../utils/Constant.js";

export const UserVerificationQueryManager = {
  createUserVerificationTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.USER_VERIFICATION_MODEL} (
      user_id UUID PRIMARY KEY REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      identity_verified BOOLEAN DEFAULT FALSE,
      identity_verified_at TIMESTAMPTZ,

      background_check_status VARCHAR(20),
      background_check_at TIMESTAMPTZ,

      documents JSONB,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  createUserVerificationTableQueryIndex:`
  -- Admin review queries
CREATE INDEX IF NOT EXISTS idx_user_verification_status
ON user_verifications (identity_verified);
`
};
