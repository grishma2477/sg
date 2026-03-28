
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";
import { FinancialPointBatchQueryManager } from "./FinancialPointBatchQueryManager.js";

const FinancialPointBatch = ModelManager.createModel(
  FinancialPointBatchQueryManager.schema,
  String.FINANCIAL_POINT_BATCH
);

export default FinancialPointBatch;