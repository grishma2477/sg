import { String } from "../../utils/Constant.js";

export const WalletQueryManager = {
  createWalletTableQuery: `
    CREATE TABLE ${String.WALLET_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${String.USER_MODEL}(id),
      balance NUMERIC(12,2) DEFAULT 0.0,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

};

