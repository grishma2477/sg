import { ModelManager } from '../../../database/utils/ModelManager.js';
import { String } from '../../../utils/Constant.js';
import { KYCQueryManager } from './KYCQueryManager.js';

const KYC = ModelManager.createModel(KYCQueryManager.schema, String.KYC_MODEL);

export default KYC;