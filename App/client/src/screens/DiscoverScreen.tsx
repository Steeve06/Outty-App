// DiscoverScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { loadInitialQueue, saveInteraction } from '../services/discoveryServices';

const GREEN = '#2D9B6F';

export default function DiscoverScreen() {
  const [profilesQueue, setProfilesQueue] = useState<UserProfile[]>([]);
  const activeProfile = profilesQueue[0];
  const { userProfile } = useAuth();

  useEffect(() => {
    async function initQueue() {
      try {
        const currentUid = userProfile?.uid;
        if (!currentUid) return;

        const profiles = await loadInitialQueue(currentUid);

        console.log(profiles);
        setProfilesQueue(profiles);
      }
      catch (error) {
        console.error('Failed to initialize queue:', error);
      }
    }

    initQueue();
  }, [userProfile]);

  async function handleInteraction(type: 'like' | 'pass' | 'block') {
    try {
      if (!activeProfile || !userProfile?.uid || !activeProfile.uid) return;

      await saveInteraction(userProfile.uid, activeProfile.uid, type);

      setProfilesQueue((prevQueue) => prevQueue.slice(1));
    }
    catch (error) {
      console.error('Failed to save interaction:', error);
    }
  }

  type UserProfile = {
    id?: string;
    uid?: string;
    name?: string;
    age?: number;
    city?: string;
    location?: string;
    state?: string;
    bio?: string;
    username?: string;
    photoURL?: string;
    interests?: string[];
    skillLevel?: string;
    attitude?: string;
    maxRange?: string;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!activeProfile ? (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>No more profiles.</Text>
        ) : (
          <View key={activeProfile.id} style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri:
                    activeProfile.photoURL ||
                    'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=1000&auto=format&fit=crop',
                }}
                style={styles.profileImg}
              />
              <View style={styles.overlay}>
                <Text style={styles.name}>
                  {activeProfile.name || 'Unknown User'}
                  {activeProfile.age ? `, ${activeProfile.age}` : ''}
                </Text>
                <Text style={styles.location}>
                  📍 {activeProfile.location || 'Unknown City'}
                  {activeProfile.state ? `, ${activeProfile.state}` : ''}
                </Text>

                <View style={styles.tagRow}>
                  {(activeProfile.interests || []).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.handle}>@{activeProfile.username || 'unknown'}</Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.bio}>
                {activeProfile.bio || 'No bio added yet.'}
              </Text>

              <View style={styles.statsRow}>
                <Stat label="Skill Level" value={activeProfile.skillLevel || '—'} />
                <Stat label="Attitude" value={activeProfile.attitude || '—'} />
                <Stat label="Max Range" value={activeProfile.maxRange || '—'} />
              </View>

              <View style={styles.gallery}>
                <View style={styles.galleryPlaceholder} />
                <View style={styles.galleryPlaceholder} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnNo]}
          onPress={() => handleInteraction('pass')}
        >
          <Ionicons name="close" size={32} color="#e74c3c" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnYes]}
          onPress={() => handleInteraction('like')}
        >
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scroll: {
    padding: 16,
    paddingBottom: 100,
    alignItems: 'center',
  },

  card: {
    width: '30%',
    minWidth: 340,
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 24,
  },

  imageWrapper: { height: 400, position: 'relative' },
  profileImg: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.3)' },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  location: { color: '#fff', fontSize: 14, marginVertical: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  tagText: { color: '#fff', fontSize: 12 },
  handle: { color: '#fff', fontSize: 12, opacity: 0.8 },
  content: { padding: 20 },
  bio: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  gallery: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  galleryPlaceholder: { flex: 1, height: 100, backgroundColor: '#eee', borderRadius: 12 },
  actions: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 20 },
  actionBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  btnNo: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  btnYes: { backgroundColor: GREEN },
});