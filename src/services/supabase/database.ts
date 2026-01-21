import { supabase } from './client';
import type {
  Child,
  ChildInsert,
  Theme,
  ArtStyle,
  Story,
  StoryInsert,
  StoryPage,
  StoryPageInsert
} from '@/types/database';

// ============ Children ============

export async function createChild(child: ChildInsert): Promise<Child> {
  const { data, error } = await supabase
    .from('children')
    .insert(child)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChildrenByUser(userId: string): Promise<Child[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getChildById(childId: string): Promise<Child | null> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function updateChild(childId: string, updates: Partial<Child>): Promise<Child> {
  const { data, error } = await supabase
    .from('children')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', childId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ Themes ============

export async function getActiveThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .order('display_name');

  if (error) throw error;
  return data;
}

export async function getThemeById(themeId: string): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', themeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

// ============ Art Styles ============

export async function getActiveArtStyles(): Promise<ArtStyle[]> {
  const { data, error } = await supabase
    .from('art_styles')
    .select('*')
    .eq('is_active', true)
    .order('display_name');

  if (error) throw error;
  return data;
}

export async function getArtStyleById(artStyleId: string): Promise<ArtStyle | null> {
  const { data, error } = await supabase
    .from('art_styles')
    .select('*')
    .eq('id', artStyleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

// ============ Stories ============

export async function createStory(story: StoryInsert): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .insert(story)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStoriesByUser(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getStoryById(storyId: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getStoryWithPages(storyId: string): Promise<{ story: Story; pages: StoryPage[] } | null> {
  const [storyResult, pagesResult] = await Promise.all([
    supabase.from('stories').select('*').eq('id', storyId).single(),
    supabase.from('story_pages').select('*').eq('story_id', storyId).order('page_number'),
  ]);

  if (storyResult.error) {
    if (storyResult.error.code === 'PGRST116') return null;
    throw storyResult.error;
  }
  if (pagesResult.error) throw pagesResult.error;

  return { story: storyResult.data, pages: pagesResult.data };
}

export async function updateStory(storyId: string, updates: Partial<Story>): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', storyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStory(storyId: string): Promise<void> {
  // Delete pages first
  await supabase.from('story_pages').delete().eq('story_id', storyId);

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) throw error;
}

// ============ Story Pages ============

export async function createStoryPages(pages: StoryPageInsert[]): Promise<StoryPage[]> {
  const { data, error } = await supabase
    .from('story_pages')
    .insert(pages)
    .select();

  if (error) throw error;
  return data;
}

export async function getStoryPages(storyId: string): Promise<StoryPage[]> {
  const { data, error } = await supabase
    .from('story_pages')
    .select('*')
    .eq('story_id', storyId)
    .order('page_number');

  if (error) throw error;
  return data;
}

export async function updateStoryPage(pageId: string, updates: Partial<StoryPage>): Promise<StoryPage> {
  const { data, error } = await supabase
    .from('story_pages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', pageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function incrementPageRegeneration(pageId: string): Promise<StoryPage> {
  const { data: page, error: fetchError } = await supabase
    .from('story_pages')
    .select('regeneration_count')
    .eq('id', pageId)
    .single();

  if (fetchError) throw fetchError;

  return updateStoryPage(pageId, {
    regeneration_count: (page.regeneration_count || 0) + 1,
    status: 'generating',
  });
}
