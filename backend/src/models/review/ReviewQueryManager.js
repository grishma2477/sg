import { String } from "../../utils/Constant.js";

export const ReviewQueryManager = {
  createReviewTableQuery: `
       CREATE TABLE ${String.RIDE_RATING_MODEL} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

    rater_role VARCHAR(10) NOT NULL CHECK (rater_role IN ('RIDER','DRIVER')),
    rater_id UUID NOT NULL,

    target_role VARCHAR(10) NOT NULL CHECK (target_role IN ('RIDER','DRIVER')),
    target_id UUID NOT NULL,

    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    is_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP
);
  `,

};

