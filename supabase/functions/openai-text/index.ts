import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { isAuthenticatedUserRequest } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ImageInput = {
  base64: string;
  mimeType?: string;
};

type TextRequest = {
  prompt?: string;
  images?: ImageInput[];
};

function detectImageMimeType(base64: string): string | null {
  let bytes: number[];
  try {
    bytes = Array.from(atob(base64.slice(0, 32)), (char) => char.charCodeAt(0));
  } catch {
    return null;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  const signature = String.fromCharCode(...bytes);
  if (signature.startsWith("GIF87a") || signature.startsWith("GIF89a")) {
    return "image/gif";
  }
  if (signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractOutputText(payload: Record<string, unknown>): string | null {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (!Array.isArray(payload.output)) return null;

  const parts: string[] = [];
  for (const item of payload.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const candidate = part as { type?: string; text?: string };
      if (candidate.type === "output_text" && candidate.text) {
        parts.push(candidate.text);
      }
    }
  }

  return parts.length ? parts.join("\n").trim() : null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!isAuthenticatedUserRequest(request)) {
    return json({ error: "Authentication required." }, 401);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return json({ error: "AI generation is not configured yet." }, 503);
  }

  let body: TextRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const prompt = body.prompt?.trim();
  const images = Array.isArray(body.images) ? body.images : [];
  if (!prompt) return json({ error: "A prompt is required." }, 400);
  if (prompt.length > 60_000) return json({ error: "Prompt is too long." }, 413);
  if (images.length > 3) return json({ error: "At most three images are supported." }, 400);
  if (images.some((image) => !image.base64 || image.base64.length > 14_000_000)) {
    return json({ error: "One or more image inputs are invalid or too large." }, 413);
  }

  const normalizedImages = images.map((image) => ({
    ...image,
    mimeType: detectImageMimeType(image.base64),
  }));
  if (normalizedImages.some((image) => !image.mimeType)) {
    return json(
      { error: "One or more photos are not a valid JPEG, PNG, GIF, or WebP image. Please upload the photos again." },
      415
    );
  }

  const content: Array<Record<string, string>> = [
    { type: "input_text", text: prompt },
    ...normalizedImages.map((image) => ({
      type: "input_image",
      image_url: `data:${image.mimeType};base64,${image.base64}`,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_TEXT_MODEL") || "gpt-5.4-mini",
      input: [{ role: "user", content }],
    }),
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const apiError = payload.error as {
      code?: string;
      message?: string;
      param?: string;
      type?: string;
    } | undefined;
    console.error("OpenAI text request failed", {
      status: response.status,
      code: apiError?.code,
      message: apiError?.message,
      param: apiError?.param,
      type: apiError?.type,
    });
    return json(
      { error: apiError?.message || "The text model request failed." },
      response.status >= 500 ? 502 : response.status
    );
  }

  const text = extractOutputText(payload);
  if (!text) return json({ error: "The text model returned no text." }, 502);

  return json({ text });
});
