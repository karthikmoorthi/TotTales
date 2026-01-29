import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Theme } from '@/types';
import { generateThemePreview } from '@/services/ai/previewImageGenerator';

interface GenerationProgress {
  isGenerating: boolean;
  currentTheme: string | null;
  completed: number;
  total: number;
}

/**
 * Hook to automatically generate missing theme preview images
 */
export function useThemePreviewGeneration(themes: Theme[] | undefined) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<GenerationProgress>({
    isGenerating: false,
    currentTheme: null,
    completed: 0,
    total: 0,
  });

  const generateMissingPreviews = useCallback(async () => {
    if (!themes) return;

    // Find themes without preview images
    const themesWithoutImages = themes.filter((t) => !t.preview_image_url);

    if (themesWithoutImages.length === 0) {
      return;
    }

    setProgress({
      isGenerating: true,
      currentTheme: null,
      completed: 0,
      total: themesWithoutImages.length,
    });

    for (let i = 0; i < themesWithoutImages.length; i++) {
      const theme = themesWithoutImages[i];

      setProgress((prev) => ({
        ...prev,
        currentTheme: theme.display_name,
        completed: i,
      }));

      try {
        await generateThemePreview(theme.name);

        // Invalidate the themes query to refresh data
        await queryClient.invalidateQueries({ queryKey: ['themes'] });
      } catch (error) {
        console.error(`Failed to generate preview for ${theme.name}:`, error);
      }

      // Small delay between generations to avoid rate limits
      if (i < themesWithoutImages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    setProgress({
      isGenerating: false,
      currentTheme: null,
      completed: themesWithoutImages.length,
      total: themesWithoutImages.length,
    });
  }, [themes, queryClient]);

  // Auto-generate missing previews when themes load
  useEffect(() => {
    if (themes && themes.length > 0 && !progress.isGenerating) {
      const hasAnyMissing = themes.some((t) => !t.preview_image_url);
      if (hasAnyMissing) {
        generateMissingPreviews();
      }
    }
  }, [themes?.length]); // Only trigger when themes first load

  return {
    progress,
    generateMissingPreviews,
  };
}
