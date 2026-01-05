import { ModelManager } from "../../../database/utils/ModelManager.js";
import { DriverLocationQueryManager } from "./DriverLocationQueryManager.js";
import { String } from "../../../utils/Constant.js";

const DriverLocation = ModelManager.createModel(
  DriverLocationQueryManager.createDriverLocationTableQuery,
  String.DRIVER_LOCATION_MODEL
);

export default DriverLocation;
