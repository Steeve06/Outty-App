
const { admin, db } = require('./firebase');

async function registerUser(email, password, role = 'user') {
  // Create user in Firebase Auth
  const userRecord = await admin.auth().createUser({ email, password });

  // Save role in Firestore
  await db.collection('users').doc(userRecord.uid).set({
    email,
    role, // 'admin' or 'user'
  });

  return userRecord;
}

module.exports = { registerUser };