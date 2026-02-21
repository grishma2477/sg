import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { RidePaymentQueryManager } from "./RidePaymentQueryManager.js";

const RidePayment = ModelManager.createModel(
  RidePaymentQueryManager.schema,
  String.RIDE_PAYMENT_MODEL
);

export default RidePayment;