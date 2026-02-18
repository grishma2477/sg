
// import { String } from "../../utils/Constant.js";

// export const ReviewQueryManager = {
//   schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.REVIEW_MODEL} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//       ride_id UUID UNIQUE NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

//       reviewer_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
//       reviewee_driver_id UUID REFERENCES ${String.DRIVER_MODEL}(id),
//       reviewee_user_id UUID REFERENCES ${String.USER_MODEL}(id),

//       star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),

//       positive_taps JSONB DEFAULT '[]',
//       negative_taps JSONB DEFAULT '[]',

//       has_safety_concern BOOLEAN DEFAULT FALSE,
//       safety_concern_details TEXT,

//       calculated_impact INTEGER,
//       is_processed BOOLEAN DEFAULT FALSE,

//       created_at TIMESTAMPTZ DEFAULT NOW()
//     );
    
//     -- Add reviewee_user_id if table exists but column doesn't
//     DO $$
//     BEGIN
//       IF NOT EXISTS (
//         SELECT 1 FROM information_schema.columns 
//         WHERE table_name = 'ride_reviews'
//         AND column_name = 'reviewee_user_id'
//       ) THEN
//         ALTER TABLE ride_reviews
//         ADD COLUMN reviewee_user_id UUID REFERENCES users(id);
//       END IF;
//     END $$;
    
//     -- Make reviewee_driver_id nullable
//     DO $$
//     BEGIN
//       ALTER TABLE ride_reviews
//       ALTER COLUMN reviewee_driver_id DROP NOT NULL;
//     EXCEPTION
//       WHEN OTHERS THEN NULL;
//     END $$;
//   `,

//  `
  
//   -- Driver review history
// CREATE INDEX IF NOT EXISTS idx_reviews_driver
// ON ride_reviews (reviewee_driver_id);

// -- Rider review history (NEW)
// CREATE INDEX IF NOT EXISTS idx_reviews_rider
// ON ride_reviews (reviewee_user_id);

// -- Safety concern filtering
// CREATE INDEX IF NOT EXISTS idx_reviews_safety_concern
// ON ride_reviews (has_safety_concern)
// WHERE has_safety_concern = TRUE;` ]
// };


import { String } from "../../utils/Constant.js";

export const ReviewQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.REVIEW_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ride_id UUID NOT NULL REFERENCES ${String.RIDE_MODEL}(id) ON DELETE CASCADE,

      reviewer_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      reviewee_driver_id UUID REFERENCES ${String.DRIVER_MODEL}(id),
      reviewee_user_id UUID REFERENCES ${String.USER_MODEL}(id),

      star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),

      positive_taps JSONB DEFAULT '[]',
      negative_taps JSONB DEFAULT '[]',

      has_safety_concern BOOLEAN DEFAULT FALSE,
      safety_concern_details TEXT,

      calculated_impact INTEGER,
      is_processed BOOLEAN DEFAULT FALSE,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- CORRECT CONSTRAINT: One review per user per ride
      UNIQUE (ride_id, reviewer_id)
    );
    
    -- Add reviewee_user_id if table exists but column doesn't
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ride_reviews'
        AND column_name = 'reviewee_user_id'
      ) THEN
        ALTER TABLE ride_reviews
        ADD COLUMN reviewee_user_id UUID REFERENCES users(id);
      END IF;
    END $$;
    
    -- Make reviewee_driver_id nullable
    DO $$
    BEGIN
      ALTER TABLE ride_reviews
      ALTER COLUMN reviewee_driver_id DROP NOT NULL;
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END $$;
    
    -- Drop the wrong constraint if it exists
    DO $$
    BEGIN
      ALTER TABLE ride_reviews DROP CONSTRAINT IF EXISTS ride_reviews_ride_id_key;
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END $$;
    
    -- Add the correct constraint if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_ride_reviewer'
      ) THEN
        ALTER TABLE ride_reviews 
        ADD CONSTRAINT unique_ride_reviewer UNIQUE (ride_id, reviewer_id);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END $$;
  `,

 `
  
  -- Driver review history
CREATE INDEX IF NOT EXISTS idx_reviews_driver
ON ride_reviews (reviewee_driver_id);

-- Rider review history (NEW)
CREATE INDEX IF NOT EXISTS idx_reviews_rider
ON ride_reviews (reviewee_user_id);

-- Safety concern filtering
CREATE INDEX IF NOT EXISTS idx_reviews_safety_concern
ON ride_reviews (has_safety_concern)
WHERE has_safety_concern = TRUE;` ]
};