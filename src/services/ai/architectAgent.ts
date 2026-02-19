/**
 * Architect Agent - Creates enhanced story outlines with emotional beats and coherence tracking
 *
 * The Architect is responsible for:
 * 1. Designing the 10-page narrative structure following Rule of Three
 * 2. Assigning emotional beats and tension levels per page
 * 3. Establishing story elements for cross-page coherence (setups, settings, traits, motifs)
 * 4. Providing visual hints for illustration consistency
 */

import { generateText } from './gemini';
import {
  EnhancedOutline,
  StoryType,
  Theme,
  PageOutline,
  StoryElements,
  StructuralRole,
  EmotionalBeat,
} from '@/types';
import { safeJsonParse } from '@/utils/helpers';
import { DEFAULT_PAGE_COUNT } from '@/utils/constants';

export interface ArchitectInput {
  childName: string;
  childAge?: number;
  characterDescription: string;
  theme: Theme;
  storyType: StoryType;
}

const STORY_TYPE_GUIDANCE: Record<StoryType, string> = {
  adventure: `ACTION-PACKED adventure with:
- Thrilling discoveries and exciting challenges
- Bravery and courage in the face of obstacles
- Exploration of new places and meeting new characters
- Emotional arc: curiosity → determination → triumph`,

  emotional: `HEARTFELT story about feelings with:
- Navigating emotions like fear, loneliness, or jealousy
- Building friendships or strengthening family bonds
- Learning to express and understand feelings
- Emotional arc: uncertainty → struggle → connection/growth`,

  learning: `DISCOVERY story about learning with:
- Curiosity and asking questions about the world
- Trying new things and learning from mistakes
- "Aha" moments and gaining new understanding
- Emotional arc: wondering → experimenting → understanding`,
};

// Page structure mapping for 10 pages
const PAGE_STRUCTURE: { pageNumber: number; role: StructuralRole }[] = [
  { pageNumber: 1, role: 'opening' },
  { pageNumber: 2, role: 'opening' }, // Extended opening for setup elements
  { pageNumber: 3, role: 'problem' },
  { pageNumber: 4, role: 'attempt1' },
  { pageNumber: 5, role: 'attempt2' },
  { pageNumber: 6, role: 'attempt3' },
  { pageNumber: 7, role: 'darkMoment' },
  { pageNumber: 8, role: 'darkMoment' }, // Extended for emotional depth
  { pageNumber: 9, role: 'breakthrough' },
  { pageNumber: 10, role: 'resolution' },
];

const ARCHITECT_SYSTEM_PROMPT = `You are THE ARCHITECT, a master children's story structuralist who designs emotionally resonant picture book narratives.

Your job: Create a 10-page story outline with precise emotional beats and coherence elements.

═══════════════════════════════════════════════════════════════
STRUCTURAL RULES (Rule of Three)
═══════════════════════════════════════════════════════════════

Pages 1-2: OPENING (Setup)
- Introduce the child in their world through ACTION, not description
- Plant 1-2 setup elements that will pay off later (objects, characters, knowledge)
- Establish the child's personality through specific behaviors

Page 3: PROBLEM
- Clear challenge the child cares about deeply
- Stakes should be personal and age-appropriate
- The problem should feel real and relatable

Pages 4-6: THREE ATTEMPTS (Escalating)
- Each attempt uses a DIFFERENT approach
- Each failure has CONSEQUENCES that raise stakes
- Use CAUSALITY: "Because of [previous failure], now [this attempt]"
- Stakes: Medium → High → Highest

Pages 7-8: DARK MOMENT
- Genuine emotional low point (age-appropriate)
- Quiet, reflective — the child processes their feelings
- Show, don't tell the sadness/doubt/frustration
- This is where setup elements can be subtly present (pocket feels warm, etc.)

Page 9: BREAKTHROUGH
- Insight comes from WITHIN the child (not external rescue)
- MUST use something established earlier (setup element pays off)
- This is where explicit callbacks are ENCOURAGED
- The "aha" moment should feel earned

Page 10: RESOLUTION
- Success using the breakthrough insight
- Emotional payoff: joy, pride, triumph
- Brief callback to opening for satisfaction
- Show what the child learned or how they grew

═══════════════════════════════════════════════════════════════
EMOTIONAL BEATS
═══════════════════════════════════════════════════════════════

Assign ONE primary emotional beat per page from this palette:
- Wonder, Curiosity, Excitement, Anticipation (positive energy)
- Worry, Fear, Frustration, Disappointment, Doubt (struggle)
- Determination, Hope, Courage (resilience)
- Relief, Joy, Triumph, Pride (resolution)

Typical tension arc:
- Pages 1-2: Tension 3-4 (wonder, curiosity)
- Page 3: Tension 5 (worry introduced)
- Pages 4-6: Tension 6 → 7 → 8 (escalating)
- Pages 7-8: Tension 9 (peak - dark moment)
- Page 9: Tension 6 (hope returns)
- Page 10: Tension 2 (relief, joy)

═══════════════════════════════════════════════════════════════
STORY ELEMENTS (Coherence Tracking)
═══════════════════════════════════════════════════════════════

You MUST define these elements to ensure the story feels connected:

1. SETUPS (1-3 elements)
   Objects, characters, or knowledge introduced early that pay off later.
   Example: {"element": "sparkly feather", "introducedPage": 2, "payoffPage": 9, "purpose": "Will tickle the grumpy cloud"}

2. SETTINGS (1-3 locations)
   Locations with SPECIFIC visual details that remain consistent.
   Example: {"name": "the meadow", "firstAppearance": 1, "details": ["purple wildflowers", "soft green grass", "old oak tree"], "appearsOnPages": [1, 2, 10]}

3. CHARACTER TRAITS
   Define the child's personality for consistent portrayal.
   - personality: 3 traits (e.g., ["curious", "determined", "kind"])
   - catchphrase: A phrase they say when trying something (e.g., "What if I try...?")
   - physicalMannerisms: 2-3 specific behaviors (e.g., ["taps chin when thinking", "skips when happy", "hugs self when nervous"])

4. MOTIFS (1-2 recurring phrases)
   Phrases that appear multiple times, creating rhythm.
   Example: {"phrase": "One more try!", "usedOnPages": [4, 5, 6], "emotionalContext": "Said when Maya decides to persist despite failure"}

═══════════════════════════════════════════════════════════════
VISUAL HINTS
═══════════════════════════════════════════════════════════════

For each page, provide a SPECIFIC visual hint for the illustrator:
- ❌ "Maya looks sad" (too vague)
- ✅ "Maya sitting alone under the oak tree, knees hugged to chest, single tear on cheek, wilted flowers nearby"

Include: character pose, expression, key objects, setting details, lighting/mood.

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY valid JSON matching this exact structure:
{
  "title": "Creative story title",
  "storyType": "adventure|emotional|learning",
  "emotionalTheme": "Core theme (e.g., 'the power of persistence')",
  "childName": "The child's name",
  "pages": [
    {
      "pageNumber": 1,
      "structuralRole": "opening",
      "emotionalBeat": "wonder",
      "tensionLevel": 3,
      "plotPoint": "What happens on this page",
      "causality": "Because [setup], now [this happens]",
      "visualHint": "Detailed visual description for illustrator"
    }
    // ... 10 pages total
  ],
  "storyElements": {
    "setups": [
      {"element": "description", "introducedPage": 2, "payoffPage": 9, "purpose": "why it matters"}
    ],
    "settings": [
      {"name": "location name", "firstAppearance": 1, "details": ["detail1", "detail2"], "appearsOnPages": [1, 2, 10]}
    ],
    "characterTraits": {
      "personality": ["trait1", "trait2", "trait3"],
      "catchphrase": "The child's repeated phrase",
      "physicalMannerisms": ["mannerism1", "mannerism2"]
    },
    "motifs": [
      {"phrase": "recurring phrase", "usedOnPages": [4, 5, 6], "emotionalContext": "when/why it's used"}
    ]
  }
}`;

/**
 * Generate an enhanced story outline with the Architect Agent
 */
export async function runArchitectAgent(input: ArchitectInput): Promise<EnhancedOutline> {
  const { childName, childAge, characterDescription, theme, storyType } = input;

  const storyTypeGuidance = STORY_TYPE_GUIDANCE[storyType];

  const prompt = `${ARCHITECT_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════
YOUR ASSIGNMENT
═══════════════════════════════════════════════════════════════

Create a ${DEFAULT_PAGE_COUNT}-page ${storyType} story outline for:

PROTAGONIST:
- Name: ${childName}
- Age: ${childAge ? `${childAge} years old` : 'Young toddler (2-5 years)'}
- Physical appearance: ${characterDescription}

SETTING/THEME:
${theme.base_prompt}

STORY TYPE GUIDANCE:
${storyTypeGuidance}

CRITICAL REQUIREMENTS:
- ${childName} must be the HERO who solves the problem (no adult rescue)
- Everything must be age-appropriate for toddlers (2-6 years)
- The breakthrough MUST use a setup element from pages 1-2
- Tension must peak at pages 7-8, then resolve
- Each page's visual hint must be specific enough to illustrate

Return ONLY valid JSON. No markdown, no explanation.`;

  console.log('[ArchitectAgent] Generating enhanced outline for:', childName);
  console.log('[ArchitectAgent] Story type:', storyType);
  console.log('[ArchitectAgent] Theme:', theme.name);

  const response = await generateText(prompt);

  // Clean up the response
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

  // Create default outline for fallback
  const defaultOutline = createDefaultOutline(childName, storyType, theme);

  const parsed = safeJsonParse<EnhancedOutline>(cleanedResponse.trim(), defaultOutline);

  // Validate and fix the outline
  const validatedOutline = validateAndFixOutline(parsed, childName, storyType, theme);

  console.log('[ArchitectAgent] Outline generated:', validatedOutline.title);
  console.log('[ArchitectAgent] Pages:', validatedOutline.pages.length);
  console.log('[ArchitectAgent] Setups:', validatedOutline.storyElements.setups.length);
  console.log('[ArchitectAgent] Settings:', validatedOutline.storyElements.settings.length);

  return validatedOutline;
}

/**
 * Create a default outline as fallback
 */
function createDefaultOutline(
  childName: string,
  storyType: StoryType,
  theme: Theme
): EnhancedOutline {
  const defaultPages: PageOutline[] = PAGE_STRUCTURE.map(({ pageNumber, role }) => ({
    pageNumber,
    structuralRole: role,
    emotionalBeat: getDefaultEmotionalBeat(role),
    tensionLevel: getDefaultTensionLevel(pageNumber),
    plotPoint: `Page ${pageNumber}: ${childName} ${getDefaultPlotPoint(role)}`,
    causality: pageNumber === 1 ? 'Story begins' : 'Because of what happened before',
    visualHint: `${childName} in the ${theme.name.toLowerCase()} setting`,
  }));

  const defaultElements: StoryElements = {
    setups: [
      {
        element: 'a special object',
        introducedPage: 2,
        payoffPage: 9,
        purpose: 'Will help solve the problem',
      },
    ],
    settings: [
      {
        name: theme.name.toLowerCase(),
        firstAppearance: 1,
        details: ['colorful surroundings', 'magical atmosphere'],
        appearsOnPages: [1, 2, 3, 10],
      },
    ],
    characterTraits: {
      personality: ['curious', 'determined', 'kind'],
      catchphrase: 'I can do this!',
      physicalMannerisms: ['tilts head when curious', 'jumps when excited'],
    },
    motifs: [
      {
        phrase: 'One more try!',
        usedOnPages: [4, 5, 6],
        emotionalContext: 'Said when deciding to persist',
      },
    ],
  };

  return {
    title: `${childName}'s ${theme.name} Adventure`,
    storyType,
    emotionalTheme: 'the power of persistence',
    childName,
    pages: defaultPages,
    storyElements: defaultElements,
  };
}

function getDefaultEmotionalBeat(role: StructuralRole): EmotionalBeat {
  const mapping: Record<StructuralRole, EmotionalBeat> = {
    opening: 'wonder',
    problem: 'worry',
    attempt1: 'determination',
    attempt2: 'frustration',
    attempt3: 'doubt',
    darkMoment: 'disappointment',
    breakthrough: 'hope',
    resolution: 'joy',
  };
  return mapping[role];
}

function getDefaultTensionLevel(pageNumber: number): number {
  const levels = [3, 4, 5, 6, 7, 8, 9, 9, 6, 2];
  return levels[pageNumber - 1] || 5;
}

function getDefaultPlotPoint(role: StructuralRole): string {
  const points: Record<StructuralRole, string> = {
    opening: 'discovers something exciting',
    problem: 'faces a challenging situation',
    attempt1: 'tries to solve the problem',
    attempt2: 'tries a different approach',
    attempt3: 'makes one last attempt',
    darkMoment: 'feels discouraged',
    breakthrough: 'has an important realization',
    resolution: 'succeeds and celebrates',
  };
  return points[role];
}

/**
 * Validate and fix the parsed outline
 */
function validateAndFixOutline(
  parsed: EnhancedOutline,
  childName: string,
  storyType: StoryType,
  theme: Theme
): EnhancedOutline {
  const defaultOutline = createDefaultOutline(childName, storyType, theme);

  // Ensure required fields
  const outline: EnhancedOutline = {
    title: parsed.title || defaultOutline.title,
    storyType: parsed.storyType || storyType,
    emotionalTheme: parsed.emotionalTheme || defaultOutline.emotionalTheme,
    childName: parsed.childName || childName,
    pages: [],
    storyElements: {
      setups: [],
      settings: [],
      characterTraits: defaultOutline.storyElements.characterTraits,
      motifs: [],
    },
  };

  // Validate pages
  if (Array.isArray(parsed.pages) && parsed.pages.length >= DEFAULT_PAGE_COUNT) {
    outline.pages = parsed.pages.slice(0, DEFAULT_PAGE_COUNT).map((page, index) => ({
      pageNumber: page.pageNumber || index + 1,
      structuralRole: validateStructuralRole(page.structuralRole) || PAGE_STRUCTURE[index].role,
      emotionalBeat: validateEmotionalBeat(page.emotionalBeat) || getDefaultEmotionalBeat(PAGE_STRUCTURE[index].role),
      tensionLevel: typeof page.tensionLevel === 'number' ? Math.min(10, Math.max(1, page.tensionLevel)) : getDefaultTensionLevel(index + 1),
      plotPoint: page.plotPoint || defaultOutline.pages[index].plotPoint,
      causality: page.causality || defaultOutline.pages[index].causality,
      visualHint: page.visualHint || defaultOutline.pages[index].visualHint,
    }));
  } else {
    outline.pages = defaultOutline.pages;
  }

  // Validate story elements
  if (parsed.storyElements) {
    // Setups
    if (Array.isArray(parsed.storyElements.setups)) {
      outline.storyElements.setups = parsed.storyElements.setups.filter(
        (s) => s.element && typeof s.introducedPage === 'number' && typeof s.payoffPage === 'number'
      );
    }
    if (outline.storyElements.setups.length === 0) {
      outline.storyElements.setups = defaultOutline.storyElements.setups;
    }

    // Settings
    if (Array.isArray(parsed.storyElements.settings)) {
      outline.storyElements.settings = parsed.storyElements.settings.filter(
        (s) => s.name && Array.isArray(s.details)
      );
    }
    if (outline.storyElements.settings.length === 0) {
      outline.storyElements.settings = defaultOutline.storyElements.settings;
    }

    // Character traits
    if (parsed.storyElements.characterTraits) {
      const traits = parsed.storyElements.characterTraits;
      outline.storyElements.characterTraits = {
        personality: Array.isArray(traits.personality) && traits.personality.length > 0
          ? traits.personality
          : defaultOutline.storyElements.characterTraits.personality,
        catchphrase: traits.catchphrase || defaultOutline.storyElements.characterTraits.catchphrase,
        physicalMannerisms: Array.isArray(traits.physicalMannerisms) && traits.physicalMannerisms.length > 0
          ? traits.physicalMannerisms
          : defaultOutline.storyElements.characterTraits.physicalMannerisms,
      };
    }

    // Motifs
    if (Array.isArray(parsed.storyElements.motifs)) {
      outline.storyElements.motifs = parsed.storyElements.motifs.filter(
        (m) => m.phrase && Array.isArray(m.usedOnPages)
      );
    }
    if (outline.storyElements.motifs.length === 0) {
      outline.storyElements.motifs = defaultOutline.storyElements.motifs;
    }
  } else {
    outline.storyElements = defaultOutline.storyElements;
  }

  return outline;
}

function validateStructuralRole(role: string): StructuralRole | null {
  const validRoles: StructuralRole[] = [
    'opening', 'problem', 'attempt1', 'attempt2', 'attempt3',
    'darkMoment', 'breakthrough', 'resolution'
  ];
  return validRoles.includes(role as StructuralRole) ? (role as StructuralRole) : null;
}

function validateEmotionalBeat(beat: string): EmotionalBeat | null {
  const validBeats: EmotionalBeat[] = [
    'wonder', 'curiosity', 'excitement', 'anticipation',
    'worry', 'fear', 'frustration', 'disappointment', 'doubt',
    'determination', 'hope', 'courage',
    'relief', 'joy', 'triumph', 'pride'
  ];
  return validBeats.includes(beat as EmotionalBeat) ? (beat as EmotionalBeat) : null;
}
