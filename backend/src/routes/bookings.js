import express from "express";
import { db } from "../db/index.js";
import { calculateQuote } from "../services/pricingService.js";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const payload = req.body;

    // 🔥 GET REAL CUSTOMER FROM DB
    const customer = db
      .prepare("SELECT id FROM users WHERE role = 'customer' LIMIT 1")
      .get();

    if (!customer) {
      return res.status(400).json({ error: "No customer found in database" });
    }

    const pricing = calculateQuote(payload);

    const result = db.prepare(`
      INSERT INTO bookings (
        customer_user_id,
        service_type,
        frequency,
        date,
        time,
        postcode,
        address,
        estimated_hours,
        amount_gbp,
        rooms_json,
        addons_json,
        status,
        notes
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending',?)
    `).run(
      customer.id, // ✅ REAL USER ID
      payload.service_type,
      payload.frequency,
      payload.date,
      payload.time,
      payload.postcode,
      payload.address || "",
      pricing.estimated_hours,
      pricing.amount_gbp,
      JSON.stringify(payload.rooms || {}),
      JSON.stringify(payload.addons || {}),
      payload.notes || ""
    );

    const booking = db
      .prepare("SELECT * FROM bookings WHERE id=?")
      .get(result.lastInsertRowid);

    res.status(201).json({ booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Booking failed: " + error.message });
  }
});

export default router;
