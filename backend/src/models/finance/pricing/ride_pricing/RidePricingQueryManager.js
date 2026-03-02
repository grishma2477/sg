import { String } from "../../../../utils/Constant.js";


export const RidePricingQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ride_pricing (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      ride_id UUID UNIQUE NOT NULL
        REFERENCES ${String.RIDE_MODEL}(id)
        ON DELETE CASCADE,

      -- ================================
      -- ESTIMATED VALUES (at request)
      -- ================================
      estimated_distance_km NUMERIC(10,2) NOT NULL,
      estimated_duration_minutes INTEGER NOT NULL,
      estimated_base_fare NUMERIC(12,2) NOT NULL,
      estimated_tax NUMERIC(12,2) DEFAULT 0,
      estimated_platform_fee NUMERIC(12,2) DEFAULT 0,
      estimated_total NUMERIC(12,2) NOT NULL,

      -- ================================
      -- ACTUAL VALUES (after completion)
      -- ================================
      actual_distance_km NUMERIC(10,2),
      actual_duration_minutes INTEGER,
      actual_base_fare NUMERIC(12,2),
      actual_tax NUMERIC(12,2),
      actual_platform_fee NUMERIC(12,2),
      final_total NUMERIC(12,2),

      -- ================================
      -- SURGE & ADJUSTMENTS
      -- ================================
      surge_multiplier NUMERIC(5,2) DEFAULT 1.00,
      adjustment_amount NUMERIC(12,2) DEFAULT 0,
      adjustment_reason TEXT,

      currency VARCHAR(3) DEFAULT 'NPR',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      CHECK (estimated_total >= 0),
      CHECK (surge_multiplier >= 1.00)
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_ride_pricing_ride
    ON ride_pricing(ride_id);
  `],
  
  triggers: [`
    CREATE OR REPLACE FUNCTION update_ride_pricing_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS ride_pricing_update_timestamp
    ON ride_pricing;

    CREATE TRIGGER ride_pricing_update_timestamp
    BEFORE UPDATE ON ride_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_ride_pricing_timestamp();
  `]
};