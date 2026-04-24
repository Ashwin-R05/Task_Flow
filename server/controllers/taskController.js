const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get tasks (RBAC + optional user filter via ?userId=)
// @route   GET /api/tasks
const getTasks = async (req, res) => {
    try {
        let query = { organization: req.user.organization };

        // If a userId filter is provided (admin clicking a user icon)
        if (req.query.userId) {
            // Show tasks created by OR assigned to this user
            query.$or = [
                { createdBy: req.query.userId },
                { assignedTo: req.query.userId }
            ];
        } else if (req.user.role === 'user') {
            // Regular users see tasks they created OR are assigned to
            query.$or = [
                { createdBy: req.user._id },
                { assignedTo: req.user._id }
            ];
        }
        // Admin with no filter → sees ALL org tasks

        const tasks = await Task.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        console.error('Get Tasks Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching tasks.' });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Task title is required.' });
        }

        // If admin assigns to a user, verify they belong to same org
        if (assignedTo) {
            const assignee = await User.findById(assignedTo);
            if (!assignee || assignee.organization !== req.user.organization) {
                return res.status(400).json({ message: 'Cannot assign to a user outside your organization.' });
            }
        }

        // Auto-set organization and creator from authenticated user
        const task = await Task.create({
            title,
            description: description || '',
            organization: req.user.organization,
            createdBy: req.user._id,
            assignedTo: assignedTo || null
        });

        // Populate creator and assignee info before sending response
        await task.populate('createdBy', 'name email');
        await task.populate('assignedTo', 'name email');

        res.status(201).json(task);
    } catch (error) {
        console.error('Create Task Error:', error.message);
        res.status(500).json({ message: 'Server error while creating task.' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Ensure user can only delete tasks within their organization
        if (task.organization !== req.user.organization) {
            return res.status(403).json({ message: 'Access denied. Task belongs to another organization.' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.json({ message: 'Task deleted successfully.' });
    } catch (error) {
        console.error('Delete Task Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting task.' });
    }
};

// @desc    Toggle task status (pending ↔ completed)
// @route   PUT /api/tasks/:id/toggle
const toggleTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Verify organization ownership
        if (task.organization !== req.user.organization) {
            return res.status(403).json({ message: 'Access denied. Task belongs to another organization.' });
        }

        // Toggle the status
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        await task.save();

        await task.populate('createdBy', 'name email');
        await task.populate('assignedTo', 'name email');

        res.json(task);
    } catch (error) {
        console.error('Toggle Task Error:', error.message);
        res.status(500).json({ message: 'Server error while updating task.' });
    }
};

module.exports = { getTasks, createTask, deleteTask, toggleTask };
