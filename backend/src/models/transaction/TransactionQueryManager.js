import { String } from "../../utils/Constant.js";

export const TransactionQueryManager = {
  createTransactionTableQuery: `
    CREATE TABLE ${String.TRANSACTION_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_id UUID REFERENCES ${String.WALLET_MODEL}(id),
      ride_id UUID REFERENCES ${String.RIDE_MODEL}(id),
      amount NUMERIC(10,2),
      type VARCHAR(20) CHECK (type IN ('CREDIT', 'DEBIT')),
      status VARCHAR(20) CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

};

