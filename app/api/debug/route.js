import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic endpoint. Remove after debugging.
export async function GET() {
  try {
    await ensureSchema();
    const before = await sql`SELECT id, delivered FROM orders WHERE id = 2;`;
    const upd = await sql`UPDATE orders SET delivered = TRUE WHERE id = 2 RETURNING id, delivered;`;
    const after = await sql`SELECT id, delivered FROM orders WHERE id = 2;`;
    // revert so we don't leave test state
    await sql`UPDATE orders SET delivered = FALSE WHERE id = 2;`;

    const envSeen = {
      POSTGRES_URL: mask(process.env.POSTGRES_URL),
      DATABASE_URL: mask(process.env.DATABASE_URL),
      POSTGRES_URL_NON_POOLING: mask(process.env.POSTGRES_URL_NON_POOLING),
      DATABASE_URL_UNPOOLED: mask(process.env.DATABASE_URL_UNPOOLED),
      POSTGRES_PRISMA_URL: mask(process.env.POSTGRES_PRISMA_URL),
    };

    return NextResponse.json({
      ok: true,
      before: before.rows[0],
      updateReturning: upd.rows[0],
      afterInSameRequest: after.rows[0],
      envSeen,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

function mask(v) {
  if (!v) return null;
  // show host + a hint so we can tell endpoints apart, hide credentials
  try {
    const u = new URL(v);
    return `${u.hostname}${u.search ? " " + u.search : ""}`;
  } catch {
    return "set";
  }
}
