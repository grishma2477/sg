import { String } from "../../../../utils/Constant.js";

export const PaymentProviderQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.PAYMENT_PROVIDER_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      name VARCHAR(50) NOT NULL UNIQUE,
      type VARCHAR(30) NOT NULL CHECK (
        type IN ('WALLET', 'BANK', 'CARD', 'GATEWAY')
      ),

      is_active BOOLEAN DEFAULT TRUE,

      -- Optional config for gateway (API keys, webhook URLs etc.)
      config JSONB,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,


    `
    CREATE INDEX IF NOT EXISTS idx_payment_provider_active
    ON ${String.PAYMENT_PROVIDER_MODEL}(is_active);

    CREATE INDEX IF NOT EXISTS idx_payment_provider_type
    ON ${String.PAYMENT_PROVIDER_MODEL}(type);

    CREATE INDEX IF NOT EXISTS idx_payment_provider_name
    ON ${String.PAYMENT_PROVIDER_MODEL}(name);
    `
  ]
};