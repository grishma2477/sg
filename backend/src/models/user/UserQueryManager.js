import { String } from "../../utils/Constant.js";

export const UserQueryManager = {
  schema: [
    `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS ${String.USER_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
      status VARCHAR(20) NOT NULL CHECK (status IN ('active','inactive','suspended', 'banned', 'deleted')) DEFAULT 'inactive',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
    `
    CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);

    CREATE INDEX IF NOT EXISTS idx_users_status
    ON users (status);
  `
  ]
};