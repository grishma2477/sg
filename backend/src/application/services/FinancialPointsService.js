
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import FinancialPointAccount from "../../models/finance/financial_points/FinancialPointAccount.js";
import FinancialPointBatch from "../../models/finance/financial_points/FinancialPointBatch.js";
import { AppError } from "../../utils/AppError.js";
import { POINTS_CONVERSION } from "../../utils/Constant.js";


export class FinancialPointsService {

  // ============================================
  // CREATE ACCOUNT IF NOT EXISTS
  // ============================================
  static async ensureAccount(userId, client) {

    let account = await FinancialPointAccount.findOne(
      { user_id: userId },
      client
    );

    if (!account) {
      account = await FinancialPointAccount.create({
        user_id: userId
      }, client);
    }

    return account;
  }

  // ============================================
  // EARN POINTS (2 MONTH EXPIRY)
  // ============================================
  static async earnPoints({ userId, points, source }) {

    if (points <= 0) {
      throw new AppError("INVALID_POINTS_AMOUNT", 400);
    }

    return await withTransaction(async (client) => {

      const account = await this.ensureAccount(userId, client);

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 2);

      await FinancialPointBatch.create({
        account_id: account.id,
        user_id: userId,
        source,
        points_earned: points,
        points_remaining: points,
        expiry_date: expiryDate
      }, client);

      await FinancialPointAccount.updateOne(
        { id: account.id },
        {
          total_points: account.total_points + points,
          lifetime_earned: account.lifetime_earned + points,
          last_activity_at: new Date()
        },
        client
      );

      return { message: "POINTS_EARNED", points };
    });
  }

  // ============================================
  // REDEEM POINTS (FIFO)
  // ============================================
  static async redeemPoints({ userId, nprAmount }) {

    if (nprAmount <= 0) {
      throw new AppError("INVALID_AMOUNT", 400);
    }

    const requiredPoints = Math.ceil(
      nprAmount / POINTS_CONVERSION.NPR_PER_POINT
    );

    return await withTransaction(async (client) => {

      const account = await this.ensureAccount(userId, client);

      if (account.total_points < requiredPoints) {
        throw new AppError("INSUFFICIENT_POINTS", 400);
      }

      let remainingToDeduct = requiredPoints;

      const batches = await FinancialPointBatch.find({
        user_id: userId,
        status: "active"
      }, client);

      const sortedBatches = batches
        .filter(b => new Date(b.expiry_date) > new Date())
        .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

      for (const batch of sortedBatches) {

        if (remainingToDeduct <= 0) break;

        const usable = Math.min(
          batch.points_remaining,
          remainingToDeduct
        );

        const newRemaining = batch.points_remaining - usable;

        await FinancialPointBatch.updateOne(
          { id: batch.id },
          {
            points_remaining: newRemaining,
            status: newRemaining === 0 ? "fully_redeemed" : "active"
          },
          client
        );

        remainingToDeduct -= usable;
      }

      await FinancialPointAccount.updateOne(
        { id: account.id },
        {
          total_points: account.total_points - requiredPoints,
          lifetime_redeemed: account.lifetime_redeemed + requiredPoints,
          last_activity_at: new Date()
        },
        client
      );

      return {
        message: "POINTS_REDEEMED",
        pointsUsed: requiredPoints,
        nprValue: nprAmount
      };
    });
  }

  // ============================================
  // EXPIRE POINTS (CRON JOB READY)
  // ============================================
  static async expirePointsJob() {

    return await withTransaction(async (client) => {

      const now = new Date();

      const expiredBatches = await FinancialPointBatch.find({
        status: "active"
      }, client);

      for (const batch of expiredBatches) {

        if (new Date(batch.expiry_date) <= now &&
            batch.points_remaining > 0) {

          const expiredPoints = batch.points_remaining;

          await FinancialPointBatch.updateOne(
            { id: batch.id },
            {
              points_remaining: 0,
              status: "expired"
            },
            client
          );

          const account = await FinancialPointAccount.findOne(
            { id: batch.account_id },
            client
          );

          await FinancialPointAccount.updateOne(
            { id: account.id },
            {
              total_points: account.total_points - expiredPoints,
              lifetime_expired: account.lifetime_expired + expiredPoints
            },
            client
          );
        }
      }

      return { message: "POINT_EXPIRY_COMPLETED" };
    });
  }
}