import { ModelManager } from "../../database/utils/ModelManager.js";
import { RideRequestQueryManager } from "./RideRequestQueryManager.js";
import { String } from "../../utils/Constant.js";

const RideRequest = ModelManager.createModel(RideRequestQueryManager.schema, String.RIDE_REQUEST_MODEL);

export default RideRequest;
