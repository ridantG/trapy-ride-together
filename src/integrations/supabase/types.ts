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
      bookings: {
        Row: {
          created_at: string | null
          id: string
          passenger_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          platform_fee: number
          ride_id: string
          seats_booked: number
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          passenger_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee: number
          ride_id: string
          seats_booked?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          passenger_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee?: number
          ride_id?: string
          seats_booked?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          avatar_url: string | null
          created_at: string | null
          dl_status: Database["public"]["Enums"]["verification_status"] | null
          fuel_points: number | null
          full_name: string | null
          gender: string | null
          id: string
          is_aadhaar_verified: boolean | null
          is_dl_verified: boolean | null
          is_phone_verified: boolean | null
          phone: string | null
          rating: number | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_rides: number | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          aadhaar_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          avatar_url?: string | null
          created_at?: string | null
          dl_status?: Database["public"]["Enums"]["verification_status"] | null
          fuel_points?: number | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_aadhaar_verified?: boolean | null
          is_dl_verified?: boolean | null
          is_phone_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_rides?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          aadhaar_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          avatar_url?: string | null
          created_at?: string | null
          dl_status?: Database["public"]["Enums"]["verification_status"] | null
          fuel_points?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_aadhaar_verified?: boolean | null
          is_dl_verified?: boolean | null
          is_phone_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_rides?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      rides: {
        Row: {
          car_model: string | null
          car_number: string | null
          created_at: string | null
          departure_time: string
          destination: string
          distance_km: number | null
          driver_id: string
          id: string
          is_chatty: boolean | null
          is_music_allowed: boolean | null
          is_pet_friendly: boolean | null
          is_smoking_allowed: boolean | null
          is_women_only: boolean | null
          max_two_back_seat: boolean | null
          origin: string
          price_per_seat: number
          seats_available: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string | null
          departure_time: string
          destination: string
          distance_km?: number | null
          driver_id: string
          id?: string
          is_chatty?: boolean | null
          is_music_allowed?: boolean | null
          is_pet_friendly?: boolean | null
          is_smoking_allowed?: boolean | null
          is_women_only?: boolean | null
          max_two_back_seat?: boolean | null
          origin: string
          price_per_seat: number
          seats_available: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string | null
          departure_time?: string
          destination?: string
          distance_km?: number | null
          driver_id?: string
          id?: string
          is_chatty?: boolean | null
          is_music_allowed?: boolean | null
          is_pet_friendly?: boolean | null
          is_smoking_allowed?: boolean | null
          is_women_only?: boolean | null
          max_two_back_seat?: boolean | null
          origin?: string
          price_per_seat?: number
          seats_available?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_user_id_fkey"
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
      booking_status: "pending" | "confirmed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      subscription_tier: "free" | "premium"
      verification_status: "pending" | "verified" | "rejected"
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
      booking_status: ["pending", "confirmed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      subscription_tier: ["free", "premium"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
