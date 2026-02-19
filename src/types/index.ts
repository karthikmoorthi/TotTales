export * from './database';

// Story type selection
export type StoryType = 'adventure' | 'emotional' | 'learning';

// Story outline structure (Rule of Three) - Legacy, kept for transition
export interface StoryOutline {
  title: string;
  storyType: StoryType;
  emotionalTheme: string;
  structure: {
    opening: string;
    problem: string;
    attempt1: string;
    attempt2: string;
    attempt3: string;
    darkMoment: string;
    breakthrough: string;
    resolution: string;
  };
}

// ============================================
// AGENTIC ARCHITECTURE TYPES (TotTales 2.0)
// ============================================

// Structural roles for each page in Rule of Three
export type StructuralRole =
  | 'opening'
  | 'problem'
  | 'attempt1'
  | 'attempt2'
  | 'attempt3'
  | 'darkMoment'
  | 'breakthrough'
  | 'resolution';

// Emotional palette for story beats
export type EmotionalBeat =
  | 'wonder'
  | 'curiosity'
  | 'excitement'
  | 'anticipation'
  | 'worry'
  | 'fear'
  | 'frustration'
  | 'disappointment'
  | 'doubt'
  | 'determination'
  | 'hope'
  | 'courage'
  | 'relief'
  | 'joy'
  | 'triumph'
  | 'pride';

// Per-page outline from Architect
export interface PageOutline {
  pageNumber: number;
  structuralRole: StructuralRole;
  emotionalBeat: EmotionalBeat;
  tensionLevel: number; // 1-10, peaks at dark moment
  plotPoint: string; // What happens on this page
  causality: string; // "Because of [previous], now [this]"
  visualHint: string; // Key visual for illustration
}

// Setup element that pays off later
export interface SetupElement {
  element: string; // "sparkly feather", "wise turtle Shelly"
  introducedPage: number;
  payoffPage: number;
  purpose: string; // "Will be used to solve the problem"
}

// Location with consistent details
export interface SettingLocation {
  name: string; // "the meadow", "cloud kingdom"
  firstAppearance: number;
  details: string[]; // "purple wildflowers", "soft grass"
  appearsOnPages: number[];
}

// Character personality for consistency
export interface CharacterTraits {
  personality: string[]; // ["curious", "determined", "kind"]
  catchphrase: string; // "What if I try...?"
  physicalMannerisms: string[]; // ["taps chin when thinking", "skips when happy"]
}

// Recurring phrase/motif
export interface StoryMotif {
  phrase: string; // "One more try!"
  usedOnPages: number[];
  emotionalContext: string; // "Used when Maya decides to persist"
}

// All story elements for coherence tracking
export interface StoryElements {
  setups: SetupElement[];
  settings: SettingLocation[];
  characterTraits: CharacterTraits;
  motifs: StoryMotif[];
}

// Enhanced outline from Architect Agent
export interface EnhancedOutline {
  title: string;
  storyType: StoryType;
  emotionalTheme: string;
  childName: string;
  pages: PageOutline[];
  storyElements: StoryElements;
}

// Editor's note from Critic (specific, actionable feedback)
export type CriticIssueType =
  | 'beat_mismatch'
  | 'tell_not_show'
  | 'stakes_flat'
  | 'vocabulary'
  | 'missing_sensory'
  | 'coherence_break'
  | 'structure_issue';

export interface EditorNote {
  page: number;
  issue: CriticIssueType;
  current: string; // What's wrong
  suggestion: string; // Specific fix
}

// Critic's evaluation result
export interface CriticEvaluation {
  approved: boolean;
  structurePass: boolean;
  emotionalPass: boolean;
  languagePass: boolean;
  coherencePass: boolean;
  editorNotes: EditorNote[]; // Max 3 actionable notes if not approved
}

// Story creation flow types
export interface StoryCreationState {
  childId: string | null;
  childName: string;
  childPhotos: string[];
  themeId: string | null;
  artStyleId: string | null;
  characterDescription: string | null;
}

export interface GenerationProgress {
  stage:
    | 'analyzing'
    | 'outlining'
    | 'writing'
    | 'reviewing'
    | 'revising'
    | 'illustrating'
    | 'finalizing';
  currentPage: number;
  totalPages: number;
  message: string;
  revision?: number; // Current revision round (0-2)
}

export interface StoryNarrative {
  title: string;
  pages: PageNarrative[];
}

export interface PageNarrative {
  pageNumber: number;
  text: string;
  sceneDescription: string;
  imagePrompt: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

// Navigation types
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/callback': undefined;
  '(main)': undefined;
  '(main)/index': undefined;
  '(main)/create/upload-photo': undefined;
  '(main)/create/select-theme': undefined;
  '(main)/create/select-style': undefined;
  '(main)/create/generating': { storyId: string };
  '(main)/read/[storyId]': { storyId: string };
  '(main)/library': undefined;
};
