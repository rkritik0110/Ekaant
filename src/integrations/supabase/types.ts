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
      access_control: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          created_at: string
          id: string
          is_allowed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          created_at?: string
          id?: string
          is_allowed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          created_at?: string
          id?: string
          is_allowed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_holds: {
        Row: {
          buffer_end_timestamp: string
          cabin_id: string
          created_at: string
          end_timestamp: string
          held_until: string
          id: string
          start_timestamp: string
          user_id: string
        }
        Insert: {
          buffer_end_timestamp: string
          cabin_id: string
          created_at?: string
          end_timestamp: string
          held_until?: string
          id?: string
          start_timestamp: string
          user_id: string
        }
        Update: {
          buffer_end_timestamp?: string
          cabin_id?: string
          created_at?: string
          end_timestamp?: string
          held_until?: string
          id?: string
          start_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_holds_cabin_id_fkey"
            columns: ["cabin_id"]
            isOneToOne: false
            referencedRelation: "cabins"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number | null
          batch_type: Database["public"]["Enums"]["batch_type"] | null
          booking_date: string
          booking_type: string | null
          buffer_end_timestamp: string | null
          cabin_id: string
          checked_in_at: string | null
          created_at: string
          end_time: string
          end_timestamp: string | null
          has_locker: boolean
          id: string
          is_recurring: boolean | null
          recurring_group_id: string | null
          slot_type: Database["public"]["Enums"]["slot_type"]
          start_time: string
          start_timestamp: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          batch_type?: Database["public"]["Enums"]["batch_type"] | null
          booking_date: string
          booking_type?: string | null
          buffer_end_timestamp?: string | null
          cabin_id: string
          checked_in_at?: string | null
          created_at?: string
          end_time: string
          end_timestamp?: string | null
          has_locker?: boolean
          id?: string
          is_recurring?: boolean | null
          recurring_group_id?: string | null
          slot_type: Database["public"]["Enums"]["slot_type"]
          start_time: string
          start_timestamp?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          batch_type?: Database["public"]["Enums"]["batch_type"] | null
          booking_date?: string
          booking_type?: string | null
          buffer_end_timestamp?: string | null
          cabin_id?: string
          checked_in_at?: string | null
          created_at?: string
          end_time?: string
          end_timestamp?: string | null
          has_locker?: boolean
          id?: string
          is_recurring?: boolean | null
          recurring_group_id?: string | null
          slot_type?: Database["public"]["Enums"]["slot_type"]
          start_time?: string
          start_timestamp?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cabin_id_fkey"
            columns: ["cabin_id"]
            isOneToOne: false
            referencedRelation: "cabins"
            referencedColumns: ["id"]
          },
        ]
      }
      cabins: {
        Row: {
          cabin_number: number
          created_at: string
          held_by: string | null
          held_until: string | null
          id: string
          status: Database["public"]["Enums"]["cabin_status"]
          updated_at: string
        }
        Insert: {
          cabin_number: number
          created_at?: string
          held_by?: string | null
          held_until?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cabin_status"]
          updated_at?: string
        }
        Update: {
          cabin_number?: number
          created_at?: string
          held_by?: string | null
          held_until?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cabin_status"]
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          cabin_id: string | null
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          is_active: boolean
          started_at: string
          user_id: string
        }
        Insert: {
          cabin_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
          user_id: string
        }
        Update: {
          cabin_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_cabin_id_fkey"
            columns: ["cabin_id"]
            isOneToOne: false
            referencedRelation: "cabins"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_hours: number
          deadline: string | null
          id: string
          is_completed: boolean
          target_hours: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_hours?: number
          deadline?: string | null
          id?: string
          is_completed?: boolean
          target_hours?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_hours?: number
          deadline?: string | null
          id?: string
          is_completed?: boolean
          target_hours?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_settings: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_anonymous: boolean
          show_on_leaderboard: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          show_on_leaderboard?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          show_on_leaderboard?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_booking_groups: {
        Row: {
          batch_type: Database["public"]["Enums"]["batch_type"]
          cabin_id: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          user_id: string
        }
        Insert: {
          batch_type: Database["public"]["Enums"]["batch_type"]
          cabin_id: string
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          user_id: string
        }
        Update: {
          batch_type?: Database["public"]["Enums"]["batch_type"]
          cabin_id?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_booking_groups_cabin_id_fkey"
            columns: ["cabin_id"]
            isOneToOne: false
            referencedRelation: "cabins"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          cabin_number: number
          created_at: string
          id: string
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          cabin_number: number
          created_at?: string
          id?: string
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          cabin_number?: number
          created_at?: string
          id?: string
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      shift_assignments: {
        Row: {
          created_at: string
          id: string
          shift_id: string
          staff_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shift_id: string
          staff_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shift_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          end_time: string
          id: string
          shift_date: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          shift_date: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          shift_date?: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      silent_requests: {
        Row: {
          cabin_id: string | null
          created_at: string
          id: string
          notes: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          user_id: string
        }
        Insert: {
          cabin_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          user_id: string
        }
        Update: {
          cabin_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          request_type?: Database["public"]["Enums"]["request_type"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "silent_requests_cabin_id_fkey"
            columns: ["cabin_id"]
            isOneToOne: false
            referencedRelation: "cabins"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          hours_remaining: number
          hours_total: number
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          hours_remaining?: number
          hours_total?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          valid_from: string
          valid_until: string
        }
        Update: {
          created_at?: string
          hours_remaining?: number
          hours_total?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_booking_overlap: {
        Args: {
          p_buffer_end_timestamp: string
          p_cabin_id: string
          p_exclude_booking_id?: string
          p_start_timestamp: string
        }
        Returns: boolean
      }
      cleanup_expired_holds: { Args: never; Returns: undefined }
      get_cabin_availability: {
        Args: { p_cabin_id: string; p_date: string }
        Returns: {
          batch_type: string
          booking_id: string
          end_time: string
          start_time: string
          status: string
          user_id: string
        }[]
      }
      get_user_focus_stats: {
        Args: { p_user_id: string }
        Returns: {
          month_minutes: number
          today_minutes: number
          total_minutes: number
          week_minutes: number
        }[]
      }
      get_weekly_leaderboard: {
        Args: never
        Returns: {
          display_name: string
          is_anonymous: boolean
          rank: number
          total_minutes: number
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_goal_progress: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "student"
      batch_type: "morning" | "mid_day" | "afternoon" | "evening" | "custom"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "expired"
        | "held"
      cabin_status: "available" | "occupied" | "on_hold"
      request_status: "pending" | "acknowledged" | "completed"
      request_type: "water" | "coffee" | "noise_complaint" | "assistance"
      shift_type: "morning" | "evening" | "night"
      slot_type: "four_hours" | "eight_hours" | "full_day" | "monthly"
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
      app_role: ["admin", "student"],
      batch_type: ["morning", "mid_day", "afternoon", "evening", "custom"],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "expired",
        "held",
      ],
      cabin_status: ["available", "occupied", "on_hold"],
      request_status: ["pending", "acknowledged", "completed"],
      request_type: ["water", "coffee", "noise_complaint", "assistance"],
      shift_type: ["morning", "evening", "night"],
      slot_type: ["four_hours", "eight_hours", "full_day", "monthly"],
    },
  },
} as const
