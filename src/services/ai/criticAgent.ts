/**
 * Critic Agent - Evaluates story quality with binary pass/fail criteria
 *
 * The Critic is responsible for:
 * 1. Evaluating structure (Rule of Three adherence)
 * 2. Checking emotional beat fidelity
 * 3. Verifying language quality (sensory, onomatopoeia, show-don't-tell)
 * 4. Assessing coherence (setups/payoffs, settings, character, motifs)
 * 5. Providing specific, actionable feedback when issues found
 */

import { generateText } from './openai';
import {
  EnhancedOutline,
  StoryNarrative,
  CriticEvaluation,
  EditorNote,
  CriticIssueType,
} from '@/types';
import { safeJsonParse } from '@/utils/helpers';

export interface CriticInput {
  outline: EnhancedOutline;
  narrative: StoryNarrative;
}

const CRITIC_SYSTEM_PROMPT = `You are THE CRITIC, an exacting children's book editor with decades of experience.

Your job: Evaluate if this story meets professional picture book standards using BINARY pass/fail criteria.

═══════════════════════════════════════════════════════════════
EVALUATION CRITERIA
═══════════════════════════════════════════════════════════════

You will evaluate FOUR categories. Each has specific checks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE (ALL must pass for structurePass = true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ problemClear
  Is the central problem/challenge crystal clear by page 3?
  The reader should know exactly what the child is trying to accomplish.

□ threeAttempts
  Are there exactly 3 DISTINCT solution attempts (pages 4, 5, 6)?
  Each attempt must be a different approach, not just "trying harder."

□ attemptsEscalate
  Does each attempt have HIGHER stakes than the previous?
  Consequences of failure should increase: inconvenience → worry → desperation.

□ darkMomentPresent
  Is there a genuine emotional low point (pages 7-8)?
  The child should feel discouraged. Show it through physical descriptions.

□ breakthroughEarned
  Does the breakthrough (page 9) use something ESTABLISHED earlier?
  The solution must connect to a setup from pages 1-2, not appear randomly.
  Check: Does the breakthrough reference a specific element from the outline's setups?

□ resolutionSolves
  Does the ending (page 10) actually SOLVE the original problem?
  The resolution must address what was introduced on page 3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTIONAL (ALL must pass for emotionalPass = true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ beatsMatch
  Does each page's prose embody its ASSIGNED emotional beat?
  Check the outline's emotionalBeat for each page against the actual text.
  - Page with "frustration" beat → Should show stomping, sighing, frowning
  - Page with "triumph" beat → Should show jumping, cheering, smiling

□ showDontTell
  Are emotions shown through PHYSICAL DESCRIPTIONS, not named directly?
  FAIL if you find: "was scared", "felt happy", "was sad", "felt angry"
  PASS if emotions shown through: actions, body language, physical sensations

□ childIsHero
  Does the CHILD solve the problem themselves?
  FAIL if: an adult swoops in, magic happens randomly, someone else saves the day
  PASS if: the child's own insight, effort, or action resolves the situation

□ satisfyingEnding
  Does the ending deliver emotional payoff?
  The reader should feel the triumph/relief/joy along with the character.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE (3 of 4 must pass for languagePass = true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ sensoryPresent
  Are there at least 5 sensory details across the story?
  Count: sounds heard, textures felt, sights described vividly.

□ onomatopoeiaUsed
  Are there at least 2 onomatopoeia words?
  Examples: Whoosh, Splash, Pop, Zoom, Crash, Thump, Squish, Plop, Swoosh

□ repetitionUsed
  Are there callback phrases that toddlers could "read along" with?
  Look for: catchphrase usage, repeated phrases at similar moments, motifs.

□ vocabularySimple
  Is vocabulary appropriate for a 4-year-old?
  FAIL if: words over 3 syllables without context clues, abstract concepts
  PASS if: mostly 1-2 syllable words, concrete/visual language

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COHERENCE (ALL must pass for coherencePass = true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ elementsPayoff
  Do setup elements from the outline appear on their payoff pages?
  Check each setup in outline.storyElements.setups:
  - Is it introduced on its introducedPage?
  - Is it used meaningfully on its payoffPage (especially page 9)?

□ settingsConsistent
  Are setting details maintained consistently?
  If meadow has "purple wildflowers" on page 1, they should still be purple later.
  Visual/atmospheric details should feel like the same world.

□ characterConsistent
  Does the child show their defined traits THROUGHOUT (not just once)?
  Check: personality traits, catchphrase usage, physical mannerisms.
  The character should feel like the SAME person across all pages.

□ continuityFeels
  Does the story feel like ONE connected journey?

  PAGES 2-8: Check for subtle continuity (preferred) OR natural verbal:
  - Visual/atmospheric continuity (same setting details, weather, mood)
  - Spatial logic (movement through world makes sense)
  - Object presence (setup elements felt even if not explicitly named)
  - Light verbal OK if natural ("The sparkly feather tickled her fingers")

  PAGE 9 (Breakthrough): Check for EXPLICIT payoff:
  - Setup elements should be clearly called back
  - Reader should unmistakably see the connection

  PASS if pages 2-8 feel connected AND page 9 has clear payoff.
  FAIL only if pages feel disconnected or breakthrough is unclear.

□ motifsNatural
  Do recurring phrases feel organic to the character?
  - Should appear in emotionally similar moments
  - Natural variation is OK ("One more try!" ≈ "Just one more try!")
  - Should feel like personality, not mechanical repetition

  PASS if motifs enhance character voice. FAIL if they feel forced/robotic.

═══════════════════════════════════════════════════════════════
FINAL VERDICT
═══════════════════════════════════════════════════════════════

approved = structurePass AND emotionalPass AND languagePass AND coherencePass

If NOT approved, provide EXACTLY 3 Editor's Notes (no more, no less).

Each note must be:
- SPECIFIC: Reference the exact page and problematic text
- ACTIONABLE: Provide a concrete suggestion, not vague advice
- PRIORITIZED: Fix the most impactful issues first

Editor Note format:
{
  "page": 5,
  "issue": "beat_mismatch",
  "current": "Maya tried again.",
  "suggestion": "Maya's fists clenched tight. She stomped her foot. 'I will NOT give up!' she shouted."
}

Issue types:
- "beat_mismatch": Page doesn't match its emotional beat
- "tell_not_show": Emotion told directly instead of shown
- "stakes_flat": Attempts don't escalate properly
- "vocabulary": Word too complex for audience
- "missing_sensory": Needs more sensory language
- "coherence_break": Setup/payoff missing or setting inconsistent
- "structure_issue": Rule of Three structure violated

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY valid JSON:
{
  "approved": true/false,
  "structurePass": true/false,
  "emotionalPass": true/false,
  "languagePass": true/false,
  "coherencePass": true/false,
  "editorNotes": [
    // ONLY if not approved - exactly 3 notes
    {
      "page": number,
      "issue": "issue_type",
      "current": "problematic text",
      "suggestion": "specific fix"
    }
  ]
}`;

/**
 * Evaluate story quality with the Critic Agent
 */
export async function runCriticAgent(input: CriticInput): Promise<CriticEvaluation> {
  const { outline, narrative } = input;

  const prompt = `${CRITIC_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════
STORY TO EVALUATE
═══════════════════════════════════════════════════════════════

TITLE: ${narrative.title}
STORY TYPE: ${outline.storyType}
EMOTIONAL THEME: ${outline.emotionalTheme}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECT'S OUTLINE (what SHOULD happen)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formatOutlineForCritic(outline)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORY ELEMENTS TO CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formatStoryElementsForCritic(outline)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORDSMITH'S DRAFT (what was ACTUALLY written)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formatNarrativeForCritic(narrative)}

═══════════════════════════════════════════════════════════════
YOUR EVALUATION
═══════════════════════════════════════════════════════════════

Evaluate the draft against ALL criteria above.
Be STRICT but FAIR. Professional picture books have high standards.

Remember:
- Structure: ALL 6 checks must pass
- Emotional: ALL 4 checks must pass
- Language: 3 of 4 checks must pass
- Coherence: ALL 5 checks must pass

If ANY category fails, approved = false, and you MUST provide exactly 3 editor notes.
Prioritize the most impactful fixes.

Return ONLY valid JSON. No markdown, no explanation.`;

  console.log('[CriticAgent] Evaluating story:', narrative.title);

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

  // Fail closed if the model returns malformed JSON. Treating a parser failure
  // as approval can publish a story the Critic never actually evaluated.
  const defaultEvaluation: CriticEvaluation = {
    approved: false,
    structurePass: false,
    emotionalPass: false,
    languagePass: false,
    coherencePass: false,
    editorNotes: [],
  };

  const parsed = safeJsonParse<CriticEvaluation>(cleanedResponse.trim(), defaultEvaluation);

  // Validate and fix the evaluation
  const validatedEvaluation = validateAndFixEvaluation(parsed);

  console.log('[CriticAgent] Evaluation complete');
  console.log('[CriticAgent] Approved:', validatedEvaluation.approved);
  console.log('[CriticAgent] Structure:', validatedEvaluation.structurePass);
  console.log('[CriticAgent] Emotional:', validatedEvaluation.emotionalPass);
  console.log('[CriticAgent] Language:', validatedEvaluation.languagePass);
  console.log('[CriticAgent] Coherence:', validatedEvaluation.coherencePass);
  if (!validatedEvaluation.approved) {
    console.log('[CriticAgent] Editor notes:', validatedEvaluation.editorNotes.length);
  }

  return validatedEvaluation;
}

/**
 * Format the outline for the Critic prompt
 */
function formatOutlineForCritic(outline: EnhancedOutline): string {
  return outline.pages
    .map((page) => {
      return `PAGE ${page.pageNumber} | Role: ${page.structuralRole} | Beat: ${page.emotionalBeat} | Tension: ${page.tensionLevel}/10
  Expected: ${page.plotPoint}`;
    })
    .join('\n\n');
}

/**
 * Format story elements for the Critic prompt
 */
function formatStoryElementsForCritic(outline: EnhancedOutline): string {
  const { setups, settings, characterTraits, motifs } = outline.storyElements;

  const setupsText = setups
    .map((s) => `- "${s.element}": Introduce on p${s.introducedPage} → Payoff on p${s.payoffPage}`)
    .join('\n');

  const settingsText = settings
    .map((s) => `- ${s.name} (pages ${s.appearsOnPages.join(',')}): Must include: ${s.details.join(', ')}`)
    .join('\n');

  const traitsText = `- Personality: ${characterTraits.personality.join(', ')}
- Catchphrase: "${characterTraits.catchphrase}"
- Mannerisms: ${characterTraits.physicalMannerisms.join(', ')}`;

  const motifsText = motifs
    .map((m) => `- "${m.phrase}" should appear on pages ${m.usedOnPages.join(', ')}`)
    .join('\n');

  return `SETUPS (must introduce AND pay off):
${setupsText}

SETTINGS (details must be consistent):
${settingsText}

CHARACTER TRAITS (must show throughout):
${traitsText}

MOTIFS (recurring phrases):
${motifsText}`;
}

/**
 * Format the narrative for the Critic prompt
 */
function formatNarrativeForCritic(narrative: StoryNarrative): string {
  return narrative.pages
    .map((page) => {
      return `PAGE ${page.pageNumber}:
"${page.text}"`;
    })
    .join('\n\n');
}

/**
 * Validate and fix the parsed evaluation
 */
function validateAndFixEvaluation(parsed: CriticEvaluation): CriticEvaluation {
  const evaluation: CriticEvaluation = {
    approved: typeof parsed.approved === 'boolean' ? parsed.approved : false,
    structurePass: typeof parsed.structurePass === 'boolean' ? parsed.structurePass : false,
    emotionalPass: typeof parsed.emotionalPass === 'boolean' ? parsed.emotionalPass : false,
    languagePass: typeof parsed.languagePass === 'boolean' ? parsed.languagePass : false,
    coherencePass: typeof parsed.coherencePass === 'boolean' ? parsed.coherencePass : false,
    editorNotes: [],
  };

  // Recalculate approved based on individual passes
  evaluation.approved =
    evaluation.structurePass &&
    evaluation.emotionalPass &&
    evaluation.languagePass &&
    evaluation.coherencePass;

  // Validate editor notes if not approved
  if (!evaluation.approved && Array.isArray(parsed.editorNotes)) {
    evaluation.editorNotes = parsed.editorNotes
      .filter((note) => isValidEditorNote(note))
      .slice(0, 3) // Max 3 notes
      .map((note) => ({
        page: typeof note.page === 'number' ? note.page : 1,
        issue: validateIssueType(note.issue),
        current: typeof note.current === 'string' ? note.current : 'Issue identified',
        suggestion: typeof note.suggestion === 'string' ? note.suggestion : 'Please revise this section',
      }));

    // Ensure we have exactly 3 notes if not approved
    while (evaluation.editorNotes.length < 3) {
      evaluation.editorNotes.push(createGenericNote(evaluation));
    }
  }

  return evaluation;
}

/**
 * Check if an editor note is valid
 */
function isValidEditorNote(note: unknown): note is EditorNote {
  if (!note || typeof note !== 'object') return false;
  const n = note as Record<string, unknown>;
  return (
    typeof n.page === 'number' &&
    typeof n.issue === 'string' &&
    typeof n.current === 'string' &&
    typeof n.suggestion === 'string'
  );
}

/**
 * Validate issue type
 */
function validateIssueType(issue: string): CriticIssueType {
  const validTypes: CriticIssueType[] = [
    'beat_mismatch',
    'tell_not_show',
    'stakes_flat',
    'vocabulary',
    'missing_sensory',
    'coherence_break',
    'structure_issue',
  ];
  return validTypes.includes(issue as CriticIssueType)
    ? (issue as CriticIssueType)
    : 'structure_issue';
}

/**
 * Create a generic note based on what failed
 */
function createGenericNote(evaluation: CriticEvaluation): EditorNote {
  if (!evaluation.structurePass) {
    return {
      page: 9,
      issue: 'structure_issue',
      current: 'Breakthrough moment',
      suggestion: 'Ensure the breakthrough clearly uses an element established in pages 1-2.',
    };
  }
  if (!evaluation.emotionalPass) {
    return {
      page: 7,
      issue: 'tell_not_show',
      current: 'Dark moment description',
      suggestion: 'Show the emotion through physical descriptions: drooping shoulders, slow steps, looking down.',
    };
  }
  if (!evaluation.languagePass) {
    return {
      page: 4,
      issue: 'missing_sensory',
      current: 'First attempt scene',
      suggestion: 'Add sensory details: what does the character hear, feel, or see vividly?',
    };
  }
  if (!evaluation.coherencePass) {
    return {
      page: 9,
      issue: 'coherence_break',
      current: 'Breakthrough connection',
      suggestion: 'Make the connection to earlier setup elements explicit and clear.',
    };
  }
  return {
    page: 5,
    issue: 'stakes_flat',
    current: 'Second attempt',
    suggestion: 'Raise the stakes: show more consequences, more determination, more at risk.',
  };
}

/**
 * Quick local check for obvious issues (can be used before full Critic evaluation)
 */
export function quickQualityCheck(narrative: StoryNarrative): {
  hasOnomatopoeia: boolean;
  onomatopoeiaCount: number;
  hasTellNotShow: boolean;
  tellNotShowInstances: string[];
  wordCount: number;
  avgWordsPerPage: number;
} {
  const allText = narrative.pages.map((p) => p.text).join(' ');
  const wordCount = allText.split(/\s+/).length;
  const avgWordsPerPage = Math.round(wordCount / narrative.pages.length);

  // Check for onomatopoeia
  const onomatopoeiaPatterns = [
    /\bwhoosh\b/gi, /\bsplash\b/gi, /\bpop\b/gi, /\bzoom\b/gi,
    /\bcrash\b/gi, /\bthump\b/gi, /\bsquish\b/gi, /\bplop\b/gi,
    /\bswoosh\b/gi, /\bbang\b/gi, /\bsplat\b/gi, /\bbuzz\b/gi,
  ];
  let onomatopoeiaCount = 0;
  for (const pattern of onomatopoeiaPatterns) {
    const matches = allText.match(pattern);
    if (matches) onomatopoeiaCount += matches.length;
  }

  // Check for "tell not show" violations
  const tellPatterns = [
    /\bwas scared\b/gi,
    /\bfelt scared\b/gi,
    /\bwas happy\b/gi,
    /\bfelt happy\b/gi,
    /\bwas sad\b/gi,
    /\bfelt sad\b/gi,
    /\bwas angry\b/gi,
    /\bfelt angry\b/gi,
    /\bwas excited\b/gi,
    /\bfelt excited\b/gi,
    /\bwas worried\b/gi,
    /\bfelt worried\b/gi,
    /\bwas frustrated\b/gi,
    /\bfelt frustrated\b/gi,
  ];
  const tellNotShowInstances: string[] = [];
  for (const pattern of tellPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      tellNotShowInstances.push(...matches);
    }
  }

  return {
    hasOnomatopoeia: onomatopoeiaCount >= 2,
    onomatopoeiaCount,
    hasTellNotShow: tellNotShowInstances.length > 0,
    tellNotShowInstances,
    wordCount,
    avgWordsPerPage,
  };
}
