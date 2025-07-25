export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ranking: {
        Row: {
          id: string
          rank_position: number | null
          telegram_id: number
          total_tonix: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          rank_position?: number | null
          telegram_id: number
          total_tonix?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          rank_position?: number | null
          telegram_id?: number
          total_tonix?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_tonix: number | null
          commission_earned: number | null
          created_at: string
          id: string
          referred_telegram_id: number
          referrer_telegram_id: number
        }
        Insert: {
          bonus_tonix?: number | null
          commission_earned?: number | null
          created_at?: string
          id?: string
          referred_telegram_id: number
          referrer_telegram_id: number
        }
        Update: {
          bonus_tonix?: number | null
          commission_earned?: number | null
          created_at?: string
          id?: string
          referred_telegram_id?: number
          referrer_telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_telegram_id_fkey"
            columns: ["referred_telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_telegram_id_fkey"
            columns: ["referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      system_tasks: {
        Row: {
          action_url: string | null
          category: string
          cooldown_hours: number | null
          created_at: string
          description: string
          frequency: string
          id: string
          is_active: boolean | null
          task_name: string
          tonix_reward: number
        }
        Insert: {
          action_url?: string | null
          category: string
          cooldown_hours?: number | null
          created_at?: string
          description: string
          frequency: string
          id?: string
          is_active?: boolean | null
          task_name: string
          tonix_reward?: number
        }
        Update: {
          action_url?: string | null
          category?: string
          cooldown_hours?: number | null
          created_at?: string
          description?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          task_name?: string
          tonix_reward?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          action_url: string | null
          category: string | null
          completed_at: string | null
          cooldown_hours: number | null
          created_at: string
          description: string | null
          frequency: string | null
          id: string
          is_repeatable: boolean | null
          next_available_at: string | null
          status: string
          task_name: string
          task_type: string
          telegram_id: number
          tonix_earned: number | null
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          completed_at?: string | null
          cooldown_hours?: number | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_repeatable?: boolean | null
          next_available_at?: string | null
          status?: string
          task_name: string
          task_type: string
          telegram_id: number
          tonix_earned?: number | null
        }
        Update: {
          action_url?: string | null
          category?: string | null
          completed_at?: string | null
          cooldown_hours?: number | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_repeatable?: boolean | null
          next_available_at?: string | null
          status?: string
          task_name?: string
          task_type?: string
          telegram_id?: number
          tonix_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source_id: string | null
          telegram_id: number
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          telegram_id: number
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          telegram_id?: number
          transaction_type?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          current_streak: number | null
          first_name: string | null
          last_checkin_date: string | null
          last_name: string | null
          level: number | null
          profile_photo_url: string | null
          referral_code: string | null
          telegram_id: number
          total_days: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          first_name?: string | null
          last_checkin_date?: string | null
          last_name?: string | null
          level?: number | null
          profile_photo_url?: string | null
          referral_code?: string | null
          telegram_id: number
          total_days?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          first_name?: string | null
          last_checkin_date?: string | null
          last_name?: string | null
          level?: number | null
          profile_photo_url?: string | null
          referral_code?: string | null
          telegram_id?: number
          total_days?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_do_task: {
        Args: { user_telegram_id: number; system_task_id: string }
        Returns: boolean
      }
      complete_task: {
        Args: { user_telegram_id: number; system_task_id: string }
        Returns: Json
      }
      process_referral_signup: {
        Args: { new_user_telegram_id: number; referrer_code: string }
        Returns: Json
      }
      update_referral_commission: {
        Args: { referred_user_telegram_id: number; tonix_earned: number }
        Returns: Json
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
