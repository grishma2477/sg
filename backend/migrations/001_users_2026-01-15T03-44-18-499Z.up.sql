CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
      status VARCHAR(20) DEFAULT 'active',
      is_verified BOOLEAN DEFAULT FALSE,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);

    CREATE INDEX IF NOT EXISTS idx_users_status
    ON users (status);