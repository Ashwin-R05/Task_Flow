const User = require('../models/User');

// @desc    Get all users in the same organization (admin only)
// @route   GET /api/users
const getOrgUsers = async (req, res) => {
    try {
        // Only admins can view org users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const users = await User.find({ organization: req.user.organization, role: 'user' })
            .select('name email role createdAt')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get Org Users Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
};

module.exports = { getOrgUsers };
