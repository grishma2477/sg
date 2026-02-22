import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { BNPLAccountQueryManager } from "./BNPLAccountQueryManager.js";

const BNPLAccount = ModelManager.createModel(
  BNPLAccountQueryManager.schema,
  String.BNPL
);

export default BNPLAccount;