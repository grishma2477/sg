import { ModelManager } from "../../database/utils/ModelManager.js";
import { RideStopQueryManager } from "./RideStopQueryManager.enhanced.js";
import { String } from "../../utils/Constant.js";

const RideStop = ModelManager.createModel(RideStopQueryManager.schema, String.RIDE_STOP_MODEL);

export default RideStop;
