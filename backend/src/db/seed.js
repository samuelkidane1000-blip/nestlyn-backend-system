import bcrypt from "bcryptjs";
import { db, initDb } from "./index.js";
initDb();
function upsertUser(name,email,password,role){
  const existing=db.prepare("SELECT id FROM users WHERE email=?").get(email);
  const hash=bcrypt.hashSync(password,10);
  if(existing){db.prepare("UPDATE users SET name=?, password_hash=?, role=? WHERE id=?").run(name,hash,role,existing.id);return existing.id;}
  const result=db.prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)").run(name,email,hash,role);
  return result.lastInsertRowid;
}
const adminId=upsertUser("Nestlyn Admin","admin@nestlynhome.co.uk","Password123!","admin");
const customerId=upsertUser("Amelia Carter","customer@example.com","Password123!","customer");
const cleanerId=upsertUser("Maria Cleaner","cleaner@example.com","Password123!","cleaner");
db.prepare("INSERT OR IGNORE INTO customers (user_id,phone,address,postcode,notes) VALUES (?,?,?,?,?)").run(customerId,"+44 7700 000001","10 Belgrave Square, London","SW1X 8PS","Prefers same cleaner");
db.prepare("INSERT OR IGNORE INTO cleaners (user_id,phone,home_postcode,status,rating,capacity_per_day) VALUES (?,?,?,?,?,?)").run(cleanerId,"+44 7700 000002","SW1A 1AA","active",4.9,6);
console.log("Seed complete");
