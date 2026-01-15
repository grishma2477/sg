import fs from "fs";
import path from "path";
import { pool } from "../src/database/DBConnection.js";

const migrationsDir = path.join(process.cwd(), "migrations");

const ensureMigrationsDir = () => {
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
        console.log("ℹ️  Created migrations directory");
    }
};

const ensureTracking = async () => {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const getApplied = async () => {
    const { rows } = await pool.query(`SELECT name FROM schema_migrations`);
    return new Set(rows.map(r => r.name));
};

const run = async () => {
    ensureMigrationsDir();

    const files = fs
        .readdirSync(migrationsDir)
        .filter(f => f.endsWith(".up.sql"))
        .sort();

    if (files.length === 0) {
        console.log("ℹ️  No migration files found. Skipping migrations.");
        return;
    }

    await ensureTracking();
    const applied = await getApplied();

    for (const file of files) {
        if (applied.has(file)) {
            console.log(`⏭️  Skipping ${file}`);
            continue;
        }

        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

        const client = await pool.connect();
        try {
            console.log(`🚀 Applying ${file}`);
            await client.query("BEGIN");
            await client.query(sql);
            await client.query(
                `INSERT INTO schema_migrations (name) VALUES ($1)`,
                [file]
            );
            await client.query("COMMIT");
            console.log(`✅ Applied ${file}`);
        } catch (err) {
            await client.query("ROLLBACK");
            console.error(`❌ Failed ${file}`);
            throw err;
        } finally {
            client.release();
        }
    }
};

run()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
