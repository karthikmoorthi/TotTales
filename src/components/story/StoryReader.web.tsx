import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Story, StoryPage as StoryPageType } from '@/types';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';
import { StoryPage } from './StoryPage';
import { PageIndicator } from './PageIndicator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

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

  const goToPage = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    }
    setCurrentPage(index);
  };

  const handleScroll = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const renderPageContent = (page: any, index: number) => {
    if (page.type === 'cover') {
      return (
        <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
          <View style={styles.coverPage}>
            <View style={styles.coverContent}>
              <Text style={styles.coverTitle}>{story.title}</Text>
              <Text style={styles.coverSubtitle}>A personalized story</Text>
              <Text style={styles.swipeHint}>Click arrows or swipe to read →</Text>
            </View>
          </View>
        </View>
      );
    }

    if (page.type === 'end') {
      return (
        <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
          <View style={styles.endPage}>
            <View style={styles.endContent}>
              <Text style={styles.endTitle}>The End</Text>
              <Text style={styles.endSubtitle}>{story.title}</Text>
            </View>
          </View>
        </View>
      );
    }

    const storyPage = page.data as StoryPageType;
    return (
      <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
        <StoryPage
          page={storyPage}
          isActive={currentPage === index}
          onRegenerate={onRegeneratePage ? () => handleRegenerate(storyPage.id) : undefined}
          isRegenerating={regeneratingPageId === storyPage.id}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {allPages.map((page, index) => (
          <View key={page.type === 'story' ? (page.data as StoryPageType).id : page.type}>
            {renderPageContent(page, index)}
          </View>
        ))}
      </ScrollView>

      {currentPage > 0 && (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonLeft]}
          onPress={() => goToPage(currentPage - 1)}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
      )}
      {currentPage < allPages.length - 1 && (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonRight]}
          onPress={() => goToPage(currentPage + 1)}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.indicatorContainer, { bottom: insets.bottom + SPACING.md }]}>
        <PageIndicator total={allPages.length} current={currentPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pager: { flex: 1 },
  pageWrapper: { flex: 1, height: SCREEN_HEIGHT },
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
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  navButtonLeft: { left: SPACING.md },
  navButtonRight: { right: SPACING.md },
  navButtonText: { fontSize: 36, color: '#FFFFFF', fontWeight: '300' },
});
