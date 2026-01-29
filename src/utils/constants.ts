// App Constants
export const APP_NAME = 'TotTales';

// Story Generation
export const DEFAULT_PAGE_COUNT = 6;
export const MAX_REGENERATION_ATTEMPTS = 3;
export const MAX_PHOTOS_PER_CHILD = 5;

// Image Settings
export const IMAGE_COMPRESSION_QUALITY = 0.8;
export const IMAGE_MAX_WIDTH = 1024;
export const IMAGE_MAX_HEIGHT = 1024;

// API Timeouts (ms)
export const API_TIMEOUT = 30000;
export const GENERATION_TIMEOUT = 120000;

// Storage Buckets
export const STORAGE_BUCKETS = {
  CHILD_PHOTOS: 'child-photos',
  STORY_IMAGES: 'story-images',
  PREVIEW_IMAGES: 'preview-images',
} as const;

// Generation Stages
export const GENERATION_STAGES = {
  ANALYZING: 'analyzing',
  WRITING: 'writing',
  ILLUSTRATING: 'illustrating',
  FINALIZING: 'finalizing',
} as const;

// Story Status
export const STORY_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Page Status
export const PAGE_STATUS = {
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Colors
export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#A5B4FC',
  secondary: '#EC4899',
  secondaryDark: '#DB2777',
  secondaryLight: '#F9A8D4',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
} as const;

// Typography
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Comic Book Styling
export const COMIC_BOOK = {
  // Container dimensions
  widthPercent: 0.7, // 70% of screen width
  aspectRatio: 3 / 4, // 3:4 portrait ratio

  // Panel styling
  panelBorderWidth: 3,
  panelBorderColor: '#374151',
  panelBorderRadius: 8,
  panelBackground: '#FFFFFF',

  // Caption box styling
  captionBackground: '#FFFBEB',
  captionBorderColor: '#374151',
  captionBorderWidth: 2,

  // Shadow for depth
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,

  // Animation
  flipDuration: 400,

  // Text colors
  titleColor: '#1E293B',
  textColor: '#1E293B',
  pageNumberColor: '#6B7280',
} as const;
