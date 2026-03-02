import { String } from "../../../utils/Constant.js";

export const FinancialPointAccountQueryManager = {
  schema: [`

    CREATE TABLE IF NOT EXISTS ${String.FINANCIAL_POINT_ACCOUNT}  (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      user_id UUID UNIQUE NOT NULL
        REFERENCES ${String.USER_MODEL}(id)
        ON DELETE CASCADE,

      total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
      locked_points INTEGER NOT NULL DEFAULT 0 CHECK (locked_points >= 0),

      lifetime_earned INTEGER DEFAULT 0 CHECK (lifetime_earned >= 0),
      lifetime_redeemed INTEGER DEFAULT 0 CHECK (lifetime_redeemed >= 0),
      lifetime_expired INTEGER DEFAULT 0 CHECK (lifetime_expired >= 0),

      tier VARCHAR(20) DEFAULT 'standard' CHECK (
        tier IN ('standard', 'silver', 'gold', 'platinum')
      ),

      risk_score INTEGER DEFAULT 0,

      last_activity_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      CHECK (locked_points <= total_points)
    );

  `,
  `
    CREATE INDEX IF NOT EXISTS idx_fp_account_user
    ON ${String.FINANCIAL_POINT_ACCOUNT}(user_id);

    CREATE INDEX IF NOT EXISTS idx_fp_account_tier
    ON ${String.FINANCIAL_POINT_ACCOUNT}(tier);
  `],

  triggers: [`

    CREATE OR REPLACE FUNCTION update_fp_account_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS fp_account_update_timestamp
    ON ${String.FINANCIAL_POINT_ACCOUNT};

    CREATE TRIGGER fp_account_update_timestamp
    BEFORE UPDATE ON ${String.FINANCIAL_POINT_ACCOUNT}
    FOR EACH ROW
    EXECUTE FUNCTION update_fp_account_timestamp();

  `]
};