CREATE TABLE IF NOT EXISTS safety_audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      driver_id UUID NOT NULL REFERENCES drivers(id),
      event_type VARCHAR(50) NOT NULL,

      points_before INTEGER,
      points_after INTEGER,
      points_delta INTEGER,

      triggered_by_review_id UUID REFERENCES ride_reviews(id),
      triggered_by_admin_id UUID REFERENCES users(id),

      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- Driver audit trail
CREATE INDEX IF NOT EXISTS idx_audit_driver
ON safety_audit_logs (driver_id);

-- Time-based audit review
CREATE INDEX IF NOT EXISTS idx_audit_created_at
ON safety_audit_logs (created_at);