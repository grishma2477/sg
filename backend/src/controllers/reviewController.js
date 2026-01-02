// import { ReviewSubmissionService } from "../application/services/ReviewSubmissionService.js";
// import { ReviewRepository } from "../infrastructure/repositories/ReviewRepository.js";
// import { safetyQueue } from "../infrastructure/async/safetyQueue.js";

// const service = new ReviewSubmissionService();
// const repo = new ReviewRepository();

// export const submitReview = async (req, res) => {
//   const review = service.submit(req.body);

//   await repo.save(review);

//   // async safety (NON-BLOCKING)
//   safetyQueue.push(review);

//   res.status(201).json({ reviewId: review.id });
// };


import { ReviewSubmissionService } from "../application/services/ReviewSubmissionService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const reviewService = new ReviewSubmissionService();

export const submitReview = async (req, res, next) => {
  try {
    /**
     * Delegate EVERYTHING to the service:
     * - validation
     * - role-direction enforcement
     * - DB transaction
     * - Redis cleanup
     * - Bull queue push
     */
    const review = await reviewService.submit({
      ...req.body,
      currentUser: req.user
    });

    /**
     * Consistent API response
     */
    return res.status(201).json(
      ApiResponse.success(
        { reviewId: review.id },
        "REVIEW_SUBMITTED"
      )
    );
  } catch (err) {
    next(err); // centralized error handler
  }
};
