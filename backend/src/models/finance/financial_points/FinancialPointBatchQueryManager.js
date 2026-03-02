import { String } from "../../../utils/Constant.js";


export const FinancialPointBatchQueryManager = {
  schema: [`

    CREATE TABLE IF NOT EXISTS ${String.FINANCIAL_POINT_BATCH} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      account_id UUID NOT NULL
        REFERENCES financial_point_accounts(id)
        ON DELETE CASCADE,

      user_id UUID NOT NULL
        REFERENCES ${String.USER_MODEL}(id)
        ON DELETE CASCADE,

      source VARCHAR(50) NOT NULL,
      -- ride_completion | bonus | referral | adjustment

      points_earned INTEGER NOT NULL CHECK (points_earned > 0),
      points_remaining INTEGER NOT NULL CHECK (points_remaining >= 0),

      expiry_date TIMESTAMPTZ NOT NULL,

      status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'expired', 'fully_redeemed')
      ),

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      CHECK (points_remaining <= points_earned)
    );

  `,
  `
    CREATE INDEX IF NOT EXISTS idx_fp_batch_user
    ON ${String.FINANCIAL_POINT_BATCH}(user_id);

    CREATE INDEX IF NOT EXISTS idx_fp_batch_expiry
    ON ${String.FINANCIAL_POINT_BATCH}(expiry_date);

    CREATE INDEX IF NOT EXISTS idx_fp_batch_status
    ON ${String.FINANCIAL_POINT_BATCH}(status);
  `],

  triggers: [`

    CREATE OR REPLACE FUNCTION update_fp_batch_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS fp_batch_update_timestamp
    ON ${String.FINANCIAL_POINT_BATCH};

    CREATE TRIGGER fp_batch_update_timestamp
    BEFORE UPDATE ON ${String.FINANCIAL_POINT_BATCH}
    FOR EACH ROW
    EXECUTE FUNCTION update_fp_batch_timestamp();

  `]
};