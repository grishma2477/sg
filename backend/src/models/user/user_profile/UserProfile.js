import { ModelManager } from '../../../database/utils/ModelManager.js';
import { UserProfileQueryManager } from '../UserProfileQueryManager.js';
import { String } from '../../../utils/Constant.js';

const UserProfile = ModelManager.createModel(
  UserProfileQueryManager.createUserProfileTableQuery,
  String.USER_PROFILE_MODEL
);

export default UserProfile;
