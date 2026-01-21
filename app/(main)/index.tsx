import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStories } from '@/hooks/useStories';
import { Button, Card, EmptyState, LoadingSpinner } from '@/components/ui';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';
import { Story } from '@/types';
import { formatDate, truncateText } from '@/utils/helpers';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { data: stories, isLoading } = useUserStories(user?.id);

  const recentStories = stories?.slice(0, 4) || [];

  const handleCreateStory = () => {
    router.push('/(main)/create/upload-photo');
  };

  const handleViewLibrary = () => {
    router.push('/(main)/library');
  };

  const handleOpenStory = (storyId: string) => {
    router.push(`/(main)/read/${storyId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.displayName?.split(' ')[0] || 'there'}!
            </Text>
            <Text style={styles.tagline}>Ready to create some magic?</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={signOut}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <Ionicons name="person-circle" size={44} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Create Story CTA */}
        <Card style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <View style={styles.ctaIcon}>
              <Ionicons name="sparkles" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Create a New Story</Text>
              <Text style={styles.ctaDescription}>
                Turn your child into the hero of their own adventure
              </Text>
            </View>
          </View>
          <Button
            title="Start Creating"
            onPress={handleCreateStory}
            style={styles.ctaButton}
          />
        </Card>

        {/* Recent Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Stories</Text>
            {recentStories.length > 0 && (
              <TouchableOpacity onPress={handleViewLibrary}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <LoadingSpinner message="Loading stories..." />
          ) : recentStories.length > 0 ? (
            <FlatList
              data={recentStories}
              renderItem={({ item }) => (
                <StoryCard story={item} onPress={() => handleOpenStory(item.id)} />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesContainer}
            />
          ) : (
            <EmptyState
              icon="book-outline"
              title="No Stories Yet"
              description="Create your first personalized storybook!"
              actionLabel="Create Story"
              onAction={handleCreateStory}
              style={styles.emptyState}
            />
          )}
        </View>

        {/* Quick Stats */}
        {stories && stories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stories.length}</Text>
                <Text style={styles.statLabel}>Stories Created</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {stories.reduce((sum, s) => sum + s.total_pages, 0)}
                </Text>
                <Text style={styles.statLabel}>Pages Written</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StoryCard({ story, onPress }: { story: Story; onPress: () => void }) {
  const isGenerating = story.status === 'generating';
  const isFailed = story.status === 'failed';

  return (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={onPress}
      disabled={isGenerating}
      activeOpacity={0.7}
    >
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
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={1}>
          {truncateText(story.title, 20)}
        </Text>
        <Text style={styles.storyDate}>{formatDate(story.created_at)}</Text>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.text,
  },
  tagline: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  ctaCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  ctaDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ctaButton: {
    marginTop: SPACING.sm,
  },
  section: {
    paddingVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  storiesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  storyCard: {
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storyImage: {
    width: '100%',
    height: 120,
  },
  storyImagePlaceholder: {
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyInfo: {
    padding: SPACING.sm,
  },
  storyTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  storyDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
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
  emptyState: {
    paddingVertical: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
