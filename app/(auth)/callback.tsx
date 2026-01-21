import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function CallbackScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(main)');
    }
  }, [isAuthenticated, router]);

  return <LoadingSpinner fullScreen message="Completing sign in..." />;
}
