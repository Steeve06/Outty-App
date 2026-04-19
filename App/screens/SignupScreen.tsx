import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, DocumentData } from 'firebase/firestore';

import { auth, db } from '../firebase';
import { RootStackParamList } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const ADVENTURE_TYPES = [
    'Hiking', 'Kayaking', 'Rock Climbing', 'Skiing',
    'Backpacking', 'Camping', 'Cycling', 'Surfing',
    'Mountaineering', 'Travel',
];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const ATTITUDES    = ['Relaxed', 'Moderate', 'Intense', 'Extreme'];
const TOTAL_STEPS  = 4;
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen({ navigation }: Props) {
    const [step, setStep]       = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1 fields
    const [name, setName]         = useState('');
    const [age, setAge]           = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio]           = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');

    // Step 1 errors
    const [nameErr, setNameErr]         = useState('');
    const [ageErr, setAgeErr]           = useState('');
    const [locationErr, setLocationErr] = useState('');
    const [emailErr, setEmailErr]       = useState('');
    const [passwordErr, setPasswordErr] = useState('');

    // Step 2
    const [adventures, setAdventures] = useState<string[]>([]);

    // Step 3
    const [skillLevel, setSkillLevel]   = useState('');
    const [attitude, setAttitude]       = useState('');
    const [maxDistance, setMaxDistance] = useState(50);

    // Step 4
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook]   = useState('');
    const [twitter, setTwitter]     = useState('');

    function validateStep1(): boolean {
        let valid = true;

        if (!name.trim()) { setNameErr('Required'); valid = false; } else setNameErr('');
        if (!age.trim()) { setAgeErr('Required'); valid = false; }
        else if (isNaN(Number(age)) || Number(age) < 18) { setAgeErr('Must be 18+'); valid = false; }
        else setAgeErr('');
        if (!location.trim()) { setLocationErr('Required'); valid = false; } else setLocationErr('');
        if (!email.trim()) { setEmailErr('Required'); valid = false; }
        else if (!EMAIL_REGEX.test(email)) { setEmailErr('Enter a valid email'); valid = false; }
        else setEmailErr('');
        if (!password) { setPasswordErr('Required'); valid = false; }
        else if (password.length < 6) { setPasswordErr('At least 6 characters'); valid = false; }
        else setPasswordErr('');

        return valid;
    }

    function handleNext() {
        if (step === 1 && !validateStep1()) return;
        if (step === 3 && (!skillLevel || !attitude)) {
            alert('Please select a skill level and adventure attitude.');
            return;
        }
        setStep(step + 1);
    }

    function handleBack() {
        setStep(step - 1);
    }

    function toggleAdventure(item: string) {
        if (adventures.includes(item)) {
            setAdventures(adventures.filter(function(a) { return a !== item; }));
        } else {
            setAdventures([...adventures, item]);
        }
    }

    function decreaseDistance() {
        setMaxDistance(Math.max(5, maxDistance - 5));
    }

    function increaseDistance() {
        setMaxDistance(Math.min(200, maxDistance + 5));
    }

    async function handleComplete() {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name.trim() });

            const userData: DocumentData = {
                uid:         user.uid,
                email:       email.trim(),
                name:        name.trim(),
                age:         Number(age),
                location:    location.trim(),
                bio:         bio.trim(),
                adventures:  adventures,
                skillLevel:  skillLevel,
                attitude:    attitude,
                maxDistance: maxDistance,
                social: {
                    instagram: instagram.trim(),
                    facebook:  facebook.trim(),
                    twitter:   twitter.trim(),
                },
                role:      'user',
                provider:  'email',
                createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            alert('Account created! You can now log in.');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? '';
            if (code === 'auth/email-already-in-use') {
                alert('An account with this email already exists.');
            } else if (code === 'auth/weak-password') {
                alert('Password is too weak. Use at least 6 characters.');
            } else {
                alert('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    const progressPercent = (step / TOTAL_STEPS) * 100;

    return (
        <KeyboardAvoidingView style={styles.bg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.topBar}>
                <View style={styles.miniLogoCircle}>
                    <Text style={styles.miniLogoEmoji}>🏔</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: (progressPercent + '%') as any }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>

                    {/* ── Step 1 ── */}
                    {step === 1 && (
                        <>
                            <Text style={styles.stepTitle}>Basic Information</Text>
                            <Text style={styles.stepSubtitle}>Step 1 of 4</Text>

                            <Text style={styles.label}>Name</Text>
                            {!!nameErr && <Text style={styles.fieldError}>{nameErr}</Text>}
                            <TextInput
                                style={nameErr ? [styles.input, styles.inputError] : styles.input}
                                placeholder="Your name" placeholderTextColor="#aaa"
                                value={name} onChangeText={setName}
                            />

                            <Text style={styles.label}>Age</Text>
                            {!!ageErr && <Text style={styles.fieldError}>{ageErr}</Text>}
                            <TextInput
                                style={ageErr ? [styles.input, styles.inputError] : styles.input}
                                placeholder="Your age" placeholderTextColor="#aaa"
                                value={age} onChangeText={setAge} keyboardType="number-pad"
                            />

                            <Text style={styles.label}>Location</Text>
                            {!!locationErr && <Text style={styles.fieldError}>{locationErr}</Text>}
                            <TextInput
                                style={locationErr ? [styles.input, styles.inputError] : styles.input}
                                placeholder="City, State" placeholderTextColor="#aaa"
                                value={location} onChangeText={setLocation}
                            />

                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                placeholder="Tell us about yourself and what kind of adventures you're looking for..."
                                placeholderTextColor="#aaa" value={bio} onChangeText={setBio}
                                multiline numberOfLines={4}
                            />

                            <Text style={styles.label}>Email</Text>
                            {!!emailErr && <Text style={styles.fieldError}>{emailErr}</Text>}
                            <TextInput
                                style={emailErr ? [styles.input, styles.inputError] : styles.input}
                                placeholder="you@example.com" placeholderTextColor="#aaa"
                                value={email} onChangeText={setEmail}
                                autoCapitalize="none" keyboardType="email-address" autoComplete="email"
                            />

                            <Text style={styles.label}>Password</Text>
                            {!!passwordErr && <Text style={styles.fieldError}>{passwordErr}</Text>}
                            <TextInput
                                style={passwordErr ? [styles.input, styles.inputError] : styles.input}
                                placeholder="••••••••" placeholderTextColor="#aaa"
                                value={password} onChangeText={setPassword} secureTextEntry
                            />
                        </>
                    )}

                    {/* ── Step 2 ── */}
                    {step === 2 && (
                        <>
                            <Text style={styles.stepTitle}>Your Adventures</Text>
                            <Text style={styles.stepSubtitle}>Step 2 of 4</Text>
                            <Text style={styles.pickerLabel}>Select your adventure types</Text>
                            <View style={styles.chipWrap}>
                                {ADVENTURE_TYPES.map(function(item) {
                                    const selected = adventures.includes(item);
                                    return (
                                        <TouchableOpacity
                                            key={item}
                                            style={selected ? [styles.chip, styles.chipSelected] : styles.chip}
                                            onPress={function() { toggleAdventure(item); }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={selected ? [styles.chipText, styles.chipTextSelected] : styles.chipText}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* ── Step 3 ── */}
                    {step === 3 && (
                        <>
                            <Text style={styles.stepTitle}>Experience & Preferences</Text>
                            <Text style={styles.stepSubtitle}>Step 3 of 4</Text>

                            <Text style={styles.pickerLabel}>Skill Level</Text>
                            <View style={styles.grid2}>
                                {SKILL_LEVELS.map(function(lvl) {
                                    return (
                                        <TouchableOpacity
                                            key={lvl}
                                            style={skillLevel === lvl ? [styles.gridBtn, styles.gridBtnSelected] : styles.gridBtn}
                                            onPress={function() { setSkillLevel(lvl); }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={skillLevel === lvl ? [styles.gridBtnText, styles.gridBtnTextSelected] : styles.gridBtnText}>
                                                {lvl}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={[styles.pickerLabel, { marginTop: 16 }]}>Adventure Attitude</Text>
                            <View style={styles.grid2}>
                                {ATTITUDES.map(function(att) {
                                    return (
                                        <TouchableOpacity
                                            key={att}
                                            style={attitude === att ? [styles.gridBtn, styles.gridBtnSelected] : styles.gridBtn}
                                            onPress={function() { setAttitude(att); }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={attitude === att ? [styles.gridBtnText, styles.gridBtnTextSelected] : styles.gridBtnText}>
                                                {att}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={[styles.pickerLabel, { marginTop: 16 }]}>
                                Maximum Distance (miles): {maxDistance}
                            </Text>
                            <View style={styles.sliderRow}>
                                <TouchableOpacity style={styles.sliderBtn} onPress={decreaseDistance}>
                                    <Text style={styles.sliderBtnText}>−</Text>
                                </TouchableOpacity>
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: ((maxDistance / 200) * 100 + '%') as any }]} />
                                </View>
                                <TouchableOpacity style={styles.sliderBtn} onPress={increaseDistance}>
                                    <Text style={styles.sliderBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* ── Step 4 ── */}
                    {step === 4 && (
                        <>
                            <Text style={styles.stepTitle}>Connect Social Media</Text>
                            <Text style={styles.stepSubtitle}>Step 4 of 4</Text>
                            <Text style={styles.optionalNote}>
                                Connect your social media accounts to enrich your profile (optional)
                            </Text>
                            <Text style={styles.socialLabel}>📷  Instagram</Text>
                            <TextInput
                                style={styles.input} placeholder="@username" placeholderTextColor="#aaa"
                                value={instagram} onChangeText={setInstagram} autoCapitalize="none"
                            />
                            <Text style={styles.socialLabel}>  Facebook</Text>
                            <TextInput
                                style={styles.input} placeholder="facebook.com/username" placeholderTextColor="#aaa"
                                value={facebook} onChangeText={setFacebook} autoCapitalize="none"
                            />
                            <Text style={styles.socialLabel}>🐦  Twitter</Text>
                            <TextInput
                                style={styles.input} placeholder="@username" placeholderTextColor="#aaa"
                                value={twitter} onChangeText={setTwitter} autoCapitalize="none"
                            />
                        </>
                    )}

                    {/* ── Buttons ── */}
                    <View style={styles.btnRow}>
                        {step > 1 && (
                            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
                                <Text style={styles.backBtnText}>Back</Text>
                            </TouchableOpacity>
                        )}
                        {step < TOTAL_STEPS ? (
                            <TouchableOpacity
                                style={step === 1 ? [styles.nextBtn, styles.nextBtnFull] : styles.nextBtn}
                                onPress={handleNext}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.nextBtnText}>Next</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.nextBtn} onPress={handleComplete} activeOpacity={0.85} disabled={loading}>
                                {loading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.nextBtnText}>Complete</Text>
                                }
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const GREEN = '#2D9B6F';

const styles = StyleSheet.create({
    bg:             { flex: 1, backgroundColor: '#e8f5f0' },
    topBar:         { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center' },
    miniLogoCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    miniLogoEmoji:  { fontSize: 22 },
    progressTrack:  { width: '100%', height: 6, backgroundColor: '#d0e8dc', borderRadius: 4, overflow: 'hidden' },
    progressFill:   { height: '100%', backgroundColor: '#1a1a1a', borderRadius: 4 },
    scroll:         { flexGrow: 1, alignItems: 'center', padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 480,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 5,
    },
    stepTitle:          { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
    stepSubtitle:       { fontSize: 13, color: '#888', marginBottom: 20 },
    label:              { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 8 },
    fieldError:         { color: '#e74c3c', fontSize: 12, marginBottom: 2 },
    input: {
        width: '100%', borderRadius: 10, backgroundColor: '#f5f5f5',
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
        color: '#333', marginBottom: 10, borderWidth: 1.5, borderColor: '#f5f5f5',
    },
    bioInput:           { height: 90, textAlignVertical: 'top' },
    inputError:         { borderColor: '#e74c3c', backgroundColor: '#fff8f8' },
    pickerLabel:        { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
    chipWrap:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    chip:               { borderWidth: 1.5, borderColor: '#ccc', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
    chipSelected:       { backgroundColor: GREEN, borderColor: GREEN },
    chipText:           { fontSize: 14, color: '#333' },
    chipTextSelected:   { color: '#fff', fontWeight: '600' },
    grid2:              { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
    gridBtn:            { flex: 1, minWidth: '45%', borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    gridBtnSelected:    { backgroundColor: GREEN, borderColor: GREEN },
    gridBtnText:        { fontSize: 14, color: '#333' },
    gridBtnTextSelected:{ color: '#fff', fontWeight: '700' },
    sliderRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
    sliderBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    sliderBtnText:      { fontSize: 20, fontWeight: '700', color: '#333' },
    sliderTrack:        { flex: 1, height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden' },
    sliderFill:         { height: '100%', backgroundColor: '#1a1a1a', borderRadius: 4 },
    optionalNote:       { fontSize: 13, color: '#888', marginBottom: 16 },
    socialLabel:        { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 4 },
    btnRow:             { flexDirection: 'row', gap: 10, marginTop: 24 },
    backBtn:            { flex: 1, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
    backBtnText:        { fontSize: 15, color: '#333', fontWeight: '600' },
    nextBtn:            { flex: 2, backgroundColor: GREEN, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
    nextBtnFull:        { flex: 1 },
    nextBtnText:        { fontSize: 15, color: '#fff', fontWeight: '700' },
});