import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PromoCodeQueryManager } from "./PromoCodeQueryManager.js";

const PromoCode = ModelManager.createModel(
  PromoCodeQueryManager.schema,
  String.PROMO_CODES
);

export default PromoCode;