import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MAX_REGENERATION_ATTEMPTS } from '@/utils/constants';

interface RegenerateButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  count?: number;
  maxAttempts?: number;
}

export function RegenerateButton({
  onPress,
  isLoading = false,
  count = 0,
  maxAttempts = MAX_REGENERATION_ATTEMPTS,
}: RegenerateButtonProps) {
  const isDisabled = isLoading || count >= maxAttempts;

  return (
    <TouchableOpacity
      style={[styles.container, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.text}>Regenerate</Text>
        </>
      )}

      {!isLoading && count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{maxAttempts - count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
