import {ModelManager} from '../../database/utils/ModelManager.js';
import { UserQueryManager } from './UserQueryManager.js';
import { String } from '../../utils/Constant.js';


const User = ModelManager.createModel(UserQueryManager.schema, String.USER_MODEL);
export default User;