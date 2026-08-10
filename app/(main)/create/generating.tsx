import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateStory } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { useStoryCreation } from '@/contexts/StoryCreationContext';
import { GenerationProgress } from '@/components/creation';
import { Button } from '@/components/ui';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

export default function GeneratingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { childId, themeId, artStyleId } = useLocalSearchParams<{
    childId?: string;
    themeId?: string;
    artStyleId?: string;
  }>();
  const { user } = useAuth();
  const { reset } = useStoryCreation();
  const { progress, mutate, isError, error } = useCreateStory();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !user || !childId || !themeId || !artStyleId) return;
    startedRef.current = true;

    mutate(
      { userId: user.id, childId, themeId, artStyleId },
      {
        onSuccess: (storyId) => {
          reset();
          router.replace(`/(main)/read/${storyId}`);
        },
      }
    );
  }, [artStyleId, childId, mutate, reset, router, themeId, user]);

  if (isError || !childId || !themeId || !artStyleId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContent}>
          <View style={styles.errorIcon}>
            <Ionicons name="warning" size={64} color={COLORS.error} />
          </View>
          <Text style={styles.errorTitle}>Generation Failed</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Something went wrong while creating your story. Please try again.'}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.replace('/(main)')}
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  if (progress) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <GenerationProgress progress={progress} />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
          <Text style={styles.footerText}>
            This may take a few minutes. Keep this screen open until your story is finished.
          </Text>
        </View>
      </View>
    );
  }

  // Default loading state
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.loadingIcon}>
          <Ionicons name="sparkles" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.loadingTitle}>Preparing...</Text>
        <Text style={styles.loadingMessage}>Getting ready to create your story</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingIcon: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  loadingTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  loadingMessage: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.text,
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
    minWidth: 200,
  },
});
