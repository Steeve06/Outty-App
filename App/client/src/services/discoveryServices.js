const { db } = require('../firebase');
import { collection, query, where, limit, getDocs, setDoc, serverTimestamp, doc } from 'firebase/firestore';

async function matchUsers(fromUid, toUid) {
    const docRef = db.collection('interactions').doc(`${fromUid}_${toUid}`);
    const doc = await docRef.get();
}

// (0) Get all target UIDs the current user has already interacted with
async function fetchIdsOfInteractedWithUsers(currentUserUid) {
    try {
        const interactionsRef = collection(db, 'interactions');
        const q = query(interactionsRef, where('fromUid', '==', currentUserUid));

        const snapshot = await getDocs(q);

        const interactedUids = snapshot.docs.map(doc => doc.data().toUid);

        console.log('Already interacted with UIDs:', interactedUids);
        return interactedUids;
    } catch (error) {
        console.error('Error fetching interacted user IDs:', error.message);
        throw error;
    }
}

// (0.5) Remove profiles already interacted with from the in-memory queue
async function removeAlreadyInteractedProfiles(currentUserUid, profiles) {
    try {
        const interactedUids = await fetchIdsOfInteractedWithUsers(currentUserUid);
        const interactedSet = new Set(interactedUids);

        const filteredProfiles = profiles.filter(
            profile => profile.uid && !interactedSet.has(profile.uid)
        );

        console.log('Profiles after removing interacted users:', filteredProfiles.length);
        return filteredProfiles;
    } catch (error) {
        console.error('Error filtering interacted profiles:', error.message);
        throw error;
    }
}

// (1) Fetch a batch of candidate user profiles from Firestore, excluding the current user
export async function loadInitialQueue(currentUserUid) {
    try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, limit(20));

        const snapshot = await getDocs(q);
        console.log('Raw snapshot size:', snapshot.size);

        const profiles = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(profile => profile.uid !== currentUserUid);

        const cleanedProfiles = await removeAlreadyInteractedProfiles(currentUserUid, profiles);

        console.log('Filtered profiles:', cleanedProfiles.length);
        return cleanedProfiles;
    } catch (error) {
        console.error('Error message:', error.message);
        throw error;
    }
}

async function saveInteraction(currentUserUid, targetMatchUid, typeOfInteraction) {
    console.log('Current user ID = ' + currentUserUid);
    console.log('Target user ID = ' + targetMatchUid);
    console.log('Interaction = ' + typeOfInteraction);

    try {
        const interactionDocId = `${currentUserUid}_${targetMatchUid}`;

        const interactionRef = doc(db, 'interactions', interactionDocId);

        await setDoc(interactionRef, {
            fromUid: currentUserUid,
            toUid: targetMatchUid,
            type: typeOfInteraction, // 'like' | 'pass' | 'block'
            createdAt: serverTimestamp(),
        });

        return interactionDocId;
    } catch (error) {
        console.error('Error saving interaction:', error.message);
        throw error;
    }
}

module.exports = { loadInitialQueue, matchUsers, saveInteraction };