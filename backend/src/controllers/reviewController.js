import { ReviewSubmissionService } from "../application/services/ReviewSubmissionService.js";
import { ReviewRepository } from "../infrastructure/repositories/ReviewRepository.js";
import { safetyQueue } from "../infrastructure/async/safetyQueue.js";

const service = new ReviewSubmissionService();
const repo = new ReviewRepository();

export const submitReview = async (req, res) => {
  const review = service.submit(req.body);

  await repo.save(review);

  // async safety (NON-BLOCKING)
  safetyQueue.push(review);

  res.status(201).json({ reviewId: review.id });
};
