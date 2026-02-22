import { ModelManager } from "../../../database/utils/ModelManager.js";
import { LedgerAccountQueryManager } from "./LedgerAccountQueryManager.js";

import { String } from "../../../utils/Constant.js";

const LedgerAccount = ModelManager.createModel(
  LedgerAccountQueryManager.schema,
  String.LEDGER_ACCOUNT
);

export default LedgerAccount;