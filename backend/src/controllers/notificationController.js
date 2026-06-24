import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/notifications?page=1&limit=20
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page  = Math.max(1, parseInt(req.query.page  ?? '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    const [rowsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT id, title, body, data, type, read_at, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM notifications WHERE user_id = $1`, [userId])
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    res.json(ApiResponse.success({
      notifications: rowsResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch notifications', 500));
  }
};

/**
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    res.json(ApiResponse.success({ count: parseInt(result.rows[0].count, 10) }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to fetch unread count', 500));
  }
};

/**
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications
       SET read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND read_at IS NULL
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Notification not found or already read', 404));
    }

    res.json(ApiResponse.success({ id: result.rows[0].id, read: true }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to mark notification as read', 500));
  }
};

/**
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `UPDATE notifications
       SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    res.json(ApiResponse.success({ updated: result.rowCount }));
  } catch (error) {
    res.status(500).json(ApiResponse.error('Failed to mark all as read', 500));
  }
};
