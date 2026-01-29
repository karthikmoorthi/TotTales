import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildCharacterConsistentPrompt } from './characterConsistency';
import { retryWithBackoff } from '@/utils/helpers';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

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

/**
 * Generate an illustration for a story page using Gemini's image generation
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

  // Use retry logic for API calls
  return retryWithBackoff(async () => {
    try {
      // Using Gemini 2.5 Flash Image for image generation
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-image',
        generationConfig: {
          responseModalities: ['Text', 'Image'],
        } as any,
      });

      const response = await model.generateContent(fullPrompt);
      const result = response.response;

      // Extract image from response
      const parts = result.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if ((part as any).inlineData?.data) {
          return {
            base64: (part as any).inlineData.data,
            mimeType: (part as any).inlineData.mimeType || 'image/png',
          };
        }
      }

      throw new Error('No image generated in response');
    } catch (error: any) {
      // Check if it's a content safety error
      if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
        throw new Error('Image generation blocked by safety filters. Please try a different scene.');
      }
      throw error;
    }
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
 * Alternative: Generate image using Imagen via Vertex AI
 * This is a fallback if Gemini image generation isn't available
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
