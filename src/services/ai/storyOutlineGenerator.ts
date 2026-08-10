import { generateText } from './openai';
import { StoryOutline, StoryType, Theme } from '@/types';
import { safeJsonParse } from '@/utils/helpers';

interface OutlineGenerationInput {
  childName: string;
  childAge?: number;
  characterDescription: string;
  theme: Theme;
  storyType: StoryType;
}

const STORY_TYPE_DESCRIPTIONS: Record<StoryType, string> = {
  adventure: `An ACTION-PACKED adventure story focused on:
- Thrilling discoveries and exciting challenges
- Bravery and courage in the face of obstacles
- Exploration of new places and meeting new characters
- Emotional arc: curiosity → determination → triumph`,

  emotional: `A HEARTFELT story about feelings and relationships focused on:
- Navigating emotions like fear, loneliness, or jealousy
- Building friendships or strengthening family bonds
- Learning to express and understand feelings
- Emotional arc: uncertainty → struggle → connection/growth`,

  learning: `A DISCOVERY story about learning something meaningful focused on:
- Curiosity and asking questions about the world
- Trying new things and learning from mistakes
- "Aha" moments and gaining new understanding
- Emotional arc: wondering → experimenting → understanding`,
};

/**
 * Generate a structured story outline using the Rule of Three
 * This creates the narrative skeleton before expanding to full pages
 */
export async function generateStoryOutline(
  input: OutlineGenerationInput
): Promise<StoryOutline> {
  const { childName, childAge, characterDescription, theme, storyType } = input;

  const storyTypeDescription = STORY_TYPE_DESCRIPTIONS[storyType];

  const prompt = `You are a professional children's book author creating an outline for a ${storyType} story.
You specialize in the "Rule of Three" narrative structure that makes picture books memorable and emotionally satisfying.

PROTAGONIST:
- Name: ${childName}
- Age: ${childAge ? `${childAge} years old` : 'Young toddler (2-5 years)'}
- Physical description: ${characterDescription}

SETTING/THEME:
${theme.base_prompt}

STORY TYPE:
${storyTypeDescription}

Create a story outline following the RULE OF THREE structure. This proven structure works because:
1. Children love patterns and repetition
2. Stakes escalate naturally with each attempt
3. The final success feels earned after real struggle
4. The emotional journey is satisfying

YOUR OUTLINE MUST INCLUDE:

1. OPENING (Hook + Setup):
   - Start with ${childName} in an intriguing situation that immediately captures attention
   - Introduce the world and ${childName}'s personality through action, not description
   - Plant the seed of what ${childName} wants or needs

2. PROBLEM:
   - What clear challenge does ${childName} face?
   - The problem should be introduced within the first moments
   - Make it personal to ${childName} - something they truly care about

3. ATTEMPT 1 → FAIL:
   - ${childName}'s first logical solution attempt
   - Why does it fail? (Make it specific and understandable)
   - What does ${childName} learn or feel?

4. ATTEMPT 2 → FAIL (Higher Stakes):
   - A different approach, showing ${childName} adapting
   - The failure should have bigger consequences
   - Tension and worry should increase

5. ATTEMPT 3 → FAIL (Highest Stakes):
   - ${childName}'s most determined effort yet
   - The biggest setback - everything seems lost
   - This failure leads directly to the dark moment

6. DARK MOMENT (Emotional Low Point):
   - ${childName} feels truly discouraged (age-appropriate sadness/worry)
   - A quiet, reflective moment
   - This is where the reader feels FOR the character

7. BREAKTHROUGH:
   - What insight, memory, or observation helps ${childName}?
   - The solution should come from WITHIN ${childName}
   - It should use something established earlier (not random luck)
   - NO ADULTS SWOOPING IN TO SAVE THE DAY

8. RESOLUTION:
   - How does ${childName} succeed using their breakthrough?
   - Show the emotional payoff - joy, pride, relief
   - What has ${childName} learned or how have they grown?
   - Connect back to the opening for satisfaction

Also provide:
- A creative, engaging TITLE for the story
- The core EMOTIONAL THEME (e.g., "overcoming fear", "the power of persistence", "true friendship")

CRITICAL REQUIREMENTS:
- ${childName} must be the hero who solves the problem themselves
- Keep everything age-appropriate for toddlers (2-6 years)
- Each section should be 1-2 sentences describing what happens
- The story should be warm and encouraging, even in difficult moments
- The ending must feel EARNED after the struggles

Respond in this exact JSON format:
{
  "title": "The story title",
  "storyType": "${storyType}",
  "emotionalTheme": "The core emotional theme",
  "structure": {
    "opening": "Description of the opening hook and setup",
    "problem": "The central challenge introduced",
    "attempt1": "First attempt and how it fails",
    "attempt2": "Second attempt with higher stakes and failure",
    "attempt3": "Third attempt with highest stakes and failure",
    "darkMoment": "The emotional low point",
    "breakthrough": "The insight that leads to the solution",
    "resolution": "How the child succeeds and what they learned"
  }
}

Return ONLY valid JSON, no additional text or markdown.`;

  console.log('[StoryOutlineGenerator] Generating outline for story type:', storyType);

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

  const defaultOutline: StoryOutline = {
    title: `${childName}'s ${storyType.charAt(0).toUpperCase() + storyType.slice(1)} Story`,
    storyType,
    emotionalTheme: 'perseverance',
    structure: {
      opening: `${childName} discovers something exciting`,
      problem: `${childName} faces a challenge`,
      attempt1: `${childName} tries to solve it but fails`,
      attempt2: `${childName} tries again with a new idea but fails`,
      attempt3: `${childName} tries their hardest but fails`,
      darkMoment: `${childName} feels discouraged`,
      breakthrough: `${childName} realizes something important`,
      resolution: `${childName} succeeds and celebrates`,
    },
  };

  const parsed = safeJsonParse<StoryOutline>(cleanedResponse.trim(), defaultOutline);

  // Validate the outline has required fields
  if (!parsed.structure || !parsed.title) {
    console.warn('[StoryOutlineGenerator] Incomplete outline, using defaults');
    return defaultOutline;
  }

  console.log('[StoryOutlineGenerator] Outline generated:', parsed.title);

  return {
    title: parsed.title,
    storyType: parsed.storyType || storyType,
    emotionalTheme: parsed.emotionalTheme || 'perseverance',
    structure: {
      opening: parsed.structure.opening || defaultOutline.structure.opening,
      problem: parsed.structure.problem || defaultOutline.structure.problem,
      attempt1: parsed.structure.attempt1 || defaultOutline.structure.attempt1,
      attempt2: parsed.structure.attempt2 || defaultOutline.structure.attempt2,
      attempt3: parsed.structure.attempt3 || defaultOutline.structure.attempt3,
      darkMoment: parsed.structure.darkMoment || defaultOutline.structure.darkMoment,
      breakthrough: parsed.structure.breakthrough || defaultOutline.structure.breakthrough,
      resolution: parsed.structure.resolution || defaultOutline.structure.resolution,
    },
  };
}
