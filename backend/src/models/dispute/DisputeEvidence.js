import { ModelManager } from "../../database/utils/ModelManager.js";
import { String } from "../../utils/Constant.js";
import { DisputeEvidenceQueryManager } from "./DisputeEvidenceQueryManager.js";

const DisputeEvidence = ModelManager.createModel(DisputeEvidenceQueryManager.schema,
  String.DISPUTE_EVIDENCE_MODEL
);

export default DisputeEvidence;
