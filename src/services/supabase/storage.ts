import { supabase } from './client';
import { STORAGE_BUCKETS } from '@/utils/constants';
import { compressImage, getChildPhotoPath, getStoryImagePath } from '@/utils/helpers';
import * as FileSystem from 'expo-file-system';

/**
 * Upload a child's photo to storage
 */
export async function uploadChildPhoto(
  userId: string,
  childId: string,
  photoUri: string,
  photoIndex: number
): Promise<string> {
  // Compress the image first
  const compressedUri = await compressImage(photoUri);

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(compressedUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert to ArrayBuffer
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const path = getChildPhotoPath(userId, childId, photoIndex);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.CHILD_PHOTOS)
    .upload(path, bytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.CHILD_PHOTOS)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload a generated story image to storage
 */
export async function uploadStoryImage(
  storyId: string,
  pageNumber: number,
  imageBase64: string
): Promise<string> {
  // Convert base64 to ArrayBuffer
  const binaryString = atob(imageBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const path = getStoryImagePath(storyId, pageNumber);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.STORY_IMAGES)
    .upload(path, bytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.STORY_IMAGES)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a photo from storage
 */
export async function deletePhoto(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

/**
 * Get signed URL for private image (child photos)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Download image as base64
 */
export async function downloadImageAsBase64(
  bucket: string,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;

  // Convert blob to base64
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });
}
