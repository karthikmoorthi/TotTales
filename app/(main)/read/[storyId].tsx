import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStoryWithPages, useRegeneratePage } from '@/hooks/useStories';
import { StoryReader } from '@/components/story';
import { LoadingSpinner } from '@/components/ui';
import { COLORS, FONT_SIZES, SPACING, MAX_REGENERATION_ATTEMPTS } from '@/utils/constants';

export default function ReadStoryScreen() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useStoryWithPages(storyId);
  const regeneratePage = useRegeneratePage();

  const handleRegenerate = async (pageId: string) => {
    if (!storyId) return;

    const page = data?.pages.find((p) => p.id === pageId);
    if (page && (page.regeneration_count || 0) >= MAX_REGENERATION_ATTEMPTS) {
      Alert.alert(
        'Regeneration Limit Reached',
        `You can only regenerate each page ${MAX_REGENERATION_ATTEMPTS} times.`
      );
      return;
    }

    try {
      await regeneratePage.mutateAsync({ storyId, pageId });
      refetch();
    } catch (err) {
      console.error('Error regenerating page:', err);
      Alert.alert('Error', 'Failed to regenerate illustration. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen message="Loading story..." />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="warning" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Story Not Found</Text>
        <Text style={styles.errorMessage}>
          We couldn't load this story. It may have been deleted or there was an error.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.replace('/(main)')}
        >
          <Text style={styles.errorButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { story, pages } = data;

  // Show generating state
  if (story.status === 'generating') {
    return (
      <View style={[styles.container, styles.generatingContainer]}>
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + SPACING.sm }]}
          onPress={() => router.replace('/(main)')}
        >
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.generatingContent}>
          <LoadingSpinner size="large" />
          <Text style={styles.generatingTitle}>Creating Your Story</Text>
          <Text style={styles.generatingMessage}>
            This may take a few minutes. You can check back later from your library.
          </Text>
          <Text style={styles.pageCount}>
            {pages.filter((p) => p.status === 'completed').length} of {story.total_pages} pages complete
          </Text>
        </View>
      </View>
    );
  }

  // Show failed state
  if (story.status === 'failed') {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="warning" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Generation Failed</Text>
        <Text style={styles.errorMessage}>
          We couldn't finish creating this story. Please try creating a new one.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.replace('/(main)')}
        >
          <Text style={styles.errorButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + SPACING.sm }]}
        onPress={() => router.replace('/(main)')}
      >
        <Ionicons name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <StoryReader
        story={story}
        pages={pages}
        onRegeneratePage={handleRegenerate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  generatingContent: {
    alignItems: 'center',
  },
  generatingTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  generatingMessage: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  pageCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
