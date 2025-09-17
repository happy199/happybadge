export type Database = {
  public: {
    Tables: {
      event_badge_templates: {
        Row: {
          id: string
          event_id: string
          user_id: string
          name: string
          frame_image_url: string
          shape: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          name: string
          frame_image_url: string
          shape?: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          name?: string
          frame_image_url?: string
          shape?: string
          is_public?: boolean
          created_at?: string
        }
      }
      event_badge_generations: {
        Row: {
          id: number
          template_id: string
          generated_at: string
          metadata: Record<string, unknown> | null
        }
        Insert: {
          id?: number
          template_id: string
          generated_at?: string
          metadata?: Record<string, unknown> | null
        }
        Update: {
          id?: number
          template_id?: string
          generated_at?: string
          metadata?: Record<string, unknown> | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          company: string | null
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          company?: string | null
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          company?: string | null
          plan?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          event_date: string
          location: string
          logo_url: string | null
          status: string
          settings: Record<string, unknown>
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          event_date: string
          location: string
          logo_url?: string | null
          status?: string
          settings?: Record<string, unknown>
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          event_date?: string
          location?: string
          logo_url?: string | null
          status?: string
          settings?: Record<string, unknown>
          slug?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          event_id: string
          custom_data: Record<string, unknown> | null
          registered_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          event_id: string
          custom_data?: Record<string, unknown> | null
          registered_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          event_id?: string
          custom_data?: Record<string, unknown> | null
        }
      }
      badges: {
        Row: {
          id: string
          event_id: string
          participant_email: string
          participant_name: string
          photo_url: string
          template_id: string
          generated_image_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_email: string
          participant_name: string
          photo_url: string
          template_id: string
          generated_image_url?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_email?: string
          participant_name?: string
          photo_url?: string
          template_id?: string
          generated_image_url?: string | null
          status?: string
        }
      }
      badge_templates: {
        Row: {
          id: string
          name: string
          preview_url: string
          type: string
          config: Record<string, unknown>
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          preview_url: string
          type?: string
          config: Record<string, unknown>
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          preview_url?: string
          type?: string
          config?: Record<string, unknown>
          is_premium?: boolean
        }
      }
      analytics: {
        Row: {
          id: string
          event_id: string
          type: string
          data: Record<string, unknown>
          recorded_at: string
        }
        Insert: {
          id?: string
          event_id: string
          type: string
          data: Record<string, unknown>
          recorded_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          type?: string
          data?: Record<string, unknown>
        }
      }
    }
  }
}

