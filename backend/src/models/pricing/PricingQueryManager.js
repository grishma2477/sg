import { String } from "../../utils/Constant.js";

export const PricingQueryManager = {
  createPricingTableQuery: `
    CREATE TABLE ${String.PRICING_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicle_type VARCHAR(20),
      base_fare NUMERIC(6,2),
      per_km NUMERIC(6,2),
      per_min NUMERIC(6,2),
      surge_multiplier NUMERIC(4,2) DEFAULT 1.0,
      city VARCHAR(50)
    );
  `,

  createPricingIndexes: `
    CREATE INDEX idx_pricing_vehicle_city
    ON ${String.PRICING_MODEL}(vehicle_type, city);
  `
};

