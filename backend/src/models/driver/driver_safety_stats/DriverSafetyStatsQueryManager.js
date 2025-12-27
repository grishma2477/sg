import { String } from "../../utils/Constant.js";

export const DriverSafetyStatsQueryManager = {
  createDriverSafetyStatsTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_SAFETY_STATS_MODEL} (
      driver_id UUID PRIMARY KEY REFERENCES ${String.DRIVER_MODEL}(id) ON DELETE CASCADE,

      current_points INTEGER DEFAULT 1000,
      average_rating DECIMAL(3,2) DEFAULT 0,

      completed_rides INTEGER DEFAULT 0,
      total_safety_concerns INTEGER DEFAULT 0,

      verified_safe_badge BOOLEAN DEFAULT FALSE,

      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  createDriverSafetyStatsTableQueryIndex:`
  -- Matching & filtering
CREATE INDEX IF NOT EXISTS idx_driver_safety_points
ON driver_safety_stats (current_points);

CREATE INDEX IF NOT EXISTS idx_driver_verified_safe
ON driver_safety_stats (verified_safe_badge)
WHERE verified_safe_badge = TRUE;
`
};
