import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PayoutBatchQueryManager } from "./PayoutBatchQueryManager.js";

const PayoutBatch = ModelManager.createModel(
  PayoutBatchQueryManager.schema,
  String.PAYOUT_BATCH
);

export default PayoutBatch;