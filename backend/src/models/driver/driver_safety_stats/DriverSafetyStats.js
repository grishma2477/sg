import { ModelManager } from "../../../database/utils/ModelManager.js";
import { DriverSafetyStatsQueryManager } from "./DriverSafetyStatsQueryManager.js";
import { String } from "../../../utils/Constant.js";

const DriverSafetyStats = ModelManager.createModel([
  DriverSafetyStatsQueryManager.createDriverSafetyStatsTableQuery,
  DriverSafetyStatsQueryManager.createDriverSafetyStatsTableQueryIndex],
  String.DRIVER_SAFETY_STATS_MODEL
);

export default DriverSafetyStats;
