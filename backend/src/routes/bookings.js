import express from "express";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { calculateQuote } from "../services/pricingService.js";
import { autoAssignCleaner } from "../services/assignmentService.js";
const router=express.Router();
router.get("/",requireAuth,(req,res)=>{
  let rows;
  if(req.user.role==="admin") rows=db.prepare("SELECT * FROM bookings ORDER BY id DESC").all();
  else if(req.user.role==="customer") rows=db.prepare("SELECT * FROM bookings WHERE customer_user_id=? ORDER BY id DESC").all(req.user.id);
  else rows=db.prepare(`SELECT b.* FROM bookings b JOIN assignments a ON a.booking_id=b.id WHERE a.cleaner_user_id=? ORDER BY b.id DESC`).all(req.user.id);
  res.json({bookings:rows});
});
router.post("/", (req, res) => {
  const payload=req.body;
  const pricing=calculateQuote(payload);
  const result=db.prepare(`INSERT INTO bookings (customer_user_id,service_type,frequency,date,time,postcode,address,estimated_hours,amount_gbp,rooms_json,addons_json,status,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending',?)`).run(
    1,payload.service_type,payload.frequency,payload.date,payload.time,payload.postcode,payload.address||"",
    pricing.estimated_hours,pricing.amount_gbp,JSON.stringify(payload.rooms||{}),JSON.stringify(payload.addons||{}),payload.notes||""
  );
  const booking=db.prepare("SELECT * FROM bookings WHERE id=?").get(result.lastInsertRowid);
  res.status(201).json({booking});
});
router.post("/:id/assign",requireAuth,requireRole("admin"),(req,res)=>{
  try{
    const cleaner=autoAssignCleaner(req.params.id);
    if(!cleaner)return res.status(404).json({error:"No available cleaners"});
    res.json({message:"Assigned",cleaner});
  }catch(error){res.status(400).json({error:error.message});}
});
router.patch("/:id/status",requireAuth,requireRole("admin","cleaner"),(req,res)=>{
  const {status}=req.body;
  db.prepare("UPDATE bookings SET status=? WHERE id=?").run(status,req.params.id);
  db.prepare("INSERT INTO job_events (booking_id,event_type,payload_json) VALUES (?, 'status_changed', json(?))").run(req.params.id, JSON.stringify({status,by:req.user.role}));
  const booking=db.prepare("SELECT * FROM bookings WHERE id=?").get(req.params.id);
  res.json({booking});
});
export default router;
