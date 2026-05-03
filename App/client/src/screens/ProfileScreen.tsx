import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import PhotoManager from '../components/PhotoManager';

const GREEN = '#2D9B6F';
const BACKGROUND = '#f8f9fa';
const TEXT_MAIN = '#1a1a1a';
const TEXT_LABEL = '#888';
const ERROR_RED = '#e74c3c';

const ConnectedAccountSection = ({ username, onDisconnect }: { username: string; onDisconnect: () => void }) => (
  <View style={styles.connectionCard}>
    <View style={styles.connectionHeader}>
      <View style={styles.iconCircle}>
        <Ionicons name="logo-instagram" size={24} color="#E1306C" />
      </View>
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionTitle}>Instagram Connected</Text>
        <Text style={styles.connectionSubtitle}>@{username}</Text>
      </View>
      <TouchableOpacity onPress={onDisconnect} style={styles.disconnectBtn}>
        <Text style={styles.disconnectText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { userProfile, logout } = useAuth();
  
  // State to store profile data from the backend
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editInterests, setEditInterests] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) return;
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${userProfile?.uid}`)
      .then(res => res.json())
      .then(data => {
        console.log('Profile data:', data);
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err)
      });
  }, [userProfile?.uid]);

  const refreshProfile = () => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${userProfile?.uid}`)
        .then(res => res.json())
        .then(data => setProfile(data));
  };
  const handleLogout = async () => {
    alert('handleLogout fired');
    try {
      await logout();
    } catch (error) {
      alert('logout failed');
      console.log(error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  const handleEdit = () => {
    setEditName(profile?.name ?? '');
    setEditBio(profile?.bio ?? '');
    setEditLocation(profile?.location ?? '');
    setEditInterests(profile?.interests?.join(', ') ?? '');
    setModalVisible(true);
  };

  const handleSave = () => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${userProfile?.uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(editName && { name: editName }),
        ...(editBio && { bio: editBio }),
        ...(editLocation && { location: editLocation }),
        ...(editInterests && { interests: editInterests.split(',').map(i => i.trim()) })
      })
    })
      .then(() => {
        return fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${userProfile?.uid}`)
          .then(res => res.json())
          .then(data => {
            console.log('Updated Profile', data)
            setProfile(data);
            console.log('Profile updated')
            setModalVisible(false)
          })
      })
      .catch(err => console.log(err));
  }

  const handleDelete = () => {
    Alert.alert('Delete Profile', 'Are you sure you want to delete your profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile/${userProfile?.uid}`, {
            method: 'DELETE'
          })
            .then(res => res.json())
            .then(() => {
              setProfile(null);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            })
            .catch(err => console.log(err));
        }
      }
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={16} color={TEXT_MAIN} style={styles.editIcon} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={TEXT_MAIN} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profile?.photos?.[0] ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' }}
            style={styles.profileImage}
          />
        </View>
        <PhotoManager onPhotoChange={refreshProfile}/>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{profile?.location}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>
            {profile?.bio}
          </Text>
        </View>

        <View style={styles.tagSection}>
          <Text style={styles.label}>Adventures</Text>
          <View style={styles.tagContainer}>
            {(profile?.interests ?? []).map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Skill Level</Text>
            <Text style={styles.value}>{profile?.skillLevel}</Text>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Attitude</Text>
            <Text style={styles.value}>{profile?.attitude}</Text>
          </View>
        </View>
      </View>

      <View style={styles.connectionWrapper}>
        <Text style={styles.sectionLabel}>Connected Accounts</Text>
        <ConnectedAccountSection
          username="alexrivers"
          onDisconnect={() => console.log('Disconnecting...')}
        />
      </View>

      <View style={styles.actionContainer}>
        {/* <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={TEXT_MAIN} />
          <Text style={styles.actionText}>Log Out</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.actionRow}
          onPress={(handleLogout)}
        >
          <Ionicons name="log-out-outline" size={20} color={TEXT_MAIN} />
          <Text style={styles.actionText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionRow, styles.deleteAction]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={ERROR_RED} />
          <Text style={[styles.actionText, styles.deleteText]}>Delete Profile</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />

            <Text style={styles.label}>Bio</Text>
            <TextInput style={styles.input} value={editBio} onChangeText={setEditBio} multiline />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation} />

            <Text style={styles.label}>Interests (comma separated)</Text>
            <TextInput style={styles.input} value={editInterests} onChangeText={setEditInterests} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, marginBottom: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  settingsBtn: { marginLeft: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: TEXT_MAIN },
  editBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff' },
  editIcon: { marginRight: 4 },
  editBtnText: { fontSize: 14, fontWeight: '600', color: TEXT_MAIN },
  card: { marginHorizontal: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' },
  infoSection: { marginBottom: 15 },
  tagSection: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: TEXT_LABEL, marginBottom: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: TEXT_MAIN, marginBottom: 10 },
  value: { fontSize: 16, color: TEXT_MAIN },
  tagContainer: { flexDirection: 'row', gap: 8, marginTop: 4 },
  tag: { backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginTop: 10 },
  halfWidth: { flex: 1 },
  connectionWrapper: { marginTop: 20, marginHorizontal: 20 },
  connectionCard: { padding: 16, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  connectionHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FDF0F5', justifyContent: 'center', alignItems: 'center' },
  connectionInfo: { flex: 1, marginLeft: 12 },
  connectionTitle: { fontSize: 15, fontWeight: '600', color: TEXT_MAIN },
  connectionSubtitle: { fontSize: 13, color: TEXT_LABEL },
  disconnectBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  disconnectText: { color: ERROR_RED, fontSize: 13, fontWeight: '600' },
  actionContainer: { marginTop: 30, marginHorizontal: 20 },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  deleteAction: { marginTop: 10 },
  actionText: { marginLeft: 10, fontSize: 16, fontWeight: '500', color: TEXT_MAIN },
  deleteText: { color: ERROR_RED },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: TEXT_MAIN },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15 },
  saveBtn: { backgroundColor: GREEN, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: TEXT_LABEL, fontSize: 15 }
});
