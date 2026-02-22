import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PayoutAttemptQueryManager } from "./PayoutAttemptQueryManager.js";

const PayoutAttempt = ModelManager.createModel(
  PayoutAttemptQueryManager.schema,
  String.PAYOUT_ATTEMPTS
);

export default PayoutAttempt;