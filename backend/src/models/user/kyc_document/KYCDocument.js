import { ModelManager } from '../../../database/utils/ModelManager.js';
import { String } from '../../../utils/Constant.js';
import { KYCDocumentQueryManager } from './KYCDocumentQueryManager.js';

const KYCDocument = ModelManager.createModel(KYCDocumentQueryManager.schema, String.KYC_DOCUMENT_MODEL);

export default KYCDocument;