import { ModelManager } from "../../database/utils/ModelManager.js";
import { RideQueryManager } from "./RideQueryManager.js";
import { String } from "../../utils/Constant.js";

const Ride = ModelManager.createModel([
  RideQueryManager.createRideTableQuery,
  RideQueryManager.createRideTableQueryIndex],
  String.RIDE_MODEL
);

export default Ride;
