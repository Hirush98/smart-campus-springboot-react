# Smart Campus Operations Hub
### IT3030 – Programming Applications and Frameworks | Group XX

[![CI](https://github.com/YOUR_ORG/it3030-paf-2026-smart-campus-groupXX/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/it3030-paf-2026-smart-campus-groupXX/actions)

A full-stack web platform to manage facility bookings, asset management, and maintenance ticketing for a university campus.

---

## Team & Module Ownership

| Member | Module | Responsibilities |
|--------|--------|-----------------|
| Member 1 | Module A | Facilities & Assets Catalogue – resources CRUD, search & filtering |
| Member 2 | Module B | Booking Management – workflow, conflict detection, admin review |
| Member 3 | Module C | Maintenance & Incident Ticketing – tickets, attachments, comments |
| Member 4 | Module D + E | Notifications + Auth (OAuth2, JWT, roles) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Java 17 · Spring Boot 3.2 · Spring Security · Spring Data MongoDB |
| Authentication | JWT · OAuth2 (Google Sign-In) |
| Database | MongoDB 7 |
| Frontend | React 18 · Vite · Tailwind CSS · React Router v6 · Axios |
| CI/CD | GitHub Actions |

---

## Project Structure

```
it3030-paf-2026-smart-campus-groupXX/
├── backend/                    ← Spring Boot REST API
│   └── src/main/java/com/smartcampus/
│       ├── controller/         ← REST controllers (one per module)
│       ├── service/            ← Business logic
│       ├── repository/         ← MongoDB repositories
│       ├── model/              ← Domain models + enums
│       ├── security/           ← JWT filter, UserPrincipal
│       ├── config/             ← SecurityConfig, MongoConfig
│       └── exception/          ← Global error handling
├── frontend/                   ← React web application
│   └── src/
│       ├── pages/              ← One page per module
│       ├── components/         ← Shared layout + UI components
│       ├── context/            ← AuthContext (global auth state)
│       ├── services/           ← Axios API service functions
│       └── hooks/              ← Custom React hooks
└── .github/workflows/ci.yml    ← GitHub Actions CI pipeline
```

---

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+
- MongoDB 7 running locally (or MongoDB Atlas URI)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/it3030-paf-2026-smart-campus-groupXX.git
cd it3030-paf-2026-smart-campus-groupXX
```

### 2. Configure the backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/smart_campus

# Generate a strong secret (min 256-bit):
app.jwt.secret=REPLACE_WITH_LONG_RANDOM_SECRET

# Get from Google Cloud Console → APIs & Services → Credentials:
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

### 3. Run the backend

```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## API Endpoint Summary

### Module A – Resources (Member 1)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/resources` | Public | List / search resources |
| GET | `/api/resources/{id}` | Public | Get resource by ID |
| POST | `/api/resources` | ADMIN | Create resource |
| PUT | `/api/resources/{id}` | ADMIN | Update resource |
| PATCH | `/api/resources/{id}/status` | ADMIN | Change status |
| DELETE | `/api/resources/{id}` | ADMIN | Delete resource |

### Module B – Bookings (Member 2)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | USER/ADMIN | List bookings |
| GET | `/api/bookings/{id}` | USER/ADMIN | Get booking |
| POST | `/api/bookings` | USER | Create booking |
| PATCH | `/api/bookings/{id}/approve` | ADMIN | Approve |
| PATCH | `/api/bookings/{id}/reject` | ADMIN | Reject with reason |
| PATCH | `/api/bookings/{id}/cancel` | USER/ADMIN | Cancel |

### Module C – Tickets (Member 3)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tickets` | USER/ADMIN | List tickets |
| GET | `/api/tickets/{id}` | USER/ADMIN | Get ticket |
| POST | `/api/tickets` | USER | Submit ticket |
| PATCH | `/api/tickets/{id}/status` | ADMIN/TECH | Update status |
| PATCH | `/api/tickets/{id}/assign` | ADMIN | Assign technician |
| DELETE | `/api/tickets/{id}` | ADMIN | Delete ticket |
| GET | `/api/tickets/{id}/comments` | USER | List comments |
| POST | `/api/tickets/{id}/comments` | USER | Add comment |
| PUT | `/api/tickets/{id}/comments/{cid}` | OWNER | Edit comment |
| DELETE | `/api/tickets/{id}/comments/{cid}` | OWNER/ADMIN | Delete comment |

### Module D – Notifications (Member 4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | USER | Get my notifications |
| GET | `/api/notifications/unread-count` | USER | Unread badge count |
| PATCH | `/api/notifications/{id}/read` | USER | Mark one read |
| PATCH | `/api/notifications/read-all` | USER | Mark all read |

### Module E – Auth (Member 4)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | USER | Current user info |

---

## Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google+ API**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
5. Copy Client ID and Secret into `application.properties`

---
# Smart Campus Booking Management System

## 📌 Module: Booking Management (Conflict Handling)

This module is responsible for managing booking requests for campus resources. It ensures proper handling of booking conflicts and maintains a consistent booking workflow.

---

## 🚀 Features

- Create booking requests
- View bookings (user-specific and admin view)
- Approve or reject bookings (Admin only)
- Cancel bookings
- Booking conflict handling
- Status-based workflow (no hard deletion)

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|--------|------------|
| GET | /api/bookings | Get bookings (Admin: all, User: own) |
| GET | /api/bookings/{id} | Get booking by ID |
| POST | /api/bookings | Create new booking |
| PATCH | /api/bookings/{id}/approve | Approve booking (Admin) |
| PATCH | /api/bookings/{id}/reject | Reject booking with reason (Admin) |
| PATCH | /api/bookings/{id}/cancel | Cancel booking |

---

## ⚙️ Booking Workflow

1. User creates booking → Status = PENDING  
2. Admin reviews booking  
3. Admin can:
   - Approve → Status = APPROVED  
   - Reject → Status = REJECTED (with reason)  
4. User/Admin can cancel → Status = CANCELLED  

---

## ⚠️ Conflict Handling

- System prevents conflicting bookings by controlling approval process  
- Only valid bookings are approved  
- Conflicting bookings are rejected with a reason  

---

## 🗄️ Database Design (Booking Entity)

- id  
- userId  
- resourceId  
- status (PENDING, APPROVED, REJECTED, CANCELLED)  
- reason  
- createdAt / updatedAt  

---

## 🔐 Security

- Role-based access control  
- Admin: approve/reject bookings  
- User: view and manage own bookings  

---

## 🧠 Design Decisions

- Used PATCH for partial updates  
- Avoided DELETE to preserve booking history  
- Used status-based lifecycle for better data consistency  


## Running Tests

```bash
# Backend
cd backend && mvn test

# Frontend (if tests added)
cd frontend && npm test
```

---

## Git Workflow

- `main` – stable, submission-ready
- `develop` – integration branch
- `feature/member1-module-a` – individual feature branches

**Each member should commit regularly to their own branch and open PRs into `develop`.**
