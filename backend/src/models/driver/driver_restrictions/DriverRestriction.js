
import { DriverRestrictionQueryManager } from "./DriverRestrictionQueryManager.js";

import { ModelManager } from "../../../database/utils/ModelManager.js";
import { String } from "../../../utils/Constant.js";

const DriverRestriction = ModelManager.createModel(DriverRestrictionQueryManager.schema,
  String.DRIVER_RESTRICTION_MODEL
);

export default DriverRestriction;
