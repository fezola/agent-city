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
      agent_memories: {
        Row: {
          agent_id: string
          created_at: string
          day: number
          details: string | null
          emotion: string
          event: string
          id: string
          impact: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          day: number
          details?: string | null
          emotion: string
          event: string
          id?: string
          impact: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          day?: number
          details?: string | null
          emotion?: string
          event?: string
          id?: string
          impact?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_type: string
          balance: number
          confidence: number
          created_at: string
          current_price_modifier: number | null
          id: string
          is_alive: boolean
          last_action: string | null
          last_action_reason: string | null
          mood: string
          name: string
          updated_at: string
          world_id: string
        }
        Insert: {
          agent_type: string
          balance?: number
          confidence?: number
          created_at?: string
          current_price_modifier?: number | null
          id?: string
          is_alive?: boolean
          last_action?: string | null
          last_action_reason?: string | null
          mood?: string
          name: string
          updated_at?: string
          world_id: string
        }
        Update: {
          agent_type?: string
          balance?: number
          confidence?: number
          created_at?: string
          current_price_modifier?: number | null
          id?: string
          is_alive?: boolean
          last_action?: string | null
          last_action_reason?: string | null
          mood?: string
          name?: string
          updated_at?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "world_state"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_history: {
        Row: {
          agent_id: string | null
          balance: number
          city_health: number | null
          created_at: string
          day: number
          id: string
          treasury_balance: number | null
          worker_satisfaction: number | null
          world_id: string
        }
        Insert: {
          agent_id?: string | null
          balance: number
          city_health?: number | null
          created_at?: string
          day: number
          id?: string
          treasury_balance?: number | null
          worker_satisfaction?: number | null
          world_id: string
        }
        Update: {
          agent_id?: string | null
          balance?: number
          city_health?: number | null
          created_at?: string
          day?: number
          id?: string
          treasury_balance?: number | null
          worker_satisfaction?: number | null
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_history_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "world_state"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          id: string
          world_id: string
          owner_id: string
          building_type: string
          level: number
          is_active: boolean
          built_day: number
          last_maintained_day: number
          created_at: string
        }
        Insert: {
          id?: string
          world_id: string
          owner_id: string
          building_type: string
          level?: number
          is_active?: boolean
          built_day: number
          last_maintained_day: number
          created_at?: string
        }
        Update: {
          id?: string
          world_id?: string
          owner_id?: string
          building_type?: string
          level?: number
          is_active?: boolean
          built_day?: number
          last_maintained_day?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "world_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      wagers: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          day_placed: number
          id: string
          payout: number | null
          prediction: string
          resolved: boolean
          won: boolean | null
          world_id: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          day_placed: number
          id?: string
          payout?: number | null
          prediction: string
          resolved?: boolean
          won?: boolean | null
          world_id: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          day_placed?: number
          id?: string
          payout?: number | null
          prediction?: string
          resolved?: boolean
          won?: boolean | null
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wagers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wagers_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "world_state"
            referencedColumns: ["id"]
          },
        ]
      }
      world_events: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          created_at: string
          day: number
          description: string
          details: Json | null
          event_type: string
          id: string
          world_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          created_at?: string
          day: number
          description: string
          details?: Json | null
          event_type: string
          id?: string
          world_id: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          created_at?: string
          day?: number
          description?: string
          details?: Json | null
          event_type?: string
          id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "world_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "world_events_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "world_state"
            referencedColumns: ["id"]
          },
        ]
      }
      world_state: {
        Row: {
          city_health: number
          created_at: string
          day: number
          id: string
          inflation: number
          is_collapsed: boolean
          is_running: boolean
          merchant_stability: number
          participation_fee: number
          salary_rate: number
          tax_rate: number
          treasury_balance: number
          updated_at: string
          worker_satisfaction: number
        }
        Insert: {
          city_health?: number
          created_at?: string
          day?: number
          id?: string
          inflation?: number
          is_collapsed?: boolean
          is_running?: boolean
          merchant_stability?: number
          participation_fee?: number
          salary_rate?: number
          tax_rate?: number
          treasury_balance?: number
          updated_at?: string
          worker_satisfaction?: number
        }
        Update: {
          city_health?: number
          created_at?: string
          day?: number
          id?: string
          inflation?: number
          is_collapsed?: boolean
          is_running?: boolean
          merchant_stability?: number
          participation_fee?: number
          salary_rate?: number
          tax_rate?: number
          treasury_balance?: number
          updated_at?: string
          worker_satisfaction?: number
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
