import { ModelManager } from "../../database/utils/ModelManager.js";
import { DriverQueryManager } from "./DriverQueryManager.js";
import { String } from "../../utils/Constant.js";

const Driver = ModelManager.createModel([
  DriverQueryManager.createDriverTableQuery,
  DriverQueryManager.createDriverTableQueryIndex],
  String.DRIVER_MODEL
);

export default Driver;
