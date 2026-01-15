import { DriverVisibilityQueryManager } from "./DriverVisibilityQueryManager.js";
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";

const DriverVisibility = ModelManager.createModel(DriverVisibilityQueryManager.schema, String.DRIVER_VISIBILITY_MODEL);

export default DriverVisibility;
