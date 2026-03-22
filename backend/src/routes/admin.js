import express from "express";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const router=express.Router();
router.get("/dashboard",requireAuth,requireRole("admin"),(_req,res)=>{
  const pending=db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status='pending'").get().count;
  const assigned=db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status='assigned'").get().count;
  const completed=db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status='completed'").get().count;
  const customers=db.prepare("SELECT COUNT(*) as count FROM users WHERE role='customer'").get().count;
  const cleaners=db.prepare("SELECT COUNT(*) as count FROM users WHERE role='cleaner'").get().count;
  res.json({metrics:{pending,assigned,completed,customers,cleaners}});
});
export default router;
