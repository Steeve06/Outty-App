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
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// @ts-expect-error - firebase module lacks type declarations
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RootStackParamList } from '../../../../types';

GoogleSignin.configure({
  webClientId: '349245259412-14cvrtnqbk2nb0fnivqp6qm64l45e4l9.apps.googleusercontent.com',
});

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GREEN = '#2D9B6F';

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48" style={{ marginRight: 10 }}>
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(v: string): string {
    if (!v.trim()) return 'Fill out this field';
    if (!EMAIL_REGEX.test(v.trim())) return 'Enter an email address';
    return '';
  }

  function validatePassword(v: string): string {
    if (!v) return 'Fill out this field';
    return '';
  }

  function handleEmailChange(v: string) {
    setEmail(v);
    if (emailError) setEmailError(validateEmail(v));
  }

  function handlePasswordChange(v: string) {
    setPassword(v);
    if (passwordError) setPasswordError(validatePassword(v));
  }

  async function handleLogin() {
  const eErr = validateEmail(email);
  const pErr = validatePassword(password);
  setEmailError(eErr);
  setPasswordError(pErr);
  setLoginError('');
  if (eErr || pErr) return;

  setLoading(true);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    const user = userCredential.user;

    const userRef = doc(db, 'profiles', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName?.trim() || '',
        email: user.email?.trim().toLowerCase() || email.trim().toLowerCase(),
        provider: 'email',
        role: 'user',
      });
    }

    // navigation to main app is handled by AuthFlow (onAuthStateChanged),
    // so you don't need navigation.reset here.
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    ) {
      setLoginError('Incorrect email or password.');
    } else if (code === 'auth/too-many-requests') {
      setLoginError('Too many attempts. Please try again later.');
    } else {
      setLoginError('Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
  }
}

  async function handleGooglePress() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        Alert.alert('Error', 'Google Sign-In failed.');
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch {
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    }
  }

  function handleSignupPress() {
    navigation.navigate('Signup');
  }

  return (
    <KeyboardAvoidingView
      style={styles.bg}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏔</Text>
          </View>
          <Text style={styles.title}>Welcome to Outty</Text>
          <Text style={styles.subtitle}>Find your perfect adventure partner</Text>

          <Text style={styles.label}>Email</Text>
          {!!emailError && <Tooltip text={emailError} />}
          <TextInput
            style={emailError ? [styles.input, styles.inputError] : styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          {!!passwordError && <Tooltip text={passwordError} />}
          <TextInput
            style={passwordError ? [styles.input, styles.inputError] : styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />

          {!!loginError && <Text style={styles.loginError}>{loginError}</Text>}

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Log In</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialBtn} onPress={handleGooglePress} activeOpacity={0.85}>
            <GoogleIcon />
            <Text style={styles.socialBtnText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignupPress}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <View style={tooltip.wrap}>
      <Text style={tooltip.text}>{text}</Text>
      <View style={tooltip.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#e8f5f0' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 28 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#f5f5f5',
  },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#fff8f8' },
  loginError: { color: '#e74c3c', fontSize: 13, marginBottom: 8, alignSelf: 'flex-start' },
  loginBtn: {
    width: '100%',
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { color: '#aaa', fontSize: 13, marginHorizontal: 10 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  socialBtnText: { fontSize: 15, color: '#333' },
  signupRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  signupText: { color: '#666', fontSize: 14 },
  signupLink: { color: GREEN, fontWeight: '700', fontSize: 14 },
});

const tooltip = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 4,
  },
  text: { color: '#fff', fontSize: 12 },
  arrow: {
    position: 'absolute',
    bottom: -6,
    left: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
});