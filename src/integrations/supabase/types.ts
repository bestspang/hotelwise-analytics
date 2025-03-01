export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          anomaly_detected: boolean | null
          category: string
          created_at: string | null
          hotel_id: string
          recommendation_date: string
          recommendation_id: string
          recommendation_summary: string
        }
        Insert: {
          anomaly_detected?: boolean | null
          category: string
          created_at?: string | null
          hotel_id: string
          recommendation_date: string
          recommendation_id?: string
          recommendation_summary: string
        }
        Update: {
          anomaly_detected?: boolean | null
          category?: string
          created_at?: string | null
          hotel_id?: string
          recommendation_date?: string
          recommendation_id?: string
          recommendation_summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      expense_details: {
        Row: {
          cost_per_occupied_room: number
          created_at: string | null
          expense_amount: number
          expense_category: string
          expense_date: string
          expense_id: string
          hotel_id: string
        }
        Insert: {
          cost_per_occupied_room?: number
          created_at?: string | null
          expense_amount?: number
          expense_category: string
          expense_date: string
          expense_id?: string
          hotel_id: string
        }
        Update: {
          cost_per_occupied_room?: number
          created_at?: string | null
          expense_amount?: number
          expense_category?: string
          expense_date?: string
          expense_id?: string
          hotel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_details_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string | null
          fnb_revenue: number
          hotel_id: string
          net_profit: number
          operational_expenses: number
          other_revenue: number
          report_date: string
          report_id: string
          report_type: string
          room_revenue: number
          total_revenue: number
        }
        Insert: {
          created_at?: string | null
          fnb_revenue?: number
          hotel_id: string
          net_profit?: number
          operational_expenses?: number
          other_revenue?: number
          report_date: string
          report_id?: string
          report_type: string
          room_revenue?: number
          total_revenue?: number
        }
        Update: {
          created_at?: string | null
          fnb_revenue?: number
          hotel_id?: string
          net_profit?: number
          operational_expenses?: number
          other_revenue?: number
          report_date?: string
          report_id?: string
          report_type?: string
          room_revenue?: number
          total_revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      forecasting_data: {
        Row: {
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string | null
          forecast_date: string
          forecast_id: string
          forecast_type: string
          forecast_value: number
          hotel_id: string
        }
        Insert: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          forecast_date: string
          forecast_id?: string
          forecast_type: string
          forecast_value: number
          hotel_id: string
        }
        Update: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          forecast_date?: string
          forecast_id?: string
          forecast_type?: string
          forecast_value?: number
          hotel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecasting_data_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      hotel_chains: {
        Row: {
          chain_id: string
          chain_name: string
          created_at: string | null
        }
        Insert: {
          chain_id?: string
          chain_name: string
          created_at?: string | null
        }
        Update: {
          chain_id?: string
          chain_name?: string
          created_at?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          chain_id: string | null
          created_at: string | null
          hotel_id: string
          hotel_name: string
          location: string
        }
        Insert: {
          chain_id?: string | null
          created_at?: string | null
          hotel_id?: string
          hotel_name: string
          location: string
        }
        Update: {
          chain_id?: string | null
          created_at?: string | null
          hotel_id?: string
          hotel_name?: string
          location?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotels_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "hotel_chains"
            referencedColumns: ["chain_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          notification_id: string
          notification_text: string
          read_status: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          notification_id?: string
          notification_text: string
          read_status?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          notification_id?: string
          notification_text?: string
          read_status?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occupancy_reports: {
        Row: {
          average_daily_rate: number
          average_length_of_stay: number
          created_at: string | null
          date: string
          hotel_id: string
          occupancy_id: string
          occupancy_rate: number
          revenue_per_available_room: number
          total_rooms_available: number
          total_rooms_occupied: number
        }
        Insert: {
          average_daily_rate?: number
          average_length_of_stay?: number
          created_at?: string | null
          date: string
          hotel_id: string
          occupancy_id?: string
          occupancy_rate?: number
          revenue_per_available_room?: number
          total_rooms_available?: number
          total_rooms_occupied?: number
        }
        Update: {
          average_daily_rate?: number
          average_length_of_stay?: number
          created_at?: string | null
          date?: string
          hotel_id?: string
          occupancy_id?: string
          occupancy_rate?: number
          revenue_per_available_room?: number
          total_rooms_available?: number
          total_rooms_occupied?: number
        }
        Relationships: [
          {
            foreignKeyName: "occupancy_reports_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string
          id: string
          updated_at: string | null
          user_role: string
          username: string | null
        }
        Insert: {
          email: string
          id: string
          updated_at?: string | null
          user_role: string
          username?: string | null
        }
        Update: {
          email?: string
          id?: string
          updated_at?: string | null
          user_role?: string
          username?: string | null
        }
        Relationships: []
      }
      user_custom_graphs: {
        Row: {
          date_created: string | null
          graph_config: Json
          graph_id: string
          graph_name: string
          hotel_id: string | null
          user_id: string
        }
        Insert: {
          date_created?: string | null
          graph_config: Json
          graph_id?: string
          graph_name: string
          hotel_id?: string | null
          user_id: string
        }
        Update: {
          date_created?: string | null
          graph_config?: Json
          graph_id?: string
          graph_name?: string
          hotel_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_graphs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "user_custom_graphs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
