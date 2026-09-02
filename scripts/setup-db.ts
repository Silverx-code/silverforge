import { readFile } from "node:fs/promises";
import { pool } from "../src/lib/db";

async function main() {
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(schema);
  console.log("PostgreSQL schema is ready.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => pool.end());
