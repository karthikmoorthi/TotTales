/**
 * Agentic Story Loop - Orchestrates the 3-agent story generation system
 *
 * Flow:
 * 1. Architect creates enhanced outline with emotional beats & coherence elements
 * 2. Wordsmith transforms outline into toddler-friendly prose
 * 3. Critic evaluates with binary pass/fail criteria
 * 4. If not approved, Wordsmith revises (max 2 rounds)
 * 5. Return final narrative
 *
 * This replaces the linear outline → narrative flow with quality-controlled iteration.
 */

import { runArchitectAgent, ArchitectInput } from './architectAgent';
import { runWordsmithAgent, WordsmithInput } from './wordsmithAgent';
import { runCriticAgent, quickQualityCheck, CriticInput } from './criticAgent';
import {
  EnhancedOutline,
  StoryNarrative,
  CriticEvaluation,
  GenerationProgress,
  Theme,
  ArtStyle,
  StoryType,
} from '@/types';
import { MAX_REVISION_ROUNDS } from '@/utils/constants';

export interface AgenticLoopInput {
  childName: string;
  childAge?: number;
  characterDescription: string;
  theme: Theme;
  artStyle: ArtStyle;
  storyType: StoryType;
}

export interface AgenticLoopResult {
  outline: EnhancedOutline;
  narrative: StoryNarrative;
  evaluation: CriticEvaluation;
  revisionCount: number;
  wasApproved: boolean;
}

type ProgressCallback = (progress: GenerationProgress) => void;

/**
 * Run the full agentic story generation loop
 *
 * @param input - Story generation parameters
 * @param onProgress - Callback for progress updates
 * @returns The final outline, narrative, and evaluation results
 */
export async function runAgenticStoryLoop(
  input: AgenticLoopInput,
  onProgress?: ProgressCallback
): Promise<AgenticLoopResult> {
  const { childName, childAge, characterDescription, theme, artStyle, storyType } = input;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[AgenticLoop] Starting story generation for:', childName);
  console.log('[AgenticLoop] Theme:', theme.name);
  console.log('[AgenticLoop] Art Style:', artStyle.name);
  console.log('[AgenticLoop] Story Type:', storyType);
  console.log('═══════════════════════════════════════════════════════════════');

  // ─────────────────────────────────────────────────────────────────
  // PHASE 1: ARCHITECT - Create enhanced outline
  // ─────────────────────────────────────────────────────────────────

  onProgress?.({
    stage: 'outlining',
    currentPage: 0,
    totalPages: 10,
    message: 'The Architect is designing the story structure...',
    revision: 0,
  });

  console.log('\n[AgenticLoop] Phase 1: Running Architect Agent...');

  const architectInput: ArchitectInput = {
    childName,
    childAge,
    characterDescription,
    theme,
    storyType,
  };

  const outline = await runArchitectAgent(architectInput);

  console.log('[AgenticLoop] Architect complete. Title:', outline.title);
  console.log('[AgenticLoop] Emotional theme:', outline.emotionalTheme);
  console.log('[AgenticLoop] Setups:', outline.storyElements.setups.map((s) => s.element).join(', '));

  // ─────────────────────────────────────────────────────────────────
  // PHASE 2: WORDSMITH/CRITIC LOOP
  // ─────────────────────────────────────────────────────────────────

  let narrative: StoryNarrative;
  let evaluation: CriticEvaluation;
  let revisionCount = 0;

  // Initial draft
  onProgress?.({
    stage: 'writing',
    currentPage: 0,
    totalPages: 10,
    message: 'The Wordsmith is crafting the story...',
    revision: 0,
  });

  console.log('\n[AgenticLoop] Phase 2: Running Wordsmith Agent (initial draft)...');

  const wordsmithInput: WordsmithInput = {
    outline,
    characterDescription,
    theme,
    artStyle,
  };

  narrative = await runWordsmithAgent(wordsmithInput);

  console.log('[AgenticLoop] Initial draft complete.');

  // Quick local quality check (for logging)
  const quickCheck = quickQualityCheck(narrative);
  console.log('[AgenticLoop] Quick check - Onomatopoeia:', quickCheck.onomatopoeiaCount);
  console.log('[AgenticLoop] Quick check - Tell-not-show violations:', quickCheck.tellNotShowInstances.length);
  console.log('[AgenticLoop] Quick check - Avg words/page:', quickCheck.avgWordsPerPage);

  // Critic evaluation
  onProgress?.({
    stage: 'reviewing',
    currentPage: 0,
    totalPages: 10,
    message: 'The Critic is evaluating the draft...',
    revision: 0,
  });

  console.log('\n[AgenticLoop] Running Critic Agent...');

  const criticInput: CriticInput = {
    outline,
    narrative,
  };

  evaluation = await runCriticAgent(criticInput);

  // ─────────────────────────────────────────────────────────────────
  // PHASE 3: REVISION LOOP (if needed)
  // ─────────────────────────────────────────────────────────────────

  while (!evaluation.approved && revisionCount < MAX_REVISION_ROUNDS) {
    revisionCount++;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`[AgenticLoop] Revision round ${revisionCount} of ${MAX_REVISION_ROUNDS}`);
    console.log('═══════════════════════════════════════════════════════════════');

    console.log('[AgenticLoop] Issues to fix:');
    evaluation.editorNotes.forEach((note, i) => {
      console.log(`  ${i + 1}. Page ${note.page} [${note.issue}]: "${note.current.substring(0, 50)}..."`);
    });

    // Wordsmith revision
    onProgress?.({
      stage: 'revising',
      currentPage: 0,
      totalPages: 10,
      message: `The Wordsmith is polishing (revision ${revisionCount})...`,
      revision: revisionCount,
    });

    console.log('\n[AgenticLoop] Running Wordsmith Agent (revision)...');

    const revisionInput: WordsmithInput = {
      outline,
      characterDescription,
      theme,
      artStyle,
      editorNotes: evaluation.editorNotes,
      previousDraft: narrative,
    };

    narrative = await runWordsmithAgent(revisionInput);

    console.log('[AgenticLoop] Revision complete.');

    // Quick check after revision
    const revisedQuickCheck = quickQualityCheck(narrative);
    console.log('[AgenticLoop] Post-revision - Onomatopoeia:', revisedQuickCheck.onomatopoeiaCount);
    console.log('[AgenticLoop] Post-revision - Tell violations:', revisedQuickCheck.tellNotShowInstances.length);

    // Critic re-evaluation
    onProgress?.({
      stage: 'reviewing',
      currentPage: 0,
      totalPages: 10,
      message: `The Critic is re-evaluating (round ${revisionCount + 1})...`,
      revision: revisionCount,
    });

    console.log('\n[AgenticLoop] Running Critic Agent (re-evaluation)...');

    const reEvalInput: CriticInput = {
      outline,
      narrative,
    };

    evaluation = await runCriticAgent(reEvalInput);
  }

  // ─────────────────────────────────────────────────────────────────
  // PHASE 4: FINALIZE
  // ─────────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('[AgenticLoop] Story generation complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('[AgenticLoop] Final status:', evaluation.approved ? 'APPROVED' : 'ACCEPTED (max revisions)');
  console.log('[AgenticLoop] Total revisions:', revisionCount);
  console.log('[AgenticLoop] Structure:', evaluation.structurePass ? '✓' : '✗');
  console.log('[AgenticLoop] Emotional:', evaluation.emotionalPass ? '✓' : '✗');
  console.log('[AgenticLoop] Language:', evaluation.languagePass ? '✓' : '✗');
  console.log('[AgenticLoop] Coherence:', evaluation.coherencePass ? '✓' : '✗');

  if (!evaluation.approved) {
    console.log('[AgenticLoop] Warning: Story accepted after max revisions but not fully approved.');
    console.log('[AgenticLoop] Remaining issues:', evaluation.editorNotes.length);
  }

  return {
    outline,
    narrative,
    evaluation,
    revisionCount,
    wasApproved: evaluation.approved,
  };
}

/**
 * Get estimated time for agentic loop based on scenario
 */
export function getEstimatedTime(scenario: 'best' | 'typical' | 'worst'): number {
  // Estimates in seconds
  const estimates = {
    best: 20,    // Approved first try: Architect + Wordsmith + Critic
    typical: 35, // One revision: + Wordsmith + Critic
    worst: 50,   // Two revisions: + 2x (Wordsmith + Critic)
  };
  return estimates[scenario];
}

/**
 * Debug helper: Log the full outline structure
 */
export function logOutlineDebug(outline: EnhancedOutline): void {
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│ ENHANCED OUTLINE DEBUG                                      │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('Title:', outline.title);
  console.log('Type:', outline.storyType);
  console.log('Theme:', outline.emotionalTheme);
  console.log('Child:', outline.childName);
  console.log('\nPAGES:');
  outline.pages.forEach((page) => {
    console.log(`  P${page.pageNumber} [${page.structuralRole}] ${page.emotionalBeat} (${page.tensionLevel}/10)`);
    console.log(`     Plot: ${page.plotPoint.substring(0, 60)}...`);
  });
  console.log('\nSTORY ELEMENTS:');
  console.log('  Setups:', outline.storyElements.setups.map((s) => `"${s.element}" (p${s.introducedPage}→p${s.payoffPage})`).join(', '));
  console.log('  Settings:', outline.storyElements.settings.map((s) => s.name).join(', '));
  console.log('  Traits:', outline.storyElements.characterTraits.personality.join(', '));
  console.log('  Catchphrase:', `"${outline.storyElements.characterTraits.catchphrase}"`);
  console.log('  Motifs:', outline.storyElements.motifs.map((m) => `"${m.phrase}"`).join(', '));
}

/**
 * Debug helper: Log the full narrative
 */
export function logNarrativeDebug(narrative: StoryNarrative): void {
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│ NARRATIVE DEBUG                                             │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('Title:', narrative.title);
  console.log('\nPAGES:');
  narrative.pages.forEach((page) => {
    console.log(`\n  PAGE ${page.pageNumber}:`);
    console.log(`  "${page.text}"`);
    console.log(`  [Scene: ${page.sceneDescription.substring(0, 50)}...]`);
  });
}
