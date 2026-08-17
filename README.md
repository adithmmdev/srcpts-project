# SRCPTS

I built SRCPTS as a research project management system for students, faculty and funding agencies.

I wanted to work on a project where the frontend, backend and database all had to fit together, so I implemented authentication, role based access, research projects, tasks, milestones, publications, grants and chat.

## What I built

There are three main types of users.

### Faculty

* Create and manage research projects
* Assign students to projects
* Create tasks and milestones
* Add progress reports and publications
* Work with project members through chat

### Students

* View projects they are assigned to
* Work on their tasks
* Track milestones
* View project publications
* Use project chat

### Funding agencies

* View research projects
* Add grants
* Track funded projects

## How it works

```text
React frontend
      ↓
Express REST API
      ↓
JWT authentication and role checks
      ↓
PostgreSQL
```

The frontend talks to the Express API through Axios. Protected requests include a JWT and the backend checks the user's role before allowing access to restricted operations.

PostgreSQL stores the research data and the relationships between projects, students, faculty, tasks, publications and grants.

## Database

The database was one of the main parts I wanted to understand while building this project.

The main tables include:

```text
Department
   ↓
Faculty ──────── Research_Project ──────── Publication
                    │
                    ├── Project_Assignment ── Student
                    ├── Task
                    ├── Milestone
                    ├── Progress_Report
                    ├── Project_Grant ────── Funding_Agency
                    └── Project_Resource ─── Resource
```

The schema uses foreign keys to keep the relationships consistent and composite primary keys for relationships such as project assignments and project grants.

## Authentication and access

Users log in through the same API and the backend identifies whether the account belongs to a student, faculty member or funding agency.

Passwords are stored using bcrypt hashes. Protected requests use JWT bearer tokens, and role checks are applied to routes that should only be available to a particular type of user.

I also removed hard coded JWT secrets from the application and Docker configuration. The secret now comes from the environment.

## API

Some of the main routes are:

```text
POST /api/auth/login
POST /api/auth/register/student
POST /api/auth/register/faculty
POST /api/auth/register/agency

GET  /api/projects
POST /api/projects
PUT  /api/projects/:id
POST /api/projects/:id/assign

GET  /api/tasks/project/:project_id
POST /api/tasks
PUT  /api/tasks/:id
DELETE /api/tasks/:id

GET  /api/milestones/:project_id
GET  /api/reports/:project_id
GET  /api/publications/:project_id
GET  /api/chat/:project_id
GET  /api/grants
```

The backend uses parameterized PostgreSQL queries for database operations.

## Project structure

```text
srcpts-project/
├── backend/
│   ├── db/
│   │   ├── pool.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── misc.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── api.js
│       └── App.jsx
├── backend/Dockerfile
├── frontend/Dockerfile
└── docker-compose.yml
```

## Running with Docker

Docker Compose starts PostgreSQL, the Express backend and the React frontend together.

```bash
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

For local development without Docker, install Node.js and PostgreSQL, create the database and provide the required environment variables.

## What I learned

The main thing I learned from this project was how much an application depends on the database design.

It is easy to make a page that shows projects or tasks. The harder part is making sure the relationships are correct and that a student cannot access another student's data, or a faculty member cannot edit someone else's project.

Working on the API and SQL queries also helped me understand how authentication, authorization and database queries fit together instead of treating them as separate parts.

## Current limitations

This is a project I built to learn and implement a complete research management workflow. It is not intended to be a production system yet.

Some areas I would improve next are better automated API tests, stronger request validation, more detailed logging and a more complete deployment setup.

## Tech used

React, Vite, Node.js, Express, PostgreSQL, JWT, bcryptjs, Docker, Axios and Nginx.
