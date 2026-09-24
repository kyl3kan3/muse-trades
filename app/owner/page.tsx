"use client";

import { useEffect, useState } from "react";

type Board = {
  quotes: Array<{ id: string; shopName: string; serviceType: string; lowCents: number; highCents: number; needsHuman: boolean }>;
  holds: Array<{ id: string; status: string; slotStart: string; expiresAt: string }>;
  bookings: Array<{ id: string; customerName: string; address: string; slotStart: string; status: string; depositCents: number }>;
  events: Array<{ id: string; kind: string; summary: string; createdAt: string }>;
};

export default function OwnerPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/v1/owner")
      .then((r) => r.json())
      .then(setBoard)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <main style={{ padding: 40 }}>Could not load the board.</main>;
  if (!board) return <main style={{ padding: 40 }}>Loading jobs...</main>;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12, color: "#8fa38a" }}>Shop owner</p>
      <h1 style={{ fontWeight: 500 }}>Jobs that arrived</h1>
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
          <Row
            key={q.id}
            title={`${q.shopName} | ${q.serviceType}`}
            meta={`$${(q.lowCents / 100).toFixed(0)}-$${(q.highCents / 100).toFixed(0)}${q.needsHuman ? " | needs a human" : ""}`}
          />
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
  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8fa38a" }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Row({ title, meta }: { title: string; meta: string }) {
  return (
    <div style={{ borderTop: "1px solid #2a362c", padding: "12px 0" }}>
      <div>{title}</div>
      <div style={{ color: "#8fa38a", fontSize: 14 }}>{meta}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ color: "#8fa38a" }}>{text}</p>;
}
