const { db } = require('./firebase');

//async funcion to create and store unique user profile data
async function createProfile (uid, profileData){
    //creates a reference to the specific user document in the profiles collection
    const docRef = db.collection('profiles').doc(uid);
    const doc = await docRef.get();
    if(doc.exists){
        throw new Error ('Profile already exists')
    }
    await docRef.set(profileData);
    return ('profile created');
};

//async function to get user profile data
async function getProfile (uid) {
    //creates a reference to the specific user document in the profiles collection
    const docRef = db.collection('profiles').doc(uid);
    const doc = await docRef.get();
    if(doc.exists) {
        return doc.data();
    } else {
        throw new Error ('Profile not found');
    }
};

//async function to update user profile data
async function updateProfile (uid, updatedData) {
    //creates a reference to the specific user document in the profiles collection
    const docRef = db.collection('profiles').doc(uid);
    const doc = await docRef.get();
    if(doc.exists) {
        const update = await docRef.update(updatedData);
        return ('Profile successfully updated ')
    } else {
        throw new Error ('Profile not found')
    }
}

//async function to delete user profile data
async function deleteProfile (uid) {
    //creates a reference to the specific user document in the profiles collection
    const docRef = db.collection('profiles').doc(uid);
    const doc = await docRef.get();
    if(doc.exists) {
        await docRef.delete()
        return ('Profile successfully deleted ')
    } else {
        throw new Error ('Profile not found')
    }
}

module.exports = { createProfile, getProfile, updateProfile, deleteProfile };
