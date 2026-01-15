import { ModelManager } from "../../database/utils/ModelManager.js";
import { TapDefinitionQueryManager } from "./TapDefinitionQueryManager.js";
import { String } from "../../utils/Constant.js";

const TapDefinition = ModelManager.createModel(TapDefinitionQueryManager.schema,
  String.TAP_DEFINITION_MODEL
);

export default TapDefinition;
