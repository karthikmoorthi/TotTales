import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT } from './constants';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Compress and resize an image
 */
export async function compressImage(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    // ImageManipulator doesn't work well on web with blob URLs
    // Return original URI - web images are typically already optimized
    return uri;
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_MAX_WIDTH, height: IMAGE_MAX_HEIGHT } }],
    { compress: IMAGE_COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Convert image URI to base64
 */
export async function imageToBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    // On web, fetch the blob and convert to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // On native, use FileSystem
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  }
}

/**
 * Get file extension from URI
 */
export function getFileExtension(uri: string): string {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Generate a storage path for child photos
 */
export function getChildPhotoPath(userId: string, childId: string, photoIndex: number): string {
  const timestamp = Date.now();
  return `${userId}/${childId}/${timestamp}-${photoIndex}.jpg`;
}

/**
 * Generate a storage path for story images
 */
export function getStoryImagePath(storyId: string, pageNumber: number): string {
  const timestamp = Date.now();
  return `${storyId}/page-${pageNumber}-${timestamp}.jpg`;
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
