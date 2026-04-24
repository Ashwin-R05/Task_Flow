const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Serve Frontend Static Files ─────────────────────────
app.use(express.static(path.join(__dirname, '..', 'client')));

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// ─── Root Route (serve login page) ──────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'login.html'));
});

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
