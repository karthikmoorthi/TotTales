import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { StoryPage as StoryPageType } from '@/types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';
import { RegenerateButton } from './RegenerateButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryPageProps {
  page: StoryPageType;
  isActive?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function StoryPage({
  page,
  isActive = false,
  onRegenerate,
  isRegenerating = false,
}: StoryPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {page.image_url ? (
          <Image
            source={{ uri: page.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Loading image...</Text>
          </View>
        )}

        {onRegenerate && (
          <View style={styles.regenerateContainer}>
            <RegenerateButton
              onPress={onRegenerate}
              isLoading={isRegenerating}
              count={page.regeneration_count}
            />
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.pageNumber}>Page {page.page_number}</Text>
        <Text style={styles.narrative}>{page.narrative_text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
  },
  regenerateContainer: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
  textContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    marginTop: -BORDER_RADIUS.xl,
    minHeight: 150,
  },
  pageNumber: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  narrative: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 32,
  },
});
