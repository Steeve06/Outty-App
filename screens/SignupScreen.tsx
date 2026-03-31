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
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App/App';
import { localUsers } from './LoginScreen';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const ADVENTURE_TYPES = [
  'Hiking', 'Kayaking', 'Rock Climbing', 'Skiing',
  'Backpacking', 'Camping', 'Cycling', 'Surfing',
  'Mountaineering', 'Travel',
];

const SKILL_LEVELS   = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const ATTITUDES      = ['Relaxed', 'Moderate', 'Intense', 'Extreme'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_STEPS = 4;

// ── Step 1 data ──────────────────────────────────────────────────────────────
type Step1 = { name: string; age: string; location: string; bio: string; email: string; password: string };
// ── Step 2 data ──────────────────────────────────────────────────────────────
type Step2 = { adventures: string[] };
// ── Step 3 data ──────────────────────────────────────────────────────────────
type Step3 = { skillLevel: string; attitude: string; maxDistance: number };
// ── Step 4 data ──────────────────────────────────────────────────────────────
type Step4 = { instagram: string; facebook: string; twitter: string };

export default function SignupScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);

  // Step 1
  const [s1, setS1] = useState<Step1>({
    name: '', age: '', location: '', bio: '', email: '', password: '',
  });
  const [s1Errors, setS1Errors] = useState<Partial<Step1>>({});

  // Step 2
  const [s2, setS2] = useState<Step2>({ adventures: [] });

  // Step 3
  const [s3, setS3] = useState<Step3>({ skillLevel: '', attitude: '', maxDistance: 50 });

  // Step 4
  const [s4, setS4] = useState<Step4>({ instagram: '', facebook: '', twitter: '' });

  // ── Step 1 validation ────────────────────────────────────────────────────
  const validateS1 = () => {
    const errs: Partial<Step1> = {};
    if (!s1.name.trim())                    errs.name = 'Required';
    if (!s1.age.trim())                     errs.age = 'Required';
    else if (isNaN(Number(s1.age)) || Number(s1.age) < 18) errs.age = 'Must be 18+';
    if (!s1.location.trim())                errs.location = 'Required';
    if (!s1.email.trim())                   errs.email = 'Required';
    else if (!EMAIL_REGEX.test(s1.email))   errs.email = 'Enter a valid email';
    if (!s1.password)                       errs.password = 'Required';
    else if (s1.password.length < 6)       errs.password = 'At least 6 characters';
    setS1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── navigation ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 1 && !validateS1()) return;
    if (step === 3 && (!s3.skillLevel || !s3.attitude)) {
      alert('Please select a skill level and adventure attitude.');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleComplete = () => {
    // Save to in-memory store (Sprint 1 — no database)
    localUsers.push({ email: s1.email.trim(), password: s1.password });
    alert('Account created! You can now log in.');
    navigation.navigate('Login');
  };

  // ── progress bar ─────────────────────────────────────────────────────────
  const progress = step / TOTAL_STEPS;

  return (
    <KeyboardAvoidingView
      style={styles.bg}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top logo + progress */}
      <View style={styles.topBar}>
        <View style={styles.miniLogoCircle}>
          <Text style={styles.miniLogoEmoji}>🏔</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {step === 1 && (
            <Step1View s1={s1} setS1={setS1} errors={s1Errors} setErrors={setS1Errors} />
          )}
          {step === 2 && (
            <Step2View s2={s2} setS2={setS2} />
          )}
          {step === 3 && (
            <Step3View s3={s3} setS3={setS3} />
          )}
          {step === 4 && (
            <Step4View s4={s4} setS4={setS4} />
          )}

          {/* Buttons */}
          <View style={styles.btnRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : null}

            {step < TOTAL_STEPS ? (
              <TouchableOpacity
                style={[styles.nextBtn, step === 1 && styles.nextBtnFull]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextBtn} onPress={handleComplete} activeOpacity={0.85}>
                <Text style={styles.nextBtnText}>Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Step 1 ───────────────────────────────────────────────────────────────────
function Step1View({
  s1, setS1, errors, setErrors,
}: {
  s1: Step1;
  setS1: React.Dispatch<React.SetStateAction<Step1>>;
  errors: Partial<Step1>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Step1>>>;
}) {
  const update = (field: keyof Step1) => (v: string) => {
    setS1((prev) => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Step 1 of 4</Text>

      <Field label="Name" error={errors.name}>
        <TextInput style={[styles.input, !!errors.name && styles.inputError]}
          placeholder="Your name" placeholderTextColor="#aaa"
          value={s1.name} onChangeText={update('name')} />
      </Field>

      <Field label="Age" error={errors.age}>
        <TextInput style={[styles.input, !!errors.age && styles.inputError]}
          placeholder="Your age" placeholderTextColor="#aaa"
          value={s1.age} onChangeText={update('age')} keyboardType="number-pad" />
      </Field>

      <Field label="Location" error={errors.location}>
        <TextInput style={[styles.input, !!errors.location && styles.inputError]}
          placeholder="City, State" placeholderTextColor="#aaa"
          value={s1.location} onChangeText={update('location')} />
      </Field>

      <Field label="Bio" error={undefined}>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Tell us about yourself and what kind of adventures you're looking for..."
          placeholderTextColor="#aaa"
          value={s1.bio} onChangeText={update('bio')}
          multiline numberOfLines={4}
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <TextInput style={[styles.input, !!errors.email && styles.inputError]}
          placeholder="you@example.com" placeholderTextColor="#aaa"
          value={s1.email} onChangeText={update('email')}
          autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      </Field>

      <Field label="Password" error={errors.password}>
        <TextInput style={[styles.input, !!errors.password && styles.inputError]}
          placeholder="••••••••" placeholderTextColor="#aaa"
          value={s1.password} onChangeText={update('password')} secureTextEntry />
      </Field>
    </>
  );
}

// ── Step 2 ───────────────────────────────────────────────────────────────────
function Step2View({
  s2, setS2,
}: {
  s2: Step2;
  setS2: React.Dispatch<React.SetStateAction<Step2>>;
}) {
  const toggle = (item: string) => {
    setS2((prev) => ({
      adventures: prev.adventures.includes(item)
        ? prev.adventures.filter((a) => a !== item)
        : [...prev.adventures, item],
    }));
  };

  return (
    <>
      <Text style={styles.stepTitle}>Your Adventures</Text>
      <Text style={styles.stepSubtitle}>Step 2 of 4</Text>
      <Text style={styles.pickerLabel}>Select your adventure types</Text>
      <View style={styles.chipWrap}>
        {ADVENTURE_TYPES.map((item) => {
          const selected = s2.adventures.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggle(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

// ── Step 3 ───────────────────────────────────────────────────────────────────
function Step3View({
  s3, setS3,
}: {
  s3: Step3;
  setS3: React.Dispatch<React.SetStateAction<Step3>>;
}) {
  return (
    <>
      <Text style={styles.stepTitle}>Experience & Preferences</Text>
      <Text style={styles.stepSubtitle}>Step 3 of 4</Text>

      <Text style={styles.pickerLabel}>Skill Level</Text>
      <View style={styles.grid2}>
        {SKILL_LEVELS.map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.gridBtn, s3.skillLevel === lvl && styles.gridBtnSelected]}
            onPress={() => setS3((p) => ({ ...p, skillLevel: lvl }))}
            activeOpacity={0.8}
          >
            <Text style={[styles.gridBtnText, s3.skillLevel === lvl && styles.gridBtnTextSelected]}>
              {lvl}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.pickerLabel, { marginTop: 16 }]}>Adventure Attitude</Text>
      <View style={styles.grid2}>
        {ATTITUDES.map((att) => (
          <TouchableOpacity
            key={att}
            style={[styles.gridBtn, s3.attitude === att && styles.gridBtnSelected]}
            onPress={() => setS3((p) => ({ ...p, attitude: att }))}
            activeOpacity={0.8}
          >
            <Text style={[styles.gridBtnText, s3.attitude === att && styles.gridBtnTextSelected]}>
              {att}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.pickerLabel, { marginTop: 16 }]}>
        Maximum Distance (miles): {s3.maxDistance}
      </Text>
      {/* Simple stepper to simulate a slider (React Native slider needs an extra package) */}
      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.sliderBtn}
          onPress={() => setS3((p) => ({ ...p, maxDistance: Math.max(5, p.maxDistance - 5) }))}
        >
          <Text style={styles.sliderBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.sliderTrack}>
          <View
            style={[
              styles.sliderFill,
              { width: `${(s3.maxDistance / 200) * 100}%` as any },
            ]}
          />
          <View style={styles.sliderThumb} />
        </View>
        <TouchableOpacity
          style={styles.sliderBtn}
          onPress={() => setS3((p) => ({ ...p, maxDistance: Math.min(200, p.maxDistance + 5) }))}
        >
          <Text style={styles.sliderBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ── Step 4 ───────────────────────────────────────────────────────────────────
function Step4View({
  s4, setS4,
}: {
  s4: Step4;
  setS4: React.Dispatch<React.SetStateAction<Step4>>;
}) {
  return (
    <>
      <Text style={styles.stepTitle}>Connect Social Media</Text>
      <Text style={styles.stepSubtitle}>Step 4 of 4</Text>
      <Text style={styles.optionalNote}>
        Connect your social media accounts to enrich your profile (optional)
      </Text>

      <Text style={styles.socialLabel}>📷  Instagram</Text>
      <TextInput
        style={styles.input}
        placeholder="@username"
        placeholderTextColor="#aaa"
        value={s4.instagram}
        onChangeText={(v) => setS4((p) => ({ ...p, instagram: v }))}
        autoCapitalize="none"
      />

      <Text style={styles.socialLabel}>  Facebook</Text>
      <TextInput
        style={styles.input}
        placeholder="facebook.com/username"
        placeholderTextColor="#aaa"
        value={s4.facebook}
        onChangeText={(v) => setS4((p) => ({ ...p, facebook: v }))}
        autoCapitalize="none"
      />

      <Text style={styles.socialLabel}>🐦  Twitter</Text>
      <TextInput
        style={styles.input}
        placeholder="@username"
        placeholderTextColor="#aaa"
        value={s4.twitter}
        onChangeText={(v) => setS4((p) => ({ ...p, twitter: v }))}
        autoCapitalize="none"
      />
    </>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <View style={{ width: '100%' }}>
      <Text style={styles.label}>{label}</Text>
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
      {children}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const GREEN = '#2D9B6F';

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#e8f5f0' },
  topBar: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center' },
  miniLogoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: GREEN, justifyContent: 'center',
    alignItems: 'center', marginBottom: 14,
  },
  miniLogoEmoji: { fontSize: 22 },
  progressTrack: {
    width: '100%', height: 6, backgroundColor: '#d0e8dc', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#1a1a1a', borderRadius: 4 },

  scroll: { flexGrow: 1, alignItems: 'center', padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 480,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 5,
  },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 8 },
  fieldError: { color: '#e74c3c', fontSize: 12, marginBottom: 2 },
  input: {
    width: '100%', borderRadius: 10, backgroundColor: '#f5f5f5',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#333', marginBottom: 10, borderWidth: 1.5, borderColor: '#f5f5f5',
  },
  bioInput: { height: 90, textAlignVertical: 'top' },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#fff8f8' },

  pickerLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1.5, borderColor: '#ccc', borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 14, color: '#333' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },

  grid2: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4,
  },
  gridBtn: {
    flex: 1, minWidth: '45%', borderWidth: 1.5, borderColor: '#ccc',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  gridBtnSelected: { backgroundColor: GREEN, borderColor: GREEN },
  gridBtnText: { fontSize: 14, color: '#333' },
  gridBtnTextSelected: { color: '#fff', fontWeight: '700' },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  sliderBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
  },
  sliderBtnText: { fontSize: 20, fontWeight: '700', color: '#333' },
  sliderTrack: {
    flex: 1, height: 8, backgroundColor: '#ddd', borderRadius: 4,
    overflow: 'visible', justifyContent: 'center',
  },
  sliderFill: { height: '100%', backgroundColor: '#1a1a1a', borderRadius: 4 },
  sliderThumb: {
    position: 'absolute', right: 0, width: 18, height: 18,
    borderRadius: 9, backgroundColor: '#1a1a1a',
  },

  optionalNote: { fontSize: 13, color: '#888', marginBottom: 16 },
  socialLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 4 },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  backBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  backBtnText: { fontSize: 15, color: '#333', fontWeight: '600' },
  nextBtn: {
    flex: 2, backgroundColor: GREEN, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  nextBtnFull: { flex: 1 },
  nextBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
