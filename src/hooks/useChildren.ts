import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChildrenByUser,
  getChildById,
  createChild,
  updateChild,
} from '@/services/supabase/database';
import { uploadChildPhoto } from '@/services/supabase/storage';
import { analyzeChildPhotos } from '@/services/ai';
import { ChildInsert } from '@/types';

export function useUserChildren(userId: string | undefined) {
  return useQuery({
    queryKey: ['children', userId],
    queryFn: () => getChildrenByUser(userId!),
    enabled: !!userId,
  });
}

export function useChild(childId: string | undefined) {
  return useQuery({
    queryKey: ['child', childId],
    queryFn: () => getChildById(childId!),
    enabled: !!childId,
  });
}

interface CreateChildInput {
  userId: string;
  name: string;
  ageYears?: number;
  gender?: 'male' | 'female' | 'other';
  photoUris: string[];
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateChildInput) => {
      const { userId, name, ageYears, gender, photoUris } = input;

      // Create child record first
      const child = await createChild({
        user_id: userId,
        name,
        age_years: ageYears ?? null,
        gender: gender ?? null,
      });

      // Upload photos
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photoUris.length; i++) {
        const url = await uploadChildPhoto(userId, child.id, photoUris[i], i);
        uploadedUrls.push(url);
      }

      // Analyze photos and generate character description
      let characterDescription: string | null = null;
      if (uploadedUrls.length > 0) {
        try {
          characterDescription = await analyzeChildPhotos(
            photoUris,
            name,
            ageYears,
            gender
          );
        } catch (error) {
          console.error('Error analyzing photos:', error);
        }
      }

      // Update child with photos and description
      const updatedChild = await updateChild(child.id, {
        primary_photo_url: uploadedUrls[0] || null,
        additional_photos: uploadedUrls.slice(1),
        character_description: characterDescription,
      });

      return updatedChild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      updates,
    }: {
      childId: string;
      updates: Parameters<typeof updateChild>[1];
    }) => {
      return updateChild(childId, updates);
    },
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['child', childId] });
    },
  });
}
