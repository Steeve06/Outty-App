import { db } from '../../../firebase.js';

/**
 * Creates and stores unique user profile data.
 */
async function createProfile(uid, profileData) {
  const docRef = db.collection('profiles').doc(uid);
  const doc = await docRef.get();
  if (doc.exists) {
    throw new Error('Profile already exists');
  }
  await docRef.set(profileData);
  return 'profile created';
}

/**
 * Retrieves user profile data.
 */
async function getProfile(uid) {
  const docRef = db.collection('profiles').doc(uid);
  const doc = await docRef.get();
  if (doc.exists) {
    return doc.data();
  }
  throw new Error('Profile not found');
}

/**
 * Updates user profile data.
 */
async function updateProfile(uid, updatedData) {
  const docRef = db.collection('profiles').doc(uid);
  const doc = await docRef.get();
  if (doc.exists) {
    await docRef.update(updatedData);
    return 'Profile successfully updated';
  }
  throw new Error('Profile not found');
}

/**
 * Deletes user profile data.
 */
async function deleteProfile(uid) {
  const docRef = db.collection('profiles').doc(uid);
  const doc = await docRef.get();
  if (doc.exists) {
    await docRef.delete();
    return 'Profile successfully deleted';
  }
  throw new Error('Profile not found');
}

export {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
};
