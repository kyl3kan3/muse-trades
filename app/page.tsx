import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12, color: "#8fa38a" }}>
        Muse connector
      </p>
      <h1 style={{ fontSize: 48, lineHeight: 1.1, fontWeight: 500 }}>
        Agents book the job. The shop just shows up.
      </h1>
      <p style={{ fontSize: 20, lineHeight: 1.5, color: "#c5d4c1" }}>
        Muse Trades is the quote-and-book API for HVAC and plumbing shops in the
        St. Louis metro. A customer tells Muse the AC died. Muse quotes a range,
        holds a slot, and collects a deposit.
      </p>
      <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
        <Link href="/owner" style={btn}>
          Owner board
        </Link>
        <a href="/openapi.json" style={btnGhost}>
          OpenAPI
        </a>
        <a href="/llms.txt" style={btnGhost}>
          llms.txt
        </a>
      </div>
      <ol style={{ marginTop: 56, paddingLeft: 20, lineHeight: 1.7, color: "#c5d4c1" }}>
        <li>POST /api/v1/quote</li>
        <li>GET /api/v1/availability</li>
        <li>POST /api/v1/holds</li>
        <li>POST /api/v1/bookings</li>
      </ol>
    </main>
  );
}

const btn = {
  background: "#d7e3c4",
  color: "#142016",
  padding: "12px 18px",
  textDecoration: "none",
  borderRadius: 2,
} as const;
const btnGhost = {
  ...btn,
  background: "transparent",
  color: "#d7e3c4",
  border: "1px solid #3a4a3c",
} as const;
