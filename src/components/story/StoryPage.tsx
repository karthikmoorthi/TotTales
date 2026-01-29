import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { StoryPage as StoryPageType } from '@/types';
import { COLORS, FONT_SIZES, SPACING, COMIC_BOOK } from '@/utils/constants';
import { RegenerateButton } from './RegenerateButton';

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
      {/* Image section - takes most of the space */}
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

      {/* Caption box - comic style text container */}
      <View style={styles.captionBox}>
        <Text style={styles.narrative}>{page.narrative_text}</Text>
      </View>

      {/* Page number in corner */}
      <View style={styles.pageNumberContainer}>
        <Text style={styles.pageNumber}>{page.page_number}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COMIC_BOOK.panelBackground,
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
    top: SPACING.sm,
    right: SPACING.sm,
  },
  captionBox: {
    backgroundColor: COMIC_BOOK.captionBackground,
    borderTopWidth: COMIC_BOOK.captionBorderWidth,
    borderTopColor: COMIC_BOOK.captionBorderColor,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 80,
  },
  narrative: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COMIC_BOOK.textColor,
    lineHeight: 22,
    textAlign: 'center',
  },
  pageNumberContainer: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.sm,
  },
  pageNumber: {
    fontSize: FONT_SIZES.xs,
    color: COMIC_BOOK.pageNumberColor,
    fontWeight: '600',
  },
});
