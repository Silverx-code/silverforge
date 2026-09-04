import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

/**
 * node-postgres gives SSL query parameters in a connection string precedence
 * over the `ssl` option passed to Pool. Remove them so the application's TLS
 * policy is applied consistently in local development and on Vercel.
 */
export function getDatabaseConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const url = new URL(connectionString);
  for (const parameter of ["ssl", "sslmode", "sslrootcert", "sslcert", "sslkey"]) {
    url.searchParams.delete(parameter);
  }

  return url.toString();
}

// Set this to "true" only when the database presents a certificate whose
// issuer is trusted by the Vercel runtime. The existing default supports
// managed PostgreSQL providers that use a self-signed/private chain.
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: getDatabaseConnectionString(),
    ssl: {
      rejectUnauthorized,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();

  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
