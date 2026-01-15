import { ModelManager } from '../../../database/utils/ModelManager.js';
import { UserVerificationQueryManager } from './UserVerificationQueryManager.js';
import { String } from '../../../utils/Constant.js';

const UserVerification = ModelManager.createModel(
  UserVerificationQueryManager.schema,
  String.USER_VERIFICATION_MODEL
);


export default UserVerification;
