import { String } from "../../../../utils/Constant.js";

export const PendingGiftCardQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.PENDING_GIFT_CARD_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      user_id UUID NOT NULL
        REFERENCES ${String.USER_MODEL}(id)
        ON DELETE CASCADE,

      payment_provider_id UUID NOT NULL
        REFERENCES ${String.PAYMENT_PROVIDER_MODEL}(id),

      payment_method_id UUID NOT NULL
        REFERENCES ${String.PAYMENT_METHOD_MODEL}(id),

      amount NUMERIC(12,2) NOT NULL,
      message TEXT,
      validity_days INT DEFAULT 365,

      payment_reference TEXT UNIQUE, -- eSewa/Khalti transaction id
      idempotency_key TEXT UNIQUE,

      status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending','completed','failed','expired')
      ),

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_pending_gc_user
    ON ${String.PENDING_GIFT_CARD_MODEL}(user_id);

    CREATE INDEX IF NOT EXISTS idx_pending_gc_status
    ON ${String.PENDING_GIFT_CARD_MODEL}(status);
    `
  ]
};