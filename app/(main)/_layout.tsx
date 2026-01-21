import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create/upload-photo" />
      <Stack.Screen name="create/select-theme" />
      <Stack.Screen name="create/select-style" />
      <Stack.Screen name="create/generating" />
      <Stack.Screen name="read/[storyId]" />
      <Stack.Screen name="library/index" />
    </Stack>
  );
}
