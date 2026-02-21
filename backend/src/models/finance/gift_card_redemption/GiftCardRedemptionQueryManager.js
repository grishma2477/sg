import { String } from "../../../utils/Constant.js";

export const GiftCardRedemptionQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.GIFT_CARD_REDEMPTION} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      ride_id UUID REFERENCES ${String.RIDE_MODEL}(id),
      
      -- Amount used
      amount_used DECIMAL(10,2) NOT NULL CHECK (amount_used > 0),
      balance_before DECIMAL(10,2) NOT NULL,
      balance_after DECIMAL(10,2) NOT NULL,
      
      -- Type
      redemption_type VARCHAR(20) DEFAULT 'ride_payment' CHECK (
        redemption_type IN ('ride_payment', 'wallet_topup')
      ),
      
      redeemed_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_gc_redemption_card 
    ON gift_card_redemptions(gift_card_id);
    
    CREATE INDEX IF NOT EXISTS idx_gc_redemption_user 
    ON gift_card_redemptions(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_gc_redemption_ride 
    ON gift_card_redemptions(ride_id);
    
    CREATE INDEX IF NOT EXISTS idx_gc_redemption_date 
    ON gift_card_redemptions(redeemed_at DESC);
  `]
};