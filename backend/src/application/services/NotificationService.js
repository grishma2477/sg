import { pool } from '../../database/DBConnection.js';
import { sendToUser } from '../../infrastructure/fcmClient.js';
import { emitToUser } from '../../realtime/socketServer.js';

export class NotificationService {
  /**
   * Save notification to DB, send FCM push, emit socket event.
   * Fire-and-forget safe — never throws; logs errors.
   *
   * @param {number} userId
   * @param {{ title: string, body: string, data?: object, type: string }} payload
   */
  static async notify(userId, { title, body, data = {}, type }) {
    if (!userId) return;

    try {
      // 1. Persist to notifications table
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, data, type)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, title, body, JSON.stringify(data), type]
      );
    } catch (err) {
      console.error(`[NotificationService] DB insert failed for user ${userId}:`, err.message);
    }

    // 2. FCM push (fire-and-forget)
    sendToUser(userId, { title, body, data }).catch((err) =>
      console.error(`[NotificationService] FCM failed for user ${userId}:`, err.message)
    );

    // 3. Socket real-time bell
    try {
      emitToUser(userId, 'notification', { title, body, data, type });
    } catch (err) {
      console.error(`[NotificationService] Socket emit failed for user ${userId}:`, err.message);
    }
  }

  /**
   * Convenience: notify multiple users with the same payload.
   */
  static async notifyMany(userIds, payload) {
    await Promise.allSettled(userIds.map((id) => NotificationService.notify(id, payload)));
  }
}
