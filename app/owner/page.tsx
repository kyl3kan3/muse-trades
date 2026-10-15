"use client";

import { useState } from "react";

type Board = {
  quotes: Array<{ id: string; shopName: string; serviceType: string; lowCents: number; highCents: number; needsHuman: boolean }>;
  holds: Array<{ id: string; status: string; slotStart: string; expiresAt: string }>;
  bookings: Array<{ id: string; customerName: string; address: string; slotStart: string; status: string; depositCents: number }>;
  events: Array<{ id: string; kind: string; summary: string; createdAt: string }>;
};

const SHOPS = [
  { id: "stl-comfort-hvac", label: "River City Comfort (HVAC)" },
  { id: "stl-metro-plumb", label: "Metro East Plumbing" },
];

export default function OwnerPage() {
  const [shopId, setShopId] = useState(SHOPS[0].id);
  const [token, setToken] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBoard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErr("");
    setBoard(null);
    setLoading(true);
    try {
      const query = "?shopId=" + encodeURIComponent(shopId);
      const response = await fetch("/api/v1/owner" + query, {
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Access denied. Check your owner token." : response.status === 503 ? "Owner access is not configured for this shop." : "Could not load the owner board.");
      const data = await response.json() as Board;
      setBoard(data);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not load the owner board.");
    } finally {
      setLoading(false);
    }
  }

  if (!board) {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12, color: "#8fa38a" }}>Shop owner</p>
        <h1 style={{ fontWeight: 500 }}>Sign in to view jobs</h1>
        <form onSubmit={loadBoard} style={{ display: "grid", gap: 16, marginTop: 28 }}>
          <label style={{ display: "grid", gap: 6 }}>Shop
            <select value={shopId} onChange={(event) => setShopId(event.target.value)} style={{ padding: 12 }}>
              {SHOPS.map((shop) => <option key={shop.id} value={shop.id}>{shop.label}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>Owner access token
            <input type="password" autoComplete="current-password" required value={token} onChange={(event) => setToken(event.target.value)} style={{ padding: 12 }} />
          </label>
          {err && <p role="alert" style={{ color: "#fca5a5" }}>{err}</p>}
          <button disabled={loading} type="submit" style={{ padding: 12 }}>{loading ? "Checking access..." : "Open owner board"}</button>
          <p style={{ color: "#8fa38a", fontSize: 13 }}>Your token is sent only to this site and is not saved in browser storage.</p>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12, color: "#8fa38a" }}>Shop owner</p>
      <h1 style={{ fontWeight: 500 }}>Jobs that arrived</h1>
      <p>{SHOPS.find((shop) => shop.id === shopId)?.label}</p>
      <button type="button" onClick={() => setBoard(null)} style={{ padding: 8 }}>Sign out</button>
      <Section title="Bookings">
        {board.bookings.length === 0 && <Empty text="No bookings yet." />}
        {board.bookings.map((b) => (
          <Row key={b.id} title={b.customerName} meta={`${b.status} | ${b.address} | ${b.slotStart}`} />
        ))}
      </Section>
      <Section title="Holds">
        {board.holds.length === 0 && <Empty text="No live holds." />}
        {board.holds.map((h) => (
          <Row key={h.id} title={h.status} meta={`${h.slotStart} | expires ${h.expiresAt}`} />
        ))}
      </Section>
      <Section title="Quotes">
        {board.quotes.length === 0 && <Empty text="No quotes yet." />}
        {board.quotes.map((q) => (
          <Row key={q.id} title={`${q.shopName} | ${q.serviceType}`} meta={`$${(q.lowCents / 100).toFixed(0)}-$${(q.highCents / 100).toFixed(0)}${q.needsHuman ? " | needs a human" : ""}`} />
        ))}
      </Section>
      <Section title="Activity">
        {board.events.map((e) => (
          <Row key={e.id} title={e.kind} meta={`${e.summary} | ${e.createdAt}`} />
        ))}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ marginTop: 36 }}><h2 style={{ fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8fa38a" }}>{title}</h2><div>{children}</div></section>;
}
function Row({ title, meta }: { title: string; meta: string }) {
  return <div style={{ borderTop: "1px solid #2a362c", padding: "12px 0" }}><div>{title}</div><div style={{ color: "#8fa38a", fontSize: 14 }}>{meta}</div></div>;
}
function Empty({ text }: { text: string }) { return <p style={{ color: "#8fa38a" }}>{text}</p>; }
