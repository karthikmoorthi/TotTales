import { generateText } from './gemini';
import { StoryNarrative, PageNarrative, Theme } from '@/types';
import { DEFAULT_PAGE_COUNT } from '@/utils/constants';
import { safeJsonParse } from '@/utils/helpers';

interface StoryGenerationInput {
  childName: string;
  childAge?: number;
  childGender?: string;
  theme: Theme;
  characterDescription: string;
  pageCount?: number;
}

/**
 * Generate a complete story narrative with scene descriptions for each page
 */
export async function generateStoryNarrative(
  input: StoryGenerationInput
): Promise<StoryNarrative> {
  const { childName, childAge, childGender, theme, characterDescription, pageCount = DEFAULT_PAGE_COUNT } = input;

  const prompt = `You are a children's book author writing for toddlers (ages 2-6). Create a short, engaging storybook where the main character is a real child.

CHILD PROTAGONIST:
- Name: ${childName}
- ${childAge ? `Age: ${childAge} years old` : 'Young toddler'}
- ${childGender ? `Gender: ${childGender}` : ''}
- Physical description: ${characterDescription}

STORY THEME:
${theme.base_prompt}

REQUIREMENTS:
1. Write exactly ${pageCount} pages
2. Each page should have 2-3 short sentences (appropriate for toddlers)
3. Use simple vocabulary suitable for ages 2-6
4. Make ${childName} the hero who drives the action
5. Include age-appropriate emotions and actions
6. End with a positive, satisfying conclusion
7. Keep the tone warm, encouraging, and fun

For each page, also provide:
- A scene description (what's visually happening in detail)
- An image prompt for illustration generation

Respond in this exact JSON format:
{
  "title": "The story title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The narrative text for this page",
      "sceneDescription": "Detailed description of what's happening visually",
      "imagePrompt": "Prompt for generating the illustration"
    }
  ]
}

Important: Return ONLY valid JSON, no additional text or markdown.`;

  const response = await generateText(prompt);

  // Clean up the response and parse JSON
  let cleanedResponse = response.trim();

  // Remove markdown code blocks if present
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.slice(7);
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.slice(3);
  }
  if (cleanedResponse.endsWith('```')) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }

  const parsed = safeJsonParse<StoryNarrative>(cleanedResponse.trim(), {
    title: `${childName}'s Adventure`,
    pages: [],
  });

  // Validate and ensure we have the right structure
  if (!parsed.pages || parsed.pages.length === 0) {
    throw new Error('Failed to generate story pages');
  }

  // Validate each page has required fields
  const validatedPages: PageNarrative[] = parsed.pages.map((page, index) => ({
    pageNumber: page.pageNumber || index + 1,
    text: page.text || '',
    sceneDescription: page.sceneDescription || '',
    imagePrompt: page.imagePrompt || page.sceneDescription || '',
  }));

  return {
    title: parsed.title,
    pages: validatedPages,
  };
}

/**
 * Regenerate a single page's narrative
 */
export async function regeneratePageNarrative(
  input: StoryGenerationInput,
  pageNumber: number,
  existingStory: StoryNarrative,
  reason?: string
): Promise<PageNarrative> {
  const { childName, theme, characterDescription } = input;

  const previousPage = existingStory.pages.find((p) => p.pageNumber === pageNumber - 1);
  const currentPage = existingStory.pages.find((p) => p.pageNumber === pageNumber);
  const nextPage = existingStory.pages.find((p) => p.pageNumber === pageNumber + 1);

  const prompt = `You are rewriting page ${pageNumber} of a children's storybook.

STORY TITLE: ${existingStory.title}

CHILD PROTAGONIST:
- Name: ${childName}
- Physical description: ${characterDescription}

STORY THEME: ${theme.base_prompt}

CONTEXT:
${previousPage ? `Previous page (${pageNumber - 1}): "${previousPage.text}"` : 'This is the first page'}
${nextPage ? `Next page (${pageNumber + 1}): "${nextPage.text}"` : 'This is the last page'}

Current page to rewrite: "${currentPage?.text || ''}"

${reason ? `REASON FOR REWRITE: ${reason}` : ''}

Write a new version of page ${pageNumber} that:
1. Maintains story continuity with surrounding pages
2. Uses 2-3 short sentences suitable for toddlers
3. Features ${childName} as the hero
4. Includes a detailed scene description for illustration

Respond in this exact JSON format:
{
  "pageNumber": ${pageNumber},
  "text": "The new narrative text",
  "sceneDescription": "Detailed visual description",
  "imagePrompt": "Prompt for illustration generation"
}

Return ONLY valid JSON.`;

  const response = await generateText(prompt);

  let cleanedResponse = response.trim();
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.slice(7);
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.slice(3);
  }
  if (cleanedResponse.endsWith('```')) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }

  const parsed = safeJsonParse<PageNarrative>(cleanedResponse.trim(), {
    pageNumber,
    text: '',
    sceneDescription: '',
    imagePrompt: '',
  });

  return {
    pageNumber,
    text: parsed.text || currentPage?.text || '',
    sceneDescription: parsed.sceneDescription || '',
    imagePrompt: parsed.imagePrompt || parsed.sceneDescription || '',
  };
}

/**
 * Validate story content for appropriateness
 */
export function validateStoryContent(story: StoryNarrative): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for inappropriate words
  const inappropriateWords = [
    'kill', 'die', 'death', 'blood', 'scary', 'monster',
    'hate', 'stupid', 'ugly', 'weapon', 'gun', 'knife',
  ];

  const allText = [story.title, ...story.pages.map((p) => p.text)].join(' ').toLowerCase();

  inappropriateWords.forEach((word) => {
    if (allText.includes(word)) {
      issues.push(`Contains inappropriate word: "${word}"`);
    }
  });

  // Check page count
  if (story.pages.length < 3) {
    issues.push('Story is too short');
  }

  // Check for empty pages
  story.pages.forEach((page, index) => {
    if (!page.text || page.text.trim().length === 0) {
      issues.push(`Page ${index + 1} has no text`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
