/**
 * Service to generate preview images for themes and art styles
 * These are static images without any children, showcasing the theme/style aesthetics
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/services/supabase/client';
import { STORAGE_BUCKETS } from '@/utils/constants';
import { retryWithBackoff } from '@/utils/helpers';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

// Theme preview prompts - whimsical, toddler-friendly scenes that showcase each theme
const THEME_PREVIEW_PROMPTS: Record<string, string> = {
  space_adventure: `A delightful toddler-friendly space scene: a cute smiling rocket ship with round windows flying past a big friendly moon with a happy face, surrounded by colorful candy-like planets in pink, purple, and turquoise. Twinkling cartoon stars everywhere, a cute alien waving from a tiny flying saucer. Bright, cheerful colors, rounded soft shapes, very whimsical and playful like a Pixar animation for babies. No human characters. High quality children's book illustration.`,

  underwater_explorer: `An adorable toddler-friendly underwater world: a cute cartoon submarine with big round portholes exploring a magical coral reef. Smiling clownfish, a friendly purple octopus waving, a happy sea turtle with a patterned shell, bubbles everywhere. The coral is in bright candy colors - pink, orange, turquoise. Treasure chest with sparkles peeking out. Warm glowing light rays from above. Rounded, soft, bubbly shapes perfect for toddlers. No human characters. High quality children's book illustration.`,

  enchanted_forest: `A magical toddler-friendly enchanted forest: giant colorful mushrooms with polka dots in red and white, cute woodland animals peeking out - a fluffy bunny, a friendly owl with big eyes, a tiny deer. Fairy houses built into tree stumps with glowing windows. Fireflies creating magical sparkles. A rainbow peeking through the trees. Flowers with smiling faces. Soft dappled golden sunlight. Everything round, cute, and cozy. No human characters. High quality children's book illustration.`,

  dinosaur_land: `An adorable toddler-friendly dinosaur world: a super cute baby T-Rex with big sparkling eyes and a friendly smile standing next to a gentle long-necked Brachiosaurus. A happy Triceratops with colorful horns munching on giant leaves. Prehistoric jungle with oversized tropical plants and ferns. A cute volcano in the background puffing out heart-shaped clouds. Bright, warm, sunny colors - greens, oranges, yellows. Everything chunky and adorable. No human characters. High quality children's book illustration.`,

  superhero_academy: `A fun toddler-friendly superhero headquarters: a colorful building shaped like a giant star with a superhero cape flag waving on top. Cute superhero masks and capes displayed in windows. A rainbow swooshing across the sky. Fluffy clouds shaped like lightning bolts and stars. Training dummies that look like friendly robots. Bright bold primary colors - red, blue, yellow. Everything looks fun, safe, and exciting. No human characters. High quality children's book illustration.`,

  fairy_tale_kingdom: `A dreamy toddler-friendly fairy tale castle: a pink and purple castle with swirly towers topped with golden flags, sitting on fluffy clouds. A sparkling rainbow arching over the castle. Cute unicorn peeking from behind a tower. Magic wands with star tips floating in the air. Flowers and butterflies everywhere. A winding path made of colorful stepping stones. Golden sparkles and fairy dust throughout. Soft pastel colors with pops of gold. No human characters. High quality children's book illustration.`,

  safari_adventure: `A cheerful toddler-friendly African safari scene: an adorable cartoon giraffe with long eyelashes next to a smiling baby elephant spraying water from its trunk. A friendly lion with a fluffy mane lounging under a big acacia tree. Cute zebras with bold black and white stripes. A happy hippo peeking out of a watering hole. Colorful birds flying overhead. Warm golden savanna grass, bright blue sky with puffy white clouds. Everything chunky, round, and huggable looking. No human characters. High quality children's book illustration.`,

  arctic_expedition: `A magical toddler-friendly Arctic wonderland: cute chunky igloos with warm glowing windows, adorable fluffy polar bear cubs playing in the snow, happy penguins sliding down a sparkly ice slide. Magnificent northern lights swirling in green, pink and purple across the sky. Friendly seals on ice floes waving their flippers. Snowflakes that look like little stars. Shimmering blue and white icebergs with a magical glow. Everything soft, round, and cozy despite the snow. No human characters. High quality children's book illustration.`,
};

// Art style preview prompts - same scene in different styles
const BASE_STYLE_SCENE = `A cozy treehouse in a sunny meadow with wildflowers, butterflies, and a friendly bird on a branch. No people or characters. Square format.`;

const ART_STYLE_MODIFIERS: Record<string, string> = {
  watercolor_whimsy: `Style: Soft watercolor illustration with gentle color gradients, whimsical details, and a dreamy quality. Soft pastels and muted tones with delicate brushstrokes visible.`,

  bright_cartoon: `Style: Bright, bold cartoon illustration with vibrant saturated colors, clean outlines, and a playful energetic feel. Modern animated style with cheerful colors.`,

  storybook_classic: `Style: Classic golden age children's book illustration with rich warm colors, detailed textures, and a timeless quality. Reminiscent of beloved vintage picture books.`,

  paper_cutout: `Style: Paper cutout collage style with layered textures, bold flat colors like construction paper, and visible paper edges. Eric Carle inspired with dimensional quality.`,

  soft_digital: `Style: Soft digital painting with smooth gradients, gentle lighting, and a modern polished look. Cute rounded shapes with harmonious pastel palette.`,

  crayon_charm: `Style: Charming crayon or colored pencil illustration with visible waxy texture strokes, rich colors, and a warm hand-drawn quality. Paper texture visible.`,
};

interface GeneratedImage {
  base64: string;
  mimeType: string;
}

/**
 * Generate a preview image using Gemini
 */
async function generatePreviewImage(prompt: string): Promise<GeneratedImage> {
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
      generationConfig: {
        responseModalities: ['Text', 'Image'],
      } as any,
    });

    const response = await model.generateContent(prompt);
    const result = response.response;
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
  }, 3, 2000);
}

/**
 * Upload a preview image to Supabase storage
 * Uses the story-images bucket with a 'previews/' prefix
 */
async function uploadPreviewImage(
  type: 'theme' | 'style',
  name: string,
  imageBase64: string
): Promise<string> {
  const binaryString = atob(imageBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Use story-images bucket with previews/ prefix
  const path = `previews/${type}s/${name}.jpg`;

  // Try to delete existing file first (ignore errors)
  try {
    await supabase.storage
      .from(STORAGE_BUCKETS.STORY_IMAGES)
      .remove([path]);
  } catch (e) {
    // Ignore - file may not exist
  }

  // Upload the new image
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.STORY_IMAGES)
    .upload(path, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.STORY_IMAGES)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Generate and upload a theme preview image
 */
export async function generateThemePreview(themeName: string): Promise<string | null> {
  const prompt = THEME_PREVIEW_PROMPTS[themeName];
  if (!prompt) {
    console.warn(`No preview prompt found for theme: ${themeName}`);
    return null;
  }

  try {
    const image = await generatePreviewImage(prompt);
    const url = await uploadPreviewImage('theme', themeName, image.base64);

    // Update database
    await supabase
      .from('themes')
      .update({ preview_image_url: url })
      .eq('name', themeName);

    return url;
  } catch (error) {
    console.error(`Failed to generate preview for theme ${themeName}:`, error);
    return null;
  }
}

/**
 * Generate and upload an art style preview image
 */
export async function generateStylePreview(styleName: string): Promise<string | null> {
  const styleModifier = ART_STYLE_MODIFIERS[styleName];
  if (!styleModifier) {
    console.warn(`No preview prompt found for style: ${styleName}`);
    return null;
  }

  try {
    const prompt = `${BASE_STYLE_SCENE}\n\n${styleModifier}`;
    const image = await generatePreviewImage(prompt);
    const url = await uploadPreviewImage('style', styleName, image.base64);

    // Update database
    await supabase
      .from('art_styles')
      .update({ preview_image_url: url })
      .eq('name', styleName);

    return url;
  } catch (error) {
    console.error(`Failed to generate preview for style ${styleName}:`, error);
    return null;
  }
}

/**
 * Generate all missing theme previews
 */
export async function generateMissingThemePreviews(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<void> {
  // Get themes without preview images
  const { data: themes } = await supabase
    .from('themes')
    .select('name, preview_image_url')
    .is('preview_image_url', null);

  if (!themes || themes.length === 0) {
    console.log('All themes already have preview images');
    return;
  }

  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    onProgress?.(i + 1, themes.length, theme.name);

    await generateThemePreview(theme.name);

    // Delay between requests to avoid rate limiting
    if (i < themes.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Generate all missing art style previews
 */
export async function generateMissingStylePreviews(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<void> {
  // Get styles without preview images
  const { data: styles } = await supabase
    .from('art_styles')
    .select('name, preview_image_url')
    .is('preview_image_url', null);

  if (!styles || styles.length === 0) {
    console.log('All art styles already have preview images');
    return;
  }

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    onProgress?.(i + 1, styles.length, style.name);

    await generateStylePreview(style.name);

    // Delay between requests to avoid rate limiting
    if (i < styles.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Generate all missing preview images (themes and styles)
 */
export async function generateAllMissingPreviews(
  onProgress?: (stage: 'themes' | 'styles', current: number, total: number, name: string) => void
): Promise<void> {
  await generateMissingThemePreviews((current, total, name) =>
    onProgress?.('themes', current, total, name)
  );

  await generateMissingStylePreviews((current, total, name) =>
    onProgress?.('styles', current, total, name)
  );
}
