
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

// Any logged-in user can access this
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}` });
});

// Only admins can access this
router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin panel' });
});

// Backend/routes/index.js (add this route)
router.get('/me', verifyToken, async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  const userData = userDoc.data();
  res.json({ role: userData?.role });
});

module.exports = router;