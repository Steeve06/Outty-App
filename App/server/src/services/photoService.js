const { db, bucket, admin } = require('./firebase'); // uses your existing firebase config
// Save photo URL to user profile
const savePhoto = async (uid, photoUrl) => {
  const userRef = db.collection('profiles').doc(uid);
  await userRef.update ( 
    {
      photos: admin.firestore.FieldValue.arrayUnion(photoUrl)
    }
  )

  return { message: 'Photos saved successfully', photos: photoUrl };
};

// Get photo from profile
const getPhoto = async (uid) => {
  const userRef = db.collection('profiles').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  return doc.data().photos;
};

const uploadPhoto = async (uid, fileBuffer, mimeType) => {
  const fileName = `photos/${uid}/${Date.now()}`;
  const file = bucket.file(fileName);

  await file.save(fileBuffer, {
      metadata: { contentType: mimeType }
  });

  await file.makePublic();

  const photoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
  // Save URL to profile
  await savePhoto(uid, photoUrl);
  
  return photoUrl;
};

const deletePhoto = async (uid, photoUrl) => {
  const userRef = db.collection('profiles').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }
  await userRef.update({
    photos: admin.firestore.FieldValue.arrayRemove(photoUrl)
  }) ;
  return {message: 'photo deleted successfully'};
}

module.exports = { savePhoto, getPhoto, uploadPhoto, deletePhoto };