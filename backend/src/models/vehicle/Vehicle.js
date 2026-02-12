import { ModelManager } from "../../database/utils/ModelManager.js";
import { VehicleApplicationQueryManager } from "./VehicleQueryManager.js";
import { String } from "../../utils/Constant.js";

const VehicleApplication = ModelManager.createModel(
  VehicleApplicationQueryManager.schema,
  String.VEHICLE_APPLICATION_MODEL
);

export default VehicleApplication;