import { ModelManager } from '../../../database/utils/ModelManager.js';
import { AuthCredentialQueryManager } from './AuthCredentialQueryManager.js';
import { String } from '../../../utils/Constant.js';

const AuthCredential = ModelManager.createModel([
  AuthCredentialQueryManager.createAuthCredentialTableQuery,
  AuthCredentialQueryManager.createAuthCredentialTableQueryIndex
],
  String.AUTH_CREDENTIAL_MODEL
);

export default AuthCredential;
