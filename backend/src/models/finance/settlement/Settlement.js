import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { SettlementQueryManager } from "./SettlementQueryManager.js";

const Settlement = ModelManager.createModel(
  SettlementQueryManager.schema,
  String.SETTLEMENT
);

export default Settlement;