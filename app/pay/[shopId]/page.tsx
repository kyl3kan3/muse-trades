export default async function PayPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontWeight: 500 }}>Deposit</h1>
      <p style={{ color: "#c5d4c1", lineHeight: 1.6 }}>
        In production this page is a Stripe Link checkout for shop{" "}
        <code>{shopId}</code>. Wire STRIPE_SECRET_KEY and a Payment Link or
        Checkout Session here. Muse already speaks Stripe Link.
      </p>
    </main>
  );
}
