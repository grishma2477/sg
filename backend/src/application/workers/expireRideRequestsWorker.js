import { pool } from "../../database/DBConnection.js";
import { emitToUser } from "../../realtime/socketServer.js";

export const runExpireRideRequestsWorker = () => {

  setInterval(async () => {

    try {

      const result = await pool.query(`
        UPDATE ride_requests
        SET status = 'expired'
        WHERE status IN ('pending','broadcasting')
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
        RETURNING id, rider_id
      `);

      if (result.rows.length > 0) {
        console.log(`⏰ Expired ${result.rows.length} ride requests`);

        for (const row of result.rows) {
          // Cancel all pending bids for expired requests
          await pool.query(
            `UPDATE ride_bids SET status = 'expired'
             WHERE ride_request_id = $1 AND status = 'pending'`,
            [row.id]
          );

          // Notify rider their request expired
          emitToUser(row.rider_id, "ride_request_expired", {
            requestId: row.id,
            message: "Your ride request expired. No drivers accepted in time.",
          });
        }
      }

    } catch (error) {

      console.error("Ride expiration worker error:", error);

    }

  }, 60000); // every 60 seconds

};
