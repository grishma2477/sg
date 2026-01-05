import { String } from "../../utils/Constant.js";

/**
 * Safety Comments Query Manager
 * 
 * Extended commenting system for reviews with safety concerns
 */
export const SafetyCommentQueryManager = {
  createSafetyCommentTableQuery: `
    CREATE TABLE IF NOT EXISTS ${String.SAFETY_COMMENT_MODEL} (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- References
      review_id UUID NOT NULL REFERENCES ${String.REVIEW_MODEL}(id) ON DELETE CASCADE,
      
      -- Commenter (can be rider, driver, or admin)
      commenter_id UUID NOT NULL REFERENCES ${String.USER_MODEL}(id),
      commenter_role VARCHAR(20) NOT NULL,  -- 'rider', 'driver', 'admin'
      
      -- Comment details
      comment_text TEXT NOT NULL,
      
      -- Safety categorization
      safety_category VARCHAR(50),
      -- 'aggressive_driving', 'harassment', 'cleanliness', 'route_issue', 
      -- 'communication', 'vehicle_condition', 'other'
      
      -- Severity (admin can escalate)
      severity_level VARCHAR(20) DEFAULT 'low',
      -- 'low', 'medium', 'high', 'critical'
      
      -- Evidence attachments
      evidence_urls JSONB DEFAULT '[]',  -- Array of image/video URLs
      
      -- Admin review
      admin_reviewed BOOLEAN DEFAULT FALSE,
      admin_reviewed_by UUID REFERENCES ${String.USER_MODEL}(id),
      admin_reviewed_at TIMESTAMPTZ,
      admin_notes TEXT,
      admin_action_taken VARCHAR(100),  -- 'warning', 'suspension', 'training_required', etc.
      
      -- Resolution
      is_resolved BOOLEAN DEFAULT FALSE,
      resolved_at TIMESTAMPTZ,
      resolution_notes TEXT,
      
      -- Visibility
      is_public BOOLEAN DEFAULT FALSE,  -- Shown to other users?
      is_flagged BOOLEAN DEFAULT FALSE,  -- Flagged for urgent review
      
      -- Follow-up
      requires_follow_up BOOLEAN DEFAULT FALSE,
      follow_up_completed BOOLEAN DEFAULT FALSE,
      follow_up_notes TEXT,
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT valid_commenter_role CHECK (
        commenter_role IN ('rider', 'driver', 'admin', 'system')
      ),
      CONSTRAINT valid_severity CHECK (
        severity_level IN ('low', 'medium', 'high', 'critical')
      ),
      CONSTRAINT comment_not_empty CHECK (LENGTH(TRIM(comment_text)) > 0)
    );
  `,

  createSafetyCommentIndexes: `
    -- Review comments lookup
    CREATE INDEX IF NOT EXISTS idx_safety_comments_review 
    ON ${String.SAFETY_COMMENT_MODEL}(review_id, created_at ASC);
    
    -- Commenter history
    CREATE INDEX IF NOT EXISTS idx_safety_comments_commenter 
    ON ${String.SAFETY_COMMENT_MODEL}(commenter_id, created_at DESC);
    
    -- Unresolved issues
    CREATE INDEX IF NOT EXISTS idx_safety_comments_unresolved 
    ON ${String.SAFETY_COMMENT_MODEL}(is_resolved, severity_level DESC, created_at ASC)
    WHERE is_resolved = FALSE;
    
    -- Admin review queue
    CREATE INDEX IF NOT EXISTS idx_safety_comments_admin_queue 
    ON ${String.SAFETY_COMMENT_MODEL}(admin_reviewed, severity_level DESC, created_at ASC)
    WHERE admin_reviewed = FALSE;
    
    -- Flagged comments
    CREATE INDEX IF NOT EXISTS idx_safety_comments_flagged 
    ON ${String.SAFETY_COMMENT_MODEL}(is_flagged, created_at ASC)
    WHERE is_flagged = TRUE;
    
    -- Safety category analysis
    CREATE INDEX IF NOT EXISTS idx_safety_comments_category 
    ON ${String.SAFETY_COMMENT_MODEL}(safety_category, severity_level);
    
    -- Follow-up tracking
    CREATE INDEX IF NOT EXISTS idx_safety_comments_followup 
    ON ${String.SAFETY_COMMENT_MODEL}(requires_follow_up, follow_up_completed)
    WHERE requires_follow_up = TRUE AND follow_up_completed = FALSE;
  `
};

/**
 * Safety category definitions
 */
export const SafetyCategories = {
  AGGRESSIVE_DRIVING: {
    key: 'aggressive_driving',
    label: 'Aggressive or Reckless Driving',
    defaultSeverity: 'high',
    pointsImpact: -100,
    requiresAdminReview: true
  },
  HARASSMENT: {
    key: 'harassment',
    label: 'Harassment or Inappropriate Behavior',
    defaultSeverity: 'critical',
    pointsImpact: -200,
    requiresAdminReview: true
  },
  CLEANLINESS: {
    key: 'cleanliness',
    label: 'Vehicle Cleanliness Issues',
    defaultSeverity: 'low',
    pointsImpact: -20,
    requiresAdminReview: false
  },
  ROUTE_ISSUE: {
    key: 'route_issue',
    label: 'Route or Navigation Problems',
    defaultSeverity: 'medium',
    pointsImpact: -30,
    requiresAdminReview: false
  },
  COMMUNICATION: {
    key: 'communication',
    label: 'Communication Issues',
    defaultSeverity: 'low',
    pointsImpact: -15,
    requiresAdminReview: false
  },
  VEHICLE_CONDITION: {
    key: 'vehicle_condition',
    label: 'Vehicle Safety or Mechanical Issues',
    defaultSeverity: 'high',
    pointsImpact: -80,
    requiresAdminReview: true
  },
  UNSAFE_BEHAVIOR: {
    key: 'unsafe_behavior',
    label: 'Other Unsafe Behavior',
    defaultSeverity: 'high',
    pointsImpact: -75,
    requiresAdminReview: true
  },
  OTHER: {
    key: 'other',
    label: 'Other Safety Concern',
    defaultSeverity: 'medium',
    pointsImpact: -25,
    requiresAdminReview: false
  }
};
