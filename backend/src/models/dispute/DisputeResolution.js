import { ModelManager } from "../../database/utils/ModelManager.js";
import { String } from "../../utils/Constant.js";
import { DisputeResolutionQueryManager } from "./DisputeResolutionQueryManager.js";

const DisputeResolution = ModelManager.createModel(DisputeResolutionQueryManager.schema,
  String.DISPUTE_RESOLUTION_MODEL
);

export default DisputeResolution;
