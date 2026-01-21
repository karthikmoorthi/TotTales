import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui';
import { GenerationProgress as GenerationProgressType } from '@/types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';

interface GenerationProgressProps {
  progress: GenerationProgressType;
}

const STAGE_INFO = {
  analyzing: {
    icon: 'scan-outline' as const,
    title: 'Analyzing Photos',
    description: 'Understanding your child\'s features...',
  },
  writing: {
    icon: 'create-outline' as const,
    title: 'Writing Story',
    description: 'Crafting a magical adventure...',
  },
  illustrating: {
    icon: 'brush-outline' as const,
    title: 'Creating Illustrations',
    description: 'Drawing beautiful scenes...',
  },
  finalizing: {
    icon: 'checkmark-circle-outline' as const,
    title: 'Finishing Up',
    description: 'Adding final touches...',
  },
};

export function GenerationProgress({ progress }: GenerationProgressProps) {
  const stageInfo = STAGE_INFO[progress.stage];
  const overallProgress = calculateOverallProgress(progress);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={stageInfo.icon} size={48} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>{stageInfo.title}</Text>
      <Text style={styles.description}>{stageInfo.description}</Text>

      <ProgressBar
        progress={overallProgress}
        label="Overall Progress"
        style={styles.progressBar}
      />

      {progress.stage === 'illustrating' && (
        <Text style={styles.pageInfo}>
          Creating page {progress.currentPage} of {progress.totalPages}
        </Text>
      )}

      <Text style={styles.message}>{progress.message}</Text>

      <View style={styles.stages}>
        {Object.entries(STAGE_INFO).map(([stage, info], index) => {
          const isCompleted = getStageOrder(stage) < getStageOrder(progress.stage);
          const isCurrent = stage === progress.stage;

          return (
            <View key={stage} style={styles.stageItem}>
              <View
                style={[
                  styles.stageDot,
                  isCompleted && styles.stageDotCompleted,
                  isCurrent && styles.stageDotCurrent,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.stageText,
                  (isCompleted || isCurrent) && styles.stageTextActive,
                ]}
              >
                {info.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getStageOrder(stage: string): number {
  const order = ['analyzing', 'writing', 'illustrating', 'finalizing'];
  return order.indexOf(stage);
}

function calculateOverallProgress(progress: GenerationProgressType): number {
  const stageWeights = {
    analyzing: 10,
    writing: 20,
    illustrating: 60,
    finalizing: 10,
  };

  const stageStarts = {
    analyzing: 0,
    writing: 10,
    illustrating: 30,
    finalizing: 90,
  };

  const currentStageWeight = stageWeights[progress.stage];
  const currentStageStart = stageStarts[progress.stage];

  if (progress.stage === 'illustrating' && progress.totalPages > 0) {
    const pageProgress = (progress.currentPage - 1) / progress.totalPages;
    return currentStageStart + pageProgress * currentStageWeight;
  }

  return currentStageStart + currentStageWeight / 2;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  pageInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  stages: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stageDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stageDotCurrent: {
    backgroundColor: COLORS.primary,
  },
  stageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  stageTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
});
