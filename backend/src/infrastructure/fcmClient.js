import admin from 'firebase-admin';
import { pool } from '../database/DBConnection.js';

// TODO: Add to .env:
//   FIREBASE_SERVICE_ACCOUNT — JSON string of the service account key downloaded from
//   Firebase Console → Project Settings → Service Accounts → Generate new private key

let app;

function getApp() {
  if (app) return app;

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    console.warn('[fcmClient] FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('[fcmClient] Firebase Admin SDK initialized');
    return app;
  } catch (err) {
    console.error('[fcmClient] Failed to initialize Firebase:', err.message);
    return null;
  }
}

// Lookup active FCM tokens for a user
async function getTokensForUser(userId) {
  const result = await pool.query(
    `SELECT fcm_token FROM device_tokens WHERE user_id = $1 AND is_active = true`,
    [userId]
  );
  return result.rows.map((r) => r.fcm_token).filter(Boolean);
}

/**
 * Send push notification to a single user (all their active devices)
 */
export async function sendToUser(userId, { title, body, data = {} }) {
  if (!getApp()) return;
  const tokens = await getTokensForUser(userId);
  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    tokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    if (response.failureCount > 0) {
      const failed = response.responses
        .map((r, i) => (!r.success ? tokens[i] : null))
        .filter(Boolean);
      // Deactivate stale tokens
      if (failed.length > 0) {
        await pool.query(
          `UPDATE device_tokens SET is_active = false WHERE fcm_token = ANY($1::text[])`,
          [failed]
        );
      }
    }
  } catch (err) {
    console.error(`[fcmClient] sendToUser(${userId}) error:`, err.message);
  }
}

/**
 * Send push notification to multiple users (batch)
 */
export async function sendToMultiple(userIds, { title, body, data = {} }) {
  if (!getApp() || userIds.length === 0) return;

  const result = await pool.query(
    `SELECT user_id, fcm_token FROM device_tokens WHERE user_id = ANY($1::int[]) AND is_active = true`,
    [userIds]
  );

  const tokens = result.rows.map((r) => r.fcm_token).filter(Boolean);
  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    tokens
  };

  try {
    await admin.messaging().sendEachForMulticast(message);
  } catch (err) {
    console.error('[fcmClient] sendToMultiple error:', err.message);
  }
}

/**
 * Send push to a Firebase topic (e.g., surge alerts)
 */
export async function sendToTopic(topic, { title, body, data = {} }) {
  if (!getApp()) return;
  try {
    await admin.messaging().send({
      topic,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
    });
  } catch (err) {
    console.error(`[fcmClient] sendToTopic(${topic}) error:`, err.message);
  }
}
