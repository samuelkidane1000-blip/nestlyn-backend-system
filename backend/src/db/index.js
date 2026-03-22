import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../nestlyn.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','customer','cleaner')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      phone TEXT,address TEXT,postcode TEXT,notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS cleaners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      phone TEXT,home_postcode TEXT,status TEXT DEFAULT 'active',
      rating REAL DEFAULT 5.0,capacity_per_day INTEGER DEFAULT 6,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_user_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,frequency TEXT NOT NULL,date TEXT NOT NULL,time TEXT NOT NULL,
      postcode TEXT NOT NULL,address TEXT,estimated_hours REAL DEFAULT 2,amount_gbp REAL NOT NULL,
      rooms_json TEXT,addons_json TEXT,status TEXT DEFAULT 'pending',notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      cleaner_user_id INTEGER NOT NULL,
      assigned_by TEXT DEFAULT 'system',
      assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'assigned',
      FOREIGN KEY(booking_id) REFERENCES bookings(id),
      FOREIGN KEY(cleaner_user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_user_id INTEGER NOT NULL,
      stripe_customer_id TEXT,stripe_subscription_id TEXT,
      plan_name TEXT NOT NULL,status TEXT DEFAULT 'draft',amount_gbp REAL NOT NULL,
      billing_interval TEXT DEFAULT 'weekly',created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS job_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,event_type TEXT NOT NULL,payload_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    );
  `);
}
