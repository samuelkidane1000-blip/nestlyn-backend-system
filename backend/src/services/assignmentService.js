import { db } from "../db/index.js";
export function autoAssignCleaner(bookingId){
  const booking=db.prepare("SELECT * FROM bookings WHERE id=?").get(bookingId);
  if(!booking)throw new Error("Booking not found");
  const cleaner=db.prepare(`SELECT u.id as user_id,u.name,c.capacity_per_day,c.rating
    FROM cleaners c JOIN users u ON u.id=c.user_id
    WHERE c.status='active' ORDER BY c.rating DESC,c.capacity_per_day DESC,u.id ASC LIMIT 1`).get();
  if(!cleaner)return null;
  db.prepare("INSERT OR REPLACE INTO assignments (booking_id,cleaner_user_id,assigned_by,status) VALUES (?,?, 'system','assigned')").run(bookingId,cleaner.user_id);
  db.prepare("INSERT INTO job_events (booking_id,event_type,payload_json) VALUES (?, 'assigned', json(?))").run(bookingId, JSON.stringify({cleaner_user_id: cleaner.user_id, cleaner_name: cleaner.name}));
  db.prepare("UPDATE bookings SET status='assigned' WHERE id=?").run(bookingId);
  return cleaner;
}
