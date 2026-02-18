import { String } from "../../../utils/Constant.js";

export const RiderSafetyStatsQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.RIDER_SAFETY_STATS_MODEL} (
      user_id UUID PRIMARY KEY REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      current_points INTEGER DEFAULT 1000,
      average_rating DECIMAL(3,2) DEFAULT 0,

      completed_rides INTEGER DEFAULT 0,
      total_safety_concerns INTEGER DEFAULT 0,

      verified_safe_badge BOOLEAN DEFAULT FALSE,

      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `
  -- Matching & filtering
CREATE INDEX IF NOT EXISTS idx_rider_safety_points
ON ${String.RIDER_SAFETY_STATS_MODEL} (current_points);

CREATE INDEX IF NOT EXISTS idx_rider_verified_safe
ON ${String.RIDER_SAFETY_STATS_MODEL} (verified_safe_badge)
WHERE verified_safe_badge = TRUE;
`]
};