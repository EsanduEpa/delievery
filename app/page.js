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
      const res = await fetch("/api/stats");
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
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&by=${by}`);
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
    <main style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1>T-Shirt Delivery</h1>

      {stats && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: 12,
            marginBottom: 16,
            background: "#f7f7f7",
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 6 }}>
            <strong>Remaining: {stats.remaining}</strong> / {stats.total}{" "}
            (delivered {stats.delivered})
          </div>
          <div>
            <strong>Remaining by size:</strong>{" "}
            {stats.bySize
              .filter((s) => s.remaining > 0)
              .map((s) => `${s.shirt_size}: ${s.remaining}`)
              .join("  •  ") || "all delivered 🎉"}
          </div>
          <button
            onClick={loadStats}
            style={{ marginTop: 8, padding: "4px 10px", fontSize: 13 }}
          >
            Refresh totals
          </button>
        </div>
      )}

      <form onSubmit={search} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 16 }}>
            <input
              type="radio"
              name="by"
              checked={by === "index"}
              onChange={() => setBy("index")}
            />{" "}
            Index Number
          </label>
          <label>
            <input
              type="radio"
              name="by"
              checked={by === "contact"}
              onChange={() => setBy("contact")}
            />{" "}
            Contact Number
          </label>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={by === "index" ? "Enter index number" : "Enter contact number"}
          autoFocus
          style={{ padding: 8, fontSize: 16, width: "70%" }}
        />
        <button type="submit" style={{ padding: 8, fontSize: 16, marginLeft: 8 }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results && results.length === 0 && <p>No orders found.</p>}

      {results && results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {results.map((o) => (
            <li
              key={o.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 6,
                padding: 12,
                marginBottom: 10,
                background: o.delivered ? "#e6ffe6" : "white",
              }}
            >
              <div><strong>Name:</strong> {o.name}</div>
              <div><strong>Size:</strong> {o.shirt_size || "—"}</div>
              <div><strong>Index:</strong> {o.index_number || "—"}</div>
              <div><strong>Contact:</strong> {o.contact_number || "—"}</div>
              <div style={{ margin: "6px 0" }}>
                <strong>Status:</strong>{" "}
                {o.delivered ? (
                  <span style={{ color: "green" }}>
                    ✅ Delivered
                    {o.delivered_at ? ` (${new Date(o.delivered_at).toLocaleString()})` : ""}
                  </span>
                ) : (
                  <span style={{ color: "#b30000" }}>❌ Not delivered</span>
                )}
              </div>
              <button
                onClick={() => toggleDelivered(o)}
                style={{ padding: "6px 12px", fontSize: 15 }}
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
