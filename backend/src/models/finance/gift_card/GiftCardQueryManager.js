import { String } from "../../../utils/Constant.js";

export const GiftCardQueryManager = {
  schema: [`
CREATE TABLE IF NOT EXISTS ${String.GIFT_CARD_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      code VARCHAR(50) UNIQUE NOT NULL,
      
      -- Owner tracking
      purchased_by UUID REFERENCES ${String.USER_MODEL}(id),
      current_owner_id UUID REFERENCES ${String.USER_MODEL}(id),
      
      -- Balance
      initial_balance DECIMAL(10,2) NOT NULL CHECK (initial_balance > 0),
      current_balance DECIMAL(10,2) NOT NULL CHECK (current_balance >= 0),
      currency VARCHAR(3) DEFAULT 'NPR',
      
      -- Status
      status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'redeemed', 'expired', 'cancelled')
      ),
      
      -- Validity
      valid_from TIMESTAMPTZ DEFAULT NOW(),
      valid_until TIMESTAMPTZ,
      
      -- Metadata
      message TEXT,
      
      purchased_at TIMESTAMPTZ DEFAULT NOW(),
      first_redeemed_at TIMESTAMPTZ,
      fully_redeemed_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
    -- Indexes
    CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_card_code 
    ON gift_cards(UPPER(code));
    
    CREATE INDEX IF NOT EXISTS idx_gift_card_owner 
    ON gift_cards(current_owner_id);
    
    CREATE INDEX IF NOT EXISTS idx_gift_card_purchased_by 
    ON gift_cards(purchased_by);
    
    CREATE INDEX IF NOT EXISTS idx_gift_card_status 
    ON gift_cards(status, valid_until);
  `],
  
  triggers: [`
    -- Update updated_at
    CREATE OR REPLACE FUNCTION update_gift_card_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      
      -- Update status based on balance
      IF NEW.current_balance = 0 AND OLD.current_balance > 0 THEN
        NEW.status = 'redeemed';
        NEW.fully_redeemed_at = NOW();
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS gift_card_update_timestamp ON gift_cards;
    CREATE TRIGGER gift_card_update_timestamp
    BEFORE UPDATE ON gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_gift_card_timestamp();
  `]
};