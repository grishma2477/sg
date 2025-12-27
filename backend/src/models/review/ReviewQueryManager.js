import { String } from "../../utils/Constant.js";

export const ReviewQueryManager = {
  createReviewTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.REVIEW_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ride_id UUID UNIQUE NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

      reviewer_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      reviewee_driver_id UUID NOT NULL REFERENCES ${String.DRIVER_MODEL}(id),

      star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),

      positive_taps JSONB DEFAULT '[]',
      negative_taps JSONB DEFAULT '[]',

      has_safety_concern BOOLEAN DEFAULT FALSE,
      safety_concern_details TEXT,

      calculated_impact INTEGER,
      is_processed BOOLEAN DEFAULT FALSE,

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  createReviewTableQueryIndex:`
  
  -- Driver review history
CREATE INDEX IF NOT EXISTS idx_reviews_driver
ON ride_reviews (reviewee_driver_id);

-- Safety concern filtering
CREATE INDEX IF NOT EXISTS idx_reviews_safety_concern
ON ride_reviews (has_safety_concern)
WHERE has_safety_concern = TRUE;`
};
