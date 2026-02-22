import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PaymentQueryManager } from "./PaymentQueryManager.js";

const Payment = ModelManager.createModel(
  PaymentQueryManager.schema,
  String.PAYMENT
);

export default Payment;