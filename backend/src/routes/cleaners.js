import express from "express";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const router=express.Router();
router.get("/",requireAuth,requireRole("admin"),(_req,res)=>{
  const cleaners=db.prepare(`SELECT u.id,u.name,u.email,c.phone,c.home_postcode,c.status,c.rating,c.capacity_per_day
    FROM cleaners c JOIN users u ON u.id=c.user_id ORDER BY c.rating DESC,u.name ASC`).all();
  res.json({cleaners});
});
router.get("/my-jobs",requireAuth,requireRole("cleaner"),(req,res)=>{
  const jobs=db.prepare(`SELECT b.*,a.status as assignment_status FROM assignments a JOIN bookings b ON b.id=a.booking_id WHERE a.cleaner_user_id=? ORDER BY b.date ASC,b.time ASC`).all(req.user.id);
  res.json({jobs});
});
export default router;
