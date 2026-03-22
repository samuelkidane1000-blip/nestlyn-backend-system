import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import { initDb } from "./db/index.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import cleanerRoutes from "./routes/cleaners.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import adminRoutes from "./routes/admin.js";
dotenv.config();
initDb();
import "./db/seed.js";
const stripe=process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const app=express();
app.use(cors({
  origin: "*"
}));
app.use(morgan("dev"));
app.use("/webhook", express.raw({type:"application/json"}));
app.use(express.json());
app.get("/health",(_req,res)=>res.json({ok:true}));
app.use("/api/auth",authRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/cleaners",cleanerRoutes);
app.use("/api/subscriptions",subscriptionRoutes);
app.use("/api/admin",adminRoutes);
app.post("/webhook",(req,res)=>{
  if(!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).send("Stripe not configured");
  try{
    const event=stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
    if(event.type==="checkout.session.completed") console.log("Checkout completed", event.data.object.id);
    if(event.type==="customer.subscription.created") console.log("Subscription created", event.data.object.id);
    res.json({received:true});
  }catch(error){res.status(400).send(`Webhook Error: ${error.message}`);}
});
const port=process.env.PORT || 4000;
app.listen(port,()=>console.log(`Backend running on http://localhost:${port}`));
