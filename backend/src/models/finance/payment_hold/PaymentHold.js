import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PaymentHoldQueryManager } from "./PaymentHoldQueryManager.js";


const PaymentHold = ModelManager.createModel(
  PaymentHoldQueryManager.schema,
  String.PAYMENT_HOLD_MODEL
);

export default PaymentHold;