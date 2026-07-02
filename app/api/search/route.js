import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET /api/search?q=23001102&by=index
// GET /api/search?q=0761855216&by=contact
export async function GET(req) {
  try {
    await ensureSchema();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const by = url.searchParams.get("by") === "contact" ? "contact" : "index";
    if (!q) return NextResponse.json({ ok: true, results: [] });

    const like = `%${q}%`;
    const { rows } =
      by === "contact"
        ? await sql`
            SELECT id, name, index_number, contact_number, shirt_size, delivered, delivered_at
            FROM orders WHERE contact_number ILIKE ${like}
            ORDER BY name;`
        : await sql`
            SELECT id, name, index_number, contact_number, shirt_size, delivered, delivered_at
            FROM orders WHERE index_number ILIKE ${like}
            ORDER BY name;`;

    return NextResponse.json({ ok: true, results: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
