import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StoryType } from '@/types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';

interface StoryTypeOption {
  id: StoryType;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}

const STORY_TYPES: StoryTypeOption[] = [
  {
    id: 'adventure',
    name: 'Exciting Adventure',
    description: 'Action-packed journey with discoveries, challenges, and bravery',
    icon: 'rocket-outline',
    colors: ['#6366F1', '#8B5CF6'],
  },
  {
    id: 'emotional',
    name: 'Heartfelt Journey',
    description: 'A story about feelings, friendship, or overcoming fears',
    icon: 'heart-outline',
    colors: ['#EC4899', '#F472B6'],
  },
  {
    id: 'learning',
    name: 'Discovery & Growth',
    description: 'Learn something new while having fun and exploring',
    icon: 'bulb-outline',
    colors: ['#F59E0B', '#FBBF24'],
  },
];

interface StoryTypeSelectorProps {
  selectedType: StoryType | null;
  onSelect: (storyType: StoryType) => void;
}

export function StoryTypeSelector({ selectedType, onSelect }: StoryTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Story Type</Text>
      <Text style={styles.subtitle}>
        What kind of story would you like to create?
      </Text>

      <View style={styles.optionsContainer}>
        {STORY_TYPES.map((type) => {
          const isSelected = type.id === selectedType;

          return (
            <TouchableOpacity
              key={type.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(type.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={type.colors}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={type.icon} size={32} color="white" />
              </LinearGradient>

              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {type.name}
                </Text>
                <Text style={styles.optionDescription}>
                  {type.description}
                </Text>
              </View>

              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
  optionsContainer: {
    gap: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.md,
    position: 'relative',
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F3FF',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.lg,
  },
  optionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optionTitleSelected: {
    color: COLORS.primary,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
  },
});
