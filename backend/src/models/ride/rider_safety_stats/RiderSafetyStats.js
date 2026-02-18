import { RiderSafetyStatsQueryManager } from "./RiderSafetyStatsQueryManager.js";
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";

const RiderSafetyStats = ModelManager.createModel(
  RiderSafetyStatsQueryManager.schema,
  String.RIDER_SAFETY_STATS_MODEL
);

export default RiderSafetyStats;