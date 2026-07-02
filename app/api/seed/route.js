import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../lib/db";
import orders from "../../../data/orders.json";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// POST /api/seed         -> seed only if table is empty
// POST /api/seed?force=1 -> wipe and reseed
export async function POST(req) {
  try {
    await ensureSchema();
    const force = new URL(req.url).searchParams.get("force") === "1";

    const { rows } = await sql`SELECT COUNT(*)::int AS c FROM orders;`;
    if (rows[0].c > 0 && !force) {
      return NextResponse.json({ ok: true, skipped: true, existing: rows[0].c });
    }

    if (force) await sql`TRUNCATE orders RESTART IDENTITY;`;

    for (const o of orders) {
      await sql`
        INSERT INTO orders (name, index_number, contact_number, shirt_size, email)
        VALUES (${o.name}, ${o.index_number}, ${o.contact_number}, ${o.shirt_size}, ${o.email});
      `;
    }

    return NextResponse.json({ ok: true, inserted: orders.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
