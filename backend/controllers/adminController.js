const User = require('../models/User');
const Contact = require('../models/Contact');

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalContacts, activeUsers, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Contact.countDocuments(),
      User.countDocuments({ isActive: true, role: 'user' }),
      User.find({ role: 'user' }).sort('-createdAt').limit(5).select('name email createdAt isActive'),
    ]);

    // Contacts per user stats
    const contactsPerUser = await Contact.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $group: { _id: null, avg: { $avg: '$count' }, max: { $max: '$count' } } },
    ]);

    // Monthly signups (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalContacts,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        avgContactsPerUser: contactsPerUser[0]?.avg?.toFixed(1) || 0,
        maxContactsByUser: contactsPerUser[0]?.max || 0,
        recentUsers,
        monthlySignups,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET ALL USERS ─────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('contactCount'),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET USER DETAILS WITH CONTACTS ────────────────────────────────────────
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('contactCount');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const contacts = await Contact.find({ user: req.params.id }).sort('-createdAt').limit(10);
    res.json({ success: true, user, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── TOGGLE USER ACTIVE STATUS ─────────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify admin accounts.' });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DELETE USER (and their contacts) ─────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin accounts.' });
    }

    // Delete all their contacts too
    await Contact.deleteMany({ user: req.params.id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and all their contacts deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, getUserDetails, toggleUserStatus, deleteUser };
