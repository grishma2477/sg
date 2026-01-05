import { String } from "../../../utils/Constant.js";

/**
 * Driver Visibility Settings Query Manager
 * 
 * Controls how many ride requests a driver sees based on:
 * - Safety points
 * - Performance metrics
 * - Admin restrictions
 */
export const DriverVisibilityQueryManager = {
  createDriverVisibilityTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.DRIVER_VISIBILITY_MODEL} (
      driver_id UUID PRIMARY KEY REFERENCES ${String.DRIVER_MODEL}(id) ON DELETE CASCADE,
      
      -- Visibility Multiplier (0.0 - 2.0)
      -- 0.0 = completely hidden (suspended)
      -- 0.5 = reduced visibility (low safety)
      -- 1.0 = normal visibility
      -- 1.5 = increased visibility (high performer)
      -- 2.0 = maximum visibility (top tier)
      visibility_multiplier NUMERIC(3, 2) DEFAULT 1.00,
      
      -- Request radius in kilometers
      max_request_radius_km NUMERIC(6, 2) DEFAULT 5.00,
      
      -- Maximum concurrent ride requests shown
      max_concurrent_requests INTEGER DEFAULT 10,
      
      -- Restrictions
      is_restricted BOOLEAN DEFAULT FALSE,
      restriction_reason TEXT,
      restricted_until TIMESTAMPTZ,
      
      -- Auto-calculated based on safety points
      auto_calculated BOOLEAN DEFAULT TRUE,
      
      -- Manual override by admin
      manual_override BOOLEAN DEFAULT FALSE,
      override_set_by UUID REFERENCES ${String.USER_MODEL}(id),
      override_reason TEXT,
      
      -- Tier system
      performance_tier VARCHAR(20) DEFAULT 'standard',
      -- tiers: 'probation', 'standard', 'silver', 'gold', 'platinum'
      
      -- Last calculation
      last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT valid_multiplier CHECK (visibility_multiplier BETWEEN 0.0 AND 2.0),
      CONSTRAINT valid_radius CHECK (max_request_radius_km BETWEEN 1.0 AND 50.0),
      CONSTRAINT valid_tier CHECK (
        performance_tier IN ('probation', 'standard', 'silver', 'gold', 'platinum')
      )
    );
  `,

  createDriverVisibilityIndexes: `
    -- Active drivers by multiplier
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_multiplier 
    ON ${String.DRIVER_VISIBILITY_MODEL}(visibility_multiplier DESC)
    WHERE is_restricted = FALSE;
    
    -- Performance tiers
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_tier 
    ON ${String.DRIVER_VISIBILITY_MODEL}(performance_tier);
    
    -- Restricted drivers
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_restricted 
    ON ${String.DRIVER_VISIBILITY_MODEL}(is_restricted, restricted_until)
    WHERE is_restricted = TRUE;
    
    -- Auto-recalculation queue
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_auto_calc 
    ON ${String.DRIVER_VISIBILITY_MODEL}(last_calculated_at)
    WHERE auto_calculated = TRUE;
  `
};

/**
 * Visibility tier configuration
 */
export const VisibilityTiers = {
  probation: {
    tier: 'probation',
    multiplier: 0.5,
    minSafetyPoints: 0,
    maxSafetyPoints: 700,
    maxRadius: 3.0,
    maxConcurrent: 5,
    description: 'New or low-performing drivers'
  },
  standard: {
    tier: 'standard',
    multiplier: 1.0,
    minSafetyPoints: 700,
    maxSafetyPoints: 900,
    maxRadius: 5.0,
    maxConcurrent: 10,
    description: 'Average performing drivers'
  },
  silver: {
    tier: 'silver',
    multiplier: 1.2,
    minSafetyPoints: 900,
    maxSafetyPoints: 1100,
    maxRadius: 7.0,
    maxConcurrent: 15,
    description: 'Above average drivers'
  },
  gold: {
    tier: 'gold',
    multiplier: 1.5,
    minSafetyPoints: 1100,
    maxSafetyPoints: 1300,
    maxRadius: 10.0,
    maxConcurrent: 20,
    description: 'High performing drivers'
  },
  platinum: {
    tier: 'platinum',
    multiplier: 2.0,
    minSafetyPoints: 1300,
    maxSafetyPoints: 9999,
    maxRadius: 15.0,
    maxConcurrent: 30,
    description: 'Elite drivers'
  }
};
