# TotTales Story Generation Pipeline

## Overview

TotTales generates personalized children's storybooks using a multi-phase pipeline backed by server-side OpenAI calls. The system creates 10-page illustrated stories where the child is the hero.

---

## 1. Story Line Generation

### Phase 1: Character Analysis
**Provider:** OpenAI Responses API with image inputs

When a parent uploads photos of their child, the AI analyzes them to create a **character description**:
- Hair (color, style, length, texture)
- Eyes (color, shape)
- Skin tone and face shape
- Distinctive features (dimples, freckles)

This description ensures visual consistency across all illustrations.

### Phase 2: Story Outline Generation
**Provider:** OpenAI Responses API

Before writing the full narrative, the system generates a structured **outline** using the "Rule of Three" - a proven children's literature technique:

| Section | Purpose |
|---------|---------|
| **Opening** | Hook + character introduction in the setting |
| **Problem** | Central challenge the child faces |
| **Attempt 1** | First solution attempt → fails |
| **Attempt 2** | Second attempt with higher stakes → fails |
| **Attempt 3** | Third attempt with highest stakes → fails |
| **Dark Moment** | Emotional low point (age-appropriate worry) |
| **Breakthrough** | Child discovers the key insight |
| **Resolution** | Child succeeds + emotional payoff |

The outline is shaped by the selected **Story Type**:
- **Adventure**: Action-packed with discoveries and bravery
- **Emotional**: Focuses on feelings, friendship, overcoming fears
- **Learning**: Curiosity-driven with "aha" moments

### Phase 3: Narrative Expansion
**Provider:** OpenAI Responses API

The outline is expanded into a full 10-page narrative:

```
Pages 1-2:  Opening (hook + setup)
Page 3:     Problem introduced
Pages 4-5:  First attempt and failure
Page 6:     Second attempt (higher stakes)
Page 7:     Third attempt (highest stakes)
Page 8:     Dark moment
Page 9:     Breakthrough
Page 10:    Resolution
```

Each page includes:
- **Narrative text** (3-4 simple sentences for ages 2-6)
- **Scene description** (detailed visual description)
- **Image prompt** (optimized for illustration generation)

---

## 2. Illustration Generation

### Per-Page Image Creation
**Provider:** GPT Image 2

For each of the 10 pages, an illustration is generated using a composite prompt:

```
[Art Style Modifier]          ← Selected style (Watercolor, Cartoon, etc.)
+
[Character Description]       ← From photo analysis
+
[Scene Description]           ← From narrative generation
+
[Safety Requirements]         ← Child-appropriate content
```

### Art Style Modifiers
Each art style has a unique prompt modifier:
- **Watercolor Whimsy**: Soft, flowing watercolor with dreamy textures
- **Bright & Playful**: Bold colors, simple shapes, high contrast
- **Classic Storybook**: Traditional illustration with warm tones
- **Paper Cutout**: Layered paper collage aesthetic
- **Soft Digital**: Smooth gradients, gentle lighting
- **Crayon Charm**: Hand-drawn crayon texture

### Character Consistency
The prompt structure ensures the child looks consistent across all pages:
```
CHARACTER: Maintain EXACT consistency with this description.
Name: [Child's Name]
Description: [AI-generated physical description from photos]
```

### Safety Guardrails
- Content filtered for child-appropriateness
- Blocked terms prevent inappropriate imagery
- Retry logic (3 attempts) handles API failures
- 60-second timeout prevents hanging requests

---

## Technical Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │───▶│   Analyze   │───▶│   Outline   │───▶│   Write     │
│   Photos    │    │   Photos    │    │   Story     │    │   Narrative │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                         │                                       │
                         ▼                                       ▼
              ┌─────────────────────┐               ┌─────────────────────┐
              │ Character           │               │ 10 Pages with:      │
              │ Description         │──────────────▶│ - Text              │
              │ (for consistency)   │               │ - Scene Description │
              └─────────────────────┘               │ - Image Prompt      │
                                                    └─────────────────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────────┐
                                                    │ Generate 10         │
                                                    │ Illustrations       │
                                                    │ (GPT Image 2)       │
                                                    └─────────────────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────────┐
                                                    │ Upload to Supabase  │
                                                    │ Storage             │
                                                    └─────────────────────┘
```

---

## Why This Approach Works

1. **Two-phase generation** (outline → expand) creates coherent narratives with proper story arcs
2. **Rule of Three** is a proven technique in children's literature for emotional satisfaction
3. **Character analysis** from real photos creates personalized, recognizable illustrations
4. **Story type selection** lets parents choose the emotional tone
5. **Structured prompts** ensure age-appropriate, safe content

The result: Stories that feel professionally authored, not AI-generated, with the child as a true hero who earns their success through perseverance.
