import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/stats -> remaining (not delivered) totals, overall and per size
export async function GET() {
  try {
    await ensureSchema();
    const totals = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE delivered)::int AS delivered,
        COUNT(*) FILTER (WHERE NOT delivered)::int AS remaining
      FROM orders;`;
    const bySize = await sql`
      SELECT COALESCE(NULLIF(shirt_size, ''), '—') AS shirt_size,
             COUNT(*) FILTER (WHERE NOT delivered)::int AS remaining
      FROM orders
      GROUP BY 1
      ORDER BY 1;`;
    return NextResponse.json({
      ok: true,
      ...totals.rows[0],
      bySize: bySize.rows,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
