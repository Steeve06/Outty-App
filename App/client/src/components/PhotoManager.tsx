import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

type PhotoManagerProps = {
    onPhotoChange?: () => void;
};

function PhotoManager({ onPhotoChange }: PhotoManagerProps) {

  const { userProfile } = useAuth();
  const uid = userProfile?.uid;
  // Store uploaded photo URL
  const [photo, setPhoto] = useState<string[]>([]);

  // Store error message
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/photos/${uid}`)
        .then(res => res.json())
        .then(data => setPhoto(data.photos ?? []))
        .catch(err => console.log(err));
  }, []);

  const handleUpload = async () => {
    // Clear previous error
    setError('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
        setError('Permission Access to photos is required')
        return;
    }

    //open Image Picker
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
    });
    console.log('Result:', result);

    if(result.canceled) return;

    const image = result.assets[0];
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('photo', blob, 'photo.jpg');

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/photos/${uid}`, {
        method: 'POST',
        body: formData,
    });

    const data = await res.json();
    setPhoto(prev => [...prev, data.photoUrl]);
    onPhotoChange?.();

};

  const handleDelete = async (photoUrl: string) => {
    setError('');
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/photos/${uid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl })
    });
    await res.json();
    setPhoto(prev => prev.filter(p => p !== photoUrl));
    onPhotoChange?.();
};

  return (
    <View style={styles.container}>
    <Text style={styles.heading}>Photo Manager</Text>

    {error ? <Text style={styles.error}>{error}</Text> : null}

    <View style={styles.gallery}>
        {photo.map((photoUrl, index) => (
            <TouchableOpacity key={index} onPress={() => handleDelete(photoUrl)}>
                <Image
                    source={{ uri: photoUrl }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        ))}
        {photo.length === 0 && <Text>No photos uploaded</Text>}
    </View>

    <TouchableOpacity testID="upload-button" style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload Photo</Text>
    </TouchableOpacity>
</View>
  );
}
export default PhotoManager;

// Component styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  gallery: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginVertical: 10 
  },
  galleryImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 8 
  },
});