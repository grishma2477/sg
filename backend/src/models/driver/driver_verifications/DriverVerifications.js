import { ModelManager } from '../../../database/utils/ModelManager.js';
import { DriverVerificationsQueryManager } from './DriverVerificationsQuerymanager.js';
import { String } from '../../../utils/Constant.js';

const DriverVerifications = ModelManager.createModel(
  DriverVerificationsQueryManager.schema,
  String.DRIVER_VERIFICATIONS_MODEL
);

export { DriverVerifications };