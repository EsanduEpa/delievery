import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// POST /api/deliver  body: { id, delivered }
// Marks (or un-marks) a single order as delivered.
export async function POST(req) {
  try {
    await ensureSchema();
    const { id, delivered } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const setDelivered = delivered !== false; // default true
    const { rows } = setDelivered
      ? await sql`
          UPDATE orders SET delivered = TRUE, delivered_at = NOW()
          WHERE id = ${id}
          RETURNING id, name, index_number, contact_number, shirt_size, delivered, delivered_at;`
      : await sql`
          UPDATE orders SET delivered = FALSE, delivered_at = NULL
          WHERE id = ${id}
          RETURNING id, name, index_number, contact_number, shirt_size, delivered, delivered_at;`;

    if (!rows.length) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, order: rows[0] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
