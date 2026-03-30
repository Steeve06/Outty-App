import React from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />

      {/* Card */}
      <View style={styles.card}>
        {/* Top photo */}
        <Image
          source={{ uri: 'https://images.pexels.com/photos/2404370/pexels-photo-2404370.jpeg' }}
          style={styles.mainImage}
        />

        {/* Main content */}
        <View style={styles.content}>
          {/* Name + age */}
          <Text style={styles.name}>Maya Waters, 26</Text>

          {/* Location */}
          <Text style={styles.location}>Fort Collins, CO</Text>

          {/* Tags */}
          <View style={styles.tagRow}>
            <Tag label="kayaking" />
            <Tag label="camping" />
            <Tag label="hiking" />
          </View>

          {/* Handle */}
          <Text style={styles.handle}>@mayawaters</Text>

          {/* Bio */}
          <Text style={styles.bio}>
            Kayaker by day, stargazer by night. Love exploring hidden gems and waterways.
          </Text>

          {/* Skill / Attitude / Range */}
          <View style={styles.statsRow}>
            <Stat label="Skill Level" value="Intermediate" />
            <Stat label="Attitude" value="Moderate" />
            <Stat label="Max Range" value="60 mi" />
          </View>

          {/* Bottom thumbnail */}
          <Image
            source={{ uri: 'https://images.pexels.com/photos/2588042/pexels-photo-2588042.jpeg' }}
            style={styles.thumb}
          />

        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.circleButton, styles.noButton]}>
          <Text style={[styles.circleText, styles.noText]}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.circleButton, styles.yesButton]}>
          <Text style={[styles.circleText, styles.yesText]}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Pagination */}
      <Text style={styles.pagination}>2 / 5</Text>
    </SafeAreaView>
  );
}

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '50%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  mainImage: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  handle: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  thumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginHorizontal: 28,
  },
  noButton: {
    borderColor: '#ef4444',
    backgroundColor: '#ffffff',
  },
  yesButton: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  circleText: {
    fontSize: 26,
  },
  noText: {
    color: '#ef4444',
  },
  yesText: {
    color: '#ffffff',
  },
  pagination: {
    marginTop: 8,
    marginBottom: 10,
    color: '#6b7280',
  },
});