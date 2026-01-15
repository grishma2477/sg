import { ModelManager } from "../../database/utils/ModelManager.js";
import { SafetyCommentQueryManager } from "./SafetyCommentQueryManager.js";
import { String } from "../../utils/Constant.js";

const SafetyComment = ModelManager.createModel(SafetyCommentQueryManager.schema, String.SAFETY_COMMENT_MODEL);

export default SafetyComment;
