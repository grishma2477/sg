import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { FinancialPointAccountQueryManager } from "./FinancialPointAccountQueryManager.js";

const FinancialPointAccount = ModelManager.createModel(
  FinancialPointAccountQueryManager.schema,
  String.FINANCIAL_POINT_ACCOUNT
);

export default FinancialPointAccount;