// Generated from Supabase project hdwyyadvescgvhwbmtnw. Do not edit table shapes by hand.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      art_styles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
          prompt_modifier: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
          prompt_modifier: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
          prompt_modifier?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          additional_photos: string[] | null
          age_years: number | null
          character_description: string | null
          created_at: string
          gender: string | null
          id: string
          name: string
          primary_photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_photos?: string[] | null
          age_years?: number | null
          character_description?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          primary_photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_photos?: string[] | null
          age_years?: number | null
          character_description?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          primary_photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          art_style_id: string
          child_id: string
          cover_image_url: string | null
          created_at: string
          id: string
          status: string
          theme_id: string
          title: string
          total_pages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          art_style_id: string
          child_id: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          status?: string
          theme_id: string
          title: string
          total_pages?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          art_style_id?: string
          child_id?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          status?: string
          theme_id?: string
          title?: string
          total_pages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_art_style_id_fkey"
            columns: ["art_style_id"]
            isOneToOne: false
            referencedRelation: "art_styles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_pages: {
        Row: {
          created_at: string
          id: string
          image_prompt: string | null
          image_url: string | null
          narrative_text: string
          page_number: number
          regeneration_count: number
          status: string
          story_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          narrative_text: string
          page_number: number
          regeneration_count?: number
          status?: string
          story_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          narrative_text?: string
          page_number?: number
          regeneration_count?: number
          status?: string
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_pages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          base_prompt: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
        }
        Insert: {
          base_prompt: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
        }
        Update: {
          base_prompt?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type Child = Database['public']['Tables']['children']['Row'];
export type ChildInsert = Database['public']['Tables']['children']['Insert'];
export type ChildUpdate = Database['public']['Tables']['children']['Update'];
export type Theme = Database['public']['Tables']['themes']['Row'];
export type ThemeInsert = Database['public']['Tables']['themes']['Insert'];
export type ThemeUpdate = Database['public']['Tables']['themes']['Update'];
export type ArtStyle = Database['public']['Tables']['art_styles']['Row'];
export type ArtStyleInsert = Database['public']['Tables']['art_styles']['Insert'];
export type ArtStyleUpdate = Database['public']['Tables']['art_styles']['Update'];
export type Story = Database['public']['Tables']['stories']['Row'];
export type StoryInsert = Database['public']['Tables']['stories']['Insert'];
export type StoryUpdate = Database['public']['Tables']['stories']['Update'];
export type StoryPage = Database['public']['Tables']['story_pages']['Row'];
export type StoryPageInsert = Database['public']['Tables']['story_pages']['Insert'];
export type StoryPageUpdate = Database['public']['Tables']['story_pages']['Update'];
