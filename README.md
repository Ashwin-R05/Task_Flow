# Multi-Tenant Task Management System

A full-stack task management application where multiple organizations (tenants) can use the same system with fully isolated data.

## Features

- **User Authentication** — Register/Login with JWT tokens
- **Multi-Tenant Isolation** — Each organization's data is completely separated
- **Role-Based Access Control** — Admins see all org tasks, users see only their own
- **Task CRUD** — Create, view, toggle status, and delete tasks
- **Modern UI** — Dark glassmorphism theme with smooth animations

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Node.js, Express              |
| Database  | MongoDB (Mongoose)            |
| Auth      | JWT + bcrypt                  |
| Frontend  | HTML, CSS, JavaScript (Vanilla) |

## Project Structure

```
├── server/
│   ├── config/db.js           # MongoDB connection
│   ├── models/User.js         # User schema
│   ├── models/Task.js         # Task schema
│   ├── middleware/auth.js     # JWT verification
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   ├── server.js              # Entry point
│   └── .env                   # Environment variables
├── client/
│   ├── css/style.css          # Styles
│   ├── js/auth.js             # Login/Register logic
│   ├── js/tasks.js            # Task CRUD logic
│   ├── login.html             # Auth page
│   └── dashboard.html         # Dashboard page
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and Install
```bash
cd server
npm install
```

### 2. Configure Environment
Edit `server/.env` and add your MongoDB URI:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskmanager
JWT_SECRET=your_secret_key_here
```

### 3. Start the Server
```bash
cd server
npm start
```

### 4. Open in Browser
Navigate to `http://localhost:5000`

## API Endpoints

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | /api/auth/register    | Register a new user      | No   |
| POST   | /api/auth/login       | Login                    | No   |
| GET    | /api/tasks            | Get tasks (RBAC filtered)| Yes  |
| POST   | /api/tasks            | Create a task            | Yes  |
| PUT    | /api/tasks/:id/toggle | Toggle task status       | Yes  |
| DELETE | /api/tasks/:id        | Delete a task            | Yes  |

## How Multi-Tenancy Works

Every user and task has an `organization` field. All database queries include this field to ensure data isolation between tenants. This is the "shared database, shared collection" multi-tenancy pattern.

## License

ISC
