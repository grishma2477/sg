import { ModelManager } from '../../database/utils/ModelManager.js';
import { ReviewQueryManager } from './ReviewQueryManager.js';
import { String } from '../../utils/Constant.js';

const Review = ModelManager.createModel(
  ReviewQueryManager.createReviewTableQuery,
  String.REVIEW_MODEL
);

export default Review;
