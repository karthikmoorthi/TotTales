import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { AuthUser } from '@/types';
import {
  signInWithGoogle,
  signOut as supabaseSignOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
} from '@/services/supabase';

WebBrowser.maybeCompleteAuthSession();

const NONCE_STORAGE_KEY = 'google_auth_nonce';

// Helper to persist nonce across web redirects
function storeNonce(nonce: string) {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(NONCE_STORAGE_KEY, nonce);
  }
}

function getStoredNonce(): string | null {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(NONCE_STORAGE_KEY);
  }
  return null;
}

function clearStoredNonce() {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(NONCE_STORAGE_KEY);
  }
}

// Generate a random string for nonce
function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store raw nonce for Supabase verification
  const rawNonceRef = useRef<string>('');
  const [hashedNonce, setHashedNonce] = useState<string>('');

  // Generate nonce on mount
  useEffect(() => {
    async function initNonce() {
      // Check if we have a stored nonce from before redirect (web)
      const storedNonce = getStoredNonce();
      if (storedNonce) {
        rawNonceRef.current = storedNonce;
        // Hash it for consistency (though we won't use it for the current response)
        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          storedNonce
        );
        setHashedNonce(hashed);
      } else {
        // Generate fresh nonce
        const rawNonce = generateRandomString(32);
        rawNonceRef.current = rawNonce;
        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          rawNonce
        );
        setHashedNonce(hashed);
      }
    }
    initNonce();
  }, []);

  // Pass the HASHED nonce to Google via extraParams
  // This overrides expo-auth-session's auto-generated nonce
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    extraParams: hashedNonce ? { nonce: hashedNonce } : undefined,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentSession = await getSession();
        if (mounted) {
          setSession(currentSession);
          if (currentSession) {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession);
        if (newSession) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle Google sign-in response
  useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        try {
          setIsLoading(true);

          // Get the RAW nonce to send to Supabase
          // On web after redirect, use stored nonce; otherwise use ref
          const rawNonce = getStoredNonce() || rawNonceRef.current;

          if (!rawNonce) {
            throw new Error('No nonce available for verification');
          }

          // Pass RAW nonce to Supabase - it will hash it and compare with id_token
          const { user: authUser, session: authSession } = await signInWithGoogle(
            id_token,
            rawNonce
          );
          setSession(authSession);
          const currentUser = await getCurrentUser();
          setUser(currentUser);

          // Clean up and generate new nonce for next sign-in
          clearStoredNonce();
          const newRawNonce = generateRandomString(32);
          rawNonceRef.current = newRawNonce;
          const newHashedNonce = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            newRawNonce
          );
          setHashedNonce(newHashedNonce);
        } catch (error) {
          console.error('Error signing in with Google:', error);
          clearStoredNonce();
        } finally {
          setIsLoading(false);
        }
      }
    }

    handleGoogleResponse();
  }, [response]);

  const signIn = useCallback(async () => {
    try {
      // Store the RAW nonce before redirect (for web)
      // This is what Supabase needs to verify the id_token
      if (rawNonceRef.current) {
        storeNonce(rawNonceRef.current);
      }
      await promptAsync();
    } catch (error) {
      console.error('Error initiating sign in:', error);
      clearStoredNonce();
      throw error;
    }
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabaseSignOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
