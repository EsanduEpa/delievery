// Regenerate data/orders.json from data-tshirt.csv
// Run: node scripts/gen-json.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Minimal RFC-4180-ish CSV parser (handles quoted fields with commas/newlines)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* skip */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function normSize(s) {
  return (s || "").trim().toUpperCase();
}

const raw = readFileSync(join(root, "data-tshirt.csv"), "utf8");
const rows = parseCSV(raw);
const [, ...body] = rows; // drop header

const orders = [];
for (const r of body) {
  // Columns: Timestamp,Email,Name,Email,Contact,Index,Size,Receipt,Notes
  const name = (r[2] || "").trim();
  const contact = (r[4] || "").trim();
  const index = (r[5] || "").trim();
  const size = normSize(r[6]);
  const email = (r[1] || "").trim();
  if (!name && !index && !contact) continue; // skip blank lines
  orders.push({
    name,
    index_number: index,
    contact_number: contact,
    shirt_size: size,
    email,
  });
}

mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(join(root, "data", "orders.json"), JSON.stringify(orders, null, 2));
console.log(`Wrote ${orders.length} orders to data/orders.json`);
