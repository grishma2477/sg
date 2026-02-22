import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PayoutRequestQueryManager } from "./PayoutRequestQueryManager.js";

const PayoutRequest = ModelManager.createModel(
  PayoutRequestQueryManager.schema,
  String.PAYOUT_REQUEST
);

export default PayoutRequest;