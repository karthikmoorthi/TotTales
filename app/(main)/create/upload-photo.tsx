import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStoryCreation } from '@/contexts/StoryCreationContext';
import { useCreateChild } from '@/hooks/useChildren';
import { Header, Button } from '@/components/ui';
import { PhotoUploader, ChildForm } from '@/components/creation';
import { COLORS, SPACING } from '@/utils/constants';

interface ChildFormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other' | null;
}

export default function UploadPhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { setChildInfo, setCharacterDescription } = useStoryCreation();
  const createChild = useCreateChild();

  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    age: '',
    gender: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ChildFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ChildFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.age && (isNaN(parseInt(formData.age)) || parseInt(formData.age) < 0 || parseInt(formData.age) > 18)) {
      newErrors.age = 'Please enter a valid age (0-18)';
    }

    if (photos.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo of your child.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate() || !user) return;

    try {
      const child = await createChild.mutateAsync({
        userId: user.id,
        name: formData.name.trim(),
        ageYears: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender ?? undefined,
        photoUris: photos,
      });

      // Update context
      setChildInfo(
        child.id,
        child.name,
        [child.primary_photo_url, ...(child.additional_photos || [])].filter(Boolean) as string[]
      );

      if (child.character_description) {
        setCharacterDescription(child.character_description);
      }

      router.push('/(main)/create/select-theme');
    } catch (error) {
      console.error('Error creating child:', error);
      Alert.alert('Error', 'Failed to save child profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Add Your Child"
        subtitle="Step 1 of 3"
        showBack
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <PhotoUploader photos={photos} onPhotosChange={setPhotos} />

          <View style={styles.divider} />

          <ChildForm
            data={formData}
            onChange={setFormData}
            errors={errors}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={createChild.isPending}
            disabled={photos.length === 0 || !formData.name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
});
