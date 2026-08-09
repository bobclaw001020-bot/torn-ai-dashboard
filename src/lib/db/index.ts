import "server-only";

import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { tornDbPool?: Pool };

export const db =
  globalForDb.tornDbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForDb.tornDbPool = db;

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}
