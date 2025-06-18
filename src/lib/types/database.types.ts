export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          preferences: Json
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: string
          duration: number
          category: string
          is_active: boolean
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: string
          duration: number
          category: string
          is_active?: boolean
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: string
          duration?: number
          category?: string
          is_active?: boolean
          image_url?: string | null
        }
        Relationships: []
      }
      stylists: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          bio: string | null
          specialties: string[] | null
          avatar_url: string | null
          is_active: boolean
          availability: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          bio?: string | null
          specialties?: string[] | null
          avatar_url?: string | null
          is_active?: boolean
          availability?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          bio?: string | null
          specialties?: string[] | null
          avatar_url?: string | null
          is_active?: boolean
          availability?: Json
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          service_id: string | null
          stylist_id: string | null
          appointment_date: string
          appointment_time: string
          status: string
          notes: string | null
          total_price: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          service_id?: string | null
          stylist_id?: string | null
          appointment_date: string
          appointment_time: string
          status?: string
          notes?: string | null
          total_price?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          service_id?: string | null
          stylist_id?: string | null
          appointment_date?: string
          appointment_time?: string
          status?: string
          notes?: string | null
          total_price?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          service_id: string | null
          stylist_id: string | null
          appointment_id: string | null
          rating: number | null
          comment: string | null
          is_visible: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          service_id?: string | null
          stylist_id?: string | null
          appointment_id?: string | null
          rating?: number | null
          comment?: string | null
          is_visible?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          service_id?: string | null
          stylist_id?: string | null
          appointment_id?: string | null
          rating?: number | null
          comment?: string | null
          is_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      gallery_images: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          url: string
          title: string | null
          description: string | null
          category: string | null
          stylist_id: string | null
          is_featured: boolean
          display_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          url: string
          title?: string | null
          description?: string | null
          category?: string | null
          stylist_id?: string | null
          is_featured?: boolean
          display_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          url?: string
          title?: string | null
          description?: string | null
          category?: string | null
          stylist_id?: string | null
          is_featured?: boolean
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never