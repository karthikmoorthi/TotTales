import { Platform } from 'react-native';
import { supabase } from './client';
import { STORAGE_BUCKETS } from '@/utils/constants';
import { compressImage, getChildPhotoPath, getStoryImagePath } from '@/utils/helpers';
import * as FileSystem from 'expo-file-system';

/**
 * Convert image URI to bytes for upload (handles both web and native)
 */
async function getImageBytes(photoUri: string): Promise<Uint8Array> {
  if (Platform.OS === 'web') {
    // On web, fetch the blob and convert to array buffer
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } else {
    // On native, use FileSystem
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

/**
 * Upload a child's photo to storage
 */
export async function uploadChildPhoto(
  userId: string,
  childId: string,
  photoUri: string,
  photoIndex: number
): Promise<string> {
  let uriToUpload = photoUri;

  // Only compress on native (web blob URLs don't work with ImageManipulator)
  if (Platform.OS !== 'web') {
    uriToUpload = await compressImage(photoUri);
  }

  const bytes = await getImageBytes(uriToUpload);
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
