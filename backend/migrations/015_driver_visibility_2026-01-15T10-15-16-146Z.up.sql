CREATE TABLE IF NOT EXISTS driver_visibility (
      driver_id UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
      
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
      override_set_by UUID REFERENCES users(id),
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

-- Active drivers by multiplier
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_multiplier 
    ON driver_visibility(visibility_multiplier DESC)
    WHERE is_restricted = FALSE;
    
    -- Performance tiers
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_tier 
    ON driver_visibility(performance_tier);
    
    -- Restricted drivers
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_restricted 
    ON driver_visibility(is_restricted, restricted_until)
    WHERE is_restricted = TRUE;
    
    -- Auto-recalculation queue
    CREATE INDEX IF NOT EXISTS idx_driver_visibility_auto_calc 
    ON driver_visibility(last_calculated_at)
    WHERE auto_calculated = TRUE;