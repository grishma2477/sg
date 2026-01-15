import { DriverSafetyStatsQueryManager } from "./DriverSafetyStatsQueryManager.js";
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";

const DriverSafetyStats = ModelManager.createModel(DriverSafetyStatsQueryManager.schema,
  String.DRIVER_SAFETY_STATS_MODEL
);

export default DriverSafetyStats;
