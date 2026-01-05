import { ModelManager } from "../../../database/utils/ModelManager.js";
import { DriverVisibilityQueryManager } from "./DriverVisibilityQueryManager.js";
import { String } from "../../../utils/Constant.js";

const DriverVisibility = ModelManager.createModel([
  DriverVisibilityQueryManager.createDriverVisibilityTableQuery,
  DriverVisibilityQueryManager.createDriverVisibilityIndexes
], String.DRIVER_VISIBILITY_MODEL);

export default DriverVisibility;
