import { ModelManager } from "../../database/utils/ModelManager.js";
import { VehicleQueryManager } from "./VehicleQueryManager.js";
import { String } from "../../utils/Constant.js";

const Vehicle = ModelManager.createModel(VehicleQueryManager.schema,
  String.VEHICLE_MODEL
);

export default Vehicle;
