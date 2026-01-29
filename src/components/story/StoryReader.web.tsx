import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Story, StoryPage as StoryPageType } from '@/types';
import { COLORS, FONT_SIZES, SPACING, COMIC_BOOK } from '@/utils/constants';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [regeneratingPageId, setRegeneratingPageId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const flipProgress = useSharedValue(0);

  const allPages = [
    { type: 'cover' as const, data: story },
    ...pages.map((p) => ({ type: 'story' as const, data: p })),
    { type: 'end' as const, data: story },
  ];

  const handleRegenerate = async (pageId: string) => {
    if (!onRegeneratePage) return;
    try {
      setRegeneratingPageId(pageId);
      await onRegeneratePage(pageId);
    } finally {
      setRegeneratingPageId(null);
    }
  };

  const goToNextPage = useCallback(() => {
    if (isAnimating || currentPage >= allPages.length - 1) return;

    setIsAnimating(true);
    flipProgress.value = withTiming(
      1,
      {
        duration: COMIC_BOOK.flipDuration,
        easing: Easing.inOut(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(setCurrentPage)(currentPage + 1);
          flipProgress.value = 0;
          runOnJS(setIsAnimating)(false);
        }
      }
    );
  }, [currentPage, isAnimating, allPages.length]);

  const goToPrevPage = useCallback(() => {
    if (isAnimating || currentPage <= 0) return;

    setIsAnimating(true);
    flipProgress.value = withTiming(
      -1,
      {
        duration: COMIC_BOOK.flipDuration,
        easing: Easing.inOut(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(setCurrentPage)(currentPage - 1);
          flipProgress.value = 0;
          runOnJS(setIsAnimating)(false);
        }
      }
    );
  }, [currentPage, isAnimating]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  // Calculate book dimensions
  const bookWidth = Math.min(SCREEN_WIDTH * COMIC_BOOK.widthPercent, 500);
  const bookHeight = bookWidth / COMIC_BOOK.aspectRatio;
  const maxHeight = SCREEN_HEIGHT * 0.75;
  const finalHeight = Math.min(bookHeight, maxHeight);
  const finalWidth = finalHeight * COMIC_BOOK.aspectRatio;

  // Animated styles for page flip
  const currentPageStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [-1, 0, 1],
      [0, 0, -90]
    );
    const opacity = interpolate(
      flipProgress.value,
      [-1, -0.5, 0, 0.5, 1],
      [0, 0, 1, 1, 0]
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden' as const,
    };
  });

  const nextPageStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [90, 0]
    );
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [0, 0, 1]
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden' as const,
    };
  });

  const prevPageStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [-1, 0],
      [0, -90]
    );
    const opacity = interpolate(
      flipProgress.value,
      [-1, -0.5, 0],
      [1, 0, 0]
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden' as const,
    };
  });

  const renderPageContent = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= allPages.length) return null;
    const page = allPages[pageIndex];

    if (page.type === 'cover') {
      return (
        <View style={styles.coverPage}>
          {story.cover_image_url ? (
            <>
              <Image
                source={{ uri: story.cover_image_url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.coverGradient}
              />
            </>
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.coverContent}>
            <Text style={styles.coverTitle}>{story.title}</Text>
            <Text style={styles.coverSubtitle}>A TotTales Story</Text>
          </View>
          <Text style={styles.swipeHint}>Click arrows or use keyboard</Text>
        </View>
      );
    }

    if (page.type === 'end') {
      return (
        <View style={styles.endPage}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.secondaryDark]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.endContent}>
            <Text style={styles.endTitle}>The End</Text>
            <View style={styles.endDivider} />
            <Text style={styles.endSubtitle}>{story.title}</Text>
          </View>
        </View>
      );
    }

    const storyPage = page.data as StoryPageType;
    return (
      <StoryPage
        page={storyPage}
        isActive={currentPage === pageIndex}
        onRegenerate={onRegeneratePage ? () => handleRegenerate(storyPage.id) : undefined}
        isRegenerating={regeneratingPageId === storyPage.id}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.bookContainer}>
        <View
          style={[
            styles.book,
            {
              width: finalWidth,
              height: finalHeight,
            },
          ]}
        >
          {/* Previous page (for backward flip) */}
          {currentPage > 0 && (
            <Animated.View style={[styles.pageContainer, prevPageStyle]}>
              {renderPageContent(currentPage - 1)}
            </Animated.View>
          )}

          {/* Current page */}
          <Animated.View style={[styles.pageContainer, currentPageStyle]}>
            {renderPageContent(currentPage)}
          </Animated.View>

          {/* Next page (for forward flip) */}
          {currentPage < allPages.length - 1 && (
            <Animated.View style={[styles.pageContainer, nextPageStyle]}>
              {renderPageContent(currentPage + 1)}
            </Animated.View>
          )}
        </View>
      </View>

      {/* Navigation arrows */}
      {currentPage > 0 && (
        <Pressable
          style={[styles.navButton, styles.navButtonLeft]}
          onPress={goToPrevPage}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
      )}
      {currentPage < allPages.length - 1 && (
        <Pressable
          style={[styles.navButton, styles.navButtonRight]}
          onPress={goToNextPage}
        >
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      )}

      {/* Page indicator */}
      <View style={[styles.indicatorContainer, { bottom: insets.bottom + SPACING.md }]}>
        <PageIndicator total={allPages.length} current={currentPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bookContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  book: {
    backgroundColor: COMIC_BOOK.panelBackground,
    borderWidth: COMIC_BOOK.panelBorderWidth,
    borderColor: COMIC_BOOK.panelBorderColor,
    borderRadius: COMIC_BOOK.panelBorderRadius,
    overflow: 'hidden',
    // Web shadow
    shadowColor: COMIC_BOOK.shadowColor,
    shadowOffset: COMIC_BOOK.shadowOffset,
    shadowOpacity: COMIC_BOOK.shadowOpacity,
    shadowRadius: COMIC_BOOK.shadowRadius,
  },
  pageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  coverPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  coverContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  coverTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: SPACING.md,
  },
  coverSubtitle: {
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  swipeHint: {
    position: 'absolute',
    bottom: SPACING.lg,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  endPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  endContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  endTitle: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  endDivider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  endSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
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
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    cursor: 'pointer',
  },
  navButtonLeft: {
    left: SPACING.sm,
  },
  navButtonRight: {
    right: SPACING.sm,
  },
  navButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
