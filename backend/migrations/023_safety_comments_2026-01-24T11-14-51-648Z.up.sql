CREATE TABLE IF NOT EXISTS safety_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- References
      review_id UUID NOT NULL REFERENCES ride_reviews(id) ON DELETE CASCADE,
      
      -- Commenter (can be rider, driver, or admin)
      commenter_id UUID NOT NULL REFERENCES users(id),
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
      admin_reviewed_by UUID REFERENCES users(id),
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

-- Review comments lookup
    CREATE INDEX IF NOT EXISTS idx_safety_comments_review 
    ON safety_comments(review_id, created_at ASC);
    
    -- Commenter history
    CREATE INDEX IF NOT EXISTS idx_safety_comments_commenter 
    ON safety_comments(commenter_id, created_at DESC);
    
    -- Unresolved issues
    CREATE INDEX IF NOT EXISTS idx_safety_comments_unresolved 
    ON safety_comments(is_resolved, severity_level DESC, created_at ASC)
    WHERE is_resolved = FALSE;
    
    -- Admin review queue
    CREATE INDEX IF NOT EXISTS idx_safety_comments_admin_queue 
    ON safety_comments(admin_reviewed, severity_level DESC, created_at ASC)
    WHERE admin_reviewed = FALSE;
    
    -- Flagged comments
    CREATE INDEX IF NOT EXISTS idx_safety_comments_flagged 
    ON safety_comments(is_flagged, created_at ASC)
    WHERE is_flagged = TRUE;
    
    -- Safety category analysis
    CREATE INDEX IF NOT EXISTS idx_safety_comments_category 
    ON safety_comments(safety_category, severity_level);
    
    -- Follow-up tracking
    CREATE INDEX IF NOT EXISTS idx_safety_comments_followup 
    ON safety_comments(requires_follow_up, follow_up_completed)
    WHERE requires_follow_up = TRUE AND follow_up_completed = FALSE;