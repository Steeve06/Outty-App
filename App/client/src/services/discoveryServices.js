// eslint-disable-next-line @typescript-eslint/no-require-imports
const { db } = require('../firebase');
import { collection, query, where, limit, getDocs, setDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

// Returns the interaction doc for this exact direction (fromUid -> toUid), if one exists.
//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function matchUsers(fromUid, toUid) {
    const interactionRef = doc(db, 'interactions', `${fromUid}_${toUid}`);
    const interactionSnap = await getDoc(interactionRef);
    return interactionSnap.exists() ? interactionSnap.data() : null;
}

function buildPairKey(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// Gets all users the current user has already liked, passed, or blocked.
async function fetchIdsOfInteractedWithUsers(currentUserUid) {
    try {
        const interactionsRef = collection(db, 'interactions');
        const q = query(interactionsRef, where('fromUid', '==', currentUserUid));

        const snapshot = await getDocs(q);

        const interactedUids = snapshot.docs.map(doc => doc.data().toUid);

        return interactedUids;
    }
    catch (error) {
        throw error;
    }
}

// Removes profiles the user has already interacted with so they do not reappear in Discover.
async function removeAlreadyInteractedProfiles(currentUserUid, profiles) {
    try {
        const interactedUids = await fetchIdsOfInteractedWithUsers(currentUserUid);
        const interactedSet = new Set(interactedUids);

        const filteredProfiles = profiles.filter(
            profile => profile.uid && !interactedSet.has(profile.uid)
        );

        return filteredProfiles;
    }
    catch (error) {
        console.error('Error filtering interacted profiles:', error.message);
        throw error;
    }
}

// Loads the first batch of candidate profiles, excluding the current user and prior interactions.
export async function loadInitialQueue(currentUserUid) {
    try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, limit(20));

        const snapshot = await getDocs(q);

        const profiles = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(profile => profile.uid !== currentUserUid);

        const cleanedProfiles = await removeAlreadyInteractedProfiles(currentUserUid, profiles);

        return cleanedProfiles;
    }
    catch (error) {
        console.error('Error message:', error.message);
        throw error;
    }
}

// Saves the current user's swipe action, then checks for a mutual like if needed.
export async function saveInteraction(currentUserUid, targetMatchUid, typeOfInteraction) {
    try {
        const interactionDocId = `${currentUserUid}_${targetMatchUid}`;
        const interactionRef = doc(db, 'interactions', interactionDocId);

        await setDoc(interactionRef, {
            fromUid: currentUserUid,
            toUid: targetMatchUid,
            type: typeOfInteraction,
            createdAt: serverTimestamp(),
        });

        if (typeOfInteraction !== 'like') {
            return { matched: false };
        }

        return await checkMatch(currentUserUid, targetMatchUid);
    } catch (error) {
        console.error('Error saving interaction:', error.message);
        throw error;
    }
}

// Checks whether the other user already liked back, and creates match + conversation docs if so.
export async function checkMatch(currentUserUid, targetMatchUid) {
    try {

        console.log('hit match function');

        const reverseInteractionRef = doc(
            db,
            'interactions',
            `${targetMatchUid}_${currentUserUid}`
        );

        const reverseSnap = await getDoc(reverseInteractionRef);

        if (!reverseSnap.exists()) {
            return { matched: false };
        }

        const reverseData = reverseSnap.data();

        if (reverseData.type !== 'like') {
            return { matched: false };
        }

        const pairKey = buildPairKey(currentUserUid, targetMatchUid);

        const matchRef = doc(db, 'matches', pairKey);
        const conversationRef = doc(db, 'conversations', pairKey);

        await setDoc(matchRef, {
            participants: [currentUserUid, targetMatchUid],
            pairKey,
            status: 'matched',
            matchedAt: serverTimestamp(),
            conversationId: pairKey,
        });

        await setDoc(conversationRef, {
            participants: [currentUserUid, targetMatchUid],
            pairKey,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessageText: '',
            lastMessageAt: null,
            lastMessageSenderUid: null,
        });

        console.log('successful match');

        return {
            matched: true,
            matchId: pairKey,
            conversationId: pairKey,
        };
    } catch (error) {
        console.error('Error checking match:', error.message);
        throw error;
    }
}

module.exports = { loadInitialQueue, matchUsers, saveInteraction };