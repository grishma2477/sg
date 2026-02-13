// import { String } from "../../utils/Constant.js";

// export const DriverApplicationQueryManager = {
//   schema: [
//     `
//     CREATE TABLE IF NOT EXISTS ${String.DRIVER_APPLICATION_MODEL} (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//       user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

//       -- Driver License Information ONLY
//       license_number VARCHAR(100) NOT NULL UNIQUE,
//       license_issued_date DATE NOT NULL,
//       license_expiry_date DATE NOT NULL,
//       license_category VARCHAR(50) NOT NULL, -- A (Bike), B (Scooter), B-C (Car)
      
//       -- License Documents
//       license_front_url TEXT NOT NULL,
//       license_back_url TEXT,

//       -- Application Status
//       status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
//       admin_remarks TEXT,
//       reviewed_by UUID REFERENCES ${String.USER_MODEL}(id),
//       reviewed_at TIMESTAMPTZ,

//       created_at TIMESTAMPTZ DEFAULT NOW(),
//       updated_at TIMESTAMPTZ DEFAULT NOW()
//     );
//   `,

//     `
//     -- Index for user lookups
//     CREATE INDEX IF NOT EXISTS idx_driver_application_user
//     ON ${String.DRIVER_APPLICATION_MODEL} (user_id);
//   `,

//     `
//     -- Index for status filtering
//     CREATE INDEX IF NOT EXISTS idx_driver_application_status
//     ON ${String.DRIVER_APPLICATION_MODEL} (status);
//   `,

//     `
//     -- Trigger to update updated_at
//     CREATE OR REPLACE FUNCTION update_driver_application_updated_at()
//     RETURNS TRIGGER AS $$
//     BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
//     END;
//     $$ LANGUAGE plpgsql;

//     DROP TRIGGER IF EXISTS trigger_driver_application_updated_at ON ${String.DRIVER_APPLICATION_MODEL};
//     CREATE TRIGGER trigger_driver_application_updated_at
//     BEFORE UPDATE ON ${String.DRIVER_APPLICATION_MODEL}
//     FOR EACH ROW
//     EXECUTE FUNCTION update_driver_application_updated_at();
//   `,
//   ],
// };



import { String } from "../../utils/Constant.js";

export const DriverApplicationQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_APPLICATION_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id) ON DELETE CASCADE,

      -- ==========================================
      -- DRIVER LICENSE INFORMATION
      -- ==========================================
      license_number VARCHAR(100) NOT NULL UNIQUE,
      license_type VARCHAR(50), -- Private / Commercial
      license_category VARCHAR(50) NOT NULL, -- A (Bike), B (Scooter), B-C (Car)
      license_issued_date DATE NOT NULL,
      license_expiry_date DATE NOT NULL,
      license_renewed_date DATE,
      issuing_authority VARCHAR(200),
      years_of_experience INTEGER,
      
      -- License Documents
      license_front_url TEXT NOT NULL,
      license_back_url TEXT,

      -- ==========================================
      -- VEHICLE INFORMATION
      -- ==========================================
      vehicle_type VARCHAR(50) NOT NULL, -- bike, scooter, car, sedan, suv, ev
      vehicle_category VARCHAR(50), -- Economy / Premium / XL
      make VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL,
      color VARCHAR(50),
      license_plate VARCHAR(20) NOT NULL UNIQUE,
      vin VARCHAR(100), -- Vehicle Identification Number
      cc INTEGER, -- Engine Capacity
      
      -- Technical Details
      transmission_type VARCHAR(50), -- Manual / Automatic
      fuel_type VARCHAR(50), -- Petrol / Diesel / EV / Hybrid
      seating_capacity INTEGER DEFAULT 4,
      has_ac BOOLEAN DEFAULT true,

      -- ==========================================
      -- VEHICLE DOCUMENTS & COMPLIANCE
      -- ==========================================
      -- Registration
      registration_number VARCHAR(100),
      registration_url TEXT NOT NULL,
      registration_expiry_date DATE,
      
      -- Blue Book
      blue_book_number VARCHAR(100),
      blue_book_url TEXT,
      blue_book_expiry_date DATE,
      blue_book_renewed_date DATE,
      
      -- Insurance
      insurance_policy_number VARCHAR(100),
      insurance_url TEXT NOT NULL,
      insurance_expiry_date DATE,
      
      -- Other Certificates
      fitness_certificate_url TEXT,
      fitness_expiry_date DATE,
      emission_certificate_url TEXT,
      emission_expiry_date DATE,

      -- ==========================================
      -- VEHICLE PHOTOS (4 angles)
      -- ==========================================
      photo_front_url TEXT NOT NULL,
      photo_back_url TEXT,
      photo_left_url TEXT,
      photo_right_url TEXT,

      -- ==========================================
      -- VEHICLE AMENITIES
      -- ==========================================
      has_dashcam BOOLEAN DEFAULT false,
      has_music BOOLEAN DEFAULT false,
      has_water BOOLEAN DEFAULT false,
      has_charger BOOLEAN DEFAULT false,
      is_pet_friendly BOOLEAN DEFAULT false,
      is_wheelchair_accessible BOOLEAN DEFAULT false,

      -- ==========================================
      -- SAFETY & COMPLIANCE
      -- ==========================================
      background_check_status VARCHAR(50) DEFAULT 'pending',
      criminal_record_check_status VARCHAR(50) DEFAULT 'pending',
      driving_history_check_status VARCHAR(50) DEFAULT 'pending',
      driver_training_completed BOOLEAN DEFAULT false,
      training_date DATE,
      safety_quiz_score INTEGER,
      
      -- Emergency Contact
      emergency_contact_name VARCHAR(200),
      emergency_contact_number VARCHAR(20),

      -- ==========================================
      -- OPERATIONAL PREFERENCES
      -- ==========================================
      preferred_working_areas TEXT[], -- Array of area names
      preferred_working_hours VARCHAR(50), -- Morning / Evening / Night / Flexible
      languages_spoken TEXT[], -- Array of languages

      -- ==========================================
      -- PAYMENT INFORMATION
      -- ==========================================
      bank_account_number VARCHAR(100),
      bank_name VARCHAR(200),
      bank_branch VARCHAR(200),
      account_holder_name VARCHAR(200),
      tax_id_number VARCHAR(100),
      payment_method_preference VARCHAR(50), -- Bank / Wallet / Weekly

      -- ==========================================
      -- APPLICATION STATUS
      -- ==========================================
      status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
      admin_remarks TEXT,
      reviewed_by UUID REFERENCES ${String.USER_MODEL}(id),
      reviewed_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

    `
    -- Index for user lookups
    CREATE INDEX IF NOT EXISTS idx_driver_application_user
    ON ${String.DRIVER_APPLICATION_MODEL} (user_id);
  `,

    `
    -- Index for status filtering
    CREATE INDEX IF NOT EXISTS idx_driver_application_status
    ON ${String.DRIVER_APPLICATION_MODEL} (status);
  `,

    `
    -- Index for license plate
    CREATE INDEX IF NOT EXISTS idx_driver_application_plate
    ON ${String.DRIVER_APPLICATION_MODEL} (license_plate);
  `,

    `
    -- Trigger to update updated_at
    CREATE OR REPLACE FUNCTION update_driver_application_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_driver_application_updated_at ON ${String.DRIVER_APPLICATION_MODEL};
    CREATE TRIGGER trigger_driver_application_updated_at
    BEFORE UPDATE ON ${String.DRIVER_APPLICATION_MODEL}
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_application_updated_at();
  `,
  ],
};