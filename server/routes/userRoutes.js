const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getOrgUsers } = require('../controllers/userController');

// All user routes are protected
router.use(authMiddleware);

// GET /api/users — Get all users in organization (admin only)
router.get('/', getOrgUsers);

module.exports = router;
