/**
 * Universal Database Client (Neon Serverless Postgres / Supabase)
 */
import { neon } from "@neondatabase/serverless";

export function getDbClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL not set. Running in demo memory mode.");
    return null;
  }
  return neon(url);
}

export async function runQuery(sqlText: string, params: any[] = []) {
  const sql = getDbClient();
  if (!sql) return { simulated: true, rows: [] };
  return await sql(sqlText, params);
}
