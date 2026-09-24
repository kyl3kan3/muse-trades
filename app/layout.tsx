import type { ReactNode } from "react";

export const metadata = {
  title: "Muse Trades",
  description: "Quote, hold, and book HVAC and plumbing jobs for Muse agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0f1410",
          color: "#e8efe6",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
