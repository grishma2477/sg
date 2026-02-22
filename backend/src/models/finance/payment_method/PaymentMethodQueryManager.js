import { String } from "../../../utils/Constant.js";

export const PaymentMethodQueryManager = {
  schema: [

    // =====================================================
    // PAYMENT METHODS (User Level)
    // =====================================================
    `
    CREATE TABLE IF NOT EXISTS ${String.PAYMENT_METHOD_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      -- Ownership
      user_id UUID NOT NULL
        REFERENCES ${String.USER_MODEL}(id)
        ON DELETE CASCADE,

      provider_id UUID NOT NULL
        REFERENCES ${String.PAYMENT_PROVIDER_MODEL}(id),

      -- Gateway token (never store password/pin)
      provider_token TEXT NOT NULL,

      -- Gateway customer reference
      provider_customer_id TEXT,

      -- Masked identifier (e.g., 98******21)
      account_identifier VARCHAR(100),

      -- Verification lifecycle
      verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'failed', 'expired')
      ),

      verified_at TIMESTAMPTZ,

      -- Flags
      is_default BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      is_deleted BOOLEAN DEFAULT FALSE,

      last_used_at TIMESTAMPTZ,

      -- Webhook tracking
      webhook_event_id TEXT,
      webhook_verified BOOLEAN DEFAULT FALSE,

      -- Flexible provider-specific data
      metadata JSONB,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,

    // =====================================================
    // INDEXES
    // =====================================================
    `
    -- Fast lookup by user
    CREATE INDEX IF NOT EXISTS idx_payment_method_user
    ON ${String.PAYMENT_METHOD_MODEL}(user_id);

    -- Lookup by provider
    CREATE INDEX IF NOT EXISTS idx_payment_method_provider
    ON ${String.PAYMENT_METHOD_MODEL}(provider_id);

    -- Active methods per user
    CREATE INDEX IF NOT EXISTS idx_payment_method_active
    ON ${String.PAYMENT_METHOD_MODEL}(user_id, is_active)
    WHERE is_active = TRUE AND is_deleted = FALSE;

    -- Verification filtering
    CREATE INDEX IF NOT EXISTS idx_payment_method_verification
    ON ${String.PAYMENT_METHOD_MODEL}(verification_status);

    -- Last used sorting
    CREATE INDEX IF NOT EXISTS idx_payment_method_last_used
    ON ${String.PAYMENT_METHOD_MODEL}(last_used_at DESC);

    -- Only one default method per user
    CREATE UNIQUE INDEX IF NOT EXISTS unique_default_payment_method
    ON ${String.PAYMENT_METHOD_MODEL}(user_id)
    WHERE is_default = TRUE AND is_deleted = FALSE;
    `
  ]
};