import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import admin from "firebase-admin";
import fs from "fs";

// Initialize Firebase Admin
let db: FirebaseFirestore.Firestore;
try {
  const serviceAccountContent = fs.readFileSync(path.join(process.cwd(), "serviceAccountKey.json"), "utf8");
  const serviceAccount = JSON.parse(serviceAccountContent);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
} catch (error) {
  console.warn("Warning: Could not find or parse serviceAccountKey.json. Firebase admin features will fail.");
}

const MARKUP_MULTIPLIER = 1.60;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is running!" });
  });

  // Create Razorpay Order
  app.post("/api/razorpay/order", async (req, res) => {
    try {
      const { items, customerName, customerEmail, customerPhone, customerAddress } = req.body;

      if (!items || !items.length) {
        return res.status(400).json({ error: "No items in the order" });
      }

      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ error: "Razorpay keys are not configured" });
      }

      // Calculate total securely from DB
      let calculatedTotal = 0;
      let baseCostTotal = 0;
      const orderItems = [];

      for (const item of items) {
        const productRef = await db.collection("products").doc(item.id).get();
        if (!productRef.exists) {
          return res.status(400).json({ error: `Product ${item.id} not found` });
        }
        
        const productData = productRef.data() as any;
        const baseCost = productData.baseCost || 0;
        const numericPrice = baseCost * MARKUP_MULTIPLIER;
        
        const itemTotal = numericPrice * item.quantity;
        calculatedTotal += itemTotal;
        baseCostTotal += baseCost * item.quantity;

        orderItems.push({
          id: item.id,
          name: productData.name,
          price: `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          numericPrice: numericPrice,
          quantity: item.quantity
        });
      }

      const shippingCost = 0; // Flat fee applied later if needed
      calculatedTotal += shippingCost;

      const options = {
        amount: Math.round(calculatedTotal * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      // Create Pending Order in Firestore
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: orderItems,
        totalAmount: calculatedTotal,
        shippingCost: shippingCost,
        baseCostTotal: baseCostTotal,
        status: 'pending',
        razorpayOrderId: order.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("orders").add(orderData);

      res.json({ ...order, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (error: any) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify Razorpay Payment
  app.post("/api/razorpay/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        const ordersRef = db.collection("orders");
        const snapshot = await ordersRef.where("razorpayOrderId", "==", razorpay_order_id).limit(1).get();
        
        if (!snapshot.empty) {
          const orderDoc = snapshot.docs[0];
          await orderDoc.ref.update({
            status: "paid",
            paymentId: razorpay_payment_id
          });
        }
        res.json({ status: "success", message: "Payment verified successfully" });
      } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Razorpay Verify Error:", error);
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
