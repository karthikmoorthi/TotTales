import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Story, StoryPage as StoryPageType } from '@/types';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';
import { StoryPage } from './StoryPage';
import { PageIndicator } from './PageIndicator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryReaderProps {
  story: Story;
  pages: StoryPageType[];
  onRegeneratePage?: (pageId: string) => Promise<void>;
}

export function StoryReader({
  story,
  pages,
  onRegeneratePage,
}: StoryReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [regeneratingPageId, setRegeneratingPageId] = useState<string | null>(null);
  const pagerRef = useRef<PagerView>(null);
  const insets = useSafeAreaInsets();

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleRegenerate = async (pageId: string) => {
    if (!onRegeneratePage) return;
    try {
      setRegeneratingPageId(pageId);
      await onRegeneratePage(pageId);
    } finally {
      setRegeneratingPageId(null);
    }
  };

  const allPages = [
    { type: 'cover', data: story },
    ...pages.map((p) => ({ type: 'story', data: p })),
    { type: 'end', data: story },
  ];

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
        overdrag
      >
        {allPages.map((page, index) => {
          if (page.type === 'cover') {
            return (
              <View key="cover" style={styles.coverPage}>
                <View style={styles.coverContent}>
                  <Text style={styles.coverTitle}>{story.title}</Text>
                  <Text style={styles.coverSubtitle}>A personalized story</Text>
                  <Text style={styles.swipeHint}>Swipe to start reading →</Text>
                </View>
              </View>
            );
          }

          if (page.type === 'end') {
            return (
              <View key="end" style={styles.endPage}>
                <View style={styles.endContent}>
                  <Text style={styles.endTitle}>The End</Text>
                  <Text style={styles.endSubtitle}>{story.title}</Text>
                </View>
              </View>
            );
          }

          const storyPage = page.data as StoryPageType;
          return (
            <View key={storyPage.id}>
              <StoryPage
                page={storyPage}
                isActive={currentPage === index}
                onRegenerate={onRegeneratePage ? () => handleRegenerate(storyPage.id) : undefined}
                isRegenerating={regeneratingPageId === storyPage.id}
              />
            </View>
          );
        })}
      </PagerView>

      <View style={[styles.indicatorContainer, { bottom: insets.bottom + SPACING.md }]}>
        <PageIndicator total={allPages.length} current={currentPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pager: { flex: 1 },
  coverPage: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  coverContent: { alignItems: 'center' },
  coverTitle: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  coverSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING['2xl'],
  },
  swipeHint: {
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  endPage: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  endContent: { alignItems: 'center' },
  endTitle: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  endSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
