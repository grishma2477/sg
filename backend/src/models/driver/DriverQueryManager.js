import { String } from "../../utils/Constant.js";

export const UserQueryManager = {
    createUserTableQuery: `
      CREATE TABLE ${String.DRIVER_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${String.USER_MODEL}(id),
      license_number VARCHAR(50),
      is_verified BOOLEAN DEFAULT FALSE,
      is_online BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
      );
    `
  };

  