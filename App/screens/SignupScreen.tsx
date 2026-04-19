import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const GREEN = '#2D9B6F';

export default function SignupScreen({ navigation }: Props) {
    // Step 1 fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignupPress = () => {
        console.log('Registering:', name, email);
    };

    return (
        <KeyboardAvoidingView style={styles.bg} behavior="padding">
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>Create Account</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleSignupPress}>
                        <Text style={styles.primaryBtnText}>Continue</Text>
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
    input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 16 },
    primaryBtn: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 25 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    linkText: { color: '#666', textAlign: 'center', marginTop: 15 }
});