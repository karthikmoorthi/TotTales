import React, { createContext, useContext, useState, useCallback } from 'react';
import { StoryCreationState } from '@/types';

interface StoryCreationContextType {
  state: StoryCreationState;
  setChildInfo: (childId: string, childName: string, photos: string[]) => void;
  setCharacterDescription: (description: string) => void;
  setTheme: (themeId: string) => void;
  setArtStyle: (artStyleId: string) => void;
  reset: () => void;
  isComplete: () => boolean;
}

const initialState: StoryCreationState = {
  childId: null,
  childName: '',
  childPhotos: [],
  themeId: null,
  artStyleId: null,
  characterDescription: null,
};

const StoryCreationContext = createContext<StoryCreationContextType | undefined>(undefined);

export function StoryCreationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoryCreationState>(initialState);

  const setChildInfo = useCallback((childId: string, childName: string, photos: string[]) => {
    setState((prev) => ({
      ...prev,
      childId,
      childName,
      childPhotos: photos,
    }));
  }, []);

  const setCharacterDescription = useCallback((description: string) => {
    setState((prev) => ({
      ...prev,
      characterDescription: description,
    }));
  }, []);

  const setTheme = useCallback((themeId: string) => {
    setState((prev) => ({
      ...prev,
      themeId,
    }));
  }, []);

  const setArtStyle = useCallback((artStyleId: string) => {
    setState((prev) => ({
      ...prev,
      artStyleId,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isComplete = useCallback(() => {
    return !!(
      state.childId &&
      state.childName &&
      state.childPhotos.length > 0 &&
      state.themeId &&
      state.artStyleId
    );
  }, [state]);

  const value: StoryCreationContextType = {
    state,
    setChildInfo,
    setCharacterDescription,
    setTheme,
    setArtStyle,
    reset,
    isComplete,
  };

  return (
    <StoryCreationContext.Provider value={value}>
      {children}
    </StoryCreationContext.Provider>
  );
}

export function useStoryCreation() {
  const context = useContext(StoryCreationContext);
  if (context === undefined) {
    throw new Error('useStoryCreation must be used within a StoryCreationProvider');
  }
  return context;
}
