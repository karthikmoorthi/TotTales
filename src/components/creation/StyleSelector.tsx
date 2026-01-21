import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SelectionCard } from '@/components/ui';
import { ArtStyle } from '@/types';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

interface StyleSelectorProps {
  styles: ArtStyle[];
  selectedStyleId: string | null;
  onSelect: (styleId: string) => void;
  isLoading?: boolean;
}

export function StyleSelector({
  styles: artStyles,
  selectedStyleId,
  onSelect,
  isLoading = false,
}: StyleSelectorProps) {
  const renderStyle = ({ item }: { item: ArtStyle }) => (
    <SelectionCard
      title={item.display_name}
      description={item.description || undefined}
      imageUrl={item.preview_image_url}
      selected={item.id === selectedStyleId}
      onPress={() => onSelect(item.id)}
      style={componentStyles.card}
    />
  );

  if (isLoading) {
    return (
      <View style={componentStyles.container}>
        <Text style={componentStyles.loadingText}>Loading art styles...</Text>
      </View>
    );
  }

  return (
    <View style={componentStyles.container}>
      <Text style={componentStyles.title}>Choose an Art Style</Text>
      <Text style={componentStyles.subtitle}>
        Pick a visual style for your storybook illustrations
      </Text>

      <FlatList
        data={artStyles}
        renderItem={renderStyle}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={componentStyles.row}
        scrollEnabled={false}
        contentContainerStyle={componentStyles.grid}
      />
    </View>
  );
}

const componentStyles = StyleSheet.create({
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
