import { String } from "../../../utils/Constant.js";

export const KYCQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.KYC_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth DATE NOT NULL,
      address TEXT NOT NULL,
      profile_url TEXT NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      
      gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'others')) NOT NULL,
      national_identity_number VARCHAR(50) UNIQUE NOT NULL,
      blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      CONSTRAINT unique_user_kyc UNIQUE (user_id)
    );
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON ${String.KYC_MODEL}(user_id);
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_kyc_nin ON ${String.KYC_MODEL}(national_identity_number);
    `,
   
  
  ]
};