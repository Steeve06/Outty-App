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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory user store for Sprint 1 (no database)
export const localUsers: { email: string; password: string }[] = [];

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError]     = useState('');

  const validateEmail = (v: string) => {
    if (!v.trim())                   return 'Fill out this field';
    if (!EMAIL_REGEX.test(v.trim())) return 'Enter an email address';
    return '';
  };

  const validatePassword = (v: string) => {
    if (!v) return 'Fill out this field';
    return '';
  };

  const handleLogin = () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setLoginError('');
    if (eErr || pErr) return;

    const found = localUsers.find(
      (u) => u.email === email.trim() && u.password === password
    );
    if (!found) {
      setLoginError('Incorrect email or password.');
      return;
    }
    navigation.navigate('MainTabs');
  };

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

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          {!!emailError && <Tooltip text={emailError} />}
          <TextInput
            style={[styles.input, !!emailError && styles.inputError]}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError(validateEmail(v));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          {!!passwordError && <Tooltip text={passwordError} />}
          <TextInput
            style={[styles.input, !!passwordError && styles.inputError]}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (passwordError) setPasswordError(validatePassword(v));
            }}
            secureTextEntry
          />

          {!!loginError && <Text style={styles.loginError}>{loginError}</Text>}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.socialBtnText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
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

const GREEN = '#2D9B6F';

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
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: GREEN, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  logoEmoji: { fontSize: 28 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: {
    alignSelf: 'flex-start', fontSize: 14,
    fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 4,
  },
  input: {
    width: '100%', borderRadius: 10, backgroundColor: '#f5f5f5',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#333', marginBottom: 14, borderWidth: 1.5, borderColor: '#f5f5f5',
  },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#fff8f8' },
  loginError: { color: '#e74c3c', fontSize: 13, marginBottom: 8, alignSelf: 'flex-start' },
  loginBtn: {
    width: '100%', backgroundColor: GREEN, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 18,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { color: '#aaa', fontSize: 13, marginHorizontal: 10 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16, marginBottom: 10, backgroundColor: '#fff',
  },
  googleG: { fontSize: 16, fontWeight: '900', color: '#4285F4', marginRight: 10, fontStyle: 'italic' },
  socialBtnText: { fontSize: 15, color: '#333' },
  signupRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  signupText: { color: '#666', fontSize: 14 },
  signupLink: { color: GREEN, fontWeight: '700', fontSize: 14 },
});

const tooltip = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start', backgroundColor: '#333',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 4,
  },
  text: { color: '#fff', fontSize: 12 },
  arrow: {
    position: 'absolute', bottom: -6, left: 12,
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#333',
  },
});
