import "server-only";
import { Pool } from "pg";

/**
 * Postgres storage (Neon on Vercel). When DATABASE_URL is unset the app
 * falls back to the local JSON-file store in server-store.ts — so local
 * dev needs no database.
 */
const url = process.env.DATABASE_URL;
export const hasDb = Boolean(url && url.length > 0);

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

/** Lazily create the pool and the schema (idempotent). */
export async function db(): Promise<Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 3, // serverless: keep connections per instance minimal
      ssl: { rejectUnauthorized: false },
    });
  }
  if (!ready) {
    const p = pool;
    ready = (async () => {
      await p.query(`
        CREATE TABLE IF NOT EXISTS products (
          id   text PRIMARY KEY,
          pos  bigserial,
          data jsonb NOT NULL
        )`);
      await p.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id   text PRIMARY KEY,
          pos  bigserial,
          data jsonb NOT NULL
        )`);
      await p.query(`
        CREATE TABLE IF NOT EXISTS uploads (
          filename     text PRIMARY KEY,
          content_type text NOT NULL,
          bytes        bytea NOT NULL
        )`);
    })();
  }
  await ready;
  return pool;
}
