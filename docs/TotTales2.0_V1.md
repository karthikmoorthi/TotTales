# TotTales 2.0: Agentic Story Generation Architecture

## Executive Summary

Transform story generation from a 2-phase linear process into a 3-agent loop with quality control, producing emotionally resonant children's stories that rival professional picture books.

---

## Current State Analysis

### What We Have Now

```
Photo Analysis → Outline Generation → Narrative Expansion → Image Generation
     (1)              (2)                    (3)                  (4)
```

**Strengths:**
- Rule of Three structure baked into outline
- Story types (adventure/emotional/learning) with emotional arcs
- Character consistency from photo analysis
- 10-page stories with proper structure

**Critical Gaps:**
- No per-page emotional beats (only structure-level)
- Zero quality control (stories pass regardless of quality)
- No sensory language/onomatopoeia requirements
- Single-pass generation (bad outline = bad story)
- No "show don't tell" enforcement

---

## Proposed Architecture

### Three-Agent System

```
┌─────────────────────────────────────────────────────────────────┐
│                     AGENTIC STORY LOOP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   ARCHITECT  │───▶│   WORDSMITH  │───▶│    CRITIC    │      │
│  │  (Structure) │    │   (Prose)    │    │  (Quality)   │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                              ▲                   │              │
│                              │                   ▼              │
│                              │            ┌──────────────┐      │
│                              └────────────│  APPROVED?   │      │
│                                   NO      └──────┬───────┘      │
│                              (max 2 rounds)      │ YES          │
│                                                  ▼              │
│                                         ┌──────────────┐        │
│                                         │   IMAGES     │        │
│                                         └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent A: The Architect (Structural Lead)

### Goal
Create a 10-page outline with precise emotional beats using Rule of Three + Story Spine hybrid.

### Output Structure

```typescript
interface EnhancedOutline {
  title: string;
  storyType: 'adventure' | 'emotional' | 'learning';
  emotionalTheme: string;  // "overcoming fear", "power of persistence"

  pages: Array<{
    pageNumber: 1-10;
    structuralRole: 'opening' | 'problem' | 'attempt1' | 'attempt2' |
                    'attempt3' | 'darkMoment' | 'breakthrough' | 'resolution';
    emotionalBeat: string;       // "Anticipation", "Frustration", "Triumph"
    tensionLevel: 1-10;          // Visualizes emotional arc
    plotPoint: string;           // What happens on this page
    causality: string;           // "Because of [previous], now [this]"
    visualHint: string;          // Key visual for illustration
  }>;

  // NEW: Story Elements for Coherence
  storyElements: {
    // Objects/characters introduced that MUST pay off later
    setups: Array<{
      element: string;           // "magic feather", "grumpy toad"
      introducedPage: number;    // Page where element first appears
      payoffPage: number;        // Page where element must be used
      payoffDescription: string; // How it should be used
    }>;

    // Primary setting + any location changes
    settings: Array<{
      location: string;          // "enchanted garden", "dark cave"
      description: string;       // Key visual details to maintain
      pages: number[];           // Which pages use this setting
    }>;

    // Character traits that must stay consistent
    characterTraits: {
      personality: string[];     // ["curious", "determined", "kind"]
      speechPattern: string;     // "asks lots of questions", "says 'oh my!'"
      physicalMannerisms: string[]; // ["skips when happy", "twirls hair when thinking"]
    };

    // Recurring motifs/phrases
    motifs: Array<{
      phrase: string;            // "One more try!"
      useOnPages: number[];      // [4, 6, 9]
    }>;
  };
}
```

### Emotional Beat Palette

| Category | Beats |
|----------|-------|
| **Positive** | Wonder, Curiosity, Excitement, Anticipation, Hope, Joy, Triumph, Pride |
| **Struggle** | Worry, Fear, Frustration, Disappointment, Doubt, Determination |
| **Resolution** | Relief, Satisfaction, Courage, Love |

### Tension Arc Requirement

```
Page:     1    2    3    4    5    6    7    8    9    10
Tension:  3    4    5    6    6    7    8    9    3    2
          └─opening─┘  └──attempts escalate──┘  │    └─resolution─┘
                                            dark moment
```

### System Prompt

```
You are THE ARCHITECT, a master children's story structuralist.

Your job: Create a 10-page story outline with precise emotional beats.

PROTAGONIST: ${childName}, ${childAge} years old
CHARACTER DESCRIPTION: ${characterDescription}
SETTING: ${theme.base_prompt}
STORY TYPE: ${storyType}

RULES:

1. RULE OF THREE
   - Exactly 3 failed attempts before success
   - Each attempt uses a DIFFERENT approach
   - Stakes escalate: attempt 3 > attempt 2 > attempt 1

2. STORY SPINE CAUSALITY
   - Each event must CAUSE the next
   - Use "Because of [previous], now [this]" structure
   - No random events or coincidences

3. EMOTIONAL BEATS
   - Assign ONE emotional beat per page
   - Beat must match structural role:
     • Opening pages (1-2): Wonder, Curiosity, Excitement
     • Problem (3): Anticipation mixed with Worry
     • Attempts (4-7): Determination → Frustration → Doubt
     • Dark Moment (8): Peak worry, but NOT scary
     • Breakthrough (9): Hope, Determination
     • Resolution (10): Triumph, Pride, Joy

4. TENSION ARC
   - Start at ~3 (calm, curious)
   - Peak at 8-9 during dark moment
   - End at 2-3 (satisfied, peaceful)

5. VISUAL HINTS (for illustrator)
   - Be SPECIFIC, not vague
   - ❌ "Maya looks sad"
   - ✅ "Maya sitting under drooping flower, shoulders slumped, single tear"

6. CHILD AS HERO
   - NO adults solving the problem
   - Child's own insight leads to breakthrough
   - Breakthrough should use something established earlier

7. STORY ELEMENTS (for coherence across pages)

   a) SETUPS & PAYOFFS
      - Introduce 2-3 meaningful elements early (pages 1-4)
      - Each element MUST pay off later (pages 8-10)
      - Examples:
        • "Magic feather" found on page 2 → used in breakthrough on page 9
        • "Grumpy toad" met on page 3 → returns to help on page 9
        • "Special song" heard on page 1 → child sings it to solve problem

   b) SETTINGS
      - Define 1-2 primary locations with SPECIFIC visual details
      - If location changes, specify WHICH pages use which setting
      - Details to maintain: colors, key objects, atmosphere
      - Example: "Enchanted garden with purple flowers, golden path,
                  talking mushrooms" → pages 1-5, 9-10

   c) CHARACTER TRAITS
      - Define 3 personality traits the child MUST show throughout
      - Define a speech pattern or catchphrase
      - Define 1-2 physical mannerisms
      - Example: curious (asks questions), determined ("one more try!"),
                 kind (helps others); twirls hair when thinking

   d) RECURRING MOTIFS
      - Create 1-2 phrases that repeat across the story
      - Specify which pages should use each phrase
      - Example: "Could this be the answer?" → pages 4, 6, 9

OUTPUT: Return valid JSON matching the EnhancedOutline schema.
```

---

## Agent B: The Wordsmith (Prose Lead)

### Goal
Transform the Architect's outline into toddler-friendly prose with sensory richness.

### Requirements

#### 1. Emotional Beat Fidelity
Each page's prose MUST embody its assigned emotional beat.

| Beat | How to Show |
|------|-------------|
| Anticipation | "Maya bounced on her toes. 'Is it time? Is it time?'" |
| Frustration | "Maya stomped her foot. The butterflies wouldn't listen!" |
| Triumph | "Maya threw her arms up high. 'I DID IT!'" |

#### 2. Sensory Language (Minimum per story)

| Sense | Minimum | Example |
|-------|---------|---------|
| Sound | 3 | "She heard the whooshing wind" |
| Touch | 3 | "The bumpy stone felt rough" |
| Sight | 3 | "Sparkly stars twinkled above" |

#### 3. Onomatopoeia (Minimum 3 per story)

```
Whoosh! Pop! Splash! Zoom! Crash! Thump! Squish!
Crackle! Swoosh! Plop! Bang! Buzz! Sizzle! Crunch!
```

#### 4. Show Don't Tell

| ❌ Telling | ✅ Showing |
|-----------|-----------|
| "Maya was scared" | "Maya's tummy did flip-flops. She hid behind the big rock." |
| "Maya felt happy" | "A giggle bubbled up from Maya's belly. She spun in circles!" |
| "Maya was tired" | "Maya's eyes got heavy. Her legs felt like wobbly noodles." |

#### 5. Repetition for Read-Along

Include callback phrases toddlers can chant:
- "Oh no! That didn't work!"
- "Maya had another idea..."
- "Could this be the answer?"
- "One more time!"

#### 6. Vocabulary Constraints

- Maximum 2 syllables for most words
- No words a 4-year-old wouldn't know
- When complex word needed, define through context:
  - ❌ "The aurora borealis shimmered"
  - ✅ "The sky danced with magical lights called the aurora"

#### 7. Coherence Requirements (NEW)

**a) Element Callbacks**
Every setup element from the Architect MUST appear on its payoff page:
- If "magic feather" is setup on page 2 with payoff on page 9, page 9 MUST reference the feather
- Don't just mention it - make it ESSENTIAL to the breakthrough

**b) Setting Consistency**
Maintain the Architect's setting details across all pages using that location:
- If "enchanted garden has purple flowers" - mention purple flowers on multiple garden pages
- When returning to a location, callback to earlier details ("the same golden path...")

**c) Character Voice Consistency**
The child must demonstrate their defined traits throughout:
- If trait is "curious" → show questioning behavior on multiple pages
- Use the defined catchphrase on specified pages
- Show physical mannerisms consistently (twirling hair, bouncing, etc.)

**d) Cross-Page Continuity (Balanced Approach)**
Create a connected story using a MIX of subtle and explicit approaches.

**PAGES 2-8: Prefer subtle, but verbal isn't banned**

✅ Subtle approaches (preferred):
- Visual continuity: "The purple flowers swayed" (same garden from page 1)
- Atmospheric echoes: Same weather, lighting, mood carries through
- Object presence: "Her pocket felt warm" (feather present but not named)
- Spatial logic: Movement through world makes sense

⚠️ Light verbal OK if natural:
- "The sparkly feather tickled her fingers" (natural, not forced)
- Brief mentions that don't feel like "remember when"

❌ Avoid heavy-handed callbacks:
- "Maya remembered the feather from before..."
- "Just like the toad had said..."
- "Using what she learned earlier..."

**PAGE 9 (Breakthrough): Explicit verbal callbacks ENCOURAGED**

This is where setups pay off — be clear and explicit:
- "Maya's hand brushed her pocket. The feather!"
- "Then she remembered what Shelly said..."
- The reader should clearly see the connection land.

**e) Motif Usage**
Recurring phrases should feel like character voice, not forced repetition:
- Place in moments of similar emotion (not mechanically)
- Can vary naturally ("One more try!" → "Just one more try!")
- Should feel like personality, not a writing device

### System Prompt

```
You are THE WORDSMITH, a master of toddler-friendly prose.

Your job: Transform the Architect's outline into magical, sensory-rich prose.

CHILD PROTAGONIST:
- Name: ${childName}
- Age: ${childAge} years old
- Description: ${characterDescription}

STORY OUTLINE:
${JSON.stringify(outline, null, 2)}

REQUIREMENTS:

1. EMOTIONAL BEAT FIDELITY
   - Each page MUST embody its assigned emotional beat
   - Read the beat, then write prose that SHOWS that emotion
   - Never name the emotion directly (no "Maya felt scared")

2. SENSORY LANGUAGE
   Per story minimum:
   - 3 sounds (heard): "the whooshing wind", "a soft whisper"
   - 3 textures (felt): "bumpy stone", "silky feathers"
   - 3 sights (saw): "sparkly stars", "swirling colors"

3. ONOMATOPOEIA
   Include at least 3: Whoosh! Pop! Splash! Zoom! Crash!
   Place them for maximum impact (action moments)

4. SHOW DON'T TELL
   Physical descriptions of emotions:
   - Fear → "tummy flip-flops", "wobbly knees", "hiding"
   - Joy → "bubbling giggle", "spinning", "jumping"
   - Frustration → "stomping", "crossing arms", "huffing"

5. REPETITION
   Use 2-3 callback phrases kids can read along:
   - "Oh no! That didn't work!"
   - "Maya had an idea..."
   - "Could this be it?"

6. VOCABULARY
   - 2 syllables max for most words
   - Define complex words through context
   - Write for a 4-year-old's comprehension

7. PAGE LENGTH
   - 3-5 sentences per page
   - Short sentences (5-10 words each)

8. COHERENCE (use the storyElements from the outline)

   a) ELEMENT CALLBACKS
      ${outline.storyElements.setups.map(s =>
        `- "${s.element}" introduced page ${s.introducedPage}
           → MUST appear on page ${s.payoffPage}: ${s.payoffDescription}`
      ).join('\n')}

   b) SETTING CONSISTENCY
      ${outline.storyElements.settings.map(s =>
        `- ${s.location} (pages ${s.pages.join(', ')}):
           Maintain these details: ${s.description}`
      ).join('\n')}

   c) CHARACTER VOICE
      - Personality: ${outline.storyElements.characterTraits.personality.join(', ')}
      - Speech pattern: ${outline.storyElements.characterTraits.speechPattern}
      - Mannerisms: ${outline.storyElements.characterTraits.physicalMannerisms.join(', ')}
      Show these traits THROUGHOUT the story, not just once.

   d) CROSS-PAGE REFERENCES
      Every page (except page 1) must reference something from earlier:
      - "The [element] from before..."
      - "Just like when..."
      - "Maya remembered..."

   e) RECURRING MOTIFS
      ${outline.storyElements.motifs.map(m =>
        `- Use "${m.phrase}" on pages: ${m.useOnPages.join(', ')}`
      ).join('\n')}

OUTPUT: Return JSON with pages array containing:
- pageNumber
- text (the prose)
- sceneDescription (for illustrator)
- imagePrompt (optimized for image generation)
```

---

## Agent C: The Critic (Editor-in-Chief)

### Goal
Evaluate the draft against professional picture book standards.

### Evaluation Rubric

**IMPORTANT**: No numeric scores. Binary pass/fail on specific criteria.

#### Structure Checks (ALL must pass)

| Check | Question |
|-------|----------|
| `problemClear` | Is the central problem crystal clear by page 3? |
| `threeAttempts` | Are there exactly 3 distinct solution attempts? |
| `attemptsEscalate` | Does each attempt have higher stakes than previous? |
| `darkMomentPresent` | Is there a genuine emotional low point? |
| `breakthroughEarned` | Does the solution use something established earlier? |
| `resolutionSolves` | Does the ending directly address the opening problem? |

#### Emotional Checks (ALL must pass)

| Check | Question |
|-------|----------|
| `beatsMatch` | Does each page embody its assigned emotional beat? |
| `showDontTell` | Are emotions shown through action (not named)? |
| `childIsHero` | Does the child solve it themselves (no adult rescue)? |
| `satisfyingEnding` | Does the reader feel triumph/relief at the end? |

#### Language Checks (3 of 4 must pass)

| Check | Question |
|-------|----------|
| `sensoryPresent` | At least 5 sensory details across the story? |
| `onomatopoeiaUsed` | At least 2 onomatopoeia words? |
| `repetitionUsed` | Callback phrases for read-along present? |
| `vocabularySimple` | No words a 4-year-old wouldn't know? |

#### Coherence Checks (ALL must pass) - NEW

| Check | Question |
|-------|----------|
| `elementsPayoff` | Do setup elements appear on their payoff pages (especially breakthrough)? |
| `settingsConsistent` | Are setting details (visual/atmospheric) maintained consistently? |
| `characterConsistent` | Does the child show their defined traits throughout (not just once)? |
| `continuityFeels` | Does the story feel connected? (visual cues, atmosphere, spatial logic) |
| `motifsNatural` | Do recurring phrases feel like character voice (not forced)? |

### Output Structure

```typescript
interface CriticEvaluation {
  // Results
  structurePass: boolean;     // All 6 structure checks pass
  emotionalPass: boolean;     // All 4 emotional checks pass
  languageScore: number;      // Count of 4 language checks that pass
  coherencePass: boolean;     // All 5 coherence checks pass (NEW)

  // Final verdict
  approved: boolean;          // structure AND emotional AND coherence pass, language >= 3

  // If NOT approved: Specific, actionable feedback
  editorNotes: Array<{
    page: number;
    issue: 'beat_mismatch' | 'tell_not_show' | 'stakes_flat' |
           'vocabulary' | 'missing_sensory' | 'weak_resolution' |
           'element_missing' | 'setting_inconsistent' |        // NEW
           'character_inconsistent' | 'no_cross_reference' |   // NEW
           'motif_missing';                                     // NEW
    current: string;          // Quote the problematic text
    suggestion: string;       // Specific replacement text
  }>;
}
```

### System Prompt

```
You are THE CRITIC, an exacting children's book editor with 20 years of experience.

Your job: Evaluate if this story meets professional picture book standards.

ORIGINAL OUTLINE:
${JSON.stringify(outline, null, 2)}

WORDSMITH'S DRAFT:
${JSON.stringify(narrative, null, 2)}

EVALUATE THESE CRITERIA:

═══════════════════════════════════════════════════════════════
STRUCTURE (all must pass for structurePass = true)
═══════════════════════════════════════════════════════════════

□ problemClear
  Is the central problem crystal clear by page 3?
  The reader should know exactly what the child wants/needs.

□ threeAttempts
  Are there exactly 3 distinct solution attempts?
  Each attempt should use a different approach.

□ attemptsEscalate
  Does each attempt have higher stakes than previous?
  Attempt 3 should feel like "last chance" energy.

□ darkMomentPresent
  Is there a genuine emotional low point (page 8)?
  Child should feel doubt/worry (but NOT scary for toddlers).

□ breakthroughEarned
  Does the solution use something established earlier?
  No random luck or deus ex machina.

□ resolutionSolves
  Does the ending directly address the opening problem?
  If page 3 problem was "can't fly", resolution must show flying.

═══════════════════════════════════════════════════════════════
EMOTIONAL (all must pass for emotionalPass = true)
═══════════════════════════════════════════════════════════════

□ beatsMatch
  Does each page embody its assigned emotional beat?
  Check outline beat vs. prose tone for each page.

□ showDontTell
  Are emotions shown through physical action?
  ❌ "Maya was scared" ✅ "Maya's knees wobbled"

□ childIsHero
  Does the child solve the problem themselves?
  No parent/adult/magical creature saving the day.

□ satisfyingEnding
  Does the reader feel triumph/relief at the end?
  The struggle must make victory feel earned.

═══════════════════════════════════════════════════════════════
LANGUAGE (3 of 4 must pass)
═══════════════════════════════════════════════════════════════

□ sensoryPresent
  At least 5 sensory details (sound/touch/sight) across story?

□ onomatopoeiaUsed
  At least 2 onomatopoeia words (Whoosh! Pop! Splash!)?

□ repetitionUsed
  Callback phrases for read-along present?
  ("Oh no!", "One more time!", "Maya had an idea!")

□ vocabularySimple
  No words a 4-year-old wouldn't know?
  Check for complex vocabulary that needs simplification.

═══════════════════════════════════════════════════════════════
COHERENCE (all must pass for coherencePass = true) - NEW
═══════════════════════════════════════════════════════════════

□ elementsPayoff
  Check EACH setup element from outline.storyElements.setups:
  - Does "${element}" appear on page ${payoffPage}?
  - Is it used meaningfully (not just mentioned)?
  If ANY element is missing its payoff, FAIL.

□ settingsConsistent
  For each setting in outline.storyElements.settings:
  - Are the key visual details maintained across all pages using it?
  - If child returns to a location, does prose callback to earlier details?
  Look for contradictions (purple flowers → suddenly pink flowers).

□ characterConsistent
  Check outline.storyElements.characterTraits:
  - Is each personality trait shown on at least 3 different pages?
  - Is the speech pattern/catchphrase used?
  - Are physical mannerisms shown consistently?
  Child should feel like the SAME character throughout.

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

  PASS if pages 2-8 feel connected (subtle or verbal) AND page 9 has clear payoff.
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

approved = (structurePass AND emotionalPass AND coherencePass AND languageScore >= 3)

IF NOT APPROVED:
Provide exactly 3 Editor's Notes with:
- page: Which page number
- issue: Category from the list above
- current: Quote the exact problematic text
- suggestion: Provide specific replacement text

Be SPECIFIC. Don't say "make it more emotional."
Say "Replace 'Maya was sad' with 'Maya's lip wobbled. A tear rolled down her cheek.'"

OUTPUT: Return valid JSON matching the CriticEvaluation schema.
```

---

## Coherence Layer (Cross-Page Consistency)

### Why Coherence Matters

Without explicit coherence tracking, AI-generated stories often feel like **10 disconnected vignettes** rather than one unified narrative. Common issues:

| Problem | Example |
|---------|---------|
| **Dropped elements** | Magic feather introduced on page 2, never mentioned again |
| **Setting contradictions** | "Purple flowers" on page 1, "yellow flowers" on page 7 |
| **Character inconsistency** | Child is brave on page 3, suddenly timid on page 6 |
| **No callbacks** | Each page reads independently, no "remember when..." |
| **Timeline confusion** | "Next morning" on page 5, "that afternoon" on page 6 |

### How We Solve It

```
┌─────────────────────────────────────────────────────────────────┐
│                    COHERENCE TRACKING FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ARCHITECT creates storyElements:                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Setups: "magic feather" (page 2 → payoff page 9)      │   │
│  │ • Settings: "garden" (pages 1-5), "cave" (pages 6-8)    │   │
│  │ • Traits: curious, determined, catchphrase "oh my!"      │   │
│  │ • Motifs: "One more try!" on pages 4, 6, 9              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  WORDSMITH receives storyElements and MUST:                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Use "magic feather" in breakthrough (page 9)          │   │
│  │ • Describe garden consistently (purple flowers, etc.)    │   │
│  │ • Show curiosity on multiple pages, use "oh my!"        │   │
│  │ • Reference earlier events on each page (2-10)          │   │
│  │ • Use "One more try!" exactly on pages 4, 6, 9          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  CRITIC verifies coherence:                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ □ All setups have payoffs? ✓                            │   │
│  │ □ Settings consistent? ✓                                │   │
│  │ □ Character voice consistent? ✓                         │   │
│  │ □ Cross-references on pages 2-10? ✓                     │   │
│  │ □ Motifs used on correct pages? ✓                       │   │
│  │ → coherencePass = true                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Example: Coherent Story Elements

```json
{
  "storyElements": {
    "setups": [
      {
        "element": "sparkly feather",
        "introducedPage": 2,
        "payoffPage": 9,
        "payoffDescription": "Maya uses the feather to tickle the grumpy cloud, making it laugh and release the rain"
      },
      {
        "element": "old turtle Shelly",
        "introducedPage": 3,
        "payoffPage": 9,
        "payoffDescription": "Shelly's earlier advice 'slow and steady' inspires Maya's final approach"
      }
    ],
    "settings": [
      {
        "location": "Sunny Meadow",
        "description": "Rolling green hills, purple wildflowers, a big oak tree, fluffy clouds",
        "pages": [1, 2, 3, 10]
      },
      {
        "location": "Grumpy Cloud's Sky",
        "description": "Gray and swirly, rumbling thunder, cold wind",
        "pages": [4, 5, 6, 7, 8, 9]
      }
    ],
    "characterTraits": {
      "personality": ["curious", "determined", "kind"],
      "speechPattern": "asks 'what if...?' questions",
      "physicalMannerisms": ["skips when happy", "taps chin when thinking"]
    },
    "motifs": [
      {
        "phrase": "What if I try...?",
        "useOnPages": [4, 6, 8]
      },
      {
        "phrase": "One more try!",
        "useOnPages": [5, 7, 9]
      }
    ]
  }
}
```

### Coherence in Action (Subtle Approach)

**Page 2 (Setup):**
> "Look!" Maya skipped through the purple wildflowers. Something sparkly caught her eye. A beautiful feather! Maya tucked it in her pocket. "I'll keep you safe," she whispered.

**Page 5 (Visual continuity - no explicit callback):**
> The gray clouds grumbled overhead. Maya's pocket felt warm against her leg. She tapped her chin, thinking. "What if I try singing?"

*Note: The feather isn't mentioned by name, but "pocket felt warm" creates subtle presence.*

**Page 7 (Atmospheric echo):**
> Cold wind whooshed past. Maya hugged herself tight. Below, she could just see the purple wildflowers — so far away now.

*Note: Visual callback to the meadow creates longing/connection without explicit "remember when."*

**Page 9 (Explicit payoff - OK here):**
> Maya's hand brushed her pocket. The feather! She pulled it out, sparkles dancing. "What if I try... tickling you?" SWOOSH! The feather danced across the cloud. The grumpy cloud... GIGGLED!

*Note: Breakthrough moment can have explicit callback — this is where payoff lands.*

**Why this works:**
- Feather presence felt subtly (warm pocket) before explicit use
- Visual/atmospheric echoes (purple wildflowers seen from above) create connection
- Character mannerisms consistent (taps chin when thinking, skips when happy)
- Explicit callback reserved for the BREAKTHROUGH — feels earned, not repetitive

---

## Loop Orchestration

### Flow Control

```typescript
const MAX_REVISIONS = 2;

async function runAgenticStoryLoop(input: StoryInput): Promise<StoryNarrative> {

  // Phase 1: Architect creates outline
  console.log('[Agentic] Architect designing structure...');
  const outline = await architectAgent(input);

  let narrative: StoryNarrative;
  let evaluation: CriticEvaluation;
  let revisionCount = 0;

  // Phase 2: Wordsmith/Critic loop
  do {
    // Wordsmith writes/revises prose
    console.log(`[Agentic] Wordsmith writing... (revision ${revisionCount})`);
    narrative = await wordsmithAgent(
      input,
      outline,
      revisionCount > 0 ? evaluation.editorNotes : undefined
    );

    // Critic evaluates
    console.log('[Agentic] Critic reviewing...');
    evaluation = await criticAgent(outline, narrative);

    revisionCount++;

    if (!evaluation.approved) {
      console.log(`[Agentic] Critic rejected. Issues: ${evaluation.editorNotes.length}`);

      if (revisionCount >= MAX_REVISIONS) {
        console.warn('[Agentic] Max revisions reached, accepting current draft');
        break;
      }
    }

  } while (!evaluation.approved && revisionCount < MAX_REVISIONS);

  console.log(`[Agentic] Story approved after ${revisionCount} revision(s)`);
  return narrative;
}
```

### Progress Updates for UI

```typescript
// Update progress messages for each phase
const AGENTIC_STAGES = {
  structuring: 'The Architect is designing your story...',
  writing: 'The Wordsmith is crafting magical prose...',
  reviewing: 'The Critic is checking quality...',
  revising: 'The Wordsmith is polishing based on feedback...',
  approved: 'Story approved! Creating illustrations...',
};
```

---

## Performance Analysis

### API Call Comparison

| Scenario | API Calls | Est. Time |
|----------|-----------|-----------|
| Current (linear) | 2 | ~15 sec |
| Agentic (approved first try) | 3 | ~20 sec |
| Agentic (1 revision) | 5 | ~30 sec |
| Agentic (2 revisions, max) | 7 | ~45 sec |
| Agentic + 10 images | 7 + 10 = 17 | ~2-3 min |

### Mitigation Strategies

1. **Use faster model for Critic**
   - Critic needs less creativity, more analysis
   - Use the configured server-side text model

2. **Parallel processing**
   - Start image generation for approved pages while later pages generate

3. **Cache character descriptions**
   - Don't re-analyze photos if already done

4. **Timeout protection**
   - 60s timeout per agent call
   - Force accept after 2 revisions

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add `EnhancedOutline`, `CriticEvaluation`, `EditorNote` types |
| `src/services/ai/architectAgent.ts` | Create | Outline generation with per-page beats |
| `src/services/ai/wordsmithAgent.ts` | Create | Prose generation with sensory requirements |
| `src/services/ai/criticAgent.ts` | Create | Structured evaluation |
| `src/services/ai/agenticStoryLoop.ts` | Create | 3-agent loop orchestration |
| `src/services/ai/storyOrchestrator.ts` | Modify | Replace linear flow with agentic loop |
| `src/utils/constants.ts` | Modify | Add `MAX_REVISION_ROUNDS = 2` |
| `src/components/creation/GenerationProgress.tsx` | Modify | Add agentic stage messages |

---

## Testing Plan

### Unit Tests

1. **Architect Output Validation**
   - Verify emotional beats assigned to all pages
   - Verify tension arc rises and falls correctly
   - Verify causality chain is present
   - **Verify storyElements includes setups, settings, traits, motifs**

2. **Wordsmith Output Validation**
   - Count sensory words (≥5)
   - Count onomatopoeia (≥2)
   - Check for "telling" words (scared, happy, sad)
   - **Verify setup elements appear on payoff pages**
   - **Verify cross-references on pages 2-10**

3. **Critic Evaluation Consistency**
   - Same story should get same verdict on repeated runs
   - Editor's notes should be specific and actionable
   - **Verify coherence checks catch missing payoffs**

### Integration Tests

4. **Loop Convergence**
   - Verify max 2 revisions enforced
   - Verify approved stories pass all criteria

5. **Coherence Integration** (NEW)
   - Generate story, verify ALL setups pay off
   - Verify NO setting contradictions
   - Verify character feels consistent across pages
   - Verify recurring motifs used on correct pages

6. **End-to-End**
   - Generate 10 stories, manually score quality
   - Compare to old system (A/B test)
   - **Rate coherence: "Does this feel like ONE story?"**

### Performance Tests

7. **Latency**
   - Measure p50, p95, p99 generation times
   - Ensure <3 minutes for full story + images

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Sensory details per story | ~1-2 | ≥5 |
| Onomatopoeia per story | ~0-1 | ≥3 |
| "Show don't tell" violations | Unknown | 0 |
| Stories with clear problem by p3 | ~70% | 100% |
| Stories with earned breakthrough | ~50% | 100% |
| **Setup elements that pay off** | Unknown | 100% |
| **Pages with cross-references** | ~30% | 100% (p2-10) |
| **Character trait consistency** | Unknown | All traits shown ≥3x |
| **Setting detail consistency** | Unknown | 0 contradictions |
| Parent satisfaction (survey) | TBD | ≥8/10 |

---

## Example Output Comparison

### Before (Current System)

**Page 5:**
> "Maya tried to catch the butterfly. It flew away. Maya was sad. She sat down on a rock."

**Issues:**
- No sensory language
- "Maya was sad" = telling, not showing
- No emotional depth

### After (Agentic System)

**Page 5 (Emotional Beat: Frustration → Disappointment):**
> "Maya reached up, up, UP on her tippy-toes. WHOOSH! The butterfly swooped away, its sparkly wings tickling her nose. 'Oh no! That didn't work!' Maya's arms flopped to her sides like wet noodles. She plopped onto the bumpy rock, her chin resting in her hands."

**Improvements:**
- Sensory: "sparkly wings tickling her nose", "bumpy rock"
- Onomatopoeia: "WHOOSH!"
- Show don't tell: "arms flopped like wet noodles", "chin in hands"
- Repetition phrase: "Oh no! That didn't work!"
- Emotional beat shown through physical action

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Critic always rejects | Infinite loop | Hard cap at 2 revisions |
| Critic always approves | No quality improvement | Test rubric strictness, tune criteria |
| Latency too high | Poor UX | Use faster model for Critic, show progress |
| Agents ignore instructions | Poor output | Use structured JSON schemas, validate |
| Cost increase (3x API calls) | Higher expenses | Monitor usage, consider caching |
| **Architect creates impossible setups** | Wordsmith can't pay off | Validate setups are achievable in story context |
| **Too many coherence constraints** | Stifles creativity | Balance: 2-3 setups max, 1-2 motifs max |
| **Coherence checks too strict** | Always fails | Tune: allow 1 minor miss, require major elements |
| **Cross-references feel forced** | Unnatural prose | Provide natural callback templates |

---

## Rollout Plan

### Phase 1: Shadow Mode (Week 1)
- Run new system in parallel with old
- Log outputs but don't serve to users
- Measure quality and latency

### Phase 2: A/B Test (Week 2)
- 10% of users get new system
- Collect parent feedback
- Monitor error rates

### Phase 3: Full Rollout (Week 3)
- If metrics positive, roll out to 100%
- Keep old system as fallback
- Monitor and iterate

---

## Appendix: Prompt Templates

See individual agent sections above for complete system prompts.
