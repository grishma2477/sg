import { String } from "../../../utils/Constant.js";

export const UserProfileQueryManager = {
  createUserProfileTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.USER_PROFILE_MODEL} (
      user_id UUID PRIMARY KEY REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      profile_photo_url TEXT,

      date_of_birth DATE,
      gender VARCHAR(20),

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
};
