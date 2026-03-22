# Nestlyn Home Backend System

This is the real backend starter for your cleaning platform.

## Included
- customer / admin / cleaner login
- bookings API
- automatic cleaner assignment
- job tracking
- schedule/status updates
- subscription table
- Stripe subscription checkout placeholder
- Stripe webhook placeholder
- SQLite database

## Run backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend runs on:
```bash
http://localhost:4000
```

## Demo logins
- Admin: `admin@nestlynhome.co.uk` / `Password123!`
- Customer: `customer@example.com` / `Password123!`
- Cleaner: `cleaner@example.com` / `Password123!`

## Core endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/bookings`
- `POST /api/bookings`
- `POST /api/bookings/:id/assign`
- `PATCH /api/bookings/:id/status`
- `GET /api/cleaners`
- `GET /api/cleaners/my-jobs`
- `GET /api/admin/dashboard`
- `POST /api/subscriptions/checkout`
