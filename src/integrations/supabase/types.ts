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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_patterns: {
        Row: {
          day_type: string
          frequency_score: number
          id: string
          last_visit_at: string
          place_type: string
          time_of_day: string
          updated_at: string
          user_id: string
          visit_count: number
        }
        Insert: {
          day_type: string
          frequency_score?: number
          id?: string
          last_visit_at?: string
          place_type: string
          time_of_day: string
          updated_at?: string
          user_id: string
          visit_count?: number
        }
        Update: {
          day_type?: string
          frequency_score?: number
          id?: string
          last_visit_at?: string
          place_type?: string
          time_of_day?: string
          updated_at?: string
          user_id?: string
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_weights: {
        Row: {
          behavior_weight: number
          data_points_count: number
          feedback_weight: number
          interest_weight: number
          updated_at: string
          user_id: string
        }
        Insert: {
          behavior_weight?: number
          data_points_count?: number
          feedback_weight?: number
          interest_weight?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          behavior_weight?: number
          data_points_count?: number
          feedback_weight?: number
          interest_weight?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_weights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_visits: {
        Row: {
          created_at: string
          day_type: string
          id: string
          lat: number
          lng: number
          place_name: string | null
          place_type: string
          time_of_day: string
          user_id: string
          visited_at: string
        }
        Insert: {
          created_at?: string
          day_type: string
          id?: string
          lat: number
          lng: number
          place_name?: string | null
          place_type: string
          time_of_day: string
          user_id: string
          visited_at?: string
        }
        Update: {
          created_at?: string
          day_type?: string
          id?: string
          lat?: number
          lng?: number
          place_name?: string | null
          place_type?: string
          time_of_day?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          landmark: string | null
          last_seen_together_at: string | null
          meet_code: string | null
          pair_id: string
          shared_emoji_code: string | null
          shared_interests: string[]
          status: string
          uid_a: string
          uid_b: string
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landmark?: string | null
          last_seen_together_at?: string | null
          meet_code?: string | null
          pair_id: string
          shared_emoji_code?: string | null
          shared_interests?: string[]
          status?: string
          uid_a: string
          uid_b: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landmark?: string | null
          last_seen_together_at?: string | null
          meet_code?: string | null
          pair_id?: string
          shared_emoji_code?: string | null
          shared_interests?: string[]
          status?: string
          uid_a?: string
          uid_b?: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
        }
        Relationships: []
      }
      meetup_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          match_id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          match_id: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          match_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_feedback_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetup_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presence: {
        Row: {
          geohash: string
          lat: number
          lng: number
          updated_at: string
          user_id: string
        }
        Insert: {
          geohash: string
          lat: number
          lng: number
          updated_at?: string
          user_id: string
        }
        Update: {
          geohash?: string
          lat?: number
          lng?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_fingerprint: Json | null
          auto_accept_connections: boolean | null
          availability_status: string | null
          avatar_url: string | null
          created_at: string | null
          emoji_signature: string | null
          geohash: string | null
          id: string
          interests: string[] | null
          is_visible: boolean | null
          lat: number | null
          lng: number | null
          location_accuracy: number | null
          location_updated_at: string | null
          name: string | null
          onboarded: boolean | null
          updated_at: string | null
        }
        Insert: {
          activity_fingerprint?: Json | null
          auto_accept_connections?: boolean | null
          availability_status?: string | null
          avatar_url?: string | null
          created_at?: string | null
          emoji_signature?: string | null
          geohash?: string | null
          id: string
          interests?: string[] | null
          is_visible?: boolean | null
          lat?: number | null
          lng?: number | null
          location_accuracy?: number | null
          location_updated_at?: string | null
          name?: string | null
          onboarded?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activity_fingerprint?: Json | null
          auto_accept_connections?: boolean | null
          availability_status?: string | null
          avatar_url?: string | null
          created_at?: string | null
          emoji_signature?: string | null
          geohash?: string | null
          id?: string
          interests?: string[] | null
          is_visible?: boolean | null
          lat?: number | null
          lng?: number | null
          location_accuracy?: number | null
          location_updated_at?: string | null
          name?: string | null
          onboarded?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_stale_presence: { Args: never; Returns: number }
      generate_pair_id: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      recalculate_frequency_scores: {
        Args: { target_user_id: string }
        Returns: undefined
      }
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
