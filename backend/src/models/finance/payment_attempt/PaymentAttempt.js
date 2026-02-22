import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PaymentAttemptQueryManager } from "./PaymentAttemptQueryManager.js";

const PaymentAttempt = ModelManager.createModel(
  PaymentAttemptQueryManager.schema,
  String.PAYMENT_ATTEMPT
);

export default PaymentAttempt;