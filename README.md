# T-Shirt Delivery

Simple website to search t-shirt orders and mark them delivered. Built with Next.js + Vercel Postgres.

## What it does

- Search an order by **Index Number** (default) or **Contact Number**
- Shows the **name** and **t-shirt size**
- **Mark as delivered** (and undo) — saved in the database, shared across everyone using the site

## Data

Orders come from `data-tshirt.csv`. The parsed list lives in `data/orders.json`.
If you get a new/updated CSV, replace `data-tshirt.csv` and run:

```bash
npm run gen
```

## Deploy to Vercel (one-time setup)

1. **Push this `orders` folder to GitHub** as its own repo.
2. On **vercel.com** → **Add New → Project** → import that repo → **Deploy**.
3. In the project → **Storage → Create Database → Postgres** → connect it.
   Vercel automatically adds the `POSTGRES_URL` env var. Redeploy if prompted.
4. **Seed the database once** — open a terminal (or the browser) and run:

   ```bash
   curl -X POST https://YOUR-APP.vercel.app/api/seed
   ```

   You should see `{"ok":true,"inserted":236}`. That's it — the site is ready.

   - To wipe and reload the data later: `curl -X POST "https://YOUR-APP.vercel.app/api/seed?force=1"`

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

Search/deliver need a database. Pull the Vercel Postgres credentials locally with:

```bash
npx vercel env pull .env.development.local
```

## API

- `GET  /api/search?q=<value>&by=index|contact`
- `POST /api/deliver`  body `{ "id": <number>, "delivered": true|false }`
- `POST /api/seed`  (loads data if the table is empty; add `?force=1` to reset)
