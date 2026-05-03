// Matches Screen
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types';
import { useAuth } from '../../src/context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

// @ts-expect-error - firebase module lacks type declarations
import { db } from '../firebase';

const GREEN = '#2D9B6F';

type Conversation = {
  id: string;
  participants: string[];
  pairKey?: string;
  lastMessageText?: string;
  lastMessageAt?: { seconds: number; nanoseconds: number } | null;
  lastMessageSenderUid?: string | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  updatedAt?: { seconds: number; nanoseconds: number } | null;
};

type MatchCardData = Conversation & {
  otherUserUid: string;
  otherUserName: string;
  photos?: string[];
};

export default function MatchesScreen() {
  const { firebaseUser, userProfile } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [conversations, setConversations] = useState<MatchCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserUid = firebaseUser?.uid || userProfile?.uid;
    if (!currentUserUid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUserUid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const baseConversations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Conversation[];

          const enrichedConversations = await Promise.all(
            baseConversations.map(async (conversation) => {
              const otherUserUid =
                conversation.participants?.find(uid => uid !== currentUserUid) || 'Unknown';

              let otherUserName = otherUserUid;
              let photos: string[] = [];

              try {
                const profileRef = doc(db, 'profiles', otherUserUid);
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                  const profileData = profileSnap.data();
                  otherUserName = profileData.name || otherUserUid;
                  photos = profileData.photos || [];
                }

              } catch (profileError) {
                console.error('Error fetching profile for uid:', otherUserUid, profileError);
              }

              return {
                ...conversation,
                otherUserUid,
                otherUserName,
                photos,
              };
            })
          );

          setConversations(enrichedConversations);
          setLoading(false);
        } catch (error) {
          console.error('Error processing conversations:', error);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to conversations:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid, userProfile?.uid]);

  const renderItem = ({ item }: { item: MatchCardData }) => {
    const lastMsg = item.lastMessageText?.trim()
      ? item.lastMessageText
      : 'Say hello to start the conversation.';

    const time = item.lastMessageAt ? 'Recent activity' : 'Matched recently';

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => {
          navigation.navigate('MessagingScreen', {
            conversationId: item.id,
            otherUserUid: item.otherUserUid,
            name: item.otherUserName,
          });
        }}
      >
        <Image
          source={{
            uri:
              item.photos?.[0] ||
              'https://images.unsplash.com/photo-1551632432-c735e829929d?q=80&w=200&auto=format&fit=crop',
          }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.nameText}>{item.otherUserName}</Text>
          </View>

          <Text style={styles.locationText}>Conversation active</Text>

          <View style={styles.msgRow}>
            <Text style={styles.msgIcon}>💬</Text>
            <Text style={styles.lastMsg} numberOfLines={1}>{lastMsg}</Text>
          </View>

          <Text style={styles.timeText}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>
              No active conversations yet.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 20, color: '#1a1a1a' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  matchCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
    elevation: 2,
    backgroundColor: '#fff',
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  info: { flex: 1, marginLeft: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameText: { fontSize: 18, fontWeight: '700', color: '#333' },
  locationText: { color: '#888', fontSize: 13, marginTop: 2 },
  msgRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  msgIcon: { fontSize: 14, marginRight: 5 },
  lastMsg: { fontSize: 14, color: '#666', flex: 1 },
  timeText: { fontSize: 11, color: '#aaa', marginTop: 4 },
});