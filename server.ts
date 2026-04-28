import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { Resend } from "resend";

dotenv.config();

const stripeClient = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout Session Creation
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    const { amount, currency, invoiceId, businessName } = req.body;
    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency || "usd",
              product_data: {
                name: `Invoice #${invoiceId} - ${businessName}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL}/pay/success?invoiceId=${invoiceId}`,
        cancel_url: `${process.env.APP_URL}/pay/cancel?invoiceId=${invoiceId}`,
        metadata: { invoiceId },
      });
      res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Resend Email Sending
  app.post("/api/send-email", async (req, res) => {
    if (!resendClient) {
      return res.status(500).json({ error: "Resend not configured" });
    }
    const { to, subject, html } = req.body;
    try {
      const data = await resendClient.emails.send({
        from: "ChasePro <notifications@resend.dev>", // Should use verified domain in production
        to,
        subject,
        html,
      });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
