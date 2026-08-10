import { buildCharacterConsistentPrompt } from './characterConsistency';
import { retryWithBackoff } from '@/utils/helpers';
import { supabase } from '@/services/supabase/client';

interface ImageGenerationInput {
  artStyleModifier: string;
  characterDescription: string;
  childName: string;
  sceneDescription: string;
  imagePrompt: string;
  referencePhotoBase64?: string[];
}

interface GeneratedImage {
  base64: string;
  mimeType: string;
}

interface ImageFunctionResponse {
  base64?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Generate an illustration for a story page using the server-side AI provider.
 */
export async function generateStoryImage(
  input: ImageGenerationInput
): Promise<GeneratedImage> {
  const {
    artStyleModifier,
    characterDescription,
    childName,
    sceneDescription,
    imagePrompt,
  } = input;

  // Build a comprehensive prompt for character consistency
  const fullPrompt = buildCharacterConsistentPrompt(
    artStyleModifier,
    characterDescription,
    childName,
    `${sceneDescription}\n\nAdditional details: ${imagePrompt}`
  );

  console.log('[ImageGenerator] Requesting server-side image generation...');

  // Use retry logic for API calls
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.functions.invoke<ImageFunctionResponse>(
      'openai-image',
      {
        body: {
          prompt: fullPrompt,
          referenceImages: input.referencePhotoBase64 || [],
        },
      }
    );

    if (error) {
      console.error('[ImageGenerator] Edge Function error:', error.message);
      throw new Error(`OpenAI image service is unavailable. ${error.message}`);
    }

    if (!data?.base64) {
      throw new Error(data?.error || 'OpenAI returned an empty image response.');
    }

    return {
      base64: data.base64,
      mimeType: data.mimeType || 'image/png',
    };
  }, 3, 2000);
}

/**
 * Generate multiple images in sequence (to avoid rate limits)
 */
export async function generateStoryImages(
  inputs: ImageGenerationInput[],
  onProgress?: (current: number, total: number) => void
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];

  for (let i = 0; i < inputs.length; i++) {
    onProgress?.(i + 1, inputs.length);

    const image = await generateStoryImage(inputs[i]);
    results.push(image);

    // Add delay between requests to avoid rate limiting
    if (i < inputs.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * A fallback provider can be added behind the same server boundary later.
 */
export async function generateImageFallback(
  prompt: string
): Promise<GeneratedImage | null> {
  // This would connect to Imagen API through Vertex AI
  // For now, return null to indicate fallback not available
  console.warn('Image generation fallback not implemented');
  return null;
}

/**
 * Validate image generation prompt for safety
 */
export function validateImagePrompt(prompt: string): { valid: boolean; reason?: string } {
  const lowerPrompt = prompt.toLowerCase();

  // Check for inappropriate content
  const blockedTerms = [
    'naked', 'nude', 'violent', 'blood', 'gore', 'weapon',
    'gun', 'knife', 'scary', 'horror', 'adult', 'sexy',
  ];

  for (const term of blockedTerms) {
    if (lowerPrompt.includes(term)) {
      return { valid: false, reason: `Prompt contains blocked term: ${term}` };
    }
  }

  // Check minimum length
  if (prompt.trim().length < 10) {
    return { valid: false, reason: 'Prompt is too short' };
  }

  return { valid: true };
}
