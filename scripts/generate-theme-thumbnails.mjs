/**
 * Standalone script to generate theme thumbnail images
 * Run with: node scripts/generate-theme-thumbnails.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://hdwyyadvescgvhwbmtnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkd3l5YWR2ZXNjZ3Zod2JtdG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODI2OTEsImV4cCI6MjA4NDQ1ODY5MX0.hxo3mJEGp1LfmcHjqjOkn-7sF5zgYtGRQlsvnx-FjS4';
const GEMINI_API_KEY = 'AIzaSyDjWwfAuDhPLGMCa3eKwF0JGbXpyiguiig';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Theme prompts - whimsical, toddler-friendly scenes
const THEME_PROMPTS = {
  space_adventure: `A delightful toddler-friendly space scene: a cute smiling rocket ship with round windows flying past a big friendly moon with a happy face, surrounded by colorful candy-like planets in pink, purple, and turquoise. Twinkling cartoon stars everywhere, a cute alien waving from a tiny flying saucer. Bright, cheerful colors, rounded soft shapes, very whimsical and playful like a Pixar animation for babies. No human characters. High quality children's book illustration.`,

  underwater_explorer: `An adorable toddler-friendly underwater world: a cute cartoon submarine with big round portholes exploring a magical coral reef. Smiling clownfish, a friendly purple octopus waving, a happy sea turtle with a patterned shell, bubbles everywhere. The coral is in bright candy colors - pink, orange, turquoise. Treasure chest with sparkles peeking out. Warm glowing light rays from above. Rounded, soft, bubbly shapes perfect for toddlers. No human characters. High quality children's book illustration.`,

  enchanted_forest: `A magical toddler-friendly enchanted forest: giant colorful mushrooms with polka dots in red and white, cute woodland animals peeking out - a fluffy bunny, a friendly owl with big eyes, a tiny deer. Fairy houses built into tree stumps with glowing windows. Fireflies creating magical sparkles. A rainbow peeking through the trees. Flowers with smiling faces. Soft dappled golden sunlight. Everything round, cute, and cozy. No human characters. High quality children's book illustration.`,

  dinosaur_land: `An adorable toddler-friendly dinosaur world: a super cute baby T-Rex with big sparkling eyes and a friendly smile standing next to a gentle long-necked Brachiosaurus. A happy Triceratops with colorful horns munching on giant leaves. Prehistoric jungle with oversized tropical plants and ferns. A cute volcano in the background puffing out heart-shaped clouds. Bright, warm, sunny colors - greens, oranges, yellows. Everything chunky and adorable. No human characters. High quality children's book illustration.`,

  superhero_academy: `A fun toddler-friendly superhero headquarters: a colorful building shaped like a giant star with a superhero cape flag waving on top. Cute superhero masks and capes displayed in windows. A rainbow swooshing across the sky. Fluffy clouds shaped like lightning bolts and stars. Training dummies that look like friendly robots. Bright bold primary colors - red, blue, yellow. Everything looks fun, safe, and exciting. No human characters. High quality children's book illustration.`,

  fairy_tale_kingdom: `A dreamy toddler-friendly fairy tale castle: a pink and purple castle with swirly towers topped with golden flags, sitting on fluffy clouds. A sparkling rainbow arching over the castle. Cute unicorn peeking from behind a tower. Magic wands with star tips floating in the air. Flowers and butterflies everywhere. A winding path made of colorful stepping stones. Golden sparkles and fairy dust throughout. Soft pastel colors with pops of gold. No human characters. High quality children's book illustration.`,

  safari_adventure: `A cheerful toddler-friendly African safari scene: an adorable cartoon giraffe with long eyelashes next to a smiling baby elephant spraying water from its trunk. A friendly lion with a fluffy mane lounging under a big acacia tree. Cute zebras with bold black and white stripes. A happy hippo peeking out of a watering hole. Colorful birds flying overhead. Warm golden savanna grass, bright blue sky with puffy white clouds. Everything chunky, round, and huggable looking. No human characters. High quality children's book illustration.`,

  arctic_expedition: `A magical toddler-friendly Arctic wonderland: cute chunky igloos with warm glowing windows, adorable fluffy polar bear cubs playing in the snow, happy penguins sliding down a sparkly ice slide. Magnificent northern lights swirling in green, pink and purple across the sky. Friendly seals on ice floes waving their flippers. Snowflakes that look like little stars. Shimmering blue and white icebergs with a magical glow. Everything soft, round, and cozy despite the snow. No human characters. High quality children's book illustration.`,
};

async function generateImage(prompt) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: {
      responseModalities: ['Text', 'Image'],
    },
  });

  const response = await model.generateContent(prompt);
  const result = response.response;
  const parts = result.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png',
      };
    }
  }

  throw new Error('No image generated in response');
}

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'theme-previews');

// Ensure output directory exists
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (e) {}

async function saveImageLocally(themeName, imageBase64) {
  const buffer = Buffer.from(imageBase64, 'base64');
  const filePath = join(OUTPUT_DIR, `${themeName}.png`);
  writeFileSync(filePath, buffer);
  return filePath;
}

async function uploadImage(themeName, imageBase64) {
  const bytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
  const path = `previews/themes/${themeName}.jpg`;

  // Delete existing if present
  await supabase.storage.from('story-images').remove([path]);

  // Upload new image
  const { data, error } = await supabase.storage
    .from('story-images')
    .upload(path, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('story-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

async function updateDatabase(themeName, imageUrl) {
  const { error } = await supabase
    .from('themes')
    .update({ preview_image_url: imageUrl })
    .eq('name', themeName);

  if (error) throw error;
}

async function main() {
  console.log('🎨 Generating Theme Thumbnails\n');
  console.log('='.repeat(50));
  console.log(`📁 Saving to: ${OUTPUT_DIR}\n`);

  const themeNames = Object.keys(THEME_PROMPTS);
  const savedFiles = [];

  for (let i = 0; i < themeNames.length; i++) {
    const themeName = themeNames[i];
    const displayName = themeName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    console.log(`\n[${i + 1}/${themeNames.length}] ${displayName}`);
    console.log('  ⏳ Generating image...');

    try {
      const image = await generateImage(THEME_PROMPTS[themeName]);
      console.log('  💾 Saving locally...');

      const filePath = await saveImageLocally(themeName, image.base64);
      savedFiles.push({ themeName, displayName, filePath });
      console.log(`  ✅ Saved: ${filePath}`);

      // Delay between requests to avoid rate limiting
      if (i < themeNames.length - 1) {
        console.log('  ⏸️  Waiting 3s before next...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n🎉 Generated ${savedFiles.length} images!`);
  console.log(`\n📁 Files saved to: ${OUTPUT_DIR}`);
  console.log('\nNext step: Upload these to Supabase Storage and update the database.\n');
}

main().catch(console.error);
