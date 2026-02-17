import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStoriesByUser,
  getStoryWithPages,
  deleteStory,
} from '@/services/supabase/database';
import { createCompleteStory, regeneratePageIllustration } from '@/services/ai';
import { GenerationProgress } from '@/types';
import { useState } from 'react';

export function useUserStories(userId: string | undefined) {
  return useQuery({
    queryKey: ['stories', userId],
    queryFn: () => getStoriesByUser(userId!),
    enabled: !!userId,
  });
}

export function useStoryWithPages(storyId: string | undefined) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: () => getStoryWithPages(storyId!),
    enabled: !!storyId,
    refetchInterval: (query) => {
      // Refetch while generating
      const data = query.state.data;
      if (data?.story.status === 'generating') {
        return 3000;
      }
      return false;
    },
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<GenerationProgress | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: {
      userId: string;
      childId: string;
      themeId: string;
      artStyleId: string;
    }) => {
      return createCompleteStory(input, setProgress);
    },
    onSuccess: (storyId) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    },
    onSettled: () => {
      setProgress(null);
    },
  });

  return {
    ...mutation,
    progress,
  };
}

export function useRegeneratePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, pageId }: { storyId: string; pageId: string }) => {
      return regeneratePageIllustration(storyId, pageId);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
