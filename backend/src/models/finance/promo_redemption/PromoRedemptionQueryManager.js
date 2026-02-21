import { String } from "../../../utils/Constant.js";

export const PromoRedemptionQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.PROMO_CODE_REDEMPTION} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      ride_id UUID NOT NULL REFERENCES ${String.RIDE_MODEL}(id),
      
      -- Discount applied
      original_amount DECIMAL(10,2) NOT NULL,
      discount_amount DECIMAL(10,2) NOT NULL,
      final_amount DECIMAL(10,2) NOT NULL,
      
      -- Status
      status VARCHAR(20) DEFAULT 'applied' CHECK (
        status IN ('applied', 'used', 'refunded')
      ),
      
      redeemed_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- One promo per ride
      UNIQUE(ride_id)
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_redemption_promo 
    ON promo_redemptions(promo_code_id);
    
    CREATE INDEX IF NOT EXISTS idx_redemption_user 
    ON promo_redemptions(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_redemption_ride 
    ON promo_redemptions(ride_id);
    
    CREATE INDEX IF NOT EXISTS idx_redemption_status 
    ON promo_redemptions(status, redeemed_at DESC);
  `]
};