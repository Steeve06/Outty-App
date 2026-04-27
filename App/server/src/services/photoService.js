const db = require('./firebase'); // uses your existing firebase config

// Save photo URL to user profile
const savePhoto = async (uid, photoUrl) => {
  const userRef = db.collection('users').doc(uid);

  await userRef.set(
    {
      photo: photoUrl,
    },
    { merge: true }
  );

  return { message: 'Photo saved successfully', photo: photoUrl };
};

// Get photo from profile
const getPhoto = async (uid) => {
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  return doc.data().photo;
};

module.exports = { savePhoto, getPhoto };