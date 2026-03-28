import { ModelManager } from "../../../../database/utils/ModelManager.js";
import { PendingGiftCardQueryManager } from "./PendingGiftCardQueryManager.js";
import { String } from "../../../../utils/Constant.js";

const PendingGiftCard = ModelManager.createModel(
  PendingGiftCardQueryManager.schema,
  String.PENDING_GIFT_CARD_MODEL
);

export default PendingGiftCard;