import fs from "fs";
import path from "path";
import { MODELS } from "../src/database/ModelRegistry.js";

const migrationsDir = path.join(process.cwd(), "migrations");
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

const pad = (n) => String(n).padStart(3, "0");
const nowTag = () => new Date().toISOString().replace(/[:.]/g, "-");

const write = (filename, content) => {
    fs.writeFileSync(path.join(migrationsDir, filename), content);
    console.log(`✅ Wrote ${filename}`);
};

const normalizeSql = (queries) =>
    queries.map((q) => q.trim()).filter(Boolean).join("\n\n");

const autoDown = (tableName) => `
-- ⚠️ Auto-generated rollback (review for complex schemas)
DROP TABLE IF EXISTS ${tableName} CASCADE;
`.trim();

const run = () => {
    // Optional: unique timestamp tag so re-generation doesn't overwrite
    const tag = nowTag();

    let i = 1;
    for (const model of MODELS) {
        const tableName = model.tableName;
        const schemaQueries = model.getSchemaQueries();

        const upName = `${pad(i)}_${tableName}_${tag}.up.sql`;
        const downName = `${pad(i)}_${tableName}_${tag}.down.sql`;

        write(upName, normalizeSql(schemaQueries));
        write(downName, autoDown(tableName));
        i++;
    }

    console.log("✅ Migration generation complete.");
    console.log("⚠️ Review .down.sql files for anything beyond basic DROP TABLE.");
};

run();
