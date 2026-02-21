
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { PromoRedemptionQueryManager } from "./PromoRedemptionQueryManager.js";

const PromoRedemption = ModelManager.createModel(
  PromoRedemptionQueryManager.schema,
  String.PROMO_CODE_REDEMPTION
);

export default PromoRedemption;