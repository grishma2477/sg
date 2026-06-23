import { ModelManager } from "../../database/utils/ModelManager.js";
import { String } from "../../utils/Constant.js";
import { DisputeCaseQueryManager } from "./DisputeCaseQueryManager.js";

const DisputeCase = ModelManager.createModel(DisputeCaseQueryManager.schema,
  String.DISPUTE_CASE_MODEL
);

export default DisputeCase;
