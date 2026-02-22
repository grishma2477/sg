import { ModelManager } from "../../../database/utils/ModelManager.js";
import { PaymentMethodQueryManager  } from "./PaymentMethodQueryManager.js";
import { String } from "../../../utils/Constant.js";

const PaymentMethod = ModelManager.createModel(
  PaymentMethodQueryManager.schema,
  String.PAYMENT_METHOD_MODEL
);

export default PaymentMethod;