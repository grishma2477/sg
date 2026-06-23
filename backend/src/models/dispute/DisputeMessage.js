import { ModelManager } from "../../database/utils/ModelManager.js";
import { String } from "../../utils/Constant.js";
import { DisputeMessageQueryManager } from "./DisputeMessageQueryManager.js";

const DisputeMessage = ModelManager.createModel(DisputeMessageQueryManager.schema,
  String.DISPUTE_MESSAGE_MODEL
);

export default DisputeMessage;
