import { useQuery } from '@tanstack/react-query';
import { getActiveThemes, getActiveArtStyles } from '@/services/supabase/database';

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: getActiveThemes,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useArtStyles() {
  return useQuery({
    queryKey: ['artStyles'],
    queryFn: getActiveArtStyles,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
