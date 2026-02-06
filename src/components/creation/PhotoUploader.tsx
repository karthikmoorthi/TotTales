import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  Image as RNImage,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MAX_PHOTOS_PER_CHILD } from '@/utils/constants';

// Use RN Image on web (better blob URL support), expo-image on native
const Image = Platform.OS === 'web' ? RNImage : ExpoImage;

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const CARD_SIZE = 120;

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = MAX_PHOTOS_PER_CHILD,
}: PhotoUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [photoToRemove, setPhotoToRemove] = useState<number | null>(null);

  const pickImage = async (useCamera: boolean) => {
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

      // Calculate how many more photos can be added
      const remainingSlots = maxPhotos - photos.length;

      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: remainingSlots,
            quality: 0.8,
          }));

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri);
        const newPhotos = [...photos, ...newUris].slice(0, maxPhotos);
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
      pickImage(false);
    } else {
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

  const handleCardPress = () => {
    if (photos.length === 0) {
      showPickerOptions();
    } else if (photos.length >= 2) {
      setShowManagementModal(true);
    }
  };

  const handleAddMore = () => {
    setShowManagementModal(false);
    setTimeout(() => showPickerOptions(), 300);
  };

  // Calculate stacked photo transforms
  const getStackedStyle = (index: number, total: number) => {
    const offset = total - 1 - index;
    const rotation = offset * 6;
    const translateX = offset * 4;
    const translateY = offset * 2;

    return {
      transform: [
        { rotate: `${rotation}deg` },
        { translateX: -translateX },
        { translateY: -translateY },
      ],
      zIndex: index,
    };
  };

  // Render empty state card
  const renderEmptyCard = () => (
    <TouchableOpacity
      style={styles.emptyCard}
      onPress={showPickerOptions}
      disabled={isLoading}
    >
      <Ionicons
        name={isLoading ? 'hourglass-outline' : 'camera-outline'}
        size={36}
        color={COLORS.primary}
      />
      <Text style={styles.emptyCardText}>Add Photo</Text>
    </TouchableOpacity>
  );

  // Render single photo card
  const renderSinglePhotoCard = () => (
    <View style={styles.singlePhotoCard}>
      <Image source={{ uri: photos[0] }} style={styles.cardImage} resizeMode="cover" />

      {/* Add more button */}
      {photos.length < maxPhotos && (
        <TouchableOpacity
          style={styles.addMoreBadge}
          onPress={showPickerOptions}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Remove button */}
      <TouchableOpacity
        style={styles.removeSmallBadge}
        onPress={() => removePhoto(0)}
      >
        <Ionicons name="close" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  // Render stacked photos card
  const renderStackedPhotosCard = () => {
    // Show up to 3 stacked cards for visual effect
    const displayPhotos = photos.slice(0, 3);

    return (
      <TouchableOpacity
        style={styles.stackedContainer}
        onPress={handleCardPress}
        activeOpacity={0.8}
      >
        {displayPhotos.map((uri, index) => (
          <View
            key={index}
            style={[
              styles.stackedPhotoCard,
              getStackedStyle(index, displayPhotos.length),
            ]}
          >
            <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
          </View>
        ))}

        {/* Tap to manage overlay hint */}
        <View style={styles.tapHintOverlay}>
          <Ionicons name="images-outline" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos of Your Child</Text>
      <Text style={styles.subtitle}>
        Add 1-{maxPhotos} photos for the best character consistency
      </Text>

      <View style={styles.cardContainer}>
        {photos.length === 0 && renderEmptyCard()}
        {photos.length === 1 && renderSinglePhotoCard()}
        {photos.length >= 2 && renderStackedPhotosCard()}

        {/* Photo count badge */}
        {photos.length > 0 && (
          <Text style={styles.photoCountBadge}>
            {photos.length}/{maxPhotos} photos
          </Text>
        )}
      </View>

      {photos.length > 0 && (
        <Text style={styles.hint}>
          {photos.length >= 2
            ? 'Tap photos to manage'
            : 'Tip: Clear, front-facing photos work best'}
        </Text>
      )}

      {/* Photo Management Modal */}
      <Modal
        visible={showManagementModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManagementModal(false)}
      >
        <View style={styles.managementModalContainer}>
          <View style={styles.managementModalContent}>
            <View style={styles.managementHeader}>
              <Text style={styles.managementTitle}>Your Photos</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowManagementModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.photoGrid}
              showsVerticalScrollIndicator={false}
            >
              {photos.map((uri, index) => (
                <View key={index} style={styles.managementPhotoContainer}>
                  <Image source={{ uri }} style={styles.managementPhoto} resizeMode="cover" />

                  {/* Primary badge */}
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>Primary</Text>
                    </View>
                  )}

                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.managementRemoveButton}
                    onPress={() => {
                      removePhoto(index);
                      if (photos.length <= 2) {
                        setShowManagementModal(false);
                      }
                    }}
                  >
                    <Ionicons name="close-circle" size={28} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Add more button */}
            {photos.length < maxPhotos && (
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={handleAddMore}
              >
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                <Text style={styles.addMoreText}>Add More Photos</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Web-only confirmation modal for removing photos */}
      {Platform.OS === 'web' && (
        <Modal
          visible={photoToRemove !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPhotoToRemove(null)}
        >
          <Pressable
            style={styles.confirmModalOverlay}
            onPress={() => setPhotoToRemove(null)}
          >
            <View style={styles.confirmModalContent}>
              <Text style={styles.confirmModalTitle}>Remove Photo</Text>
              <Text style={styles.confirmModalMessage}>
                Are you sure you want to remove this photo?
              </Text>
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity
                  style={[styles.confirmModalButton, styles.cancelButton]}
                  onPress={() => setPhotoToRemove(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmModalButton, styles.deleteButton]}
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
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  emptyCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  emptyCardText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  singlePhotoCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceSecondary,
  },
  cardImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  addMoreBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  removeSmallBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  stackedContainer: {
    width: CARD_SIZE + 20,
    height: CARD_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stackedPhotoCard: {
    position: 'absolute',
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tapHintOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoCountBadge: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontWeight: '500',
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },

  // Photo Management Modal
  managementModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  managementModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl + 20, // Account for safe area
    maxHeight: '70%',
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  managementTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  managementPhotoContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceSecondary,
  },
  managementPhoto: {
    width: 100,
    height: 100,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  primaryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  managementRemoveButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceSecondary,
  },
  addMoreText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Web confirmation modal
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '80%',
    maxWidth: 300,
  },
  confirmModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  confirmModalMessage: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  confirmModalButton: {
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
