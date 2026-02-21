import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { GiftCardQueryManager } from "./GiftCardQueryManager.js";

const GiftCard = ModelManager.createModel(
  GiftCardQueryManager.schema,
  String.GIFT_CARD_MODEL
);

export default GiftCard;