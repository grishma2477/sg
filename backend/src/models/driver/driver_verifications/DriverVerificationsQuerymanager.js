import { String } from "../../../utils/Constant.js";

export const DriverVerificationsQueryManager = {
  schema: [
    `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_VERIFICATIONS_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      driver_id UUID NOT NULL UNIQUE REFERENCES ${String.DRIVER_MODEL}(id) ON DELETE CASCADE,

      -- ==========================================
      -- VERIFICATION BADGES (Uber-style)
      -- ==========================================
      
      -- Identity Verifications
      confirmed_identity BOOLEAN DEFAULT false,
      confirmed_identity_verified_at TIMESTAMPTZ,
      
      portrait_picture_check BOOLEAN DEFAULT false,
      portrait_picture_verified_at TIMESTAMPTZ,
      
      -- License & Legal
      driver_license_verified BOOLEAN DEFAULT false,
      driver_license_verified_at TIMESTAMPTZ,
      
      authorized_driver BOOLEAN DEFAULT false,
      authorized_driver_verified_at TIMESTAMPTZ,
      
      driving_history_check BOOLEAN DEFAULT false,
      driving_history_verified_at TIMESTAMPTZ,
      
      -- Background Checks
      national_police_check BOOLEAN DEFAULT false,
      police_check_verified_at TIMESTAMPTZ,
      police_check_expiry_date DATE,
      
      criminal_record_clear BOOLEAN DEFAULT false,
      criminal_record_verified_at TIMESTAMPTZ,
      
      -- Vehicle Verifications
      vehicle_inspected BOOLEAN DEFAULT false,
      vehicle_inspection_verified_at TIMESTAMPTZ,
      vehicle_inspection_expiry_date DATE,
      
      motor_vehicle_insurance BOOLEAN DEFAULT false,
      insurance_verified_at TIMESTAMPTZ,
      insurance_expiry_date DATE,
      
      ctp_insurance_check BOOLEAN DEFAULT false, -- Compulsory Third Party
      ctp_verified_at TIMESTAMPTZ,
      ctp_expiry_date DATE,
      
      -- Registration & Compliance
      vehicle_registration_verified BOOLEAN DEFAULT false,
      registration_verified_at TIMESTAMPTZ,
      
      blue_book_verified BOOLEAN DEFAULT false,
      blue_book_verified_at TIMESTAMPTZ,
      
      emission_test_passed BOOLEAN DEFAULT false,
      emission_verified_at TIMESTAMPTZ,
      
      fitness_certificate_verified BOOLEAN DEFAULT false,
      fitness_verified_at TIMESTAMPTZ,

      -- ==========================================
      -- OVERALL STATUS
      -- ==========================================
      all_verifications_complete BOOLEAN DEFAULT false,
      verification_completion_date TIMESTAMPTZ,
      
      -- Verification Level: bronze / silver / gold / platinum
      verification_level VARCHAR(50) DEFAULT 'bronze',
      verification_score INTEGER DEFAULT 0, -- Out of 100

      -- ==========================================
      -- NOTES
      -- ==========================================
      admin_notes TEXT,
      verification_remarks TEXT,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

    `
    -- Index for driver lookups
    CREATE INDEX IF NOT EXISTS idx_driver_verifications_driver
    ON ${String.DRIVER_VERIFICATIONS_MODEL} (driver_id);
  `,

    `
    -- Index for verification level
    CREATE INDEX IF NOT EXISTS idx_driver_verifications_level
    ON ${String.DRIVER_VERIFICATIONS_MODEL} (verification_level);
  `,

    `
    -- Index for completion status
    CREATE INDEX IF NOT EXISTS idx_driver_verifications_complete
    ON ${String.DRIVER_VERIFICATIONS_MODEL} (all_verifications_complete);
  `,

    `
    -- Auto-calculate verification score and level
    CREATE OR REPLACE FUNCTION update_driver_verification_score()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      
      -- Calculate score (total 100 points)
      NEW.verification_score = (
        (CASE WHEN NEW.confirmed_identity THEN 10 ELSE 0 END) +
        (CASE WHEN NEW.portrait_picture_check THEN 5 ELSE 0 END) +
        (CASE WHEN NEW.driver_license_verified THEN 15 ELSE 0 END) +
        (CASE WHEN NEW.authorized_driver THEN 10 ELSE 0 END) +
        (CASE WHEN NEW.driving_history_check THEN 10 ELSE 0 END) +
        (CASE WHEN NEW.national_police_check THEN 15 ELSE 0 END) +
        (CASE WHEN NEW.vehicle_inspected THEN 10 ELSE 0 END) +
        (CASE WHEN NEW.motor_vehicle_insurance THEN 10 ELSE 0 END) +
        (CASE WHEN NEW.ctp_insurance_check THEN 5 ELSE 0 END) +
        (CASE WHEN NEW.vehicle_registration_verified THEN 5 ELSE 0 END) +
        (CASE WHEN NEW.blue_book_verified THEN 5 ELSE 0 END)
      );
      
      -- Calculate verification level
      IF NEW.verification_score >= 90 THEN
        NEW.verification_level = 'platinum';
      ELSIF NEW.verification_score >= 75 THEN
        NEW.verification_level = 'gold';
      ELSIF NEW.verification_score >= 50 THEN
        NEW.verification_level = 'silver';
      ELSE
        NEW.verification_level = 'bronze';
      END IF;
      
      -- Check if all required verifications are complete
      NEW.all_verifications_complete = (
        NEW.confirmed_identity AND
        NEW.driver_license_verified AND
        NEW.national_police_check AND
        NEW.vehicle_inspected AND
        NEW.motor_vehicle_insurance AND
        NEW.vehicle_registration_verified
      );
      
      -- Set completion date if just completed
      IF NEW.all_verifications_complete AND (OLD.all_verifications_complete IS NULL OR OLD.all_verifications_complete = false) THEN
        NEW.verification_completion_date = NOW();
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_driver_verification_score ON ${String.DRIVER_VERIFICATIONS_MODEL};
    CREATE TRIGGER trigger_driver_verification_score
    BEFORE INSERT OR UPDATE ON ${String.DRIVER_VERIFICATIONS_MODEL}
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_verification_score();
  `,
  ],
};