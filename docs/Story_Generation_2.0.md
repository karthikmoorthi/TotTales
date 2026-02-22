# Story Generation 2.0: Agentic Architecture

## Overview

TotTales 2.0 replaces linear story generation with a **3-agent system** featuring quality control and iterative refinement.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  ARCHITECT  │───▶│  WORDSMITH  │───▶│   CRITIC    │
│  (Outline)  │    │   (Prose)   │    │ (Evaluate)  │
└─────────────┘    └──────▲──────┘    └──────┬──────┘
                         │                   │
                         │ REVISE     APPROVED?
                         │ (max 2)           │
                         └───────────────────┘
```

---

## Generation Flow

| Stage | Agent | Output | API Calls |
|-------|-------|--------|-----------|
| 1. Analyzing | - | Character description from photos | 1 |
| 2. Outlining | Architect | Enhanced 10-page outline | 1 |
| 3. Writing | Wordsmith | Story prose + image prompts | 1 |
| 4. Reviewing | Critic | Pass/fail evaluation | 1 |
| 5. Revising | Wordsmith | Revised prose (if needed) | 0-2 |
| 6. Illustrating | - | 10 page illustrations | 10 |
| 7. Finalizing | - | Story saved to database | - |

**Total API calls:** 3-7 for text, 10 for images

---

## Agent 1: The Architect

**Purpose:** Design the narrative skeleton with emotional precision.

**Output Structure:**
```typescript
{
  title: "Maya and the Grumpy Cloud",
  storyType: "adventure",
  emotionalTheme: "the power of persistence",
  pages: [
    {
      pageNumber: 1,
      structuralRole: "opening",
      emotionalBeat: "wonder",        // Per-page emotion
      tensionLevel: 3,                // 1-10, peaks at dark moment
      plotPoint: "Maya discovers...",
      causality: "Story begins",
      visualHint: "Maya in meadow, looking up at sky with wide eyes"
    }
    // ... 10 pages
  ],
  storyElements: {
    setups: [{ element: "sparkly feather", introducedPage: 2, payoffPage: 9 }],
    settings: [{ name: "meadow", details: ["purple wildflowers", "old oak tree"] }],
    characterTraits: { personality: ["curious", "determined"], catchphrase: "What if I try...?" },
    motifs: [{ phrase: "One more try!", usedOnPages: [4, 5, 6] }]
  }
}
```

**Key Prompt Elements:**
- Follow **Rule of Three**: 3 failed attempts → dark moment → breakthrough
- Assign emotional beat from palette: wonder, fear, frustration, triumph, etc.
- Tension arc: 3→5→6→7→8→**9**→6→2 (peaks at dark moment)
- Setup elements MUST pay off on page 9 (breakthrough)

---

## Agent 2: The Wordsmith

**Purpose:** Transform outline into magical toddler prose.

**Requirements:**

| Requirement | Target | Example |
|-------------|--------|---------|
| Sensory language | 5+ each (sound, texture, sight) | "The wind whooshed past her ears" |
| Onomatopoeia | 4+ per story | Whoosh! Splash! Pop! Thump! |
| Show don't tell | 100% | "Maya's tummy did flip-flops" not "Maya was scared" |
| Vocabulary | 1-2 syllables mostly | Age-appropriate for 4-year-olds |
| Page length | 40-80 words | 2-4 sentences |

**Cross-Page Continuity:**
- **Pages 2-8:** Subtle (visual continuity, atmospheric echoes, object presence)
- **Page 9:** Explicit callbacks ENCOURAGED ("The feather! That's it!")

**Revision Mode:** Accepts `editorNotes` from Critic with specific fixes per page.

---

## Agent 3: The Critic

**Purpose:** Evaluate with binary pass/fail criteria.

### Evaluation Rubric

| Category | Checks | Requirement |
|----------|--------|-------------|
| **Structure** | problemClear, threeAttempts, attemptsEscalate, darkMomentPresent, breakthroughEarned, resolutionSolves | ALL 6 pass |
| **Emotional** | beatsMatch, showDontTell, childIsHero, satisfyingEnding | ALL 4 pass |
| **Language** | sensoryPresent, onomatopoeiaUsed, repetitionUsed, vocabularySimple | 3 of 4 pass |
| **Coherence** | elementsPayoff, settingsConsistent, characterConsistent, continuityFeels, motifsNatural | ALL 5 pass |

**If NOT approved:** Returns exactly 3 actionable `EditorNotes`:
```typescript
{
  page: 5,
  issue: "tell_not_show",
  current: "Maya felt frustrated.",
  suggestion: "Maya stomped her foot. Her fists clenched tight."
}
```

---

## Quality Control Loop

```
Wordsmith creates draft
        ↓
Critic evaluates ──→ APPROVED? ──→ Continue to illustrations
        │
        │ NOT APPROVED
        ↓
Wordsmith revises (with editor notes)
        ↓
Critic re-evaluates
        ↓
(max 2 revision rounds, then accept)
```

**Safeguards:**
- `MAX_REVISION_ROUNDS = 2` prevents infinite loops
- Stories accepted after max revisions even if not fully approved
- All evaluation results logged for debugging

---

## File Reference

| File | Purpose |
|------|---------|
| `architectAgent.ts` | Outline generation with emotional beats |
| `wordsmithAgent.ts` | Prose generation and revision |
| `criticAgent.ts` | Quality evaluation |
| `agenticStoryLoop.ts` | Orchestrates the 3-agent loop |
| `storyOrchestrator.ts` | Integration with image generation & storage |

---

## Expected Output Quality

**Before (v1.0):**
> "Maya wanted to fly. She tried jumping. It didn't work. She found a feather. She flew! Maya was happy."

**After (v2.0):**
> Page 7 (Dark Moment, Beat: disappointment, Tension: 9/10)
>
> "Maya sat under the old oak tree. Her shoulders drooped like wilting flowers. The purple wildflowers swayed, but Maya didn't notice. Her pocket felt warm, but she was too tired to wonder why. A tiny tear rolled down her cheek. 'Maybe I can't do this,' she whispered."

The difference: Sensory language, emotional specificity, physical descriptions, setup presence (warm pocket), setting consistency (oak tree, purple wildflowers).
