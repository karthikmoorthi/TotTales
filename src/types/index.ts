export * from './database';

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
  stage: 'analyzing' | 'writing' | 'illustrating' | 'finalizing';
  currentPage: number;
  totalPages: number;
  message: string;
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
