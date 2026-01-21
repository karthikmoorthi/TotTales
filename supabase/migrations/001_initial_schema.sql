-- TotTales Database Schema
-- This migration creates all the necessary tables for the MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CHILDREN TABLE (story protagonists)
-- ============================================
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_years INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  primary_photo_url TEXT,
  additional_photos TEXT[] DEFAULT '{}',
  character_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own children
CREATE POLICY "Users can manage own children"
  ON children FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_children_user_id ON children(user_id);

-- ============================================
-- THEMES TABLE (story themes)
-- ============================================
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  base_prompt TEXT NOT NULL,
  preview_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Everyone can read active themes
CREATE POLICY "Anyone can view active themes"
  ON themes FOR SELECT
  USING (is_active = true);

-- ============================================
-- ART STYLES TABLE
-- ============================================
CREATE TABLE art_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  prompt_modifier TEXT NOT NULL,
  preview_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE art_styles ENABLE ROW LEVEL SECURITY;

-- Everyone can read active art styles
CREATE POLICY "Anyone can view active art styles"
  ON art_styles FOR SELECT
  USING (is_active = true);

-- ============================================
-- STORIES TABLE
-- ============================================
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme_id UUID NOT NULL REFERENCES themes(id),
  art_style_id UUID NOT NULL REFERENCES art_styles(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  total_pages INTEGER NOT NULL DEFAULT 6,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Users can manage their own stories
CREATE POLICY "Users can manage own stories"
  ON stories FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_child_id ON stories(child_id);
CREATE INDEX idx_stories_status ON stories(status);

-- ============================================
-- STORY PAGES TABLE
-- ============================================
CREATE TABLE story_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  narrative_text TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  regeneration_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, page_number)
);

-- Enable RLS
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;

-- Users can manage pages of their own stories
CREATE POLICY "Users can manage own story pages"
  ON story_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_pages.story_id
      AND stories.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX idx_story_pages_story_id ON story_pages(story_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Child photos bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('child-photos', 'child-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Story images bucket (public for sharing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for child-photos
CREATE POLICY "Users can upload child photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'child-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own child photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'child-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own child photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'child-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for story-images
CREATE POLICY "Users can upload story images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'story-images'
    AND EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view story images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images');

CREATE POLICY "Users can delete own story images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'story-images'
    AND EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_story_pages_updated_at
  BEFORE UPDATE ON story_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
