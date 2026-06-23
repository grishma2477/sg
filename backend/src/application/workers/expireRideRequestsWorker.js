import { pool } from "../../database/DBConnection.js";


export const runExpireRideRequestsWorker = () => {

  setInterval(async () => {

    try {

      const result = await pool.query(`
        UPDATE ride_requests
        SET status = 'expired'
        WHERE status IN ('pending','broadcasting')
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
        RETURNING id
      `);

      if (result.rows.length > 0) {
        console.log(`⏰ Expired ${result.rows.length} ride requests`);
      }

    } catch (error) {

      console.error("Ride expiration worker error:", error);

    }

  }, 10000); 

};