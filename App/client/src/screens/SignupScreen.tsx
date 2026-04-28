import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// @ts-expect-error - firebase module lacks type declarations
import { auth, db } from '../firebase';
import { RootStackParamList } from '../../../../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const GREEN = '#2D9B6F';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen({ navigation }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [signupError, setSignupError] = useState('');
    const [loading, setLoading] = useState(false);

    function validateName(v: string): string {
        if (!v.trim()) return 'Enter a username';
        return '';
    }

    function validateEmail(v: string): string {
        if (!v.trim()) return 'Enter an email';
        if (!EMAIL_REGEX.test(v.trim())) return 'Enter a valid email';
        return '';
    }

    function validatePassword(v: string): string {
        if (!v) return 'Enter a password';
        if (v.length < 6) return 'Password must be at least 6 characters';
        return '';
    }

    async function handleSignupPress() {
        const nErr = validateName(name);
        const eErr = validateEmail(email);
        const pErr = validatePassword(password);

        setNameError(nErr);
        setEmailError(eErr);
        setPasswordError(pErr);
        setSignupError('');

        if (nErr || eErr || pErr) return;

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password
            );

            const uid = userCredential.user.uid;

            await updateProfile(userCredential.user, {
                displayName: name.trim(),
            });


            await setDoc(doc(db, 'profiles', uid), {
                uid,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                provider: 'email',
                role: 'user',
            });

            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? '';

            if (code === 'auth/email-already-in-use') {
                setSignupError('That email is already in use.');
            } else if (code === 'auth/invalid-email') {
                setSignupError('That email address is invalid.');
            } else if (code === 'auth/weak-password') {
                setSignupError('Password should be at least 6 characters.');
            } else {
                setSignupError('Could not create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.bg}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.title}>Create Account</Text>

                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={nameError ? [styles.input, styles.inputError] : styles.input}
                        placeholder="John Doe"
                        value={name}
                        onChangeText={(v) => {
                            setName(v);
                            if (nameError) setNameError(validateName(v));
                        }}
                        autoCapitalize="words"
                    />
                    {!!nameError && <Text style={styles.fieldError}>{nameError}</Text>}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={emailError ? [styles.input, styles.inputError] : styles.input}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={(v) => {
                            setEmail(v);
                            if (emailError) setEmailError(validateEmail(v));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                    {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={passwordError ? [styles.input, styles.inputError] : styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(v) => {
                            setPassword(v);
                            if (passwordError) setPasswordError(validatePassword(v));
                        }}
                        secureTextEntry
                    />
                    {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}

                    {!!signupError && <Text style={styles.signupError}>{signupError}</Text>}

                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleSignupPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryBtnText}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? Log in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: '#e8f5f0' },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 25, elevation: 5 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 10 },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: '#f5f5f5',
    },
    inputError: {
        borderColor: '#e74c3c',
        backgroundColor: '#fff8f8',
    },
    fieldError: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 2,
    },
    signupError: {
        color: '#e74c3c',
        fontSize: 13,
        marginTop: 12,
        marginBottom: 8,
    },
    primaryBtn: {
        backgroundColor: GREEN,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 25,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 15,
    },
});