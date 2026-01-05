import SafetyCommentModel from "../../models/safety/SafetyComment.js";
import ReviewModel from "../../models/review/Review.js";
import DriverSafetyStatsModel from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
import { SafetyCategories } from "../../models/safety/SafetyCommentQueryManager.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import { AppError } from "../../utils/AppError.js";
import cloudinary from "../../config/cloudinary.js";

/**
 * Safety Comment Service
 * 
 * Manages safety-related comments and concerns:
 * - Additional details on safety issues
 * - Evidence upload (photos/videos)
 * - Admin review workflow
 * - Severity escalation
 */
export class SafetyCommentService {
  
  /**
   * Add a safety comment to a review
   * 
   * @param {Object} params
   * @param {string} params.reviewId - Review ID
   * @param {string} params.commenterId - User adding the comment
   * @param {string} params.commenterRole - 'rider', 'driver', 'admin'
   * @param {string} params.commentText - Comment content
   * @param {string} params.safetyCategory - Category of safety concern
   * @param {Array} params.evidenceFiles - Optional uploaded files
   */
  async addSafetyComment({
    reviewId,
    commenterId,
    commenterRole,
    commentText,
    safetyCategory,
    evidenceFiles = []
  }) {
    
    // ═══════════════════════════════════════════════════
    // 1️⃣ VALIDATE REVIEW
    // ═══════════════════════════════════════════════════
    const review = await ReviewModel.findById(reviewId);
    
    if (!review) {
      throw new AppError("REVIEW_NOT_FOUND", 404);
    }
    
    if (!review.has_safety_concern) {
      throw new AppError("REVIEW_HAS_NO_SAFETY_CONCERN", 400);
    }
    
    // ═══════════════════════════════════════════════════
    // 2️⃣ VALIDATE SAFETY CATEGORY
    // ═══════════════════════════════════════════════════
    const categoryConfig = SafetyCategories[safetyCategory.toUpperCase()];
    
    if (!categoryConfig) {
      throw new AppError("INVALID_SAFETY_CATEGORY", 400, {
        validCategories: Object.keys(SafetyCategories)
      });
    }
    
    // ═══════════════════════════════════════════════════
    // 3️⃣ UPLOAD EVIDENCE FILES
    // ═══════════════════════════════════════════════════
    let evidenceUrls = [];
    
    if (evidenceFiles && evidenceFiles.length > 0) {
      evidenceUrls = await this._uploadEvidence(evidenceFiles, reviewId);
    }
    
    // ═══════════════════════════════════════════════════
    // 4️⃣ DETERMINE SEVERITY
    // ═══════════════════════════════════════════════════
    const severityLevel = categoryConfig.defaultSeverity;
    const requiresAdminReview = categoryConfig.requiresAdminReview;
    
    // ═══════════════════════════════════════════════════
    // 5️⃣ CREATE COMMENT
    // ═══════════════════════════════════════════════════
    const comment = await SafetyCommentModel.create({
      review_id: reviewId,
      commenter_id: commenterId,
      commenter_role: commenterRole,
      comment_text: commentText.trim(),
      safety_category: categoryConfig.key,
      severity_level: severityLevel,
      evidence_urls: JSON.stringify(evidenceUrls),
      admin_reviewed: false,
      is_resolved: false,
      is_public: false,  // Only visible to admins and involved parties
      is_flagged: requiresAdminReview,
      requires_follow_up: severityLevel === 'critical' || severityLevel === 'high'
    });
    
    console.log(`⚠️ Safety comment created: ${comment.id} (${severityLevel})`);
    
    // ═══════════════════════════════════════════════════
    // 6️⃣ AUTO-APPLY ADDITIONAL POINTS DEDUCTION
    // ═══════════════════════════════════════════════════
    if (categoryConfig.pointsImpact < 0) {
      await this._applyAdditionalPointsDeduction(
        review.reviewee_driver_id,
        categoryConfig.pointsImpact,
        comment.id
      );
    }
    
    // TODO: Notify admins if flagged
    
    return {
      commentId: comment.id,
      severity: severityLevel,
      requiresAdminReview,
      pointsImpact: categoryConfig.pointsImpact
    };
  }
  
  /**
   * Get all comments for a review
   */
  async getReviewComments(reviewId, requesterId, requesterRole) {
    
    const review = await ReviewModel.findById(reviewId);
    
    if (!review) {
      throw new AppError("REVIEW_NOT_FOUND", 404);
    }
    
    // Only admins, reviewer, and reviewee can see comments
    const isAuthorized = 
      requesterRole === 'admin' ||
      requesterId === review.reviewer_id ||
      requesterId === review.reviewee_driver_id;
    
    if (!isAuthorized) {
      throw new AppError("NOT_AUTHORIZED", 403);
    }
    
    const comments = await SafetyCommentModel.find({
      review_id: reviewId
    });
    
    return comments.map(comment => ({
      commentId: comment.id,
      commenterId: comment.commenter_id,
      commenterRole: comment.commenter_role,
      text: comment.comment_text,
      category: comment.safety_category,
      severity: comment.severity_level,
      evidenceUrls: JSON.parse(comment.evidence_urls || '[]'),
      isResolved: comment.is_resolved,
      adminReviewed: comment.admin_reviewed,
      createdAt: comment.created_at
    }));
  }
  
  /**
   * Admin reviews and resolves a safety comment
   */
  async adminReviewComment({
    commentId,
    adminId,
    actionTaken,
    notes,
    newSeverity = null
  }) {
    
    const comment = await SafetyCommentModel.findById(commentId);
    
    if (!comment) {
      throw new AppError("COMMENT_NOT_FOUND", 404);
    }
    
    // Update comment
    const updates = {
      admin_reviewed: true,
      admin_reviewed_by: adminId,
      admin_reviewed_at: new Date(),
      admin_notes: notes,
      admin_action_taken: actionTaken,
      is_flagged: false
    };
    
    // Optionally escalate/de-escalate severity
    if (newSeverity) {
      updates.severity_level = newSeverity;
    }
    
    // If action taken, mark as resolved
    if (actionTaken && actionTaken !== 'none') {
      updates.is_resolved = true;
      updates.resolved_at = new Date();
      updates.resolution_notes = notes;
    }
    
    await SafetyCommentModel.findByIdAndUpdate(commentId, updates);
    
    console.log(`✅ Admin reviewed comment ${commentId}: ${actionTaken}`);
    
    return { success: true, action: actionTaken };
  }
  
  /**
   * Get pending admin reviews
   */
  async getPendingAdminReviews(filters = {}) {
    
    const conditions = {
      admin_reviewed: false
    };
    
    if (filters.severity) {
      conditions.severity_level = filters.severity;
    }
    
    if (filters.flaggedOnly) {
      conditions.is_flagged = true;
    }
    
    const comments = await SafetyCommentModel.find(conditions);
    
    // Enrich with review and driver data
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const review = await ReviewModel.findById(comment.review_id);
        
        return {
          commentId: comment.id,
          reviewId: comment.review_id,
          driverId: review?.reviewee_driver_id,
          category: comment.safety_category,
          severity: comment.severity_level,
          text: comment.comment_text,
          evidenceCount: JSON.parse(comment.evidence_urls || '[]').length,
          isFlagged: comment.is_flagged,
          requiresFollowUp: comment.requires_follow_up,
          createdAt: comment.created_at
        };
      })
    );
    
    // Sort by severity and date
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    enrichedComments.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    
    return enrichedComments;
  }
  
  /**
   * Get safety comment statistics
   */
  async getCommentStatistics(filters = {}) {
    
    const conditions = {};
    
    if (filters.driverId) {
      // Get reviews for this driver
      const reviews = await ReviewModel.find({
        reviewee_driver_id: filters.driverId
      });
      
      conditions.review_id = { $in: reviews.map(r => r.id) };
    }
    
    if (filters.startDate) {
      conditions.created_at = { $gte: new Date(filters.startDate) };
    }
    
    if (filters.endDate) {
      conditions.created_at = { 
        ...conditions.created_at,
        $lte: new Date(filters.endDate) 
      };
    }
    
    const comments = await SafetyCommentModel.find(conditions);
    
    // Calculate statistics
    const stats = {
      total: comments.length,
      bySeverity: {
        critical: comments.filter(c => c.severity_level === 'critical').length,
        high: comments.filter(c => c.severity_level === 'high').length,
        medium: comments.filter(c => c.severity_level === 'medium').length,
        low: comments.filter(c => c.severity_level === 'low').length
      },
      byCategory: {},
      resolved: comments.filter(c => c.is_resolved).length,
      pending: comments.filter(c => !c.admin_reviewed).length,
      flagged: comments.filter(c => c.is_flagged).length
    };
    
    // Count by category
    Object.keys(SafetyCategories).forEach(key => {
      const categoryKey = SafetyCategories[key].key;
      stats.byCategory[categoryKey] = comments.filter(
        c => c.safety_category === categoryKey
      ).length;
    });
    
    return stats;
  }
  
  // ═══════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════
  
  /**
   * Upload evidence files to Cloudinary
   */
  async _uploadEvidence(files, reviewId) {
    
    const urls = [];
    
    for (const file of files) {
      try {
        // Upload to cloudinary in safety-evidence folder
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: `safety-evidence/${reviewId}`,
          resource_type: 'auto'  // auto-detect image/video
        });
        
        urls.push({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type,
          uploadedAt: new Date()
        });
        
      } catch (error) {
        console.error("❌ Evidence upload failed:", error);
        // Continue with other files
      }
    }
    
    return urls;
  }
  
  /**
   * Apply additional points deduction for categorized safety concern
   */
  async _applyAdditionalPointsDeduction(driverId, pointsDelta, commentId) {
    
    const stats = await DriverSafetyStatsModel.findOne({
      driver_id: driverId
    });
    
    if (!stats) {
      console.log(`⚠️ No stats found for driver ${driverId}`);
      return;
    }
    
    const newPoints = Math.max(0, stats.current_points + pointsDelta);
    
    await DriverSafetyStatsModel.findOneAndUpdate(
      { driver_id: driverId },
      {
        current_points: newPoints,
        updated_at: new Date()
      }
    );
    
    console.log(`📉 Additional points deduction: ${pointsDelta} for driver ${driverId} (comment ${commentId})`);
    
    // TODO: Create audit log entry
  }
}
