import { supabase } from './client';
import { AuthUser } from '@/types';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(idToken: string, nonce?: string): Promise<{ user: User; session: Session }> {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    nonce,
  });

  if (error) throw error;
  if (!data.user || !data.session) throw new Error('Sign in failed');

  // Create/update profile
  await upsertProfile(data.user);

  return { user: data.user, session: data.session };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email!,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };
}

/**
 * Create or update user profile in database
 */
async function upsertProfile(user: User): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email!,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting profile:', error);
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data.session;
}
