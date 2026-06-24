import { pool } from '../../database/DBConnection.js';

export class SurgeService {
  /**
   * Returns the highest active surge multiplier for a given pickup point.
   * Returns 1.0 (no surge) if none found.
   */
  static async getMultiplier(lat, lng) {
    const { rows } = await pool.query(
      `SELECT multiplier, area_name, reason
       FROM surges
       WHERE NOW() BETWEEN starts_at AND ends_at
         AND ST_DWithin(
           ST_MakePoint(lng, lat)::geography,
           ST_MakePoint($1, $2)::geography,
           radius_km * 1000
         )
       ORDER BY multiplier DESC
       LIMIT 1`,
      [lng, lat]
    );
    if (!rows.length) return { multiplier: 1.0, surgeArea: null, reason: null };
    return {
      multiplier: parseFloat(rows[0].multiplier),
      surgeArea:  rows[0].area_name,
      reason:     rows[0].reason,
    };
  }

  static async listActive() {
    const { rows } = await pool.query(
      `SELECT id, area_name, lat, lng, radius_km, multiplier, reason, starts_at, ends_at,
              created_by, created_at
       FROM surges
       WHERE NOW() BETWEEN starts_at AND ends_at
       ORDER BY multiplier DESC`
    );
    return rows;
  }

  static async create({ area_name, lat, lng, radius_km, multiplier, reason, ends_at, created_by }) {
    const { rows } = await pool.query(
      `INSERT INTO surges (area_name, lat, lng, radius_km, multiplier, reason, ends_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [area_name, lat, lng, radius_km ?? 2, multiplier, reason ?? null, ends_at, created_by]
    );
    return rows[0];
  }

  static async endEarly(id) {
    const { rows } = await pool.query(
      `UPDATE surges SET ends_at = NOW() WHERE id = $1 AND ends_at > NOW() RETURNING *`,
      [id]
    );
    return rows[0] ?? null;
  }
}
