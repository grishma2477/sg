import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { LedgerEntryQueryManager } from "./LedgerEntryQueryManager.js";

const LedgerEntry = ModelManager.createModel(
  LedgerEntryQueryManager.schema,
  String.LEDGER_ENTRY
);

export default LedgerEntry;