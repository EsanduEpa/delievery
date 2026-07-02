"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [q, setQ] = useState("");
  const [by, setBy] = useState("index"); // "index" (default) or "contact"
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  async function loadStats() {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setStats(data);
    } catch {
      /* ignore stats errors */
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function search(e) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&by=${by}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Search failed");
      setResults(data.results);
    } catch (err) {
      setError(String(err.message || err));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDelivered(order) {
    const next = !order.delivered;
    if (next && !confirm(`Mark ${order.name} (${order.shirt_size}) as DELIVERED?`)) return;
    try {
      const res = await fetch("/api/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, delivered: next }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Update failed");
      setResults((rs) => rs.map((r) => (r.id === data.order.id ? data.order : r)));
      loadStats();
    } catch (err) {
      alert("Error: " + (err.message || err));
    }
  }

  return (
    <main className="wrap">
      <h1>👕 T-Shirt Delivery</h1>

      {stats && (
        <div className="stats">
          <div className="stats-top">
            <div>
              <div className="stats-remaining">{stats.remaining}</div>
              <div className="stats-sub">remaining</div>
            </div>
            <div className="stats-sub" style={{ textAlign: "right" }}>
              {stats.delivered} delivered
              <br />
              {stats.total} total
            </div>
          </div>
          <div className="sizes">
            {stats.bySize.filter((s) => s.remaining > 0).length === 0 ? (
              <span className="all-done">All delivered 🎉</span>
            ) : (
              stats.bySize
                .filter((s) => s.remaining > 0)
                .map((s) => (
                  <span key={s.shirt_size} className="size-chip">
                    {s.shirt_size} <b>{s.remaining}</b>
                  </span>
                ))
            )}
          </div>
          <button className="link-btn" onClick={loadStats}>
            Refresh totals
          </button>
        </div>
      )}

      <form onSubmit={search}>
        <div className="toggle">
          <button
            type="button"
            className={by === "index" ? "active" : ""}
            onClick={() => setBy("index")}
          >
            Index Number
          </button>
          <button
            type="button"
            className={by === "contact" ? "active" : ""}
            onClick={() => setBy("contact")}
          >
            Contact Number
          </button>
        </div>
        <div className="search-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={by === "index" ? "Enter index number" : "Enter contact number"}
            inputMode="numeric"
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "…" : "Search"}
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {results && results.length === 0 && <p className="empty">No orders found.</p>}

      {results && results.length > 0 && (
        <ul className="results">
          {results.map((o) => (
            <li key={o.id} className={`card${o.delivered ? " delivered" : ""}`}>
              <div className="card-head">
                <div className="card-name">{o.name}</div>
                <div className="size-badge">{o.shirt_size || "—"}</div>
              </div>
              <div className="card-meta">
                <span>Index: {o.index_number || "—"}</span>
                <span>Contact: {o.contact_number || "—"}</span>
              </div>
              <div className={`status ${o.delivered ? "yes" : "no"}`}>
                {o.delivered
                  ? `✅ Delivered${
                      o.delivered_at
                        ? " · " + new Date(o.delivered_at).toLocaleString()
                        : ""
                    }`
                  : "❌ Not delivered yet"}
              </div>
              <button
                className={`btn-deliver${o.delivered ? " undo" : ""}`}
                onClick={() => toggleDelivered(o)}
              >
                {o.delivered ? "Undo delivery" : "Mark as delivered"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
