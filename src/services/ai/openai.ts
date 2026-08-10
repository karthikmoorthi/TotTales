import { supabase } from '@/services/supabase/client';

interface ImageInput {
  base64: string;
  mimeType?: string;
}

interface TextFunctionResponse {
  text?: string;
  error?: string;
}

function describeFunctionError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'The AI service could not be reached.';
}

async function invokeTextFunction(
  prompt: string,
  images: ImageInput[] = []
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<TextFunctionResponse>(
    'openai-text',
    { body: { prompt, images } }
  );

  if (error) {
    throw new Error(
      `OpenAI text service is unavailable. ${describeFunctionError(error)}`
    );
  }

  if (!data?.text) {
    throw new Error(data?.error || 'OpenAI returned an empty text response.');
  }

  return data.text;
}

/**
 * Generate text through a server-side Supabase Edge Function.
 * OPENAI_API_KEY must only exist as a Supabase secret.
 */
export async function generateText(prompt: string): Promise<string> {
  return invokeTextFunction(prompt);
}

/**
 * Generate text from text plus image inputs through the same server boundary.
 */
export async function generateWithImages(
  prompt: string,
  images: ImageInput[]
): Promise<string> {
  return invokeTextFunction(prompt, images);
}
