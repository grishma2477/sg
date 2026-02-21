import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { GiftCardRedemptionQueryManager } from "./GiftCardRedemptionQueryManager.js";

const GiftCardRedemption = ModelManager.createModel(
  GiftCardRedemptionQueryManager.schema,
  String.GIFT_CARD_REDEMPTION
);

export default GiftCardRedemption;