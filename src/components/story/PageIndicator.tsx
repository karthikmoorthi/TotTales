import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils/constants';

interface PageIndicatorProps {
  total: number;
  current: number;
}

export function PageIndicator({ total, current }: PageIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} isActive={index === current} />
      ))}
    </View>
  );
}

function Dot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? 24 : 8, { duration: 200 }),
    backgroundColor: withTiming(
      isActive ? COLORS.primary : COLORS.textMuted,
      { duration: 200 }
    ),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  dot: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
  },
});
