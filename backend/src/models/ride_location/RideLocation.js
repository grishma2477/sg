import { ModelManager } from '../../database/utils/ModelManager.js';
import { RideLocationQueryManager } from './RideLocationQueryManager.js';
import { String } from '../../utils/Constant.js';

const RideLocation = ModelManager.createModel(
  RideLocationQueryManager.createRideLocationTableQuery,
  String.RIDE_LOCATION_MODEL
);

export default RideLocation;
