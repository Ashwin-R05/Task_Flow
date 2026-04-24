const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user and attach to request (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found. Token is invalid.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(401).json({ message: 'Token is invalid or expired.' });
    }
};

module.exports = authMiddleware;
