import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  setDoc,
  doc
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

type Message = {
  id: string;
  message?: string;
  sentAt?: any;
};

export default function MessagingScreen() {
  const navigation = useNavigation<any>();

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
      }));

      setMessages(messageList);
    });

    return () => unsubscribe();
  }, []);

  const saveMessageToDb = async () => {
    try {
      setLoading(true);

      await addDoc(collection(db, 'user-message'), {
        message: messageInput,
        sentAt: serverTimestamp(),
      });

      setMessageInput('');
    } catch (error) {
      Alert.alert('Error', 'Could not send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.backBtn}
          onPress={() => {
            navigation.goBack();
          }}>
          Back
        </TouchableOpacity>

        <View style={styles.topBar}>
          <View style={styles.profileImageOuterDiv}>
            <Image
              source={require('../temp-images/hiker_stock.png')}
              style={styles.profileImage} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text>Online</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.messagesOuterContainer}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.messagesScrollContent}>
            {messages.map((item) =>
            (
              <View style={{ marginBottom: 15, marginRight: 20 }}>
                <View key={item.id} style={styles.outgoingGroup}>
                  <View style={styles.outgoingMessage}>
                    <Text style={{ color: '#fff' }}>
                      {item.message ?? ''}
                    </Text>
                  </View>

                  <Text style={styles.messageTimestamp}>
                    {item.sentAt?.toDate
                      ? item.sentAt.toDate().toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                      : 'Sending...'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

        </View>

        <View style={{ marginBottom: 20 }}>
          <TextInput style={styles.messageTextInput}
            placeholder='Type message here...'
            value={messageInput}
            onChangeText={setMessageInput}>
          </TextInput>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={saveMessageToDb}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Message'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GREEN = '#2D9B6F';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    height: 800,
    width: '100%',
    maxWidth: 1000,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  button: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },

  profileImageOuterDiv: {

  },

  divider: {
    borderBottomColor: '#000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    marginBottom: 16,
  },

  userInfo: {
    paddingLeft: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 15
  },

  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingBottom: 2,
  },

  messagesOuterContainer: {
    height: 400,
    minWidth: 100,
    borderColor: '#000',
    borderWidth: 3,
    marginBottom: 10,
    borderRadius: 25,
    padding: 20,
  },

  messagesProfileIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },

  incomingGroup: {
    alignItems: 'flex-start',
  },

  outgoingGroup: {
    alignItems: 'flex-end',
  },

  incomingMessage: {
    borderWidth: 1,
    borderColor: '#514F56',
    borderRadius: 25,
    minHeight: 50,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },

  outgoingMessage: {
    borderWidth: 1,
    backgroundColor: '#3c5a14',
    borderRadius: 25,
    minHeight: 50,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },

  messageTimestamp: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    alignItems: 'flex-start',
  },

  messageTextInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 15,
    minHeight: 50,
    paddingHorizontal: 20,
    fontSize: 15,
  },

  backBtn: {
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 'auto',
    marginBottom: 20,
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },


  messagesScrollContent: {
    paddingBottom: 10,
  },

});
