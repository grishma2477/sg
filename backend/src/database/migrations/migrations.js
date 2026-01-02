/**
 * Migration: Fix Safety Points Schema
 * 
 * This migration adds missing columns and fixes schema issues
 * for the safety points system to work correctly.
 * 
 * Run with: node src/database/migrations/001_fix_safety_schema.js
 */

import { pool } from "../DBConnection.js";

async function migrate() {
  console.log("🔄 Starting migration: Fix Safety Schema");

  try {
    // ═══════════════════════════════════════════════════
    // 1. ADD is_paid TO rides TABLE (IF NOT EXISTS)
    // ═══════════════════════════════════════════════════
    console.log("📝 Adding is_paid column to rides...");
    await pool.query(`
      ALTER TABLE rides 
      ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
    `);

    await pool.query(`
      ALTER TABLE rides 
      ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
    `);

    await pool.query(`
      ALTER TABLE rides 
      ADD COLUMN IF NOT EXISTS forced_by_admin BOOLEAN DEFAULT FALSE;
    `);

    await pool.query(`
      ALTER TABLE rides 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);

    // ═══════════════════════════════════════════════════
    // 2. FIX driver_safety_stats TABLE
    // ═══════════════════════════════════════════════════
    console.log("📝 Ensuring driver_safety_stats columns...");
    
    // Check if current_points exists, if not add it
    await pool.query(`
      ALTER TABLE driver_safety_stats 
      ADD COLUMN IF NOT EXISTS current_points INTEGER DEFAULT 1000;
    `);

    // ═══════════════════════════════════════════════════
    // 3. UPDATE COMPLETED RIDES TO BE PAID
    // ═══════════════════════════════════════════════════
    console.log("📝 Marking completed rides as paid...");
    await pool.query(`
      UPDATE rides 
      SET is_paid = TRUE 
      WHERE status = 'completed' AND is_paid IS NULL OR is_paid = FALSE;
    `);

    // ═══════════════════════════════════════════════════
    // 4. INITIALIZE SAFETY STATS FOR EXISTING DRIVERS
    // ═══════════════════════════════════════════════════
    console.log("📝 Initializing safety stats for drivers without stats...");
    await pool.query(`
      INSERT INTO driver_safety_stats (driver_id, current_points, average_rating, completed_rides)
      SELECT d.id, 1000, 0, 0
      FROM drivers d
      LEFT JOIN driver_safety_stats dss ON d.id = dss.driver_id
      WHERE dss.driver_id IS NULL;
    `);

    // ═══════════════════════════════════════════════════
    // 5. FIX ride_reviews TABLE
    // ═══════════════════════════════════════════════════
    console.log("📝 Ensuring ride_reviews columns...");
    
    await pool.query(`
      ALTER TABLE ride_reviews 
      ADD COLUMN IF NOT EXISTS calculated_impact INTEGER;
    `);

    await pool.query(`
      ALTER TABLE ride_reviews 
      ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT FALSE;
    `);

    // ═══════════════════════════════════════════════════
    // 6. FIX safety_audit_logs TABLE
    // ═══════════════════════════════════════════════════
    console.log("📝 Ensuring safety_audit_logs columns...");
    
    await pool.query(`
      ALTER TABLE safety_audit_logs 
      ADD COLUMN IF NOT EXISTS points_delta INTEGER;
    `);

    console.log("✅ Migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if executed directly
migrate().catch(console.error);

export { migrate };