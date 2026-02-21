import { String } from "../../../utils/Constant.js";

export const PromoCodeQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PROMO_CODES} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      
      -- Discount details
      discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
      discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
      max_discount_amount DECIMAL(10,2),
      
      -- Conditions
      min_ride_amount DECIMAL(10,2) DEFAULT 0,
      
      -- Usage limits
      total_usage_limit INTEGER,
      usage_per_user_limit INTEGER DEFAULT 1,
      current_usage_count INTEGER DEFAULT 0,
      
      -- Validity
      valid_from TIMESTAMPTZ DEFAULT NOW(),
      valid_until TIMESTAMPTZ,
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Metadata
      created_by UUID REFERENCES ${String.USER_MODEL}(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_code 
    ON promo_codes(UPPER(code));
    
    CREATE INDEX IF NOT EXISTS idx_promo_active 
    ON promo_codes(is_active, valid_until) 
    WHERE is_active = TRUE;
    
    CREATE INDEX IF NOT EXISTS idx_promo_created_by 
    ON promo_codes(created_by);
  `],
  
  triggers: [`
    -- Update updated_at
    CREATE OR REPLACE FUNCTION update_promo_code_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS promo_code_update_timestamp ON promo_codes;
    CREATE TRIGGER promo_code_update_timestamp
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_promo_code_timestamp();
  `]
};