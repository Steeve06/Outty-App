import React, { useState } from 'react';
import { Image } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';



export default function MessagingScreen() 
{
  const [loading, setLoading] = useState(false);

  const handleAddTestEntry = async () => 
  {
    try 
    {
      setLoading(true);

      const customId = 'andre-test-message';

      await setDoc(doc(db, 'andre-messages', customId), 
      {
        message: 'Hello from MessagingScreen',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', `Entry added with ID: ${customId}`);
    } 
    catch (error) 
    {
      console.error('Error adding document:', error);
      Alert.alert('Error', 'Could not add entry.');
    } 
    finally 
    {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

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
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={require('../temp-images/hiker_stock.png')}
              style={styles.messagesProfileIcon} />

            <View style={styles.incomingGroup}>
              <View style={styles.incomingMessage}>
                <Text style={{ color: '#000' }}>
                  Hi. It is very nice to match with you.
                </Text>
              </View>

              <Text style={styles.messageTimestamp}>10:30 AM</Text>
            </View>
          </View>

          <View>
            <View style={styles.outgoingGroup}>
              <View style={styles.outgoingMessage}>
                <Text style={{ color: '#fff' }}>
                  Nice to meet you as well. Your profile says you like hiking...
                </Text>
              </View>

              <Text style={styles.messageTimestamp}>11:18 AM</Text>
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <TextInput style={styles.messageTextInput}></TextInput>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddTestEntry}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add Test Entry'}
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
    height: 700,
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
    minHeight: 400,
    minWidth: 100,
    borderColor: '#000',
    borderWidth: 3,
    marginBottom: 10,
    borderRadius: 25,
    padding: 20
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

});