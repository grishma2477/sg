import fs from "fs";
import path from "path";
import { pool } from "../src/database/DBConnection.js";

const migrationsDir = path.join(process.cwd(), "migrations");

const lastApplied = async () => {
    const { rows } = await pool.query(`
    SELECT name FROM schema_migrations
    ORDER BY id DESC
    LIMIT 1
  `);
    return rows[0]?.name || null;
};

const run = async () => {
    const lastUp = await lastApplied();
    if (!lastUp) {
        console.log("✅ Nothing to rollback.");
        await pool.end();
        return;
    }

    const downFile = lastUp.replace(".up.sql", ".down.sql");
    const downPath = path.join(migrationsDir, downFile);

    if (!fs.existsSync(downPath)) {
        throw new Error(`Missing down migration: ${downFile}`);
    }

    const sql = fs.readFileSync(downPath, "utf8");

    const client = await pool.connect();
    try {
        console.log(`⏪ Rolling back: ${lastUp}`);
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(`DELETE FROM schema_migrations WHERE name = $1`, [lastUp]);
        await client.query("COMMIT");
        console.log(`✅ Rolled back: ${lastUp}`);
    } catch (e) {
        await client.query("ROLLBACK");
        console.error(`❌ Rollback failed: ${lastUp}`);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
};

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
