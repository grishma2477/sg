import { MODELS } from "../src/database/ModelRegistry.js";

const isNonEmptyString = (s) => typeof s === "string" && s.trim().length > 0;

const classify = (sql) => {
    const t = sql.trim().toUpperCase();
    if (t.startsWith("CREATE EXTENSION")) return "EXTENSION";
    if (t.startsWith("CREATE TABLE")) return "TABLE";
    if (t.startsWith("ALTER TABLE")) return "ALTER";
    if (t.includes("CREATE INDEX") || t.startsWith("CREATE INDEX")) return "INDEX";
    if (t.startsWith("CREATE UNIQUE INDEX")) return "INDEX";
    if (t.startsWith("CREATE TRIGGER") || t.includes("TRIGGER")) return "TRIGGER";
    return "OTHER";
};

const run = () => {
    const errors = [];
    const warnings = [];

    for (const m of MODELS) {
        if (!m?.tableName) errors.push(`Model missing tableName`);
        if (!m?.getSchemaQueries) errors.push(`${m.tableName}: missing getSchemaQueries()`);

        const schema = m?.getSchemaQueries?.();
        if (!Array.isArray(schema)) {
            errors.push(`${m.tableName}: schemaQueries must be an array`);
            continue;
        }

        if (schema.length === 0) warnings.push(`${m.tableName}: schemaQueries array is empty`);

        schema.forEach((q, i) => {
            if (!isNonEmptyString(q)) errors.push(`${m.tableName}: schemaQueries[${i}] must be a non-empty string`);
        });

        // Ordering hint
        const kinds = schema.map(classify);
        const extPos = kinds.indexOf("EXTENSION");
        const tablePos = kinds.indexOf("TABLE");
        if (tablePos !== -1 && extPos !== -1 && extPos > tablePos) {
            warnings.push(`${m.tableName}: EXTENSION appears after TABLE; consider moving extension first`);
        }
    }

    if (warnings.length) {
        console.log("⚠️  Schema warnings:");
        warnings.forEach((w) => console.log(" -", w));
    }

    if (errors.length) {
        console.error("❌ Schema errors:");
        errors.forEach((e) => console.error(" -", e));
        process.exit(1);
    }

    console.log("✅ Schema consistency check passed.");
};

run();
