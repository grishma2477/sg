/**
 * Database Initialization Script
 * 
 * Creates all tables in the correct order (respecting foreign key dependencies).
 * Run with: node src/database/init.js
 */

import { pool } from "./DBConnection.js";

// Import all query managers
import { UserQueryManager } from "../models/user/UserQueryManager.js";
import { AuthCredentialQueryManager } from "../models/user/auth_credentials/AuthCredentialQueryManager.js";
import { UserProfileQueryManager } from "../models/user/user_profile/UserProfileQueryManager.js";
import { DriverQueryManager } from "../models/driver/DriverQueryManager.js";
import { DriverSafetyStatsQueryManager } from "../models/driver/driver_safety_stats/DriverSafetyStatsQueryManager.js";
import { VehicleQueryManager } from "../models/vehicle/VehicleQueryManager.js";
import { RideQueryManager } from "../models/ride/RideQueryManager.js";
import { ReviewQueryManager } from "../models/review/ReviewQueryManager.js";
import { SafetyAuditLogQueryManager } from "../models/safety/SafetyAuditLogQueryManager.js";
import { TapDefinitionQueryManager } from "../models/reference/TapDefinitionQueryManager.js";
import { AdminAuditQueryManager } from "../models/admin/AdminAuditQueryManager.js";

async function initializeDatabase() {
  console.log("🚀 Starting database initialization...\n");

  try {
    // ═══════════════════════════════════════════════════
    // PHASE 1: EXTENSIONS
    // ═══════════════════════════════════════════════════
    console.log("📦 Creating extensions...");
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log("✅ Extensions ready\n");

    // ═══════════════════════════════════════════════════
    // PHASE 2: BASE TABLES (NO FOREIGN KEYS)
    // ═══════════════════════════════════════════════════
    console.log("📋 Creating base tables...");

    // Users (base of everything)
    console.log("  → users");
    await pool.query(UserQueryManager.createUserTableQuery);

    // Reference tables
    console.log("  → tap_definitions");
    await pool.query(TapDefinitionQueryManager.createTapDefinitionTableQuery);

    // Admin audits (references users)
    console.log("  → admin_audits");
    await pool.query(AdminAuditQueryManager.createAdminAuditTableQuery);

    console.log("✅ Base tables created\n");

    // ═══════════════════════════════════════════════════
    // PHASE 3: USER-RELATED TABLES
    // ═══════════════════════════════════════════════════
    console.log("📋 Creating user-related tables...");

    console.log("  → auth_credentials");
    await pool.query(AuthCredentialQueryManager.createAuthCredentialTableQuery);

    console.log("  → user_profiles");
    await pool.query(UserProfileQueryManager.createUserProfileTableQuery);

    console.log("✅ User tables created\n");

    // ═══════════════════════════════════════════════════
    // PHASE 4: DRIVER TABLES
    // ═══════════════════════════════════════════════════
    console.log("📋 Creating driver tables...");

    console.log("  → drivers");
    await pool.query(DriverQueryManager.createDriverTableQuery);

    console.log("  → driver_safety_stats");
    await pool.query(DriverSafetyStatsQueryManager.createDriverSafetyStatsTableQuery);

    console.log("  → vehicles");
    await pool.query(VehicleQueryManager.createVehicleTableQuery);

    console.log("✅ Driver tables created\n");

    // ═══════════════════════════════════════════════════
    // PHASE 5: RIDE TABLES
    // ═══════════════════════════════════════════════════
    console.log("📋 Creating ride tables...");

    console.log("  → rides");
    await pool.query(RideQueryManager.createRideTableQuery);

    console.log("✅ Ride tables created\n");

    // ═══════════════════════════════════════════════════
    // PHASE 6: REVIEW & SAFETY TABLES
    // ═══════════════════════════════════════════════════
    console.log("📋 Creating review & safety tables...");

    console.log("  → ride_reviews");
    await pool.query(ReviewQueryManager.createReviewTableQuery);

    console.log("  → safety_audit_logs");
    await pool.query(SafetyAuditLogQueryManager.createSafetyAuditLogTableQuery);

    console.log("✅ Review & safety tables created\n");

    // ═══════════════════════════════════════════════════
    // PHASE 7: CREATE INDEXES
    // ═══════════════════════════════════════════════════
    console.log("📋 Creating indexes...");

    await pool.query(UserQueryManager.createUserTableQueryIndex);
    await pool.query(AuthCredentialQueryManager.createAuthCredentialTableQueryIndex);
    await pool.query(DriverQueryManager.createDriverTableQueryIndex);
    await pool.query(DriverSafetyStatsQueryManager.createDriverSafetyStatsTableQueryIndex);
    await pool.query(VehicleQueryManager.createVehicleTableQueryIndex);
    await pool.query(RideQueryManager.createRideTableQueryIndex);
    await pool.query(ReviewQueryManager.createReviewTableQueryIndex);
    await pool.query(SafetyAuditLogQueryManager.createSafetyAuditLogTableQueryIndex);
    await pool.query(TapDefinitionQueryManager.createTapDefinitionTableQueryIndex);

    console.log("✅ Indexes created\n");

    // ═══════════════════════════════════════════════════
    // PHASE 8: SEED TAP DEFINITIONS
    // ═══════════════════════════════════════════════════
    console.log("📋 Seeding tap definitions...");

    await seedTapDefinitions();

    console.log("✅ Tap definitions seeded\n");

    console.log("🎉 Database initialization complete!");

  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error(error.stack);
    throw error;
  }
}

async function seedTapDefinitions() {
  const taps = [
    // Positive taps
    { key: "felt_safe", label: "Felt Safe", category: "positive", points: 3, order: 1 },
    { key: "respectful", label: "Respectful", category: "positive", points: 2, order: 2 },
    { key: "followed_rules", label: "Followed Traffic Rules", category: "positive", points: 2, order: 3 },
    { key: "responsible_driving", label: "Responsible Driving", category: "positive", points: 2, order: 4 },
    { key: "good_route", label: "Good Route", category: "positive", points: 1, order: 5 },
    { key: "professional_communication", label: "Professional Communication", category: "positive", points: 1, order: 6 },

    // Negative taps (safety concerns)
    { key: "unsafe_driving", label: "Unsafe Driving", category: "negative", points: -10, order: 10 },
    { key: "speeding", label: "Speeding", category: "negative", points: -8, order: 11 },
    { key: "phone_use", label: "Phone Use While Driving", category: "negative", points: -8, order: 12 },
    { key: "rude_behavior", label: "Rude Behavior", category: "negative", points: -5, order: 13 },
    { key: "route_deviation", label: "Unnecessary Route Deviation", category: "negative", points: -3, order: 14 },
    { key: "vehicle_condition", label: "Poor Vehicle Condition", category: "negative", points: -3, order: 15 },
  ];

  for (const tap of taps) {
    await pool.query(`
      INSERT INTO tap_definitions (tap_key, tap_label, tap_category, point_value, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      ON CONFLICT (tap_key) DO UPDATE SET
        tap_label = EXCLUDED.tap_label,
        tap_category = EXCLUDED.tap_category,
        point_value = EXCLUDED.point_value,
        display_order = EXCLUDED.display_order;
    `, [tap.key, tap.label, tap.category, tap.points, tap.order]);
  }
}

// Run if executed directly
initializeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export { initializeDatabase };