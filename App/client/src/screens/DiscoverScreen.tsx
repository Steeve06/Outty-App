import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Main Image & Overlay */}
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=1000&auto=format&fit=crop' }} 
              style={styles.profileImg} 
            />
            <View style={styles.overlay}>
              <Text style={styles.name}>Jordan Peak, 30</Text>
              <Text style={styles.location}>📍 Boulder, CO</Text>
              <View style={styles.tagRow}>
                {['hiking', 'mountaineering', 'backpacking'].map(t => (
                  <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                ))}
              </View>
              <Text style={styles.handle}>@jordanpeak</Text>
            </View>
          </View>

          {/* Bio & Stats */}
          <View style={styles.content}>
            <Text style={styles.bio}>Chasing summits and sunrises. Let's conquer the Rockies together! 🏔</Text>
            
            <View style={styles.statsRow}>
              <Stat label="Skill Level" value="Advanced" />
              <Stat label="Attitude" value="Intense" />
              <Stat label="Max Range" value="75 mi" />
            </View>

            <View style={styles.gallery}>
               <View style={styles.galleryPlaceholder} />
               <View style={styles.galleryPlaceholder} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.btnNo]}>
          <Ionicons name="close" size={32} color="#e74c3c" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.btnYes]}>
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Stat = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const GREEN = '#2D9B6F';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
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
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  gallery: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  galleryPlaceholder: { width: '48%', height: 100, backgroundColor: '#eee', borderRadius: 12 },
  actions: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 20 },
  actionBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  btnNo: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  btnYes: { backgroundColor: GREEN },
});