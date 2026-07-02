import { sql } from "@vercel/postgres";

// Create the orders table if it doesn't exist yet.
export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      index_number TEXT,
      contact_number TEXT,
      shirt_size TEXT,
      email TEXT,
      delivered BOOLEAN NOT NULL DEFAULT FALSE,
      delivered_at TIMESTAMPTZ
    );
  `;
}

export { sql };
