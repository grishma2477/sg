// import { String } from "../../utils/Constant.js";

// export const DriverQueryManager = {
//   schema: [`
//     CREATE TABLE IF NOT EXISTS ${String.DRIVER_MODEL} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//       user_id UUID UNIQUE NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

//       is_online BOOLEAN DEFAULT FALSE,
//       is_available BOOLEAN DEFAULT FALSE,
//       status VARCHAR(20) DEFAULT 'offline',

//       created_at TIMESTAMPTZ DEFAULT NOW(),
//       updated_at TIMESTAMPTZ DEFAULT NOW()
//     );
//   `,
//  `
  
//   -- Join performance
// CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_user
// ON drivers (user_id);

// -- Availability filtering
// CREATE INDEX IF NOT EXISTS idx_drivers_status
// ON drivers (status);

// CREATE INDEX IF NOT EXISTS idx_drivers_online
// ON drivers (is_online)
// WHERE is_online = TRUE;
// `]
// };




import { String } from "../../utils/Constant.js";

export const DriverQueryManager = {
  schema: [`
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      -- ==========================================
      -- ONLINE STATUS
      -- ==========================================
      is_online BOOLEAN DEFAULT FALSE,
      is_available BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'offline', -- offline / online / busy / inactive

      -- ==========================================
      -- VERIFICATION STATUS
      -- ==========================================
      verification_level VARCHAR(50) DEFAULT 'bronze', -- bronze / silver / gold / platinum
      verification_score INTEGER DEFAULT 0, -- 0-100
      all_badges_verified BOOLEAN DEFAULT false,

      -- ==========================================
      -- PERFORMANCE METRICS
      -- ==========================================
      acceptance_rate DECIMAL(5,2) DEFAULT 0, -- 0.00 to 100.00
      cancellation_rate DECIMAL(5,2) DEFAULT 0, -- 0.00 to 100.00
      average_rating DECIMAL(3,2) DEFAULT 0, -- 0.00 to 5.00
      total_trips INTEGER DEFAULT 0,
      lifetime_earnings DECIMAL(12,2) DEFAULT 0,

      -- ==========================================
      -- ELIGIBILITY FLAGS
      -- ==========================================
      surge_eligible BOOLEAN DEFAULT false,
      incentive_eligible BOOLEAN DEFAULT false,
      penalty_points INTEGER DEFAULT 0,

      -- ==========================================
      -- SAFETY FEATURES
      -- ==========================================
      sos_enabled BOOLEAN DEFAULT true,
      audio_recording_consent BOOLEAN DEFAULT false,
      face_verification_status VARCHAR(50) DEFAULT 'pending',
      last_face_verification_at TIMESTAMPTZ,

      -- ==========================================
      -- DEVICE METADATA (for fraud control)
      -- ==========================================
      device_id VARCHAR(200),
      app_version VARCHAR(50),
      os_version VARCHAR(50),
      last_login_at TIMESTAMPTZ,
      push_token TEXT,
      gps_permission_status BOOLEAN DEFAULT false,
      location_accuracy_status VARCHAR(50),

      -- ==========================================
      -- PREFERENCES
      -- ==========================================
      preferred_working_hours VARCHAR(50), -- Morning / Evening / Night / Flexible
      languages_spoken TEXT[], -- ['English', 'Nepali', 'Hindi']
      gender VARCHAR(20),

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
 `
  
  -- Join performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_user
ON ${String.DRIVER_MODEL} (user_id);

-- Availability filtering
CREATE INDEX IF NOT EXISTS idx_drivers_status
ON ${String.DRIVER_MODEL} (status);

CREATE INDEX IF NOT EXISTS idx_drivers_online
ON ${String.DRIVER_MODEL} (is_online)
WHERE is_online = TRUE;

-- Verification filtering
CREATE INDEX IF NOT EXISTS idx_drivers_verification_level
ON ${String.DRIVER_MODEL} (verification_level);

-- Performance metrics
CREATE INDEX IF NOT EXISTS idx_drivers_rating
ON ${String.DRIVER_MODEL} (average_rating);

CREATE INDEX IF NOT EXISTS idx_drivers_total_trips
ON ${String.DRIVER_MODEL} (total_trips);
`]
};