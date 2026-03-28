import { String } from "../../../../utils/Constant.js";
import { ModelManager } from "../../../database/utils/ModelManager.js";
import { RidePricingQueryManager } from "./RidePricingQueryManager.js";

const RidePricing = ModelManager.createModel(
  RidePricingQueryManager.schema,
  String.RIDE_PRICING
);

export default RidePricing;