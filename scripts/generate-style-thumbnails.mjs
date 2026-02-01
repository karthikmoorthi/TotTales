/**
 * Generate art style thumbnail images
 * Run with: node scripts/generate-style-thumbnails.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'style-previews');

// Ensure output directory exists
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (e) {}

const GEMINI_API_KEY = 'AIzaSyDjWwfAuDhPLGMCa3eKwF0JGbXpyiguiig';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Base scene for all art styles
const BASE_SCENE = `A cozy treehouse in a sunny meadow with wildflowers, butterflies, and a friendly bird on a branch. No people or characters.`;

// Art style prompts
const STYLE_PROMPTS = {
  watercolor_whimsy: `${BASE_SCENE}

Style: Soft watercolor illustration with gentle color gradients, whimsical details, and a dreamy quality. Soft pastels and muted tones with delicate brushstrokes visible. High quality children's book illustration.`,

  bright_cartoon: `${BASE_SCENE}

Style: Bright, bold cartoon illustration with vibrant saturated colors, clean outlines, and a playful energetic feel. Modern animated style with cheerful colors. High quality children's book illustration.`,

  storybook_classic: `${BASE_SCENE}

Style: Classic golden age children's book illustration with rich warm colors, detailed textures, and a timeless quality. Reminiscent of beloved vintage picture books. High quality children's book illustration.`,

  paper_cutout: `${BASE_SCENE}

Style: Paper cutout collage style with layered textures, bold flat colors like construction paper, and visible paper edges. Eric Carle inspired with dimensional quality. High quality children's book illustration.`,

  soft_digital: `${BASE_SCENE}

Style: Soft digital painting with smooth gradients, gentle lighting, and a modern polished look. Cute rounded shapes with harmonious pastel palette. High quality children's book illustration.`,

  crayon_charm: `${BASE_SCENE}

Style: Charming crayon or colored pencil illustration with visible waxy texture strokes, rich colors, and a warm hand-drawn quality. Paper texture visible. High quality children's book illustration.`,
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

async function saveImageLocally(styleName, imageBase64) {
  const buffer = Buffer.from(imageBase64, 'base64');
  const filePath = join(OUTPUT_DIR, `${styleName}.png`);
  writeFileSync(filePath, buffer);
  return filePath;
}

async function main() {
  console.log('🎨 Generating Art Style Thumbnails\n');
  console.log('='.repeat(50));
  console.log(`📁 Saving to: ${OUTPUT_DIR}\n`);

  const styleNames = Object.keys(STYLE_PROMPTS);
  const savedFiles = [];

  for (let i = 0; i < styleNames.length; i++) {
    const styleName = styleNames[i];
    const displayName = styleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    console.log(`\n[${i + 1}/${styleNames.length}] ${displayName}`);
    console.log('  ⏳ Generating image...');

    try {
      const image = await generateImage(STYLE_PROMPTS[styleName]);
      console.log('  💾 Saving locally...');

      const filePath = await saveImageLocally(styleName, image.base64);
      savedFiles.push({ styleName, displayName, filePath });
      console.log(`  ✅ Saved: ${filePath}`);

      // Delay between requests to avoid rate limiting
      if (i < styleNames.length - 1) {
        console.log('  ⏸️  Waiting 3s before next...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n🎉 Generated ${savedFiles.length} images!`);
  console.log(`\n📁 Files saved to: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
