import dotenv from "dotenv";
dotenv.config();

export const Constant = {
  PORT: process.env.PORT,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
};

export const String = {
  // Identity
  USER_MODEL: "users",
  AUTH_CREDENTIAL_MODEL: "auth_credentials",
  USER_PROFILE_MODEL: "user_profiles",
  USER_VERIFICATION_MODEL: "user_verifications",

  // Driver Models Names Starts From Here
  DRIVER_MODEL: "drivers",
  DRIVER_SAFETY_STATS_MODEL: "driver_safety_stats",
  DRIVER_RESTRICTION_MODEL: "driver_restrictions",

  // Vehicle Models Name Starts Here
  VEHICLE_MODEL: "vehicles",

  // Ride Model Names Starts From Here
  RIDE_MODEL: "rides",
  RIDE_LOCATION_MODEL: "ride_locations",
  RIDE_STOP_MODEL: "ride_stops",

  // Review & Safety Models Name Starts From Here
  REVIEW_MODEL: "ride_reviews",
  SAFETY_AUDIT_MODEL: "safety_audit_logs",

  // Reference Models Name Starts From Here
  TAP_DEFINITION_MODEL: "tap_definitions",
};
