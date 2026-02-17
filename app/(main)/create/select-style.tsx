import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStoryCreation } from '@/contexts/StoryCreationContext';
import { useArtStyles } from '@/hooks/useThemesAndStyles';
import { useCreateStory } from '@/hooks/useStories';
import { Header, Button, LoadingSpinner } from '@/components/ui';
import { StyleSelector } from '@/components/creation';
import { COLORS, SPACING } from '@/utils/constants';

export default function SelectStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { state, setArtStyle, reset } = useStoryCreation();
  const { data: artStyles, isLoading } = useArtStyles();
  const createStory = useCreateStory();

  // Redirect if missing required state
  if (!state.childId || !state.themeId) {
    return <Redirect href="/(main)/create/upload-photo" />;
  }

  const handleCreateStory = async () => {
    if (!state.artStyleId || !user) return;

    try {
      const storyId = await createStory.mutateAsync({
        userId: user.id,
        childId: state.childId!,
        themeId: state.themeId!,
        artStyleId: state.artStyleId,
      });

      // Reset creation state
      reset();

      // Navigate to the reading screen
      router.replace(`/(main)/read/${storyId}`);
    } catch (error) {
      console.error('Error creating story:', error);
      // Stay on generating page to show error
      router.push({
        pathname: '/(main)/create/generating',
        params: { error: 'true' },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Choose Art Style"
        subtitle="Step 3 of 3"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingSpinner message="Loading art styles..." />
        ) : (
          <StyleSelector
            styles={artStyles || []}
            selectedStyleId={state.artStyleId}
            onSelect={setArtStyle}
          />
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          title="Create Story"
          onPress={handleCreateStory}
          loading={createStory.isPending}
          disabled={!state.artStyleId}
        />
      </View>
    </View>
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
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
});
