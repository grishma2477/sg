CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
      status VARCHAR(20) NOT NULL CHECK (status IN ('active','inactive','suspended', 'banned', 'deleted')) DEFAULT 'inactive',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);
    CREATE INDEX IF NOT EXISTS idx_users_status
    ON users (status);
SELECT * FROM users

UPDATE users 
SET role = 'admin' 
WHERE id = '803f9c0f-7b29-4b4f-b8bd-55f970b9bc7d';