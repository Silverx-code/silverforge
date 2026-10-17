import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());
  const { pool } = await import("../src/lib/db");
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  try {
    await pool.query(schema);
    console.log("PostgreSQL schema is ready.");
  } finally {
    await pool.end();
  }
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
