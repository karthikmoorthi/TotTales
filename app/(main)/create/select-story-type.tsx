import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStoryCreation } from '@/contexts/StoryCreationContext';
import { Header, Button } from '@/components/ui';
import { StoryTypeSelector } from '@/components/creation';
import { COLORS, SPACING } from '@/utils/constants';

export default function SelectStoryTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setStoryType } = useStoryCreation();

  // Redirect if no theme selected
  if (!state.childId || !state.themeId) {
    return <Redirect href="/(main)/create/upload-photo" />;
  }

  const handleContinue = () => {
    if (state.storyType) {
      router.push('/(main)/create/select-style');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Story Type"
        subtitle="Step 3 of 4"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StoryTypeSelector
          selectedType={state.storyType}
          onSelect={setStoryType}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!state.storyType}
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
