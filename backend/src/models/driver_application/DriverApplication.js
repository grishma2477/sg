import { ModelManager } from "../../database/utils/ModelManager.js";
import { DriverApplicationQueryManager } from "./DriverApplicationQueryManager.js";
import { String } from "../../utils/Constant.js";

const DriverApplication = ModelManager.createModel(
  DriverApplicationQueryManager.schema,
  String.DRIVER_APPLICATION_MODEL
);

export default DriverApplication;