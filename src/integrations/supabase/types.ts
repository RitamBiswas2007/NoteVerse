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
      bookmarks: {
        Row: {
          created_at: string | null
          id: string
          note_id: string | null
          thought_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_id?: string | null
          thought_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note_id?: string | null
          thought_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "study_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_posts: {
        Row: {
          circle_id: string
          content: string
          created_at: string | null
          id: string
          is_eli5: boolean | null
          is_pinned: boolean | null
          reply_count: number | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          circle_id: string
          content: string
          created_at?: string | null
          id?: string
          is_eli5?: boolean | null
          is_pinned?: boolean | null
          reply_count?: number | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          circle_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_eli5?: boolean | null
          is_pinned?: boolean | null
          reply_count?: number | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "study_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          note_id: string | null
          parent_id: string | null
          post_id: string | null
          thought_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          note_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          thought_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          note_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          thought_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "circle_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          country: string | null
          created_at: string | null
          description: string | null
          file_url: string | null
          forked_from: string | null
          id: string
          is_published: boolean | null
          note_type: Database["public"]["Enums"]["note_type"] | null
          subject: string
          tags: string[] | null
          title: string
          university: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
          views: number | null
        }
        Insert: {
          content?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          forked_from?: string | null
          id?: string
          is_published?: boolean | null
          note_type?: Database["public"]["Enums"]["note_type"] | null
          subject: string
          tags?: string[] | null
          title: string
          university?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          views?: number | null
        }
        Update: {
          content?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          forked_from?: string | null
          id?: string
          is_published?: boolean | null
          note_type?: Database["public"]["Enums"]["note_type"] | null
          subject?: string
          tags?: string[] | null
          title?: string
          university?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          id: string
          subjects: string[] | null
          university: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          education_level?:
          | Database["public"]["Enums"]["education_level"]
          | null
          id?: string
          subjects?: string[] | null
          university?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          education_level?:
          | Database["public"]["Enums"]["education_level"]
          | null
          id?: string
          subjects?: string[] | null
          university?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      study_circles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          member_count: number | null
          name: string
          post_count: number | null
          slug: string
          subject_area: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          member_count?: number | null
          name: string
          post_count?: number | null
          slug: string
          subject_area: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          slug?: string
          subject_area?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      thoughts: {
        Row: {
          category: Database["public"]["Enums"]["thought_category"] | null
          clarity_votes: number | null
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          linked_note_id: string | null
          originality_votes: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["thought_category"] | null
          clarity_votes?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          linked_note_id?: string | null
          originality_votes?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["thought_category"] | null
          clarity_votes?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          linked_note_id?: string | null
          originality_votes?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "thoughts_linked_note_id_fkey"
            columns: ["linked_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          note_id: string | null
          post_id: string | null
          thought_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          note_id?: string | null
          post_id?: string | null
          thought_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          note_id?: string | null
          post_id?: string | null
          thought_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "circle_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: string
          question_text: string
          options: string[] | any // JSON type
          correct_option_index: number
          quiz_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          question_text: string
          options: string[] | any
          correct_option_index: number
          quiz_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          question_text?: string
          options?: string[] | any
          correct_option_index?: number
          quiz_date?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          score: number
          max_score: number
          attempted_at: string | null
          quiz_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          max_score?: number
          attempted_at?: string | null
          quiz_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          max_score?: number
          attempted_at?: string | null
          quiz_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grant_bounty: {
        Args: {
          target_user_id: string
          amount: number
        }
        Returns: void
      }
      submit_bounty_contribution: {
        Args: {
          req_id: string
          note_data: Json
        }
        Returns: void
      }
    }
    Enums: {
      education_level:
      | "high_school"
      | "undergraduate"
      | "graduate"
      | "postgraduate"
      | "other"
      note_type: "pdf" | "image" | "markdown" | "link"
      thought_category:
      | "question"
      | "idea"
      | "discussion"
      | "research"
      | "other"
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
    Enums: {
      education_level: [
        "high_school",
        "undergraduate",
        "graduate",
        "postgraduate",
        "other",
      ],
      note_type: ["pdf", "image", "markdown", "link"],
      thought_category: ["question", "idea", "discussion", "research", "other"],
    },
  },
} as const
