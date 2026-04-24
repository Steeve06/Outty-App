import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';

import {
  collection, addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

// @ts-expect-error - firebase module lacks type declarations
import { db } from '../../firebase';
import { RootStackParamList } from '../../../../types';

type Message = {
  id: string;
  message?: string;
  sentAt?: { seconds: number; nanoseconds: number } | Date | null;
};

export default function MessagingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const q = query(
        collection(db, 'user-message'),
        orderBy('sentAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(messageList);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'user-message'), {
        message: messageInput.trim(),
        sentAt: serverTimestamp(),
      });
      setMessageInput('');
    } catch {
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#3c5a14', fontSize: 18 }}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.messagesOuterContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.outgoingGroup}>
             <View style={styles.outgoingMessage}>
               <Text style={{ color: '#fff' }}>{msg.message}</Text>
             </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity 
          style={styles.sendBtn} 
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Text style={{ color: '#fff' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  messagesOuterContainer: { flex: 1, marginVertical: 20 },
  outgoingGroup: { alignItems: 'flex-end', marginBottom: 10 },
  outgoingMessage: { backgroundColor: '#2D9B6F', padding: 12, borderRadius: 20, maxWidth: '80%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendBtn: { backgroundColor: '#2D9B6F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 }
});