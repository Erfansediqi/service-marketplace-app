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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          address_id: string | null
          address_label: string
          cancelled_at: string | null
          cancelled_by: string | null
          client_request_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_name_snapshot: string
          customer_phone_snapshot: string | null
          full_address: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          platform_fee: number
          provider_id: string
          provider_name_snapshot: string
          provider_profession_snapshot: string
          provider_service_id: string
          service_date: string
          service_id: string
          service_name_snapshot: string
          service_price: number
          service_time: string
          service_timezone: string
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          sync_version: number
          total: number | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          address_label: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_request_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name_snapshot: string
          customer_phone_snapshot?: string | null
          full_address: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee?: number
          provider_id: string
          provider_name_snapshot: string
          provider_profession_snapshot: string
          provider_service_id: string
          service_date: string
          service_id: string
          service_name_snapshot: string
          service_price: number
          service_time: string
          service_timezone?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          sync_version?: number
          total?: number | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          address_label?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_request_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name_snapshot?: string
          customer_phone_snapshot?: string | null
          full_address?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee?: number
          provider_id?: string
          provider_name_snapshot?: string
          provider_profession_snapshot?: string
          provider_service_id?: string
          service_date?: string
          service_id?: string
          service_name_snapshot?: string
          service_price?: number
          service_time?: string
          service_timezone?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          sync_version?: number
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_service_id_fkey"
            columns: ["provider_service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_language: string
          role: Database["public"]["Enums"]["app_role"]
          sync_version: number
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          preferred_language?: string
          role?: Database["public"]["Enums"]["app_role"]
          sync_version?: number
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_language?: string
          role?: Database["public"]["Enums"]["app_role"]
          sync_version?: number
          updated_at?: string
        }
        Relationships: []
      }
      provider_accounts: {
        Row: {
          accepts_urgent_requests: boolean
          available_today: boolean
          average_response_minutes: number
          business_name: string
          category_id: string
          completed_jobs: number
          created_at: string
          currency: string
          description: string
          district_id: string
          district_name: string
          end_time: string
          id: string
          instant_booking: boolean
          is_active: boolean
          latitude: number | null
          location_label: string
          longitude: number | null
          minimum_price: number
          owner_user_id: string
          profession: string
          province_id: string
          province_name: string
          rating: number
          response_rate: number
          review_count: number
          service_modes: string[]
          service_radius_km: number
          start_time: string
          sync_version: number
          timezone: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["provider_verification_status"]
          working_days: string[]
          years_experience: string
        }
        Insert: {
          accepts_urgent_requests?: boolean
          available_today?: boolean
          average_response_minutes?: number
          business_name: string
          category_id: string
          completed_jobs?: number
          created_at?: string
          currency?: string
          description?: string
          district_id: string
          district_name?: string
          end_time?: string
          id?: string
          instant_booking?: boolean
          is_active?: boolean
          latitude?: number | null
          location_label?: string
          longitude?: number | null
          minimum_price?: number
          owner_user_id: string
          profession?: string
          province_id: string
          province_name?: string
          rating?: number
          response_rate?: number
          review_count?: number
          service_modes?: string[]
          service_radius_km?: number
          start_time?: string
          sync_version?: number
          timezone?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["provider_verification_status"]
          working_days?: string[]
          years_experience?: string
        }
        Update: {
          accepts_urgent_requests?: boolean
          available_today?: boolean
          average_response_minutes?: number
          business_name?: string
          category_id?: string
          completed_jobs?: number
          created_at?: string
          currency?: string
          description?: string
          district_id?: string
          district_name?: string
          end_time?: string
          id?: string
          instant_booking?: boolean
          is_active?: boolean
          latitude?: number | null
          location_label?: string
          longitude?: number | null
          minimum_price?: number
          owner_user_id?: string
          profession?: string
          province_id?: string
          province_name?: string
          rating?: number
          response_rate?: number
          review_count?: number
          service_modes?: string[]
          service_radius_km?: number
          start_time?: string
          sync_version?: number
          timezone?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["provider_verification_status"]
          working_days?: string[]
          years_experience?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_accounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_accounts_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          created_at: string
          currency: string
          description_override: string | null
          estimated_price: number
          id: string
          is_active: boolean
          provider_id: string
          service_id: string
          sync_version: number
          title_override: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description_override?: string | null
          estimated_price?: number
          id?: string
          is_active?: boolean
          provider_id: string
          service_id: string
          sync_version?: number
          title_override?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description_override?: string | null
          estimated_price?: number
          id?: string
          is_active?: boolean
          provider_id?: string
          service_id?: string
          sync_version?: number
          title_override?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_verification_submissions: {
        Row: {
          created_at: string
          declaration_accepted_at: string
          id: string
          identity_back_path: string | null
          identity_front_path: string
          identity_number: string
          owner_user_id: string
          profile_photo_path: string
          provider_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          sync_version: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          declaration_accepted_at: string
          id?: string
          identity_back_path?: string | null
          identity_front_path: string
          identity_number: string
          owner_user_id: string
          profile_photo_path: string
          provider_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          sync_version?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          declaration_accepted_at?: string
          id?: string
          identity_back_path?: string | null
          identity_front_path?: string
          identity_number?: string
          owner_user_id?: string
          profile_photo_path?: string
          provider_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          sync_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_verification_submissions_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_verification_submissions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "provider_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_verification_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description_dari: string | null
          description_pashto: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name_dari: string
          name_english: string
          name_pashto: string | null
          sort_order: number
          sync_version: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_dari?: string | null
          description_pashto?: string | null
          icon_name?: string | null
          id: string
          is_active?: boolean
          name_dari: string
          name_english: string
          name_pashto?: string | null
          sort_order?: number
          sync_version?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_dari?: string | null
          description_pashto?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name_dari?: string
          name_english?: string
          name_pashto?: string | null
          sort_order?: number
          sync_version?: number
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description_dari: string | null
          description_pashto: string | null
          id: string
          is_active: boolean
          name_dari: string
          name_english: string
          name_pashto: string | null
          sort_order: number
          sync_version: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description_dari?: string | null
          description_pashto?: string | null
          id: string
          is_active?: boolean
          name_dari: string
          name_english: string
          name_pashto?: string | null
          sort_order?: number
          sync_version?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description_dari?: string | null
          description_pashto?: string | null
          id?: string
          is_active?: boolean
          name_dari?: string
          name_english?: string
          name_pashto?: string | null
          sort_order?: number
          sync_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking: {
        Args: {
          p_address_id?: string
          p_address_label: string
          p_client_request_id: string
          p_full_address: string
          p_latitude?: number
          p_longitude?: number
          p_notes?: string
          p_provider_service_id: string
          p_service_date: string
          p_service_time: string
        }
        Returns: {
          address_id: string | null
          address_label: string
          cancelled_at: string | null
          cancelled_by: string | null
          client_request_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_name_snapshot: string
          customer_phone_snapshot: string | null
          full_address: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          platform_fee: number
          provider_id: string
          provider_name_snapshot: string
          provider_profession_snapshot: string
          provider_service_id: string
          service_date: string
          service_id: string
          service_name_snapshot: string
          service_price: number
          service_time: string
          service_timezone: string
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          sync_version: number
          total: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_is_admin: { Args: never; Returns: boolean }
      submit_provider_account: {
        Args: { p_provider_id: string }
        Returns: {
          accepts_urgent_requests: boolean
          available_today: boolean
          average_response_minutes: number
          business_name: string
          category_id: string
          completed_jobs: number
          created_at: string
          currency: string
          description: string
          district_id: string
          district_name: string
          end_time: string
          id: string
          instant_booking: boolean
          is_active: boolean
          latitude: number | null
          location_label: string
          longitude: number | null
          minimum_price: number
          owner_user_id: string
          profession: string
          province_id: string
          province_name: string
          rating: number
          response_rate: number
          review_count: number
          service_modes: string[]
          service_radius_km: number
          start_time: string
          sync_version: number
          timezone: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["provider_verification_status"]
          working_days: string[]
          years_experience: string
        }
        SetofOptions: {
          from: "*"
          to: "provider_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_booking_status: {
        Args: {
          p_booking_id: string
          p_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: {
          address_id: string | null
          address_label: string
          cancelled_at: string | null
          cancelled_by: string | null
          client_request_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_name_snapshot: string
          customer_phone_snapshot: string | null
          full_address: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          platform_fee: number
          provider_id: string
          provider_name_snapshot: string
          provider_profession_snapshot: string
          provider_service_id: string
          service_date: string
          service_id: string
          service_name_snapshot: string
          service_price: number
          service_time: string
          service_timezone: string
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          sync_version: number
          total: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "customer" | "provider" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "in-progress"
        | "completed"
        | "cancelled"
      payment_status: "unpaid" | "paid" | "refunded"
      provider_verification_status:
        | "draft"
        | "pending"
        | "verified"
        | "rejected"
        | "suspended"
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
      app_role: ["customer", "provider", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
      ],
      payment_status: ["unpaid", "paid", "refunded"],
      provider_verification_status: [
        "draft",
        "pending",
        "verified",
        "rejected",
        "suspended",
      ],
    },
  },
} as const
