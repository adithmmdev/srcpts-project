# SRCPTS — Smart Research Collaboration & Project Tracking System

A full-stack research lifecycle platform for faculty, students, and funding agencies.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) + React Router + Axios |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (role-based) |
| Deployment | Docker Compose |

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- Docker & Docker Compose installed

```bash
# 1. Clone / unzip the project
cd srcpts

# 2. Start all services
docker-compose up --build

# 3. Open in browser
http://localhost:3000
```

That's it! The database schema initializes automatically on first run.

---

## 💻 Local Development (No Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```sql
-- In psql:
CREATE DATABASE srcpts;
```

### 2. Backend

```bash
cd backend
npm install

# Create .env file:
echo "DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/srcpts
JWT_SECRET=your_secret_key
PORT=5000" > .env

npm run dev
# Backend starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

---

## 👥 User Roles & Access

### Faculty
- Create and manage research projects
- Assign students to projects
- Create tasks and assign to students
- Add milestones with deadlines
- Submit progress reports
- Upload publications (PDF/DOI/URL)
- Chat with project team

### Student
- View assigned projects only
- Mark tasks as complete / in-progress
- View milestones and deadlines
- Chat with project team
- Access project publications

### Funding Agency
- View all research projects
- Fund projects (add grants with amounts)
- Update existing grants
- View own grant portfolio
- Chat with project teams

---

## 🔐 Authentication

Users register separately as Student / Faculty / Agency. Login uses **email + password** — the backend automatically detects the role from the appropriate table.

### Register Test Accounts

**Faculty:**
- POST `/api/auth/register/faculty`
- `{ "name": "Prof. Smith", "email": "smith@uni.edu", "password": "pass123", "specialization": "AI" }`

**Student:**
- POST `/api/auth/register/student`
- `{ "name": "Alice Chen", "email": "alice@uni.edu", "password": "pass123", "program": "MSc CS", "year": 2 }`

**Agency:**
- POST `/api/auth/register/agency`
- `{ "agency_name": "NSF", "contact_email": "grants@nsf.gov", "password": "pass123", "type": "Government" }`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (all roles) |
| POST | `/api/auth/register/student` | Register student |
| POST | `/api/auth/register/faculty` | Register faculty |
| POST | `/api/auth/register/agency` | Register agency |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | All (filtered by role) |
| POST | `/api/projects` | Faculty only |
| GET | `/api/projects/:id` | All |
| PUT | `/api/projects/:id` | Faculty (own projects) |
| GET | `/api/projects/:id/students` | All |
| POST | `/api/projects/:id/assign` | Faculty only |
| GET | `/api/projects/all/students` | Faculty only |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tasks/project/:id` | All (student filtered) |
| POST | `/api/tasks` | Faculty only |
| PUT | `/api/tasks/:id` | All (student: own tasks) |
| DELETE | `/api/tasks/:id` | Faculty only |

### Milestones
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/milestones/:project_id` | All |
| POST | `/api/milestones` | Faculty only |
| PUT | `/api/milestones/:project_id/:no` | Faculty only |

### Progress Reports
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/reports/:project_id` | All |
| POST | `/api/reports` | Faculty only |

### Publications
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/publications/:project_id` | All |
| POST | `/api/publications` | Faculty only |

### Chat
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/chat/:project_id` | All |
| POST | `/api/chat/send` | All |

### Grants (Agency)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/grants` | Agency only |
| POST | `/api/grants` | Agency only |
| GET | `/api/all-projects` | Agency only |

---

## 🗂️ Project Structure

```
srcpts/
├── backend/
│   ├── db/
│   │   ├── pool.js          # PostgreSQL connection
│   │   └── schema.sql       # Database schema
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints
│   │   ├── projects.js      # Project endpoints
│   │   ├── tasks.js         # Task endpoints
│   │   └── misc.js          # Milestones, chat, publications, grants
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UI.jsx       # Reusable components
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── faculty/     # Dashboard, Projects, Tasks, etc.
│   │   │   ├── student/     # Dashboard
│   │   │   └── agency/      # Dashboard, Funding
│   │   ├── api.js           # Axios instance
│   │   ├── App.jsx          # Router
│   │   └── main.jsx
│   └── package.json
└── docker-compose.yml
```

---

## 🔒 Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with 7-day expiry
- Role-based access control on all routes
- Data filtering: users only see their own data
- Foreign key constraints enforce referential integrity

---

## 📱 Features

| Feature | Faculty | Student | Agency |
|---------|---------|---------|--------|
| Create Project | ✅ | ❌ | ❌ |
| View Projects | Own | Assigned | All |
| Assign Students | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ❌ | ❌ |
| Complete Tasks | ✅ | Own | ❌ |
| Add Milestones | ✅ | ❌ | ❌ |
| Progress Reports | ✅ | View | View |
| Publications | ✅ | View | ❌ |
| Chat | ✅ | ✅ | ✅ |
| Fund Projects | ❌ | ❌ | ✅ |
