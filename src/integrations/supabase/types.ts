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
      admin_login_attempts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      aspirants: {
        Row: {
          application_data: Json | null
          cgpa: number | null
          created_at: string | null
          date_of_birth: string | null
          department: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          leadership_history: string | null
          level: string
          manifesto: string | null
          matric: string | null
          matric_number: string
          name: string
          payment_proof_url: string | null
          phone: string | null
          photo_url: string | null
          position_id: string | null
          status: string | null
          step_data: Json | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
          why_running: string | null
        }
        Insert: {
          application_data?: Json | null
          cgpa?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          department: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          leadership_history?: string | null
          level: string
          manifesto?: string | null
          matric?: string | null
          matric_number: string
          name: string
          payment_proof_url?: string | null
          phone?: string | null
          photo_url?: string | null
          position_id?: string | null
          status?: string | null
          step_data?: Json | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          why_running?: string | null
        }
        Update: {
          application_data?: Json | null
          cgpa?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          leadership_history?: string | null
          level?: string
          manifesto?: string | null
          matric?: string | null
          matric_number?: string
          name?: string
          payment_proof_url?: string | null
          phone?: string | null
          photo_url?: string | null
          position_id?: string | null
          status?: string | null
          step_data?: Json | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          why_running?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          application_id: string | null
          created_at: string | null
          department: string
          id: string
          is_active: boolean | null
          manifesto: string | null
          matric: string
          name: string
          photo_url: string | null
          position_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          department: string
          id?: string
          is_active?: boolean | null
          manifesto?: string | null
          matric: string
          name: string
          photo_url?: string | null
          position_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          department?: string
          id?: string
          is_active?: boolean | null
          manifesto?: string | null
          matric?: string
          name?: string
          photo_url?: string | null
          position_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "approved_aspirants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "aspirants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      cohssa_alumni: {
        Row: {
          administration_number: number | null
          created_at: string | null
          current_workplace: string | null
          department: string | null
          display_order: number | null
          email: string | null
          graduation_year: number | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          position: string
        }
        Insert: {
          administration_number?: number | null
          created_at?: string | null
          current_workplace?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          graduation_year?: number | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          position: string
        }
        Update: {
          administration_number?: number | null
          created_at?: string | null
          current_workplace?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          graduation_year?: number | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      cohssa_executives: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          email: string | null
          id: string
          level: string | null
          name: string
          phone: string | null
          photo_url: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          level?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          level?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      cohssa_senate: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          email: string | null
          id: string
          level: string | null
          name: string
          phone: string | null
          photo_url: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          level?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          level?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      college_departments: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          faculty: string | null
          head_of_department: string | null
          hod_photo_url: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          faculty?: string | null
          head_of_department?: string | null
          hod_photo_url?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          faculty?: string | null
          head_of_department?: string | null
          hod_photo_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      editorial_content: {
        Row: {
          author_email: string | null
          author_name: string | null
          content: string | null
          content_type: string
          created_at: string | null
          department: string | null
          id: string
          image_url: string | null
          pdf_url: string | null
          published_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          content?: string | null
          content_type: string
          created_at?: string | null
          department?: string | null
          id?: string
          image_url?: string | null
          pdf_url?: string | null
          published_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          content?: string | null
          content_type?: string
          created_at?: string | null
          department?: string | null
          id?: string
          image_url?: string | null
          pdf_url?: string | null
          published_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      election_timeline: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          is_publicly_visible: boolean | null
          stage_name: string | null
          start_date: string
          start_time: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          is_publicly_visible?: boolean | null
          stage_name?: string | null
          start_date: string
          start_time?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          is_publicly_visible?: boolean | null
          stage_name?: string | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      electoral_committee: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          email: string | null
          id: string
          is_staff_adviser: boolean | null
          level: string | null
          name: string
          phone: string | null
          photo_url: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_staff_adviser?: boolean | null
          level?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_staff_adviser?: boolean | null
          level?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          highlights: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          location: string | null
          start_date: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          highlights?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          start_date?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          highlights?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          type: string | null
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          type?: string | null
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          type?: string | null
          used?: boolean | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          eligible_departments: string[] | null
          eligible_gender: string | null
          eligible_levels: string[] | null
          fee: number | null
          id: string
          is_active: boolean | null
          max_candidates: number | null
          min_cgpa: number | null
          position_name: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligible_departments?: string[] | null
          eligible_gender?: string | null
          eligible_levels?: string[] | null
          fee?: number | null
          id?: string
          is_active?: boolean | null
          max_candidates?: number | null
          min_cgpa?: number | null
          position_name?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligible_departments?: string[] | null
          eligible_gender?: string | null
          eligible_levels?: string[] | null
          fee?: number | null
          id?: string
          is_active?: boolean | null
          max_candidates?: number | null
          min_cgpa?: number | null
          position_name?: string | null
          title?: string
        }
        Relationships: []
      }
      presidential_appointments: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          id: string
          name: string
          photo_url: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string
          name: string
          photo_url?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string
          name?: string
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
          locked_until: string | null
        }
        Insert: {
          action_type: string
          attempt_count?: number | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
          locked_until?: string | null
        }
        Update: {
          action_type?: string
          attempt_count?: number | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
          locked_until?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          admin_commission: number | null
          created_at: string | null
          department: string | null
          description: string | null
          external_link: string | null
          file_url: string | null
          id: string
          is_sold: boolean | null
          level: string | null
          price: number | null
          resource_type: string
          seller_id: string | null
          seller_name: string | null
          seller_phone: string | null
          status: string | null
          title: string
        }
        Insert: {
          admin_commission?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          external_link?: string | null
          file_url?: string | null
          id?: string
          is_sold?: boolean | null
          level?: string | null
          price?: number | null
          resource_type: string
          seller_id?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          status?: string | null
          title: string
        }
        Update: {
          admin_commission?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          external_link?: string | null
          file_url?: string | null
          id?: string
          is_sold?: boolean | null
          level?: string | null
          price?: number | null
          resource_type?: string
          seller_id?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      standing_committees: {
        Row: {
          chairman: string | null
          committee_name: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          members: string[] | null
        }
        Insert: {
          chairman?: string | null
          committee_name: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          members?: string[] | null
        }
        Update: {
          chairman?: string | null
          committee_name?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          members?: string[] | null
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string | null
          department: string
          email: string | null
          faculty: string | null
          id: string
          level: string
          matric_number: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          email?: string | null
          faculty?: string | null
          id?: string
          level: string
          matric_number: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          email?: string | null
          faculty?: string | null
          id?: string
          level?: string
          matric_number?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      university_leaders: {
        Row: {
          bio: string | null
          category: string | null
          created_at: string | null
          department: string | null
          display_order: number | null
          faculty: string | null
          id: string
          name: string
          photo_url: string | null
          position: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          faculty?: string | null
          id?: string
          name: string
          photo_url?: string | null
          position: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          faculty?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voters: {
        Row: {
          created_at: string | null
          department: string
          email: string | null
          has_voted: boolean | null
          id: string
          level: string
          matric_number: string
          name: string
          phone: string | null
          user_id: string | null
          verified: boolean | null
          webauthn_credential: Json | null
        }
        Insert: {
          created_at?: string | null
          department: string
          email?: string | null
          has_voted?: boolean | null
          id?: string
          level: string
          matric_number: string
          name: string
          phone?: string | null
          user_id?: string | null
          verified?: boolean | null
          webauthn_credential?: Json | null
        }
        Update: {
          created_at?: string | null
          department?: string
          email?: string | null
          has_voted?: boolean | null
          id?: string
          level?: string
          matric_number?: string
          name?: string
          phone?: string | null
          user_id?: string | null
          verified?: boolean | null
          webauthn_credential?: Json | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          aspirant_id: string | null
          created_at: string | null
          id: string
          position_id: string | null
          voter_id: string | null
        }
        Insert: {
          aspirant_id?: string | null
          created_at?: string | null
          id?: string
          position_id?: string | null
          voter_id?: string | null
        }
        Update: {
          aspirant_id?: string | null
          created_at?: string | null
          id?: string
          position_id?: string | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_aspirant_id_fkey"
            columns: ["aspirant_id"]
            isOneToOne: false
            referencedRelation: "approved_aspirants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_aspirant_id_fkey"
            columns: ["aspirant_id"]
            isOneToOne: false
            referencedRelation: "aspirants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "voters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      approved_aspirants_public: {
        Row: {
          department: string | null
          full_name: string | null
          id: string | null
          level: string | null
          manifesto: string | null
          name: string | null
          photo_url: string | null
          position_id: string | null
          status: string | null
          why_running: string | null
        }
        Insert: {
          department?: string | null
          full_name?: string | null
          id?: string | null
          level?: string | null
          manifesto?: string | null
          name?: string | null
          photo_url?: string | null
          position_id?: string | null
          status?: string | null
          why_running?: string | null
        }
        Update: {
          department?: string | null
          full_name?: string | null
          id?: string | null
          level?: string | null
          manifesto?: string | null
          name?: string | null
          photo_url?: string | null
          position_id?: string | null
          status?: string | null
          why_running?: string | null
        }
        Relationships: []
      }
      approved_resources_public: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          external_link: string | null
          file_url: string | null
          id: string | null
          is_sold: boolean | null
          level: string | null
          price: number | null
          resource_type: string | null
          seller_name: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          external_link?: string | null
          file_url?: string | null
          id?: string | null
          is_sold?: boolean | null
          level?: string | null
          price?: number | null
          resource_type?: string | null
          seller_name?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          external_link?: string | null
          file_url?: string | null
          id?: string | null
          is_sold?: boolean | null
          level?: string | null
          price?: number | null
          resource_type?: string | null
          seller_name?: string | null
          title?: string | null
        }
        Relationships: []
      }
      cohssa_alumni_public: {
        Row: {
          administration_number: number | null
          created_at: string | null
          current_workplace: string | null
          department: string | null
          display_order: number | null
          graduation_year: number | null
          id: string | null
          name: string | null
          photo_url: string | null
          position: string | null
        }
        Insert: {
          administration_number?: number | null
          created_at?: string | null
          current_workplace?: string | null
          department?: string | null
          display_order?: number | null
          graduation_year?: number | null
          id?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Update: {
          administration_number?: number | null
          created_at?: string | null
          current_workplace?: string | null
          department?: string | null
          display_order?: number | null
          graduation_year?: number | null
          id?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Relationships: []
      }
      cohssa_executives_public: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          id: string | null
          level: string | null
          name: string | null
          photo_url: string | null
          position: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string | null
          level?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string | null
          level?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Relationships: []
      }
      cohssa_senate_public: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          id: string | null
          level: string | null
          name: string | null
          photo_url: string | null
          position: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string | null
          level?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string | null
          level?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Relationships: []
      }
      electoral_committee_public: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          id: string | null
          is_staff_adviser: boolean | null
          level: string | null
          name: string | null
          photo_url: string | null
          position: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string | null
          is_staff_adviser?: boolean | null
          level?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          id?: string | null
          is_staff_adviser?: boolean | null
          level?: string | null
          name?: string | null
          photo_url?: string | null
          position?: string | null
        }
        Relationships: []
      }
      published_content_public: {
        Row: {
          author_name: string | null
          content: string | null
          content_type: string | null
          created_at: string | null
          department: string | null
          id: string | null
          image_url: string | null
          pdf_url: string | null
          published_at: string | null
          title: string | null
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          department?: string | null
          id?: string | null
          image_url?: string | null
          pdf_url?: string | null
          published_at?: string | null
          title?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          department?: string | null
          id?: string | null
          image_url?: string | null
          pdf_url?: string | null
          published_at?: string | null
          title?: string | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
