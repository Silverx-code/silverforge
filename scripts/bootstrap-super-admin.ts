import { loadEnvConfig } from "@next/env";
import { hashPassword } from "../src/lib/password";
import { getPasswordValidationError } from "../src/lib/password-policy";
import { createId } from "../src/lib/id";

let poolToClose: import("pg").Pool | undefined;

async function main() {
  loadEnvConfig(process.cwd());
  const { pool, query } = await import("../src/lib/db");
  poolToClose = pool;
  const email = process.env.SUPER_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    throw new Error("Set SUPER_ADMIN_BOOTSTRAP_EMAIL and SUPER_ADMIN_BOOTSTRAP_PASSWORD for this one-time command.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("SUPER_ADMIN_BOOTSTRAP_EMAIL must be a valid email address.");
  const passwordError = getPasswordValidationError(password);
  if (passwordError) throw new Error(passwordError);

  const passwordHash = await hashPassword(password);
  const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
  if (existing.rows[0]) {
    await query("UPDATE users SET password_hash = $1, account_type = 'SUPER_ADMIN', onboarding_completed = TRUE WHERE id = $2", [passwordHash, existing.rows[0].id]);
    console.log(`Super Admin account secured for ${email}.`);
  } else {
    await query(
      "INSERT INTO users (id, email, password_hash, name, account_type, onboarding_completed) VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', TRUE)",
      [createId("usr"), email, passwordHash, "Platform Admin"]
    );
    console.log(`Super Admin account created for ${email}.`);
  }
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => poolToClose?.end());
