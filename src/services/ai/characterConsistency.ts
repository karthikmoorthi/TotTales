import { generateWithImages } from './gemini';
import { imageToBase64 } from '@/utils/helpers';
import { getSignedUrl } from '@/services/supabase/storage';
import { STORAGE_BUCKETS } from '@/utils/constants';

/**
 * Check if a URL is a Supabase storage URL
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage') || url.includes('supabase.in/storage');
}

/**
 * Extract storage path from Supabase public URL
 */
function extractStoragePath(url: string): string | null {
  // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Analyze photos and generate a detailed character description
 * This description is used to maintain consistency across generated images
 */
export async function analyzeChildPhotos(
  photoUris: string[],
  childName: string,
  childAge?: number,
  childGender?: string
): Promise<string> {
  // Convert photos to base64, handling both local URIs and Supabase URLs
  const images = await Promise.all(
    photoUris.map(async (uri) => {
      let imageUri = uri;

      // If it's a Supabase storage URL, get a signed URL for private bucket access
      if (isSupabaseStorageUrl(uri)) {
        const path = extractStoragePath(uri);
        if (path) {
          imageUri = await getSignedUrl(STORAGE_BUCKETS.CHILD_PHOTOS, path, 300); // 5 min expiry
        }
      }

      return {
        base64: await imageToBase64(imageUri),
        mimeType: 'image/jpeg',
      };
    })
  );

  const prompt = `You are helping create a children's storybook. Analyze these photos of a child and provide a detailed character description that can be used to maintain consistency when generating illustrations.

Child's name: ${childName}
${childAge ? `Age: ${childAge} years old` : ''}
${childGender ? `Gender: ${childGender}` : ''}

Please describe the following physical features in detail:
1. Hair: color, style, length, texture
2. Eyes: color, shape
3. Skin tone
4. Face shape and distinguishing features
5. Approximate body type/build for their age
6. Any distinctive features (dimples, freckles, etc.)

Format your response as a concise character description paragraph that could be included in an image generation prompt. Focus on features that are most distinctive and would help maintain consistency.

Example format:
"A 4-year-old girl with curly auburn hair that reaches her shoulders, bright green eyes, light skin with a few freckles across her nose, round face with rosy cheeks and a small dimple when she smiles."

Only provide the description paragraph, no additional commentary.`;

  const description = await generateWithImages(prompt, images);
  return description.trim();
}

/**
 * Create an image prompt with character consistency
 */
export function buildCharacterConsistentPrompt(
  artStyleModifier: string,
  characterDescription: string,
  childName: string,
  sceneDescription: string
): string {
  return `${artStyleModifier}

CHARACTER: Maintain EXACT consistency with this description.
Name: ${childName}
Description: ${characterDescription}

SCENE: ${sceneDescription}

REQUIREMENTS:
- Children's book illustration style
- ${childName} is the focal point and hero of the scene
- Bright, cheerful, safe environment appropriate for toddlers
- Expressive, friendly character poses
- No text or words in the image
- Suitable for young children (ages 2-6)
- High quality, detailed illustration`;
}

/**
 * Validate that the character description is appropriate
 */
export function validateCharacterDescription(description: string): boolean {
  // Check for inappropriate content
  const inappropriateTerms = [
    'naked',
    'nude',
    'violent',
    'scary',
    'blood',
    'weapon',
    'adult',
  ];

  const lowerDescription = description.toLowerCase();
  return !inappropriateTerms.some((term) => lowerDescription.includes(term));
}
