import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';

// Icon mappings for themes and styles when images aren't available
const THEME_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; colors: string[] }> = {
  'Space Adventure': { icon: 'rocket-outline', colors: ['#1E3A8A', '#7C3AED'] },
  'Underwater Explorer': { icon: 'water-outline', colors: ['#0891B2', '#06B6D4'] },
  'Enchanted Forest': { icon: 'leaf-outline', colors: ['#166534', '#22C55E'] },
  'Dinosaur Land': { icon: 'paw-outline', colors: ['#B45309', '#F59E0B'] },
  'Superhero Academy': { icon: 'flash-outline', colors: ['#DC2626', '#F97316'] },
  'Fairy Tale Kingdom': { icon: 'sparkles-outline', colors: ['#DB2777', '#EC4899'] },
  'Safari Adventure': { icon: 'sunny-outline', colors: ['#CA8A04', '#EAB308'] },
  'Arctic Expedition': { icon: 'snow-outline', colors: ['#0284C7', '#38BDF8'] },
};

const STYLE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; colors: string[] }> = {
  'Watercolor Whimsy': { icon: 'water-outline', colors: ['#8B5CF6', '#C4B5FD'] },
  'Bright & Playful': { icon: 'color-palette-outline', colors: ['#F97316', '#FBBF24'] },
  'Classic Storybook': { icon: 'book-outline', colors: ['#92400E', '#D97706'] },
  'Paper Cutout': { icon: 'layers-outline', colors: ['#059669', '#34D399'] },
  'Soft Digital': { icon: 'brush-outline', colors: ['#EC4899', '#F9A8D4'] },
  'Crayon Charm': { icon: 'pencil-outline', colors: ['#7C3AED', '#A78BFA'] },
};

interface SelectionCardProps {
  title: string;
  description?: string;
  imageUrl?: string | null;
  imageSource?: { uri: string } | number; // For local assets or remote URLs
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function SelectionCard({
  title,
  description,
  imageUrl,
  imageSource,
  selected = false,
  onPress,
  style,
}: SelectionCardProps) {
  // Get icon config based on title
  const iconConfig = THEME_ICONS[title] || STYLE_ICONS[title];

  // Determine the image source to use
  const resolvedImageSource = imageSource || (imageUrl ? { uri: imageUrl } : null);

  const renderPlaceholder = () => {
    if (iconConfig) {
      return (
        <LinearGradient
          colors={iconConfig.colors as [string, string]}
          style={styles.imagePlaceholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={iconConfig.icon} size={40} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      );
    }
    return (
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {resolvedImageSource ? (
        <Image
          source={resolvedImageSource}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        renderPlaceholder()
      )}

      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.titleSelected]} numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {selected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  selected: {
    borderColor: COLORS.primary,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  titleSelected: {
    color: COLORS.primary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
  },
});
