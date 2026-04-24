const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, organization, role } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password || !organization) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // 3. Create user (password is hashed automatically via pre-save hook)
        const user = await User.create({
            name,
            email,
            password,
            organization,
            role: role || 'user'
        });

        // 4. Generate token and respond
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                organization: user.organization,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register Error:', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// @desc    Login an existing user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 3. Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 4. Generate token and respond
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                organization: user.organization,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { register, login };
