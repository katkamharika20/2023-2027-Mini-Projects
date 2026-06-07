# SafeWatch — Police Safety Monitoring Dashboard

A police-controlled web dashboard for monitoring IoT safety device alerts.

## Features

- 🔔 **Dashboard** — View active security alerts (manual trigger, IR proximity, combined danger)
- 🗺️ **Map View** — OpenStreetMap with alert markers and high-risk zone highlighting
- ✅ **Solved Cases** — Archive of resolved alerts
- 📖 **Guidelines** — Police-issued safety guidelines (admin-managed)
- 🔐 **Role-Based Access** — Admin, Police, and User roles
- 📡 **IoT Integration** — REST API endpoint for receiving device alerts

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Frontend:** EJS templates, Vanilla CSS & JavaScript
- **Maps:** Leaflet.js + OpenStreetMap
- **Auth:** Express sessions with bcrypt password hashing

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and session secret

# 3. Seed sample data
npm run seed

# 4. Start the server
npm run dev
```

Open `http://localhost:3000`

### Demo Accounts

| Username  | Password     | Role   |
|-----------|-------------|--------|
| admin     | admin123    | Admin  |
| officer1  | officer123  | Police |
| citizen   | citizen123  | User   |

## API Endpoints

### IoT Device Alert Ingestion
```
POST /alerts/api/incoming
Content-Type: application/json

{
  "type": "manual_trigger",       // manual_trigger | ir_proximity | combined_danger
  "latitude": 28.6139,
  "longitude": 77.2090,
  "deviceId": "DEV-001",
  "address": "Connaught Place, Delhi",   // optional
  "description": "SOS button pressed"     // optional
}
```

### Other API Routes
- `GET /alerts/api/all` — All alerts as JSON (authenticated)
- `PATCH /alerts/api/:id/solve` — Mark alert solved (police/admin)
- `POST /alerts/api/:id/notes` — Add note to alert (police/admin)
- `POST /guidelines/api` — Create guideline (police/admin)
- `PUT /guidelines/api/:id` — Update guideline (police/admin)
- `DELETE /guidelines/api/:id` — Soft-delete guideline (police/admin)

## Project Structure

```
police-safety-dashboard/
├── config/db.js           # MongoDB connection
├── controllers/           # (extensible)
├── middleware/auth.js      # Auth & role middleware
├── models/
│   ├── Alert.js           # Alert schema
│   ├── Guideline.js       # Guideline schema
│   └── User.js            # User schema with bcrypt
├── public/
│   ├── css/style.css      # Dashboard styles
│   └── js/app.js          # Frontend logic + map
├── routes/
│   ├── alerts.js          # Alert CRUD + IoT endpoint
│   ├── auth.js            # Login/logout
│   ├── guidelines.js      # Guidelines CRUD
│   └── map.js             # Map page
├── views/
│   ├── dashboard.ejs      # Active alerts
│   ├── error.ejs          # Error page
│   ├── guidelines.ejs     # Guidelines page
│   ├── layout.ejs         # Main layout
│   ├── login.ejs          # Login page
│   ├── map.ejs            # Map view
│   └── solved.ejs         # Solved cases
├── seed.js                # Database seeder
├── server.js              # Express app entry
├── .env.example           # Environment template
└── package.json
```

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Session-based auth with httpOnly cookies
- Input validation via express-validator
- Role-based access control on all write endpoints
- Health/pulse alerts are explicitly excluded per spec
