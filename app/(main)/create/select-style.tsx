import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStoryCreation } from '@/contexts/StoryCreationContext';
import { useArtStyles } from '@/hooks/useThemesAndStyles';
import { Header, Button, LoadingSpinner } from '@/components/ui';
import { StyleSelector } from '@/components/creation';
import { COLORS, SPACING } from '@/utils/constants';

export default function SelectStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { state, setArtStyle } = useStoryCreation();
  const { data: artStyles, isLoading } = useArtStyles();

  // Redirect if missing required state
  if (!state.childId || !state.themeId) {
    return <Redirect href="/(main)/create/upload-photo" />;
  }

  const handleCreateStory = () => {
    if (!state.artStyleId || !user) return;

    router.push({
      pathname: '/(main)/create/generating',
      params: {
        childId: state.childId!,
        themeId: state.themeId!,
        artStyleId: state.artStyleId,
      },
    });
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
