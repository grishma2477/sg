import { ModelManager } from "../../../../database/utils/ModelManager.js";
import { PaymentProviderQueryManager  } from "./PaymentProviderQueryManager.js";
import { String } from "../../../../utils/Constant.js";

const PaymentProvider = ModelManager.createModel(
  PaymentProviderQueryManager.schema,
  String.PAYMENT_PROVIDER_MODEL
);

export default PaymentProvider;