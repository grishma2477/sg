import DriverLocationModel from "../models/driver/driver_location/DriverLocation.js";
import { notifyDriverLocationUpdate } from "../realtime/socketServer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import RideModel from "../models/ride/Ride.js";
import { pool } from "../database/DBConnection.js";
import redis from "../infrastructure/redisClient.js";

export const updateDriverLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user.driverId;

    // Update location in database
    await DriverLocationModel.upsert({
      driver_id: driverId,
      location: `POINT(${lng} ${lat})`,
      updated_at: new Date()
    });

    // If driver has active ride, notify rider
    const activeRide = await RideModel.findOne({
      driver_id: driverId,
      status: { $in: ['accepted', 'started'] }
    });

    if (activeRide) {
      notifyDriverLocationUpdate(activeRide.rider_id, { lat, lng, driverId });
    }

    res.json(ApiResponse.success({ updated: true }));
  } catch (err) {
    next(err);
  }
};

export const getDriverLocation = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    // Redis first (30s TTL cache set by updateDriverLocation)
    const cached = await redis.get(`driver:location:${driverId}`);
    if (cached) {
      return res.json(ApiResponse.success({ ...JSON.parse(cached), source: "cache" }));
    }

    // DB fallback
    const result = await pool.query(
      `SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, updated_at
       FROM driver_locations WHERE driver_id = $1`,
      [driverId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error("Driver location not found", 404));
    }

    res.json(ApiResponse.success({ ...result.rows[0], source: "db" }));
  } catch (err) {
    next(err);
  }
};

export const getNearbyDrivers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    const query = `
      SELECT 
        d.id,
        d.is_online,
        d.is_available,
        ST_Distance(
          dl.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) / 1000 as distance_km
      FROM drivers d
      INNER JOIN driver_locations dl ON d.id = dl.driver_id
      WHERE d.is_online = true
        AND d.is_available = true
        AND ST_DWithin(
          dl.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3 * 1000
        )
      ORDER BY distance_km ASC
      LIMIT 20;
    `;

    const result = await pool.query(query, [lng, lat, radius]);
    res.json(ApiResponse.success(result.rows));
  } catch (err) {
    next(err);
  }
};
