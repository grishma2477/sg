import crypto from "crypto";
import { pool } from "../../database/DBConnection.js";

const REFRESH_TTL_DAYS = 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class RefreshTokenService {
  static generate() {
    return crypto.randomBytes(32).toString("hex");
  }

  static async create(userId, { deviceId, deviceName } = {}) {
    const token     = RefreshTokenService.generate();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_id, device_name, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, deviceId ?? null, deviceName ?? null, expiresAt]
    );

    return token; // raw token — never stored
  }

  static async verify(rawToken) {
    const tokenHash = hashToken(rawToken);
    const { rows } = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    );
    if (rows.length === 0) return { valid: false, reason: "NOT_FOUND" };

    const record = rows[0];
    if (record.revoked_at)         return { valid: false, reason: "REVOKED", userId: record.user_id };
    if (new Date() > record.expires_at) return { valid: false, reason: "EXPIRED" };

    return { valid: true, record };
  }

  // Rotate: revoke old, issue new. If old is already revoked → stolen token → revoke all.
  static async rotate(rawToken) {
    const { valid, reason, record } = await RefreshTokenService.verify(rawToken);

    if (!valid) {
      if (reason === "REVOKED" && record) {
        // Stolen token detected — revoke all tokens for this user
        await RefreshTokenService.revokeAll(record.userId);
      }
      return { success: false, reason };
    }

    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`,
      [record.id]
    );

    const newToken = await RefreshTokenService.create(record.user_id, {
      deviceId:   record.device_id,
      deviceName: record.device_name,
    });

    return { success: true, token: newToken, userId: record.user_id };
  }

  static async revoke(rawToken) {
    const tokenHash = hashToken(rawToken);
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash]
    );
  }

  static async revokeAll(userId) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  }

  static async revokeDevice(userId, deviceId) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW()
       WHERE user_id = $1 AND device_id = $2 AND revoked_at IS NULL`,
      [userId, deviceId]
    );
  }
}
