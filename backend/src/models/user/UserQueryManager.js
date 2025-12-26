import { String } from "../../utils/Constant.js";

export const UserQueryManager = {
    createUserTableQuery: `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS ${String.USER_MODEL} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        role VARCHAR(20) CHECK (role IN ('RIDER', 'DRIVER', 'ADMIN')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  };