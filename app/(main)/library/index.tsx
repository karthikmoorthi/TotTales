import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
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

  const handleDeleteStory = (storyId: string, title: string) => {
    Alert.alert(
      'Delete Story',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStory.mutateAsync(storyId);
            } catch (error) {
              console.error('Error deleting story:', error);
              Alert.alert('Error', 'Failed to delete story. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderStory = ({ item }: { item: Story }) => (
    <StoryListItem
      story={item}
      onPress={() => handleOpenStory(item.id)}
      onDelete={() => handleDeleteStory(item.id, item.title)}
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
}: {
  story: Story;
  onPress: () => void;
  onDelete: () => void;
}) {
  const isGenerating = story.status === 'generating';
  const isFailed = story.status === 'failed';

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

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
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
});
