import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { COMIC_BOOK } from '@/utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ComicBookContainerProps {
  children: React.ReactNode;
}

export function ComicBookContainer({ children }: ComicBookContainerProps) {
  const bookWidth = SCREEN_WIDTH * COMIC_BOOK.widthPercent;
  const bookHeight = bookWidth / COMIC_BOOK.aspectRatio;

  // Ensure the book fits within the screen height with some padding
  const maxHeight = SCREEN_HEIGHT * 0.75;
  const finalHeight = Math.min(bookHeight, maxHeight);
  const finalWidth = finalHeight * COMIC_BOOK.aspectRatio;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.book,
          {
            width: finalWidth,
            height: finalHeight,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    ...Platform.select({
      ios: {
        shadowColor: COMIC_BOOK.shadowColor,
        shadowOffset: COMIC_BOOK.shadowOffset,
        shadowOpacity: COMIC_BOOK.shadowOpacity,
        shadowRadius: COMIC_BOOK.shadowRadius,
      },
      android: {
        elevation: COMIC_BOOK.elevation,
      },
      web: {
        shadowColor: COMIC_BOOK.shadowColor,
        shadowOffset: COMIC_BOOK.shadowOffset,
        shadowOpacity: COMIC_BOOK.shadowOpacity,
        shadowRadius: COMIC_BOOK.shadowRadius,
      },
    }),
  },
});
