import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStoryCreation } from '@/contexts/StoryCreationContext';
import { useThemes } from '@/hooks';
import { Header, Button, LoadingSpinner } from '@/components/ui';
import { ThemeSelector } from '@/components/creation';
import { COLORS, SPACING } from '@/utils/constants';

export default function SelectThemeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setTheme } = useStoryCreation();
  const { data: themes, isLoading } = useThemes();

  // Redirect if no child selected
  if (!state.childId) {
    return <Redirect href="/(main)/create/upload-photo" />;
  }

  const handleContinue = () => {
    if (state.themeId) {
      router.push('/(main)/create/select-style');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Choose Theme"
        subtitle="Step 2 of 3"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingSpinner message="Loading themes..." />
        ) : (
          <ThemeSelector
            themes={themes || []}
            selectedThemeId={state.themeId}
            onSelect={setTheme}
          />
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!state.themeId}
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
