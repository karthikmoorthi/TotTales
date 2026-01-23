import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Text generation model
export const textModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite',
});

// Vision model for analyzing images
export const visionModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite',
});

// Image generation model (for Imagen via Gemini)
export const imageModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite',
});

/**
 * Create an image part from base64 data
 */
export function createImagePart(base64Data: string, mimeType: string = 'image/jpeg'): Part {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

/**
 * Generate text with the Gemini model
 */
export async function generateText(prompt: string): Promise<string> {
  const result = await textModel.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Generate text with images (multimodal)
 */
export async function generateWithImages(
  prompt: string,
  images: { base64: string; mimeType?: string }[]
): Promise<string> {
  const imageParts = images.map((img) =>
    createImagePart(img.base64, img.mimeType || 'image/jpeg')
  );

  const result = await visionModel.generateContent([prompt, ...imageParts]);
  const response = result.response;
  return response.text();
}

/**
 * Safety settings for content generation
 */
export const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

export default genAI;
