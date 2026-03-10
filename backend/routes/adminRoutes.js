const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, getUserDetails,
  toggleUserStatus, deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly, adminSecret } = require('../middleware/auth');

// 🔒 TRIPLE SECURITY LAYER for ALL admin routes:
// 1. Valid JWT token (protect)
// 2. Role must be 'admin' (adminOnly)
// 3. Must include X-Admin-Secret header (adminSecret)
router.use(protect, adminOnly, adminSecret);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
