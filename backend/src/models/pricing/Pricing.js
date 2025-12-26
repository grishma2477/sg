import { ModelManager } from '../../database/utils/ModelManager.js';
import { PricingQueryManager } from './PricingQueryManager.js';
import { String } from '../../utils/Constant.js';

const Pricing = ModelManager.createModel(
  PricingQueryManager.createPricingTableQuery,
  String.PRICING_MODEL
);

export default Pricing;
