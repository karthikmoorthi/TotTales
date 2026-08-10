/**
 * Wordsmith Agent - Transforms outlines into magical toddler-friendly prose
 *
 * The Wordsmith is responsible for:
 * 1. Converting the Architect's outline into engaging prose
 * 2. Ensuring emotional beat fidelity per page
 * 3. Including sensory language, onomatopoeia, show-don't-tell
 * 4. Maintaining cross-page continuity (subtle for pages 2-8, explicit for page 9)
 * 5. Incorporating story elements (character traits, motifs, settings)
 * 6. Revising based on Critic feedback when provided
 */

import { generateText } from './openai';
import {
  EnhancedOutline,
  StoryNarrative,
  PageNarrative,
  EditorNote,
  Theme,
  ArtStyle,
} from '@/types';
import { safeJsonParse } from '@/utils/helpers';
import { DEFAULT_PAGE_COUNT } from '@/utils/constants';

export interface WordsmithInput {
  outline: EnhancedOutline;
  characterDescription: string;
  theme: Theme;
  artStyle: ArtStyle;
  editorNotes?: EditorNote[]; // Feedback from Critic for revisions
  previousDraft?: StoryNarrative; // Previous draft to revise
}

const WORDSMITH_SYSTEM_PROMPT = `You are THE WORDSMITH, a master of toddler-friendly prose who transforms story outlines into magical picture book text.

Your job: Write engaging, age-appropriate prose that brings the Architect's outline to life.

═══════════════════════════════════════════════════════════════
CORE REQUIREMENTS
═══════════════════════════════════════════════════════════════

1. EMOTIONAL BEAT FIDELITY
   Each page's prose MUST embody its assigned emotional beat.
   - "Wonder" → Show wide eyes, gasps, delighted exploration
   - "Frustration" → Show physical signs: stomping, sighing, frowning
   - "Triumph" → Show jumping, cheering, beaming smiles

2. SENSORY LANGUAGE (minimum per story)
   Include at least:
   - 5 SOUNDS (heard): "The wind whooshed...", "Leaves rustled..."
   - 5 TEXTURES (felt): "The bumpy stone felt rough...", "Soft fur tickled..."
   - 5 SIGHTS (saw): "Sparkly lights danced...", "Colors swirled..."

3. ONOMATOPOEIA (minimum 4 across the story)
   Use expressive sound words that toddlers love:
   - Whoosh! Splash! Pop! Zoom! Crash! Thump! Squish! Plop!
   - Giggle! Whomp! Zing! Swoosh! Crackle! Buzz!

4. SHOW DON'T TELL
   NEVER use emotion words directly. Show through physical descriptions:
   - ❌ "Maya was scared"
   - ✅ "Maya's tummy did flip-flops. She hid behind the big rock."
   - ❌ "Maya felt happy"
   - ✅ "Maya's feet did a little dance. A huge smile spread across her face."
   - ❌ "Maya was sad"
   - ✅ "Maya's shoulders drooped. A tiny tear rolled down her cheek."

5. REPETITION FOR READ-ALONG
   Include callback phrases that toddlers can "read along" with:
   - Use the character's catchphrase on appropriate pages
   - Repeat key phrases at similar emotional moments
   - Examples: "Oh no! That didn't work!", "One more try!", "What if I...?"

6. VOCABULARY
   - Most words should be 1-2 syllables
   - No words a 4-year-old wouldn't understand
   - When a complex word is needed, define it through context
   - Use concrete, visual words over abstract ones

═══════════════════════════════════════════════════════════════
CROSS-PAGE CONTINUITY (Balanced Approach)
═══════════════════════════════════════════════════════════════

Create a connected story using a MIX of subtle and explicit approaches.

PAGES 2-8: Prefer SUBTLE continuity
✅ Visual continuity: "The purple flowers swayed" (same garden from page 1)
✅ Atmospheric echoes: Same weather, lighting, mood carries through
✅ Object presence: "Her pocket felt warm" (feather present but not named)
✅ Spatial logic: Movement through world makes sense
⚠️ Light verbal OK if natural: "The sparkly feather tickled her fingers"
❌ Avoid: "Maya remembered...", "Just like before...", "Using what she learned..."

PAGE 9 (Breakthrough): EXPLICIT callbacks ENCOURAGED
✅ "Maya's hand brushed her pocket. The feather!"
✅ "Then she remembered what Shelly said..."
✅ Clear connection between setup and payoff
The reader should unmistakably see how earlier elements solve the problem.

PAGE 10 (Resolution): Brief callback to opening
✅ Return to or reference the starting location
✅ Show how things have changed since page 1

═══════════════════════════════════════════════════════════════
USING STORY ELEMENTS
═══════════════════════════════════════════════════════════════

You will receive story elements from the Architect. Use them:

SETUPS: Introduce elements on their "introducedPage", pay off on "payoffPage"
- Page 2: "Something sparkly caught her eye. A beautiful feather!"
- Page 9: "The feather! That's it!"

SETTINGS: Use the EXACT details provided for consistency
- If meadow has "purple wildflowers, old oak tree" → use these specific details

CHARACTER TRAITS:
- Show personality traits through actions, not description
- Use the catchphrase naturally in dialogue
- Include physical mannerisms: "Maya tapped her chin, thinking..."

MOTIFS: Use recurring phrases on their specified pages
- Should feel like character voice, not mechanical
- Natural variation is OK: "One more try!" ≈ "Just one more try!"

═══════════════════════════════════════════════════════════════
PAGE TEXT LENGTH
═══════════════════════════════════════════════════════════════

Each page should have 2-4 sentences (40-80 words).
- Opening pages can be slightly shorter (hook the reader)
- Dark moment can be quieter/shorter (emotional pause)
- Breakthrough and resolution can be slightly longer (payoff)

═══════════════════════════════════════════════════════════════
IMAGE PROMPTS
═══════════════════════════════════════════════════════════════

For each page, create a detailed image prompt that:
- Describes the specific scene from the text
- Includes the child's appearance (use provided description)
- Specifies the setting details from story elements
- Captures the emotional beat visually
- Notes lighting, colors, mood

Format: "[Character description] in [setting]. [Action/pose]. [Emotional expression]. [Key objects]. [Lighting/atmosphere]. [Art style notes]."

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY valid JSON:
{
  "title": "The story title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The prose for this page (2-4 sentences)",
      "sceneDescription": "Brief description of what's happening",
      "imagePrompt": "Detailed prompt for illustration"
    }
    // ... all pages
  ]
}`;

const REVISION_PROMPT_ADDITION = `
═══════════════════════════════════════════════════════════════
REVISION INSTRUCTIONS
═══════════════════════════════════════════════════════════════

The Critic has reviewed your previous draft and found issues.
You MUST address each editor note specifically.

EDITOR NOTES TO FIX:
{EDITOR_NOTES}

PREVIOUS DRAFT:
{PREVIOUS_DRAFT}

Revise the story to fix these specific issues while maintaining everything else that was working well.
Focus on the flagged pages but ensure the fixes don't break continuity with other pages.
`;

/**
 * Generate story prose with the Wordsmith Agent
 */
export async function runWordsmithAgent(input: WordsmithInput): Promise<StoryNarrative> {
  const { outline, characterDescription, theme, artStyle, editorNotes, previousDraft } = input;

  const isRevision = editorNotes && editorNotes.length > 0 && previousDraft;

  let prompt = `${WORDSMITH_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════
YOUR ASSIGNMENT
═══════════════════════════════════════════════════════════════

Write a ${DEFAULT_PAGE_COUNT}-page picture book story.

STORY TITLE: ${outline.title}
STORY TYPE: ${outline.storyType}
EMOTIONAL THEME: ${outline.emotionalTheme}

PROTAGONIST:
- Name: ${outline.childName}
- Physical appearance: ${characterDescription}
- Personality: ${outline.storyElements.characterTraits.personality.join(', ')}
- Catchphrase: "${outline.storyElements.characterTraits.catchphrase}"
- Mannerisms: ${outline.storyElements.characterTraits.physicalMannerisms.join(', ')}

SETTING/THEME:
${theme.base_prompt}

ART STYLE:
${artStyle.prompt_modifier}

═══════════════════════════════════════════════════════════════
PAGE-BY-PAGE OUTLINE (from the Architect)
═══════════════════════════════════════════════════════════════
${formatOutlineForWordsmith(outline)}

═══════════════════════════════════════════════════════════════
STORY ELEMENTS TO USE
═══════════════════════════════════════════════════════════════
${formatStoryElements(outline)}

═══════════════════════════════════════════════════════════════
CRITICAL REMINDERS
═══════════════════════════════════════════════════════════════
- SHOW emotions through physical actions, never TELL them directly
- Include at least 4 onomatopoeia words across the story
- Use sensory language (sounds, textures, sights) throughout
- Pages 2-8: Subtle continuity preferred
- Page 9: Explicit callback to setup elements REQUIRED
- Use the catchphrase "${outline.storyElements.characterTraits.catchphrase}" naturally
- Keep vocabulary simple (1-2 syllables mostly)
- Each page: 2-4 sentences (40-80 words)

Return ONLY valid JSON. No markdown, no explanation.`;

  // Add revision instructions if this is a revision
  if (isRevision) {
    const editorNotesFormatted = editorNotes!
      .map((note) => `- Page ${note.page} [${note.issue}]: "${note.current}" → Suggestion: "${note.suggestion}"`)
      .join('\n');

    const previousDraftFormatted = previousDraft!.pages
      .map((p) => `Page ${p.pageNumber}: "${p.text}"`)
      .join('\n');

    const revisionAddition = REVISION_PROMPT_ADDITION
      .replace('{EDITOR_NOTES}', editorNotesFormatted)
      .replace('{PREVIOUS_DRAFT}', previousDraftFormatted);

    prompt += revisionAddition;

    console.log('[WordsmithAgent] Revision mode - fixing', editorNotes!.length, 'issues');
  }

  console.log('[WordsmithAgent] Generating prose for:', outline.title);
  console.log('[WordsmithAgent] Mode:', isRevision ? 'REVISION' : 'INITIAL DRAFT');

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

  // Create default narrative for fallback
  const defaultNarrative = createDefaultNarrative(outline, characterDescription, theme);

  const parsed = safeJsonParse<StoryNarrative>(cleanedResponse.trim(), defaultNarrative);

  // Validate and fix the narrative
  const validatedNarrative = validateAndFixNarrative(parsed, outline, characterDescription, theme, artStyle);

  console.log('[WordsmithAgent] Narrative generated:', validatedNarrative.title);
  console.log('[WordsmithAgent] Pages:', validatedNarrative.pages.length);

  // Log some quality metrics
  const totalText = validatedNarrative.pages.map((p) => p.text).join(' ');
  const onomatopoeiaCount = countOnomatopoeia(totalText);
  console.log('[WordsmithAgent] Onomatopoeia count:', onomatopoeiaCount);

  return validatedNarrative;
}

/**
 * Format the outline for the Wordsmith prompt
 */
function formatOutlineForWordsmith(outline: EnhancedOutline): string {
  return outline.pages
    .map((page) => {
      return `PAGE ${page.pageNumber} (${page.structuralRole})
  Emotional Beat: ${page.emotionalBeat} | Tension: ${page.tensionLevel}/10
  Plot: ${page.plotPoint}
  Causality: ${page.causality}
  Visual: ${page.visualHint}`;
    })
    .join('\n\n');
}

/**
 * Format story elements for the Wordsmith prompt
 */
function formatStoryElements(outline: EnhancedOutline): string {
  const { setups, settings, motifs } = outline.storyElements;

  const setupsText = setups
    .map((s) => `- "${s.element}" introduced on page ${s.introducedPage}, pays off on page ${s.payoffPage} (${s.purpose})`)
    .join('\n');

  const settingsText = settings
    .map((s) => `- ${s.name} (pages ${s.appearsOnPages.join(', ')}): ${s.details.join(', ')}`)
    .join('\n');

  const motifsText = motifs
    .map((m) => `- "${m.phrase}" on pages ${m.usedOnPages.join(', ')} (${m.emotionalContext})`)
    .join('\n');

  return `SETUPS (introduce early, pay off later):
${setupsText}

SETTINGS (use consistent details):
${settingsText}

MOTIFS (recurring phrases):
${motifsText}`;
}

/**
 * Create a default narrative as fallback
 */
function createDefaultNarrative(
  outline: EnhancedOutline,
  characterDescription: string,
  theme: Theme
): StoryNarrative {
  const defaultPages: PageNarrative[] = outline.pages.map((page) => ({
    pageNumber: page.pageNumber,
    text: `${outline.childName} ${getDefaultTextForRole(page.structuralRole, outline.childName)}.`,
    sceneDescription: page.plotPoint,
    imagePrompt: `${characterDescription} in ${theme.name.toLowerCase()} setting. ${page.visualHint}. ${outline.storyElements.characterTraits.personality[0]} expression.`,
  }));

  return {
    title: outline.title,
    pages: defaultPages,
  };
}

function getDefaultTextForRole(role: string, childName: string): string {
  const defaults: Record<string, string> = {
    opening: `looked around with wide, curious eyes. What an amazing place!`,
    problem: `saw something that made their tummy do a little flip. "Oh no!"`,
    attempt1: `had an idea. "What if I try this?" But it didn't work`,
    attempt2: `tried again, even harder this time. WHOOSH! But still no luck`,
    attempt3: `gave it one more try with all their might. But it still didn't work`,
    darkMoment: `sat down quietly. Their shoulders drooped a little`,
    breakthrough: `'s eyes suddenly lit up. "Wait... I know what to do!"`,
    resolution: `did it! A huge smile spread across their face. "I did it!"`,
  };
  return defaults[role] || 'continued on their adventure';
}

/**
 * Validate and fix the parsed narrative
 */
function validateAndFixNarrative(
  parsed: StoryNarrative,
  outline: EnhancedOutline,
  characterDescription: string,
  theme: Theme,
  artStyle: ArtStyle
): StoryNarrative {
  const defaultNarrative = createDefaultNarrative(outline, characterDescription, theme);

  const narrative: StoryNarrative = {
    title: parsed.title || outline.title,
    pages: [],
  };

  // Validate pages
  if (Array.isArray(parsed.pages) && parsed.pages.length >= DEFAULT_PAGE_COUNT) {
    narrative.pages = parsed.pages.slice(0, DEFAULT_PAGE_COUNT).map((page, index) => {
      const outlinePage = outline.pages[index];
      return {
        pageNumber: page.pageNumber || index + 1,
        text: page.text || defaultNarrative.pages[index].text,
        sceneDescription: page.sceneDescription || outlinePage.plotPoint,
        imagePrompt: enhanceImagePrompt(
          page.imagePrompt || defaultNarrative.pages[index].imagePrompt,
          characterDescription,
          artStyle,
          outlinePage.visualHint
        ),
      };
    });
  } else {
    // Not enough pages, use defaults but try to use any valid pages from parsed
    narrative.pages = defaultNarrative.pages.map((defaultPage, index) => {
      const parsedPage = parsed.pages?.[index];
      if (parsedPage && parsedPage.text) {
        return {
          pageNumber: index + 1,
          text: parsedPage.text,
          sceneDescription: parsedPage.sceneDescription || defaultPage.sceneDescription,
          imagePrompt: enhanceImagePrompt(
            parsedPage.imagePrompt || defaultPage.imagePrompt,
            characterDescription,
            artStyle,
            outline.pages[index].visualHint
          ),
        };
      }
      return defaultPage;
    });
  }

  return narrative;
}

/**
 * Enhance image prompt with character and style details
 */
function enhanceImagePrompt(
  basePrompt: string,
  characterDescription: string,
  artStyle: ArtStyle,
  visualHint: string
): string {
  // If prompt already seems complete, return it
  if (basePrompt.length > 100 && basePrompt.includes(artStyle.name.toLowerCase())) {
    return basePrompt;
  }

  // Enhance the prompt
  let enhanced = basePrompt;

  // Add character description if not present
  if (!enhanced.toLowerCase().includes('child') && !enhanced.includes(characterDescription.substring(0, 20))) {
    enhanced = `${characterDescription}. ${enhanced}`;
  }

  // Add art style if not present
  if (!enhanced.toLowerCase().includes(artStyle.name.toLowerCase())) {
    enhanced = `${enhanced} ${artStyle.prompt_modifier}`;
  }

  // Add visual hint if not reflected
  if (visualHint && !enhanced.includes(visualHint.substring(0, 30))) {
    enhanced = `${enhanced} Scene: ${visualHint}`;
  }

  return enhanced;
}

/**
 * Count onomatopoeia in the text
 */
function countOnomatopoeia(text: string): number {
  const onomatopoeiaPatterns = [
    /\bwhoosh\b/gi,
    /\bsplash\b/gi,
    /\bpop\b/gi,
    /\bzoom\b/gi,
    /\bcrash\b/gi,
    /\bthump\b/gi,
    /\bsquish\b/gi,
    /\bplop\b/gi,
    /\bgiggle\b/gi,
    /\bwhomp\b/gi,
    /\bzing\b/gi,
    /\bswoosh\b/gi,
    /\bcrackle\b/gi,
    /\bbuzz\b/gi,
    /\bbang\b/gi,
    /\bsplat\b/gi,
    /\bpitter\b/gi,
    /\bpatter\b/gi,
    /\brushle\b/gi,
    /\bwhisper\b/gi,
    /\broar\b/gi,
    /\bsizzle\b/gi,
    /\bdrip\b/gi,
    /\bclang\b/gi,
    /\bthud\b/gi,
  ];

  let count = 0;
  for (const pattern of onomatopoeiaPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}
