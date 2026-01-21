export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age_years: number | null;
          gender: 'male' | 'female' | 'other' | null;
          primary_photo_url: string | null;
          additional_photos: string[];
          character_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          age_years?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          primary_photo_url?: string | null;
          additional_photos?: string[];
          character_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          age_years?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          primary_photo_url?: string | null;
          additional_photos?: string[];
          character_description?: string | null;
          updated_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          base_prompt: string;
          preview_image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          base_prompt: string;
          preview_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          base_prompt?: string;
          preview_image_url?: string | null;
          is_active?: boolean;
        };
      };
      art_styles: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          prompt_modifier: string;
          preview_image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          prompt_modifier: string;
          preview_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          prompt_modifier?: string;
          preview_image_url?: string | null;
          is_active?: boolean;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          child_id: string;
          title: string;
          theme_id: string;
          art_style_id: string;
          status: 'draft' | 'generating' | 'completed' | 'failed';
          total_pages: number;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id: string;
          title: string;
          theme_id: string;
          art_style_id: string;
          status?: 'draft' | 'generating' | 'completed' | 'failed';
          total_pages?: number;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string;
          title?: string;
          theme_id?: string;
          art_style_id?: string;
          status?: 'draft' | 'generating' | 'completed' | 'failed';
          total_pages?: number;
          cover_image_url?: string | null;
          updated_at?: string;
        };
      };
      story_pages: {
        Row: {
          id: string;
          story_id: string;
          page_number: number;
          narrative_text: string;
          image_url: string | null;
          image_prompt: string | null;
          regeneration_count: number;
          status: 'pending' | 'generating' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          page_number: number;
          narrative_text: string;
          image_url?: string | null;
          image_prompt?: string | null;
          regeneration_count?: number;
          status?: 'pending' | 'generating' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          page_number?: number;
          narrative_text?: string;
          image_url?: string | null;
          image_prompt?: string | null;
          regeneration_count?: number;
          status?: 'pending' | 'generating' | 'completed' | 'failed';
          updated_at?: string;
        };
      };
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Child = Database['public']['Tables']['children']['Row'];
export type Theme = Database['public']['Tables']['themes']['Row'];
export type ArtStyle = Database['public']['Tables']['art_styles']['Row'];
export type Story = Database['public']['Tables']['stories']['Row'];
export type StoryPage = Database['public']['Tables']['story_pages']['Row'];

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ChildInsert = Database['public']['Tables']['children']['Insert'];
export type StoryInsert = Database['public']['Tables']['stories']['Insert'];
export type StoryPageInsert = Database['public']['Tables']['story_pages']['Insert'];
