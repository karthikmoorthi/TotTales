import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';

interface ImageInput {
  base64: string;
  mimeType?: string;
}

interface TextFunctionResponse {
  text?: string;
  error?: string;
}

async function describeFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.clone().json()) as {
        error?: unknown;
      };
      if (typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error.trim();
      }
    } catch {
      // Fall back to the SDK error below when the function did not return JSON.
    }
  }

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
    const detail = await describeFunctionError(error);
    throw new Error(
      `OpenAI text service is unavailable. ${detail}`
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
