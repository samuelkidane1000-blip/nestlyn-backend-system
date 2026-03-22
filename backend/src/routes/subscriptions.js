import express from "express";
import Stripe from "stripe";
import { db } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
const router=express.Router();
const stripe=process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
router.get("/",requireAuth,(req,res)=>{
  const rows=db.prepare("SELECT * FROM subscriptions WHERE customer_user_id=? ORDER BY id DESC").all(req.user.id);
  res.json({subscriptions:rows});
});
router.post("/checkout",requireAuth,async(req,res)=>{
  if(!stripe || !process.env.STRIPE_REGULAR_PRICE_ID) return res.status(400).json({error:"Stripe is not configured yet."});
  const session=await stripe.checkout.sessions.create({
    mode:"subscription",
    line_items:[{price:process.env.STRIPE_REGULAR_PRICE_ID,quantity:1}],
    success_url:`${process.env.FRONTEND_URL}/success.html`,
    cancel_url:`${process.env.FRONTEND_URL}/cancel.html`,
    customer_email:req.user.email,
    metadata:{user_id:String(req.user.id)}
  });
  res.json({url:session.url});
});
export default router;
