CREATE TABLE IF NOT EXISTS kyc_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      kyc_id UUID NOT NULL REFERENCES kyc(id) ON DELETE CASCADE,

      document_type VARCHAR(20) CHECK (document_type IN ('citizenship', 'passport', 'nin')) NOT NULL,
      document_number VARCHAR(100) NOT NULL,
      issued_date DATE NOT NULL,
      expiry_date DATE,
  
      document_front_url TEXT NOT NULL,
      document_back_url TEXT ,


      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      CONSTRAINT unique_document_number UNIQUE (document_number)
    );

CREATE INDEX IF NOT EXISTS idx_kyc_document_kyc_id ON kyc_documents(kyc_id);