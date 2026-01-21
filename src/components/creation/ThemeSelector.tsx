import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SelectionCard } from '@/components/ui';
import { Theme } from '@/types';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

interface ThemeSelectorProps {
  themes: Theme[];
  selectedThemeId: string | null;
  onSelect: (themeId: string) => void;
  isLoading?: boolean;
}

export function ThemeSelector({
  themes,
  selectedThemeId,
  onSelect,
  isLoading = false,
}: ThemeSelectorProps) {
  const renderTheme = ({ item }: { item: Theme }) => (
    <SelectionCard
      title={item.display_name}
      description={item.description || undefined}
      imageUrl={item.preview_image_url}
      selected={item.id === selectedThemeId}
      onPress={() => onSelect(item.id)}
      style={styles.card}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading themes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Theme</Text>
      <Text style={styles.subtitle}>
        Select an adventure for your child's story
      </Text>

      <FlatList
        data={themes}
        renderItem={renderTheme}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
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
  grid: {
    paddingBottom: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  card: {
    width: '48%',
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.xl,
  },
});
