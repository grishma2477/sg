import { DriverLocationQueryManager } from "./DriverLocationQueryManager.js";
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";

const DriverLocation = ModelManager.createModel(
  DriverLocationQueryManager.schema,
  String.DRIVER_LOCATION_MODEL
);

export default DriverLocation;
