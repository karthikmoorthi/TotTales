import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStories, useDeleteStory } from '@/hooks/useStories';
import { Header, EmptyState, LoadingSpinner } from '@/components/ui';
import { Story } from '@/types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';
import { formatDate, truncateText } from '@/utils/helpers';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: stories, isLoading, refetch, isRefetching } = useUserStories(user?.id);
  const deleteStory = useDeleteStory();

  const handleOpenStory = (storyId: string) => {
    router.push(`/(main)/read/${storyId}`);
  };

  const performDelete = async (storyId: string) => {
    try {
      await deleteStory.mutateAsync(storyId);
    } catch (error) {
      console.error('Error deleting story:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to delete story. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete story. Please try again.');
      }
    }
  };

  const handleDeleteStory = (storyId: string, title: string) => {
    // On native, show Alert for confirmation
    // On web, the StoryListItem handles its own modal
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Delete Story',
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performDelete(storyId),
          },
        ]
      );
    }
  };

  const renderStory = ({ item }: { item: Story }) => (
    <StoryListItem
      story={item}
      onPress={() => handleOpenStory(item.id)}
      onDelete={() => handleDeleteStory(item.id, item.title)}
      onConfirmDelete={() => performDelete(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title="My Library"
        showBack
        onBack={() => router.back()}
      />

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading your stories..." />
      ) : stories && stories.length > 0 ? (
        <FlatList
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + SPACING.lg },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="book-outline"
          title="No Stories Yet"
          description="Your created stories will appear here. Start by creating your first personalized storybook!"
          actionLabel="Create Story"
          onAction={() => router.push('/(main)/create/upload-photo')}
        />
      )}
    </View>
  );
}

function StoryListItem({
  story,
  onPress,
  onDelete,
  onConfirmDelete,
}: {
  story: Story;
  onPress: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const isGenerating = story.status === 'generating';
  const isFailed = story.status === 'failed';
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      setShowDeleteModal(true);
    } else {
      onDelete();
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    onConfirmDelete();
  };

  return (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.storyImageContainer}>
        {story.cover_image_url ? (
          <Image
            source={{ uri: story.cover_image_url }}
            style={styles.storyImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.storyImage, styles.storyImagePlaceholder]}>
            {isGenerating ? (
              <LoadingSpinner size="small" />
            ) : isFailed ? (
              <Ionicons name="warning" size={24} color={COLORS.error} />
            ) : (
              <Ionicons name="book" size={24} color={COLORS.textMuted} />
            )}
          </View>
        )}
      </View>

      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.storyMeta}>
          {story.total_pages} pages • {formatDate(story.created_at)}
        </Text>

        {isGenerating && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Generating...</Text>
          </View>
        )}
        {isFailed && (
          <View style={[styles.statusBadge, styles.statusBadgeError]}>
            <Text style={[styles.statusText, styles.statusTextError]}>Failed</Text>
          </View>
        )}
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDeletePress();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
      </Pressable>

      {/* Web delete confirmation modal */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDeleteModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Story</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete "{story.title}"? This cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmDeleteButton]}
                  onPress={confirmDelete}
                >
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storyImageContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyImagePlaceholder: {
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  storyTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  storyMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  statusBadgeError: {
    backgroundColor: COLORS.error + '20',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusTextError: {
    color: COLORS.error,
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
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
  confirmDeleteButton: {
    backgroundColor: COLORS.error,
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
