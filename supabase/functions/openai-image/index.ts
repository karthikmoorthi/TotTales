import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ImageRequest = {
  prompt?: string;
  referenceImages?: string[];
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64ToBlob(value: string): Blob {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: "image/jpeg" });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return json({ error: "AI generation is not configured yet." }, 503);
  }

  let body: ImageRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const prompt = body.prompt?.trim();
  const referenceImages = Array.isArray(body.referenceImages)
    ? body.referenceImages
    : [];
  if (!prompt) return json({ error: "A prompt is required." }, 400);
  if (prompt.length > 32_000) return json({ error: "Prompt is too long." }, 413);
  if (referenceImages.length > 3) {
    return json({ error: "At most three reference images are supported." }, 400);
  }
  if (referenceImages.some((image) => !image || image.length > 14_000_000)) {
    return json({ error: "One or more reference images are invalid or too large." }, 413);
  }

  const model = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2";
  let response: Response;

  if (referenceImages.length) {
    const form = new FormData();
    form.set("model", model);
    form.set("prompt", prompt);
    form.set("size", "1024x1536");
    referenceImages.forEach((image, index) => {
      form.append("image[]", base64ToBlob(image), `reference-${index + 1}.jpg`);
    });

    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, prompt, size: "1024x1536" }),
    });
  }

  const payload = await response.json().catch(() => ({})) as {
    data?: Array<{ b64_json?: string }>;
    error?: { message?: string };
  };
  if (!response.ok) {
    console.error("OpenAI image request failed", response.status);
    return json(
      { error: payload.error?.message || "The image model request failed." },
      response.status >= 500 ? 502 : response.status
    );
  }

  const base64 = payload.data?.[0]?.b64_json;
  if (!base64) return json({ error: "The image model returned no image." }, 502);

  return json({ base64, mimeType: "image/png" });
});
