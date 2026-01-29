/**
 * Script to generate preview images for themes and art styles
 * Run with: npx ts-node scripts/generatePreviewImages.ts
 *
 * This generates static preview images that don't include any children,
 * showcasing the theme/style aesthetics only.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
require('dotenv').config();

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role for admin operations

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
const BASE_STYLE_SCENE = `A cozy treehouse in a sunny meadow with wildflowers, butterflies, and a friendly bird on a branch. No people or characters.`;

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

async function generateImage(prompt: string): Promise<GeneratedImage> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
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
}

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

  const path = `${type}s/${name}.jpg`;

  // Delete existing file if present
  await supabase.storage.from('preview-images').remove([path]);

  const { data, error } = await supabase.storage
    .from('preview-images')
    .upload(path, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('preview-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

async function updateThemePreviewUrl(name: string, url: string): Promise<void> {
  const { error } = await supabase
    .from('themes')
    .update({ preview_image_url: url })
    .eq('name', name);

  if (error) throw error;
}

async function updateStylePreviewUrl(name: string, url: string): Promise<void> {
  const { error } = await supabase
    .from('art_styles')
    .update({ preview_image_url: url })
    .eq('name', name);

  if (error) throw error;
}

async function generateThemePreviews(): Promise<void> {
  console.log('\n📚 Generating Theme Preview Images...\n');

  for (const [themeName, prompt] of Object.entries(THEME_PREVIEW_PROMPTS)) {
    try {
      console.log(`  🎨 Generating: ${themeName}...`);

      const image = await generateImage(prompt);
      console.log(`  📤 Uploading: ${themeName}...`);

      const url = await uploadPreviewImage('theme', themeName, image.base64);
      console.log(`  💾 Updating database: ${themeName}...`);

      await updateThemePreviewUrl(themeName, url);
      console.log(`  ✅ Done: ${themeName}\n`);

      // Delay between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Failed: ${themeName}`, error);
    }
  }
}

async function generateStylePreviews(): Promise<void> {
  console.log('\n🎨 Generating Art Style Preview Images...\n');

  for (const [styleName, styleModifier] of Object.entries(ART_STYLE_MODIFIERS)) {
    try {
      console.log(`  🖌️  Generating: ${styleName}...`);

      const prompt = `${BASE_STYLE_SCENE}\n\n${styleModifier}`;
      const image = await generateImage(prompt);
      console.log(`  📤 Uploading: ${styleName}...`);

      const url = await uploadPreviewImage('style', styleName, image.base64);
      console.log(`  💾 Updating database: ${styleName}...`);

      await updateStylePreviewUrl(styleName, url);
      console.log(`  ✅ Done: ${styleName}\n`);

      // Delay between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Failed: ${styleName}`, error);
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Preview Image Generation\n');
  console.log('=' .repeat(50));

  // Check for required environment variables
  if (!GEMINI_API_KEY) {
    console.error('❌ Missing EXPO_PUBLIC_GEMINI_API_KEY');
    process.exit(1);
  }
  if (!SUPABASE_URL) {
    console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL');
    process.exit(1);
  }
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
    console.log('💡 Add this to your .env file to run this script');
    process.exit(1);
  }

  try {
    await generateThemePreviews();
    await generateStylePreviews();

    console.log('=' .repeat(50));
    console.log('\n🎉 All preview images generated successfully!\n');
  } catch (error) {
    console.error('\n❌ Error generating preview images:', error);
    process.exit(1);
  }
}

main();
