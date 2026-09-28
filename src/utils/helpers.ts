import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT } from './constants';
import { convertHeicToJpeg } from './heic';

async function normalizeWebImage(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('The selected photo could not be loaded. Please choose it again.');
  }

  const source = await response.blob();
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    try {
      // Chrome cannot decode iPhone HEIC/HEIF photos natively. Convert them
      // entirely in the browser so family photos never leave the device until
      // the normalized JPEG is ready for the user's Supabase storage.
      const jpeg = await convertHeicToJpeg(source, IMAGE_COMPRESSION_QUALITY);
      bitmap = await createImageBitmap(jpeg);
    } catch {
      throw new Error(
        'This photo could not be prepared. Please choose a JPEG, PNG, WebP, or a standard iPhone HEIC photo.'
      );
    }
  }

  const scale = Math.min(
    1,
    IMAGE_MAX_WIDTH / bitmap.width,
    IMAGE_MAX_HEIGHT / bitmap.height
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('This browser could not prepare the selected photo.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('This browser could not convert the selected photo.'));
      },
      'image/jpeg',
      IMAGE_COMPRESSION_QUALITY
    );
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      if (base64) resolve(base64);
      else reject(new Error('The selected photo could not be encoded.'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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
    const normalized = await normalizeWebImage(uri);
    return URL.createObjectURL(normalized);
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
    return blobToBase64(await normalizeWebImage(uri));
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
export function getStoryImagePath(
  storyId: string,
  pageNumber: number,
  mimeType: string = 'image/png'
): string {
  const timestamp = Date.now();
  const extension = mimeType === 'image/jpeg' ? 'jpg' : 'png';
  return `${storyId}/page-${pageNumber}-${timestamp}.${extension}`;
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
