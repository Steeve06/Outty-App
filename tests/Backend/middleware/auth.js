
const { admin, db } = require('../firebase');

// Verifies the Firebase ID token from the request header
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Checks if the user has the required role
function requireRole(role) {
  return async (req, res, next) => {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };