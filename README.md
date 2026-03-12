# MandirLedger – Temple Donation & Contribution Ledger

A transparent full-stack ledger where anyone can add data, and every write records **who** did it and **when**.

## Tech Stack

- Frontend: Next.js + TailwindCSS
- Backend: Node.js + Express
- DB: MongoDB (Mongoose)

## Core Rule (No Admin)

All write APIs require these headers:

- `x-actor-name`
- `x-actor-phone`

The frontend enforces this via the **Contributor** page and stores it in `localStorage`.

---

## Run with Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

---

## Run locally (without Docker)

### Backend

```bash
cd backend
npm install --include=dev
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Pages

- `/` Landing
- `/contributor` Contributor entry
- `/dashboard` Dashboard
- `/members` Members list
- `/members/new` Add member
- `/members/[memberId]` Member profile + donation history + edit + archive
- `/donations` Donations ledger
- `/donations/new` Add donation
- `/donations/[donationId]` Donation detail + edit + generate receipt
- `/pending` Pending contributions list
- `/activity-logs` Activity logs
- `/receipts/[receiptId]` Receipt PDF view/print

---

## Backend API (high-level)

- `GET /health`
- Members:
  - `POST /api/members`
  - `GET /api/members?q=&page=&limit=`
  - `GET /api/members/:memberId`
  - `PUT /api/members/:memberId`
  - `POST /api/members/:memberId/archive`
- Donations:
  - `POST /api/donations`
  - `GET /api/donations?q=&member_id=&from=&to=&page=&limit=`
  - `GET /api/donations/:donationId`
  - `PUT /api/donations/:donationId`
- Pending:
  - `GET /api/pending?year=`
  - `GET /api/pending/settings`
  - `PUT /api/pending/settings`
- Activity logs:
  - `GET /api/activity-logs?page=&limit=`
- Receipts:
  - `POST /api/receipts/from-donation/:donationId`
  - `GET /api/receipts/:receiptId/pdf`

---

## Tests

Backend tests:

```bash
cd backend
npm test
```

---

## Deployment

### Frontend (Vercel)

- Set root directory to `frontend`
- Add env:
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-url>`

### Backend (Render/Railway)

- Root directory: `backend`
- Start command: `npm start`
- Env:
  - `MONGODB_URI` (MongoDB Atlas)
  - `CORS_ORIGIN` (your Vercel domain)
  - `TEMPLE_NAME`

### MongoDB Atlas

- Create cluster + database
- Allowlist your backend IP or use proper networking
- Use Atlas connection string as `MONGODB_URI`
