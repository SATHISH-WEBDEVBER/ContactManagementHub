const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Standard User Auth ────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Token invalid.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// ─── Admin Only ────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    // Generic error - don't reveal admin route exists
    return res.status(404).json({ success: false, message: 'Route not found.' });
  }
  next();
};

// ─── Admin Secret Header Check ─────────────────────────────────────────────
// Extra layer: admin routes require a special header in addition to JWT + role
const adminSecret = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(404).json({ success: false, message: 'Route not found.' });
  }
  next();
};

module.exports = { protect, adminOnly, adminSecret };
