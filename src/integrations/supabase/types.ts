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
      additional_services: {
        Row: {
          amount: number
          created_at: string | null
          daily_revenue_id: string
          id: string
          service: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          daily_revenue_id: string
          id?: string
          service: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          daily_revenue_id?: string
          id?: string
          service?: string
        }
        Relationships: [
          {
            foreignKeyName: "additional_services_daily_revenue_id_fkey"
            columns: ["daily_revenue_id"]
            isOneToOne: false
            referencedRelation: "daily_revenue_breakdown"
            referencedColumns: ["id"]
          },
        ]
      }
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
      api_logs: {
        Row: {
          api_model: string | null
          applied_tables: Json | null
          confidence_scores: Json | null
          created_at: string | null
          error_message: string | null
          file_name: string | null
          id: string
          raw_result: Json | null
          request_id: string
          status: string | null
          timestamp_applied: string | null
          timestamp_received: string | null
          timestamp_sent: string | null
          user_id: string | null
        }
        Insert: {
          api_model?: string | null
          applied_tables?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          error_message?: string | null
          file_name?: string | null
          id?: string
          raw_result?: Json | null
          request_id: string
          status?: string | null
          timestamp_applied?: string | null
          timestamp_received?: string | null
          timestamp_sent?: string | null
          user_id?: string | null
        }
        Update: {
          api_model?: string | null
          applied_tables?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          error_message?: string | null
          file_name?: string | null
          id?: string
          raw_result?: Json | null
          request_id?: string
          status?: string | null
          timestamp_applied?: string | null
          timestamp_received?: string | null
          timestamp_sent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      city_ledger: {
        Row: {
          account_name: string
          charges: number | null
          closing_balance: number | null
          created_at: string | null
          hotel_id: string
          ledger_date: string
          ledger_id: string
          opening_balance: number | null
          payments: number | null
          reference_number: string | null
        }
        Insert: {
          account_name: string
          charges?: number | null
          closing_balance?: number | null
          created_at?: string | null
          hotel_id: string
          ledger_date: string
          ledger_id?: string
          opening_balance?: number | null
          payments?: number | null
          reference_number?: string | null
        }
        Update: {
          account_name?: string
          charges?: number | null
          closing_balance?: number | null
          created_at?: string | null
          hotel_id?: string
          ledger_date?: string
          ledger_id?: string
          opening_balance?: number | null
          payments?: number | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_ledger_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      daily_revenue_breakdown: {
        Row: {
          created_at: string | null
          date: string
          hotel_id: string
          id: string
          room_number: string
          room_rate: number
          total_spend: number
        }
        Insert: {
          created_at?: string | null
          date: string
          hotel_id: string
          id?: string
          room_number: string
          room_rate: number
          total_spend: number
        }
        Update: {
          created_at?: string | null
          date?: string
          hotel_id?: string
          id?: string
          room_number?: string
          room_rate?: number
          total_spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_revenue_breakdown_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      daily_room_occupancy: {
        Row: {
          additional_spend: number | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          date: string
          floor: number
          guest_name: string | null
          hotel_id: string
          id: string
          is_occupied: boolean
          room_number: string
          room_rate: number | null
          room_type: string
        }
        Insert: {
          additional_spend?: number | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          date: string
          floor: number
          guest_name?: string | null
          hotel_id: string
          id?: string
          is_occupied?: boolean
          room_number: string
          room_rate?: number | null
          room_type: string
        }
        Update: {
          additional_spend?: number | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          date?: string
          floor?: number
          guest_name?: string | null
          hotel_id?: string
          id?: string
          is_occupied?: boolean
          room_number?: string
          room_rate?: number | null
          room_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_room_occupancy_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      data_mappings: {
        Row: {
          created_at: string | null
          document_type: string
          id: string
          mappings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          id?: string
          mappings: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          id?: string
          mappings?: Json
          updated_at?: string | null
        }
        Relationships: []
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
      expense_vouchers: {
        Row: {
          created_at: string | null
          expense_amount: number | null
          expense_date: string
          expense_type: string
          hotel_id: string
          remarks: string | null
          taxes_included: number | null
          voucher_id: string
        }
        Insert: {
          created_at?: string | null
          expense_amount?: number | null
          expense_date: string
          expense_type: string
          hotel_id: string
          remarks?: string | null
          taxes_included?: number | null
          voucher_id?: string
        }
        Update: {
          created_at?: string | null
          expense_amount?: number | null
          expense_date?: string
          expense_type?: string
          hotel_id?: string
          remarks?: string | null
          taxes_included?: number | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_vouchers_hotel_id_fkey"
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
      guest_stays: {
        Row: {
          amount_paid: number | null
          arrival_date: string
          booking_source: string | null
          created_at: string | null
          departure_date: string
          guest_name: string
          nights: number
          number_of_guests: number | null
          remarks: string | null
          room_id: string | null
          stay_id: string
          total_amount: number | null
          voucher_number: string | null
        }
        Insert: {
          amount_paid?: number | null
          arrival_date: string
          booking_source?: string | null
          created_at?: string | null
          departure_date: string
          guest_name: string
          nights: number
          number_of_guests?: number | null
          remarks?: string | null
          room_id?: string | null
          stay_id?: string
          total_amount?: number | null
          voucher_number?: string | null
        }
        Update: {
          amount_paid?: number | null
          arrival_date?: string
          booking_source?: string | null
          created_at?: string | null
          departure_date?: string
          guest_name?: string
          nights?: number
          number_of_guests?: number | null
          remarks?: string | null
          room_id?: string | null
          stay_id?: string
          total_amount?: number | null
          voucher_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_stays_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_details"
            referencedColumns: ["room_id"]
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
      night_audit_details: {
        Row: {
          audit_date: string
          audit_id: string
          balance: number | null
          charges: number | null
          created_at: string | null
          hotel_id: string
          notes: string | null
          revenue: number | null
          room_id: string | null
          taxes: number | null
        }
        Insert: {
          audit_date: string
          audit_id?: string
          balance?: number | null
          charges?: number | null
          created_at?: string | null
          hotel_id: string
          notes?: string | null
          revenue?: number | null
          room_id?: string | null
          taxes?: number | null
        }
        Update: {
          audit_date?: string
          audit_id?: string
          balance?: number | null
          charges?: number | null
          created_at?: string | null
          hotel_id?: string
          notes?: string | null
          revenue?: number | null
          room_id?: string | null
          taxes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "night_audit_details_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "night_audit_details_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_details"
            referencedColumns: ["room_id"]
          },
        ]
      }
      no_show_reports: {
        Row: {
          created_at: string | null
          hotel_id: string
          no_show_id: string
          number_of_no_shows: number | null
          potential_revenue_loss: number | null
          report_date: string
        }
        Insert: {
          created_at?: string | null
          hotel_id: string
          no_show_id?: string
          number_of_no_shows?: number | null
          potential_revenue_loss?: number | null
          report_date: string
        }
        Update: {
          created_at?: string | null
          hotel_id?: string
          no_show_id?: string
          number_of_no_shows?: number | null
          potential_revenue_loss?: number | null
          report_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "no_show_reports_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
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
      processing_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          file_id: string | null
          id: string
          log_level: string
          message: string
          request_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          file_id?: string | null
          id?: string
          log_level: string
          message: string
          request_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          file_id?: string | null
          id?: string
          log_level?: string
          message?: string
          request_id?: string
        }
        Relationships: []
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
      room_details: {
        Row: {
          created_at: string | null
          hotel_id: string
          rate_type: string | null
          room_id: string
          room_number: string
          room_type: string
          standard_rate: number | null
        }
        Insert: {
          created_at?: string | null
          hotel_id: string
          rate_type?: string | null
          room_id?: string
          room_number: string
          room_type: string
          standard_rate?: number | null
        }
        Update: {
          created_at?: string | null
          hotel_id?: string
          rate_type?: string | null
          room_id?: string
          room_number?: string
          room_type?: string
          standard_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_details_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string | null
          document_type: string | null
          extracted_data: Json | null
          file_path: string
          file_size: number | null
          file_type: string
          filename: string
          id: string
          processed: boolean | null
          processing: boolean | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          extracted_data?: Json | null
          file_path: string
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          processed?: boolean | null
          processing?: boolean | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          extracted_data?: Json | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          processed?: boolean | null
          processing?: boolean | null
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
      get_data_mappings: {
        Args: {
          p_document_type: string
        }
        Returns: {
          created_at: string | null
          document_type: string
          id: string
          mappings: Json
          updated_at: string | null
        }[]
      }
      insert_data_mapping: {
        Args: {
          p_document_type: string
          p_mappings: Json
          p_created_at: string
        }
        Returns: undefined
      }
      update_data_mapping: {
        Args: {
          p_document_type: string
          p_mappings: Json
          p_updated_at: string
        }
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
