# VanRaj Royal Hotel Management System

A full-stack, Dockerised 3-tier web application built from the
`VanRaj_Hotel_Management.jsx` React prototype.

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1 — Presentation   React 18 + Vite  (port 3000)  │
├─────────────────────────────────────────────────────────┤
│  Tier 2 — Business Logic  Spring Boot 3   (port 8080)  │
├─────────────────────────────────────────────────────────┤
│  Tier 3 — Data            PostgreSQL 16   (port 5432)  │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start (Docker — recommended)

```bash
cp .env.example .env          # set your passwords
docker compose up --build     # builds all three images
```

Open http://localhost:3000

---

## Local Development (without Docker)

### 1. Database
```bash
psql -U postgres -c "CREATE DATABASE vanraj_hotel;"
psql -U postgres vanraj_hotel < init.sql
```

### 2. Backend
```bash
cd backend
# edit application.properties with your local DB credentials
mvn spring-boot:run
# API available at http://localhost:8080/api
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
                    # /api requests are proxied to :8080 via vite.config.js
```

---

## REST API

| Method | Path                       | Description             |
|--------|----------------------------|-------------------------|
| GET    | /api/guests                | List / search guests    |
| GET    | /api/guests/stats          | Dashboard statistics    |
| GET    | /api/guests/{id}           | Single guest            |
| POST   | /api/guests                | Create booking          |
| PUT    | /api/guests/{id}           | Update booking          |
| PATCH  | /api/guests/{id}/status    | Update status only      |
| DELETE | /api/guests/{id}           | Delete booking          |

Query params for GET /api/guests:
- `search` — filters name, room, type, status
- `status` — All | Checked-in | Reserved | Checked-out

---

## Project Structure

```
student-app/
├── backend/
│   ├── src/main/java/com/vanraj/hotel/
│   │   ├── HotelApplication.java          ← Spring Boot entry point
│   │   ├── config/WebConfig.java          ← CORS configuration
│   │   ├── model/Guest.java               ← JPA entity
│   │   ├── repository/GuestRepository.java← Data Tier
│   │   ├── service/GuestService.java      ← Business Logic Tier
│   │   └── controller/GuestController.java← Presentation Tier (API)
│   ├── Dockerfile
│   ├── pom.xml
│   └── application.properties
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                       ← React entry point
│   │   ├── App.jsx                        ← Presentation Tier (UI)
│   │   ├── hooks/useGuests.js             ← Business Logic Tier
│   │   └── utils/api.js                   ← Data Tier (HTTP client)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── init.sql                               ← Schema + seed data
├── .env.example
└── README.md
```

---

## 3-Tier Architecture

### Tier 1 — Presentation
- **React** `App.jsx` renders dashboard, booking form, and guest cards
- Reads data from the `useGuests` hook; never fetches directly
- Maps closely to the original `VanRaj_Hotel_Management.jsx` prototype

### Tier 2 — Business Logic
- **Spring Boot** `GuestService.java`:
  - Auto-calculates amount (price/night × nights)
  - Validates date ordering
  - Enforces status transitions
  - Aggregates dashboard statistics
- **React** `useGuests.js` hook mirrors the same logic on the client side
  for instant UI feedback (optimistic UX pattern)

### Tier 3 — Data
- **PostgreSQL** stores all guest records with constraints
- **Spring Data JPA** `GuestRepository` provides CRUD + custom search query
- `init.sql` creates the schema and seeds the four prototype guests

---

## Room Pricing

| Type          | Per Night |
|---------------|-----------|
| Standard      | ₹1,400    |
| Deluxe        | ₹2,200    |
| Suite         | ₹3,500    |
| Presidential  | ₹7,000    |
