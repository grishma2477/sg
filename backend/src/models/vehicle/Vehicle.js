import { ModelManager } from "../../database/utils/ModelManager.js";
import { VehicleQueryManager } from "./VehicleQueryManager.js";
import { String } from "../../utils/Constant.js";

const Vehicle = ModelManager.createModel([
  VehicleQueryManager.createVehicleTableQuery,
  VehicleQueryManager.createVehicleTableQueryIndex],
  String.VEHICLE_MODEL
);

export default Vehicle;
