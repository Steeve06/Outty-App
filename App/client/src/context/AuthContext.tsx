import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// @ts-expect-error - firebase module lacks type declarations
import { auth, db } from '../firebase';

export type AppUserProfile = {
    uid: string;
    name: string;
    email: string;
    provider: string;
    role: string;
    bio: string;
    location: string;
    interests: [],
    skillLevel: '',
    attitude: string,
    photos: []
};

type AuthContextValue = {
    firebaseUser: User | null;
    userProfile: AppUserProfile | null;
    initializing: boolean;
    refreshUserProfile: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureUserDocument(user: User): Promise<AppUserProfile> {
    const userRef = doc(db, 'profiles', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        const newProfile: AppUserProfile = {
            uid: user.uid,
            name: user.displayName?.trim() || '',
            email: user.email?.trim().toLowerCase() || '',
            provider: user.providerData?.[0]?.providerId === 'password' ? 'email' : (user.providerData?.[0]?.providerId || 'unknown'),
            role: 'user',
            bio: '',
            location: '',
            interests: [],
            skillLevel: '',
            attitude: '',
            photos: []
        };

        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${user.uid}`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(newProfile)
        });
        return newProfile;
    }

    const data = snap.data() as Partial<AppUserProfile>;
    const mergedProfile: AppUserProfile = {
        uid: data.uid || user.uid,
        name: data.name || user.displayName?.trim() || '',
        email: (data.email || user.email || '').trim().toLowerCase(),
        provider:
            data.provider ||
            (user.providerData?.[0]?.providerId === 'password'
                ? 'email'
                : user.providerData?.[0]?.providerId || 'unknown'),
        role: data.role || 'user',
        bio: '',
        location: '',
        interests: [],
        skillLevel: '',
        attitude: '',
        photos: []
    };

    if (
        mergedProfile.uid !== data.uid ||
        mergedProfile.name !== data.name ||
        mergedProfile.email !== data.email ||
        mergedProfile.provider !== data.provider ||
        mergedProfile.role !== data.role
    ) {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${user.uid}`, {
            method: 'PATCH',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(mergedProfile)
        });
    }

    return mergedProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
    const [initializing, setInitializing] = useState(true);

    async function refreshUserProfile() {
        if (!auth.currentUser) {
            setUserProfile(null);
            return;
        }

        const profile = await ensureUserDocument(auth.currentUser);
        setUserProfile(profile);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);

            if (!user) {
                setUserProfile(null);
                setInitializing(false);
                return;
            }

            try {
                const profile = await ensureUserDocument(user);
                setUserProfile(profile);
            } finally {
                setInitializing(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = useMemo(
        () => ({
            firebaseUser,
            userProfile,
            initializing,
            refreshUserProfile,
            logout: () => signOut(auth),
        }),
        [firebaseUser, userProfile, initializing]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}