import dotenv from "dotenv";

dotenv.config();


export const Constant = {
    MONGO_URL:process.env.MONGO_URL,
    PORT:process.env.PORT,
    AccessTokenSecretKey:process.env.ACCESS_TOKEN_SECRET_KEY,
    RefreshTokenSecretKey:process.env.REFRESH_TOKEN_SECRET_KEY,
    AccessTokenExpirationTime:process.env.ACCESS_TOKEN_EXPIRATION_TIME,
    RefreshTokenExpirationTime:process.env.REFRESH_TOKEN_EXPIRATION_TIME,
}

export const String = {
  USER_MODEL: "users",
  DRIVER_MODEL: "drivers",
  VEHICLE_MODEL: "vehicles",
  DRIVER_LOCATION_MODEL: "driver_locations",
  RIDE_LOCATION_MODEL: "ride_locations",
  RIDE_STOP_MODEL: "ride_stops",
  RIDE_MODEL: "rides",
  PRICING_MODEL: "pricing_rules",
  WALLET_MODEL: "wallets",
  TRANSACTION_MODEL: "transactions",
  RIDE_RATING_MODEL: "ride_ratings",
  ROLE_USER: "User",
  ROLE_ADMIN: "Admin",
}