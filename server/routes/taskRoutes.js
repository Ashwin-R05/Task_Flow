const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getTasks, createTask, deleteTask, toggleTask } = require('../controllers/taskController');

// All task routes are protected by JWT authentication
router.use(authMiddleware);

// GET    /api/tasks        — Get tasks (filtered by role)
router.get('/', getTasks);

// POST   /api/tasks        — Create a new task
router.post('/', createTask);

// DELETE /api/tasks/:id    — Delete a task
router.delete('/:id', deleteTask);

// PUT    /api/tasks/:id/toggle — Toggle task status
router.put('/:id/toggle', toggleTask);

module.exports = router;
