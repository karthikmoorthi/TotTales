import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MAX_PHOTOS_PER_CHILD } from '@/utils/constants';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = MAX_PHOTOS_PER_CHILD,
}: PhotoUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [photoToRemove, setPhotoToRemove] = useState<number | null>(null);

  const pickImage = async (useCamera: boolean) => {
    setShowOptionsModal(false);
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library permission is required to select photos.');
          return;
        }
      }

      setIsLoading(true);

      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          }));

      if (!result.canceled && result.assets[0]) {
        const newPhotos = [...photos, result.assets[0].uri];
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showPickerOptions = () => {
    if (Platform.OS === 'web') {
      // On web, directly open the image library (camera isn't easily available)
      pickImage(false);
    } else {
      // On native, show options via Alert
      Alert.alert(
        'Add Photo',
        'Choose how to add a photo of your child',
        [
          { text: 'Take Photo', onPress: () => pickImage(true) },
          { text: 'Choose from Library', onPress: () => pickImage(false) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const removePhoto = (index: number) => {
    if (Platform.OS === 'web') {
      setPhotoToRemove(index);
    } else {
      Alert.alert(
        'Remove Photo',
        'Are you sure you want to remove this photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              const newPhotos = photos.filter((_, i) => i !== index);
              onPhotosChange(newPhotos);
            },
          },
        ]
      );
    }
  };

  const confirmRemovePhoto = () => {
    if (photoToRemove !== null) {
      const newPhotos = photos.filter((_, i) => i !== photoToRemove);
      onPhotosChange(newPhotos);
      setPhotoToRemove(null);
    }
  };

  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item }} style={styles.photo} contentFit="cover" />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removePhoto(index)}
      >
        <Ionicons name="close-circle" size={24} color={COLORS.error} />
      </TouchableOpacity>
      {index === 0 && (
        <View style={styles.primaryBadge}>
          <Text style={styles.primaryText}>Primary</Text>
        </View>
      )}
    </View>
  );

  const renderAddButton = () => {
    if (photos.length >= maxPhotos) return null;

    return (
      <TouchableOpacity
        style={styles.addButton}
        onPress={showPickerOptions}
        disabled={isLoading}
      >
        <Ionicons
          name={isLoading ? 'hourglass-outline' : 'add'}
          size={40}
          color={COLORS.primary}
        />
        <Text style={styles.addText}>Add Photo</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos of Your Child</Text>
      <Text style={styles.subtitle}>
        Add 1-{maxPhotos} photos for the best character consistency
      </Text>

      <View style={styles.grid}>
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          ListFooterComponent={renderAddButton}
        />
        {photos.length === 0 && renderAddButton()}
      </View>

      {photos.length > 0 && (
        <Text style={styles.hint}>
          Tip: Clear, front-facing photos work best
        </Text>
      )}

      {/* Web-only confirmation modal for removing photos */}
      {Platform.OS === 'web' && (
        <Modal
          visible={photoToRemove !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPhotoToRemove(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setPhotoToRemove(null)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Remove Photo</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to remove this photo?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setPhotoToRemove(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={confirmRemovePhoto}
                >
                  <Text style={styles.deleteButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  grid: {
    width: '100%',
  },
  row: {
    justifyContent: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  photoContainer: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  primaryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  addText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  modalButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
