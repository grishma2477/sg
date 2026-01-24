import { String } from "../../../utils/Constant.js";

export const UserProfileQueryManager = {
  schema:[ `
    CREATE TABLE IF NOT EXISTS ${String.USER_PROFILE_MODEL} (
      user_id UUID PRIMARY KEY REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,

      is_kyc_verified BOOLEAN DEFAULT FALSE,
      kyc_verified_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
  ]
};
