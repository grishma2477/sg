import { ModelManager } from "../../database/utils/ModelManager.js";
import { DriverRestrictionQueryManager } from "./DriverRestrictionQueryManager.js";
import { String } from "../../utils/Constant.js";

const DriverRestriction = ModelManager.createModel([
  DriverRestrictionQueryManager.createDriverRestrictionTableQuery,
  DriverRestrictionQueryManager.createDriverRestrictionTableQueryIndex],
  String.DRIVER_RESTRICTION_MODEL
);

export default DriverRestriction;
