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
      academic_resources: {
        Row: {
          course_code: string | null
          created_at: string | null
          department: string
          description: string | null
          external_url: string
          id: string
          is_active: boolean | null
          level: string
          resource_type: string
          title: string
          updated_at: string | null
          year: string | null
        }
        Insert: {
          course_code?: string | null
          created_at?: string | null
          department: string
          description?: string | null
          external_url: string
          id?: string
          is_active?: boolean | null
          level: string
          resource_type: string
          title: string
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          course_code?: string | null
          created_at?: string | null
          department?: string
          description?: string | null
          external_url?: string
          id?: string
          is_active?: boolean | null
          level?: string
          resource_type?: string
          title?: string
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
      aspirant_applications: {
        Row: {
          admin_notes: string | null
          cgpa: number
          created_at: string | null
          current_step: number | null
          date_of_birth: string
          department: Database["public"]["Enums"]["department"]
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          leadership_history: string
          level: Database["public"]["Enums"]["level"]
          matric: string
          payment_proof_url: string | null
          payment_verified: boolean | null
          phone: string
          photo_url: string | null
          position_id: string | null
          referee_declaration_url: string | null
          screening_date: string | null
          screening_result: string | null
          status: Database["public"]["Enums"]["aspirant_status"] | null
          step_data: Json | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
          why_running: string
        }
        Insert: {
          admin_notes?: string | null
          cgpa: number
          created_at?: string | null
          current_step?: number | null
          date_of_birth: string
          department: Database["public"]["Enums"]["department"]
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          leadership_history: string
          level: Database["public"]["Enums"]["level"]
          matric: string
          payment_proof_url?: string | null
          payment_verified?: boolean | null
          phone: string
          photo_url?: string | null
          position_id?: string | null
          referee_declaration_url?: string | null
          screening_date?: string | null
          screening_result?: string | null
          status?: Database["public"]["Enums"]["aspirant_status"] | null
          step_data?: Json | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          why_running: string
        }
        Update: {
          admin_notes?: string | null
          cgpa?: number
          created_at?: string | null
          current_step?: number | null
          date_of_birth?: string
          department?: Database["public"]["Enums"]["department"]
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          leadership_history?: string
          level?: Database["public"]["Enums"]["level"]
          matric?: string
          payment_proof_url?: string | null
          payment_verified?: boolean | null
          phone?: string
          photo_url?: string | null
          position_id?: string | null
          referee_declaration_url?: string | null
          screening_date?: string | null
          screening_result?: string | null
          status?: Database["public"]["Enums"]["aspirant_status"] | null
          step_data?: Json | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          why_running?: string
        }
        Relationships: [
          {
            foreignKeyName: "aspirant_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "aspirant_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      aspirant_positions: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          eligible_departments: Database["public"]["Enums"]["department"][]
          eligible_gender: Database["public"]["Enums"]["gender"] | null
          eligible_levels: Database["public"]["Enums"]["level"][]
          fee: number
          id: string
          is_active: boolean | null
          min_cgpa: number
          position_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligible_departments: Database["public"]["Enums"]["department"][]
          eligible_gender?: Database["public"]["Enums"]["gender"] | null
          eligible_levels: Database["public"]["Enums"]["level"][]
          fee?: number
          id?: string
          is_active?: boolean | null
          min_cgpa?: number
          position_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligible_departments?: Database["public"]["Enums"]["department"][]
          eligible_gender?: Database["public"]["Enums"]["gender"] | null
          eligible_levels?: Database["public"]["Enums"]["level"][]
          fee?: number
          id?: string
          is_active?: boolean | null
          min_cgpa?: number
          position_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_type?: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          application_id: string | null
          created_at: string | null
          department: Database["public"]["Enums"]["department"]
          id: string
          manifesto: string | null
          matric: string
          name: string
          photo_url: string
          voting_position_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          department: Database["public"]["Enums"]["department"]
          id?: string
          manifesto?: string | null
          matric: string
          name: string
          photo_url: string
          voting_position_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["department"]
          id?: string
          manifesto?: string | null
          matric?: string
          name?: string
          photo_url?: string
          voting_position_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "aspirant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_voting_position_id_fkey"
            columns: ["voting_position_id"]
            isOneToOne: false
            referencedRelation: "voting_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      cohssa_alumni: {
        Row: {
          administration_number: number
          created_at: string | null
          current_workplace: string | null
          department: string | null
          email: string | null
          graduation_year: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          position: string
        }
        Insert: {
          administration_number: number
          created_at?: string | null
          current_workplace?: string | null
          department?: string | null
          email?: string | null
          graduation_year?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          position: string
        }
        Update: {
          administration_number?: number
          created_at?: string | null
          current_workplace?: string | null
          department?: string | null
          email?: string | null
          graduation_year?: string | null
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
          contact: string | null
          created_at: string | null
          department: string | null
          display_order: number
          id: string
          level: string | null
          name: string
          photo_url: string | null
          position: string
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number
          id?: string
          level?: string | null
          name: string
          photo_url?: string | null
          position: string
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number
          id?: string
          level?: string | null
          name?: string
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      cohssa_senate: {
        Row: {
          contact: string | null
          created_at: string | null
          department: string | null
          display_order: number
          id: string
          level: string | null
          name: string
          photo_url: string | null
          position: string
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number
          id?: string
          level?: string | null
          name: string
          photo_url?: string | null
          position: string
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          department?: string | null
          display_order?: number
          id?: string
          level?: string | null
          name?: string
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      committee_members: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number
          id: string
          is_staff: boolean | null
          level: string | null
          name: string
          photo_url: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number
          id?: string
          is_staff?: boolean | null
          level?: string | null
          name: string
          photo_url?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number
          id?: string
          is_staff?: boolean | null
          level?: string | null
          name?: string
          photo_url?: string | null
          position?: string
        }
        Relationships: []
      }
      editorial_content: {
        Row: {
          author_department: string | null
          author_matric: string | null
          author_name: string
          content: string
          content_type: string
          created_at: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          review_notes: string | null
          reviewed_by: string | null
          submitted_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_department?: string | null
          author_matric?: string | null
          author_name: string
          content: string
          content_type: string
          created_at?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_department?: string | null
          author_matric?: string | null
          author_name?: string
          content?: string
          content_type?: string
          created_at?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      election_timeline: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          is_active: boolean | null
          is_publicly_visible: boolean | null
          stage_name: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          is_publicly_visible?: boolean | null
          stage_name: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          is_publicly_visible?: boolean | null
          stage_name?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events_gallery: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string | null
          event_type: string
          id: string
          image_url: string | null
          is_published: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_type: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title?: string
        }
        Relationships: []
      }
      issuance_log: {
        Row: {
          id: string
          invalidated_at: string | null
          issuance_token: string
          issued_at: string | null
          voter_matric: string
        }
        Insert: {
          id?: string
          invalidated_at?: string | null
          issuance_token: string
          issued_at?: string | null
          voter_matric: string
        }
        Update: {
          id?: string
          invalidated_at?: string | null
          issuance_token?: string
          issued_at?: string | null
          voter_matric?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      student_list: {
        Row: {
          created_at: string | null
          department: Database["public"]["Enums"]["department"]
          id: string
          level: Database["public"]["Enums"]["level"] | null
          matric: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: Database["public"]["Enums"]["department"]
          id?: string
          level?: Database["public"]["Enums"]["level"] | null
          matric: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department"]
          id?: string
          level?: Database["public"]["Enums"]["level"] | null
          matric?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      university_leaders: {
        Row: {
          created_at: string | null
          display_order: number
          faculty: string | null
          id: string
          name: string
          photo_url: string | null
          position: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          faculty?: string | null
          id?: string
          name: string
          photo_url?: string | null
          position: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          faculty?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          position?: string
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
      voter_profiles: {
        Row: {
          email: string
          id: string
          issuance_token: string | null
          matric: string
          name: string
          registered_at: string | null
          user_id: string | null
          verified: boolean | null
          voted: boolean | null
          voted_at: string | null
          webauthn_credential: Json | null
        }
        Insert: {
          email: string
          id?: string
          issuance_token?: string | null
          matric: string
          name: string
          registered_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          voted?: boolean | null
          voted_at?: string | null
          webauthn_credential?: Json | null
        }
        Update: {
          email?: string
          id?: string
          issuance_token?: string | null
          matric?: string
          name?: string
          registered_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          voted?: boolean | null
          voted_at?: string | null
          webauthn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "voter_profiles_matric_fkey"
            columns: ["matric"]
            isOneToOne: true
            referencedRelation: "student_list"
            referencedColumns: ["matric"]
          },
        ]
      }
      votes: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
          issuance_token: string
          voting_position_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          issuance_token: string
          voting_position_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          issuance_token?: string
          voting_position_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voting_position_id_fkey"
            columns: ["voting_position_id"]
            isOneToOne: false
            referencedRelation: "voting_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_positions: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          max_selections: number | null
          position_name: string
          vote_type: Database["public"]["Enums"]["vote_type"] | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          max_selections?: number | null
          position_name: string
          vote_type?: Database["public"]["Enums"]["vote_type"] | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          max_selections?: number | null
          position_name?: string
          vote_type?: Database["public"]["Enums"]["vote_type"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_cast_vote: {
        Args: { _issuance_token: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "aspirant" | "voter"
      aspirant_status:
        | "submitted"
        | "payment_verified"
        | "under_review"
        | "screening_scheduled"
        | "screening_completed"
        | "qualified"
        | "disqualified"
        | "candidate"
      department:
        | "Nursing Sciences"
        | "Medical Laboratory Sciences"
        | "Medicine and Surgery"
        | "Community Medicine and Public Health"
        | "Human Anatomy"
        | "Human Physiology"
      election_stage:
        | "aspirant_application"
        | "voter_registration"
        | "voting"
        | "results"
        | "closed"
      gender: "male" | "female"
      level: "100L" | "200L" | "300L" | "400L" | "500L"
      vote_type: "single" | "multiple"
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
      app_role: ["admin", "aspirant", "voter"],
      aspirant_status: [
        "submitted",
        "payment_verified",
        "under_review",
        "screening_scheduled",
        "screening_completed",
        "qualified",
        "disqualified",
        "candidate",
      ],
      department: [
        "Nursing Sciences",
        "Medical Laboratory Sciences",
        "Medicine and Surgery",
        "Community Medicine and Public Health",
        "Human Anatomy",
        "Human Physiology",
      ],
      election_stage: [
        "aspirant_application",
        "voter_registration",
        "voting",
        "results",
        "closed",
      ],
      gender: ["male", "female"],
      level: ["100L", "200L", "300L", "400L", "500L"],
      vote_type: ["single", "multiple"],
    },
  },
} as const
