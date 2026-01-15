import { ModelManager } from "../../database/utils/ModelManager.js";
import { RideBidQueryManager } from "./RideBidQueryManager.js";
import { String } from "../../utils/Constant.js";

const RideBid = ModelManager.createModel(RideBidQueryManager.schema, String.RIDE_BID_MODEL);

export default RideBid;
