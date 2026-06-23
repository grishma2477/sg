import { String } from "../../utils/Constant.js";



export const IdempotencyKeyQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.IDEMPOTENCY_KEY} (

      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      key VARCHAR(255) NOT NULL,

      method VARCHAR(10) NOT NULL,
      path TEXT NOT NULL,

      request_hash TEXT,

      response JSONB,

      created_at TIMESTAMPTZ DEFAULT NOW()

    );
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS unique_idempotency_key
    ON ${String.IDEMPOTENCY_KEY}(key, method, path);

    CREATE INDEX IF NOT EXISTS idx_idempotency_created
    ON ${String.IDEMPOTENCY_KEY}(created_at DESC);
  `
  ]
};