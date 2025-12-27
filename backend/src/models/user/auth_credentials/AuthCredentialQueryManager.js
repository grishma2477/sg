import { String } from "../../../utils/Constant.js";

export const AuthCredentialQueryManager = {
  createAuthCredentialTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.AUTH_CREDENTIAL_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password_hash TEXT,

      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,

      last_login_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createAuthCredentialTableQueryIndex:`
  -- Login speed
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_email
ON auth_credentials (email)
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_phone
ON auth_credentials (phone)
WHERE phone IS NOT NULL;

-- Join with users
CREATE INDEX IF NOT EXISTS idx_auth_user
ON auth_credentials (user_id);

  
  `






};
