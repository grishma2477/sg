

import dotenv from "dotenv";
dotenv.config();

export const Constant = {
  PORT: process.env.PORT,
  AccessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
  RefreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
  AccessTokenExpirationTime: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
  RefreshTokenExpirationTime: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
};

/**
 * Database Table Names
 * 
 * All table name constants used throughout the application.
 * These map to the PostgreSQL table names.
 */
export const String = {

  // ===================================================
  // Globals Constant 
  // ===================================================
  MINIMUM_RIDE:10,
  INITIAL_POINTS:1000,
  // ═══════════════════════════════════════════════════
  // USER & AUTH TABLES
  // ═══════════════════════════════════════════════════
  USER_MODEL: "users",
  AUTH_CREDENTIAL_MODEL: "auth_credentials",
  USER_PROFILE_MODEL: "user_profiles",
  USER_VERIFICATION_MODEL: "user_verifications",
  KYC_MODEL: "kyc",
  KYC_DOCUMENT_MODEL: "kyc_documents",
  // ═══════════════════════════════════════════════════
  // DRIVER TABLES
  // ═══════════════════════════════════════════════════
  DRIVER_MODEL: "drivers",
  DRIVER_SAFETY_STATS_MODEL: "driver_safety_stats",
  DRIVER_RESTRICTION_MODEL: "driver_restrictions",
  DRIVER_LOCATION_MODEL: "driver_locations",
  DRIVER_VISIBILITY_MODEL: "driver_visibility",
  DRIVER_APPLICATION_MODEL: 'driver_applications',
  DRIVER_VERIFICATIONS_MODEL: 'driver_verifications',

  // ═══════════════════════════════════════════════════
  // VEHICLE TABLE
  // ═══════════════════════════════════════════════════
  VEHICLE_MODEL: "vehicles",
  VEHICLE_APPLICATION_MODEL: "vehicle_applications",

  
  // ═══════════════════════════════════════════════════
  // RIDE TABLES
  // ═══════════════════════════════════════════════════
  RIDE_MODEL: "rides",
  RIDE_BID_MODEL: "ride_bids",
  RIDE_REQUEST_MODEL: "ride_requests",
  RIDE_LOCATION_MODEL: "ride_locations",
  RIDE_STOP_MODEL: "ride_stops",
  RIDER_SAFETY_STATS_MODEL: "rider_safety_stats",


  // ═══════════════════════════════════════════════════
  // REVIEW & SAFETY TABLES
  // ═══════════════════════════════════════════════════
  REVIEW_MODEL: "ride_reviews",
  SAFETY_AUDIT_MODEL: "safety_audit_logs",
  SAFETY_COMMENT_MODEL: "safety_comments",

  // ═══════════════════════════════════════════════════
  // FINANCE TABLES
  // ═══════════════════════════════════════════════════
  WALLET_MODEL: "wallets",
  TRANSACTION_MODEL: "transactions",
  PRICING_MODEL: "pricing",
  PAYMENT_HOLD_MODEL: "payment_holds",
  RIDE_PAYMENT_MODEL: "ride_payments",
  PROMO_CODES: "promo_codes",
  PROMO_CODE_REDEMPTION: "promo_code_redemptions",
  GIFT_CARD_MODEL: "gift_cards",
  GIFT_CARD_REDEMPTION: "gift_card_redemptions",

  // ═══════════════════════════════════════════════════
  // REFERENCE TABLES
  // ═══════════════════════════════════════════════════
  TAP_DEFINITION_MODEL: "tap_definitions",

  // ═══════════════════════════════════════════════════
  // ADMIN TABLES
  // ═══════════════════════════════════════════════════
  ADMIN_AUDIT_MODEL: "admin_audits"
};