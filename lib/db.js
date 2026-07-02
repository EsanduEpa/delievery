// Vercel's Postgres providers (Neon, Supabase, etc.) inject the connection
// string under different env-var names. @vercel/postgres reads POSTGRES_URL,
// so if it's missing, copy in whichever one the provider gave us.
if (!process.env.POSTGRES_URL) {
  const fallback =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED;
  if (fallback) process.env.POSTGRES_URL = fallback;
}

// Imported after the env var is set so the lazy client picks it up.
const { sql } = await import("@vercel/postgres");

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
