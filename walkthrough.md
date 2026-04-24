# Multi-Tenant Task Management System — Walkthrough

## What We Built

A full-stack task management app with **multi-tenancy**, **JWT auth**, **RBAC**, and **dark/light theme toggle**.

## Final Feature Set

| Feature | Details |
|---------|---------|
| **User Auth** | Register & login with JWT, bcrypt password hashing |
| **Multi-Tenancy** | Organization-based data isolation on every query |
| **RBAC** | Admin sees all org tasks + team panel; User sees own + assigned tasks |
| **Task CRUD** | Create, toggle status, delete tasks |
| **Task Assignment** | Admin can assign tasks to org members via dropdown |
| **Team Panel** | Admin sees all org users (non-admins), click to filter tasks |
| **Theme Toggle** | Dark/Light mode with localStorage persistence |
| **Responsive UI** | Works on desktop and mobile |

## Project Structure (17 files)

```
├── server/
│   ├── config/db.js              — MongoDB connection
│   ├── models/User.js            — User schema + bcrypt hook
│   ├── models/Task.js            — Task schema + assignedTo field
│   ├── middleware/auth.js        — JWT verification
│   ├── controllers/authController.js   — Register & Login
│   ├── controllers/taskController.js   — CRUD + RBAC + assign
│   ├── controllers/userController.js   — Get org users (admin only)
│   ├── routes/authRoutes.js
│   ├── routes/taskRoutes.js
│   ├── routes/userRoutes.js
│   ├── server.js                 — Express entry point
│   ├── .env                      — Config (MongoDB URI, JWT secret)
│   └── package.json
├── client/
│   ├── css/style.css             — Full design system (dark + light)
│   ├── js/auth.js                — Login/Register logic
│   ├── js/tasks.js               — Dashboard logic
│   ├── login.html                — Auth page
│   └── dashboard.html            — Dashboard page
└── README.md
```

## How to Run

```bash
cd server
npm start
# Open http://localhost:5000
```

## Issues Fixed During Development

1. **Mongoose v9 pre-save hook** — Removed `next()` callback (not supported in async hooks)
2. **Express v5 breaking changes** — Downgraded to Express v4 for stability
3. **MongoDB URI** — Added database name (`/taskmanager`) to connection string

## Demo Script

Included in the [implementation_plan.md](file:///d:/INTERN's/NIT%20oru%20try/Multi-Tenant%20Task%20Management%20System/implementation_plan.md) — a ~3 minute presentation walkthrough covering registration, RBAC, tenant isolation, and code architecture.
