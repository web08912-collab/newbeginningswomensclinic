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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          age: number | null
          concern: string | null
          created_at: string
          doctor_id: string | null
          email: string | null
          follow_up_date: string | null
          full_name: string
          id: string
          internal_notes: string | null
          notes: string | null
          phone: string
          preferred_date: string
          preferred_time: string
          service: string
          status: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          concern?: string | null
          created_at?: string
          doctor_id?: string | null
          email?: string | null
          follow_up_date?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone: string
          preferred_date: string
          preferred_time: string
          service: string
          status?: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          concern?: string | null
          created_at?: string
          doctor_id?: string | null
          email?: string | null
          follow_up_date?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone?: string
          preferred_date?: string
          preferred_time?: string
          service?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          archived: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          internal_notes: string | null
          is_important: boolean
          message: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          archived?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          internal_notes?: string | null
          is_important?: boolean
          message: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          archived?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          internal_notes?: string | null
          is_important?: boolean
          message?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          consultation_fee: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          languages: string[] | null
          name: string
          phone: string | null
          qualifications: string | null
          slug: string
          sort_order: number
          specialization: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          consultation_fee?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          languages?: string[] | null
          name: string
          phone?: string | null
          qualifications?: string | null
          slug: string
          sort_order?: number
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          consultation_fee?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          languages?: string[] | null
          name?: string
          phone?: string | null
          qualifications?: string | null
          slug?: string
          sort_order?: number
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      patient_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          patient_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          patient_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          patient_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          benefits: Json
          created_at: string
          description: string | null
          duration_minutes: number | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          benefits?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          benefits?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean
          is_featured: boolean
          patient_location: string | null
          patient_name: string
          rating: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_featured?: boolean
          patient_location?: string | null
          patient_name: string
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_featured?: boolean
          patient_location?: string | null
          patient_name?: string
          rating?: number
          sort_order?: number
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
