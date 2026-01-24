CREATE TABLE IF NOT EXISTS admin_audits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id UUID NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );