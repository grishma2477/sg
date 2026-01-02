// import { String } from "../../utils/Constant.js";

// export const UserQueryManager = {
//   createUserTableQuery: `
//     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
//       CREATE TABLE IF NOT EXISTS ${String.USER_MODEL} (
//        id UUID PRIMARY KEY,

//        role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
//        status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned

//        created_at TIMESTAMPTZ DEFAULT NOW(),
//        updated_at TIMESTAMPTZ DEFAULT NOW()
//       );
//     `,

//   createUserTableQueryIndex: `
//     -- Fast role-based filtering (admin, driver, rider)
//     CREATE INDEX IF NOT EXISTS idx_users_role
//     ON users (role);

//     -- Fast status checks (active/suspended)
//     CREATE INDEX IF NOT EXISTS idx_users_status
//     ON users (status);
//     `


// };


import { String } from "../../utils/Constant.js";

export const UserQueryManager = {
  createUserTableQuery: `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS ${String.USER_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      role VARCHAR(20) NOT NULL CHECK (role IN ('rider','driver','admin')),
      status VARCHAR(20) DEFAULT 'active',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createUserTableQueryIndex: `
    CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);

    CREATE INDEX IF NOT EXISTS idx_users_status
    ON users (status);
  `
};