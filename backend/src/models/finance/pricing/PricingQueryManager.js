import { String } from "../../utils/Constant.js";

export const PricingQueryManager = {
  createPricingTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.PRICING_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ride_id UUID UNIQUE NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

      base_fare NUMERIC(10,2) NOT NULL,
      distance_fare NUMERIC(10,2) NOT NULL,
      time_fare NUMERIC(10,2) NOT NULL,
      surge_multiplier NUMERIC(4,2) DEFAULT 1.0,

      total_fare NUMERIC(10,2) NOT NULL,

      currency VARCHAR(10) DEFAULT 'USD',

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  createPricingTableQueryIndex: `
  
  -- One pricing per ride (already UNIQUE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_ride
ON pricing (ride_id);
`
};
