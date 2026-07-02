import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic endpoint. Read-only. Remove after debugging.
export async function GET() {
  try {
    await ensureSchema();
    const counts = await sql`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE delivered)::int AS delivered_count
      FROM orders;`;
    const deliveredRows = await sql`
      SELECT id, name, delivered FROM orders WHERE delivered = TRUE ORDER BY id;`;
    const row10 = await sql`SELECT id, name, delivered FROM orders WHERE id = 10;`;
    const currentDb = await sql`SELECT current_database() AS db, current_schema() AS schema;`;

    return NextResponse.json({
      ok: true,
      counts: counts.rows[0],
      deliveredRows: deliveredRows.rows,
      row10: row10.rows[0],
      db: currentDb.rows[0],
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
