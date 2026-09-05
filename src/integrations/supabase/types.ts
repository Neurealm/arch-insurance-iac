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
      action_items: {
        Row: {
          answer_id: string
          assigned_to: string | null
          created_at: string
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          answer_id: string
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          answer_id?: string
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      agents_catalog: {
        Row: {
          capability: string | null
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          capability?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          capability?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      answer_notes: {
        Row: {
          answer_id: string
          created_at: string
          created_by: string | null
          id: string
          note_text: string
          note_type: string
        }
        Insert: {
          answer_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_text: string
          note_type?: string
        }
        Update: {
          answer_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_text?: string
          note_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_notes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          answered_by: string | null
          created_at: string
          id: string
          question_id: string
          status: Database["public"]["Enums"]["answer_status"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          id?: string
          question_id: string
          status?: Database["public"]["Enums"]["answer_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          id?: string
          question_id?: string
          status?: Database["public"]["Enums"]["answer_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_narrative_versions: {
        Row: {
          approved_at: string | null
          approver_user_id: string | null
          author_user_id: string | null
          change_summary: string | null
          content_hash: string | null
          created_at: string
          created_by: string | null
          effective_end_at: string | null
          effective_start_at: string | null
          estimated_duration_seconds: number | null
          id: string
          narrative_id: string
          published_at: string | null
          retired_at: string | null
          reviewer_user_id: string | null
          source_text: string
          speech_markup: string | null
          speech_profile_id: string | null
          speech_text: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version_no: number
        }
        Insert: {
          approved_at?: string | null
          approver_user_id?: string | null
          author_user_id?: string | null
          change_summary?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          effective_end_at?: string | null
          effective_start_at?: string | null
          estimated_duration_seconds?: number | null
          id?: string
          narrative_id: string
          published_at?: string | null
          retired_at?: string | null
          reviewer_user_id?: string | null
          source_text: string
          speech_markup?: string | null
          speech_profile_id?: string | null
          speech_text?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version_no: number
        }
        Update: {
          approved_at?: string | null
          approver_user_id?: string | null
          author_user_id?: string | null
          change_summary?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          effective_end_at?: string | null
          effective_start_at?: string | null
          estimated_duration_seconds?: number | null
          id?: string
          narrative_id?: string
          published_at?: string | null
          retired_at?: string | null
          reviewer_user_id?: string | null
          source_text?: string
          speech_markup?: string | null
          speech_profile_id?: string | null
          speech_text?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "audio_narrative_versions_narrative_id_fkey"
            columns: ["narrative_id"]
            isOneToOne: false
            referencedRelation: "audio_narratives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_narrative_versions_speech_profile_id_fkey"
            columns: ["speech_profile_id"]
            isOneToOne: false
            referencedRelation: "audio_speech_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_narrative_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_narratives: {
        Row: {
          active_version_id: string | null
          audience: string
          call_id: string
          created_at: string
          created_by: string | null
          default_locale: string
          default_speech_profile_id: string | null
          description: string | null
          id: string
          module_key: string
          name: string
          owner_user_id: string | null
          scope_reference: string | null
          scope_type: string
          status: string
          tenant_id: string
          topic_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active_version_id?: string | null
          audience?: string
          call_id: string
          created_at?: string
          created_by?: string | null
          default_locale?: string
          default_speech_profile_id?: string | null
          description?: string | null
          id?: string
          module_key: string
          name: string
          owner_user_id?: string | null
          scope_reference?: string | null
          scope_type?: string
          status?: string
          tenant_id: string
          topic_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_version_id?: string | null
          audience?: string
          call_id?: string
          created_at?: string
          created_by?: string | null
          default_locale?: string
          default_speech_profile_id?: string | null
          description?: string | null
          id?: string
          module_key?: string
          name?: string
          owner_user_id?: string | null
          scope_reference?: string | null
          scope_type?: string
          status?: string
          tenant_id?: string
          topic_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_narratives_active_version_fk"
            columns: ["active_version_id"]
            isOneToOne: false
            referencedRelation: "audio_narrative_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_narratives_default_speech_profile_id_fkey"
            columns: ["default_speech_profile_id"]
            isOneToOne: false
            referencedRelation: "audio_speech_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_narratives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_placements: {
        Row: {
          audience: string
          button_label: string | null
          call_id: string
          component_key: string | null
          created_at: string
          created_by: string | null
          display_variant: string
          id: string
          is_enabled: boolean
          module_key: string
          narrative_id: string
          page_key: string | null
          placement_key: string
          record_context_type: string | null
          required_permission_code: string | null
          route_pattern: string | null
          section_key: string | null
          sort_order: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audience?: string
          button_label?: string | null
          call_id: string
          component_key?: string | null
          created_at?: string
          created_by?: string | null
          display_variant?: string
          id?: string
          is_enabled?: boolean
          module_key: string
          narrative_id: string
          page_key?: string | null
          placement_key: string
          record_context_type?: string | null
          required_permission_code?: string | null
          route_pattern?: string | null
          section_key?: string | null
          sort_order?: number
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audience?: string
          button_label?: string | null
          call_id?: string
          component_key?: string | null
          created_at?: string
          created_by?: string | null
          display_variant?: string
          id?: string
          is_enabled?: boolean
          module_key?: string
          narrative_id?: string
          page_key?: string | null
          placement_key?: string
          record_context_type?: string | null
          required_permission_code?: string | null
          route_pattern?: string | null
          section_key?: string | null
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_placements_narrative_id_fkey"
            columns: ["narrative_id"]
            isOneToOne: false
            referencedRelation: "audio_narratives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_placements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_playback_events: {
        Row: {
          audience: string | null
          browser_capability: string | null
          browser_supported: boolean | null
          call_id: string | null
          char_count: number | null
          duration_ms: number | null
          error_category: string | null
          error_code: string | null
          event_type: string
          id: string
          locale: string | null
          module_key: string | null
          narrative_id: string | null
          narrative_version_id: string | null
          occurred_at: string
          page_key: string | null
          placement_key: string | null
          playback_state: string | null
          section_key: string | null
          tenant_id: string
          user_id: string | null
          version_no: number | null
          voice_name: string | null
        }
        Insert: {
          audience?: string | null
          browser_capability?: string | null
          browser_supported?: boolean | null
          call_id?: string | null
          char_count?: number | null
          duration_ms?: number | null
          error_category?: string | null
          error_code?: string | null
          event_type: string
          id?: string
          locale?: string | null
          module_key?: string | null
          narrative_id?: string | null
          narrative_version_id?: string | null
          occurred_at?: string
          page_key?: string | null
          placement_key?: string | null
          playback_state?: string | null
          section_key?: string | null
          tenant_id: string
          user_id?: string | null
          version_no?: number | null
          voice_name?: string | null
        }
        Update: {
          audience?: string | null
          browser_capability?: string | null
          browser_supported?: boolean | null
          call_id?: string | null
          char_count?: number | null
          duration_ms?: number | null
          error_category?: string | null
          error_code?: string | null
          event_type?: string
          id?: string
          locale?: string | null
          module_key?: string | null
          narrative_id?: string | null
          narrative_version_id?: string | null
          occurred_at?: string
          page_key?: string | null
          placement_key?: string | null
          playback_state?: string | null
          section_key?: string | null
          tenant_id?: string
          user_id?: string | null
          version_no?: number | null
          voice_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_playback_events_narrative_id_fkey"
            columns: ["narrative_id"]
            isOneToOne: false
            referencedRelation: "audio_narratives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_playback_events_narrative_version_id_fkey"
            columns: ["narrative_version_id"]
            isOneToOne: false
            referencedRelation: "audio_narrative_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_playback_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_pronunciation_rules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_enabled: boolean
          locale: string | null
          match_text: string
          match_type: string
          module_key: string | null
          priority: number
          replacement_text: string
          scope: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_enabled?: boolean
          locale?: string | null
          match_text: string
          match_type?: string
          module_key?: string | null
          priority?: number
          replacement_text: string
          scope?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_enabled?: boolean
          locale?: string | null
          match_text?: string
          match_type?: string
          module_key?: string | null
          priority?: number
          replacement_text?: string
          scope?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_pronunciation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_speech_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          fallback_locale: string
          fallback_profile_id: string | null
          id: string
          is_default: boolean
          is_enabled: boolean
          locale: string
          pitch: number
          preferred_voice_names: string[]
          profile_key: string
          rate: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
          volume: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          fallback_locale?: string
          fallback_profile_id?: string | null
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          locale?: string
          pitch?: number
          preferred_voice_names?: string[]
          profile_key: string
          rate?: number
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          volume?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          fallback_locale?: string
          fallback_profile_id?: string | null
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          locale?: string
          pitch?: number
          preferred_voice_names?: string[]
          profile_key?: string
          rate?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "audio_speech_profiles_fallback_profile_id_fkey"
            columns: ["fallback_profile_id"]
            isOneToOne: false
            referencedRelation: "audio_speech_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_speech_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_variable_definitions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_format: string
          display_name: string
          id: string
          is_enabled: boolean
          missing_fallback: string
          module_key: string
          required_context: string[]
          required_permission_code: string | null
          resolver_key: string
          sensitivity: string
          spoken_format: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          value_type: string
          variable_key: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_format?: string
          display_name: string
          id?: string
          is_enabled?: boolean
          missing_fallback?: string
          module_key: string
          required_context?: string[]
          required_permission_code?: string | null
          resolver_key: string
          sensitivity?: string
          spoken_format?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          value_type?: string
          variable_key: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_format?: string
          display_name?: string
          id?: string
          is_enabled?: boolean
          missing_fallback?: string
          module_key?: string
          required_context?: string[]
          required_permission_code?: string | null
          resolver_key?: string
          sensitivity?: string
          spoken_format?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          value_type?: string
          variable_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_variable_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action_code: string
          actor_user_id: string | null
          after_values: Json | null
          before_values: Json | null
          correlation_id: string | null
          created_at: string
          id: string
          metadata: Json
          object_id: string | null
          object_type: string
          occurred_at: string
          reason: string | null
          source: string
          tenant_id: string | null
        }
        Insert: {
          action_code: string
          actor_user_id?: string | null
          after_values?: Json | null
          before_values?: Json | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          object_id?: string | null
          object_type: string
          occurred_at?: string
          reason?: string | null
          source?: string
          tenant_id?: string | null
        }
        Update: {
          action_code?: string
          actor_user_id?: string | null
          after_values?: Json | null
          before_values?: Json | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          object_id?: string | null
          object_type?: string
          occurred_at?: string
          reason?: string | null
          source?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_accounts: {
        Row: {
          account_name: string
          account_status: string
          arr_amount: number | null
          arr_currency: string | null
          created_at: string
          created_by: string | null
          external_key: string
          id: string
          metadata: Json
          partner_status: string
          program_id: string
          renewal_date: string | null
          source_reference_id: string | null
          source_status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_name: string
          account_status?: string
          arr_amount?: number | null
          arr_currency?: string | null
          created_at?: string
          created_by?: string | null
          external_key: string
          id?: string
          metadata?: Json
          partner_status?: string
          program_id: string
          renewal_date?: string | null
          source_reference_id?: string | null
          source_status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_name?: string
          account_status?: string
          arr_amount?: number | null
          arr_currency?: string | null
          created_at?: string
          created_by?: string | null
          external_key?: string
          id?: string
          metadata?: Json
          partner_status?: string
          program_id?: string
          renewal_date?: string | null
          source_reference_id?: string | null
          source_status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_accounts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_accounts_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "commercial_source_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_assumption_apply_log: {
        Row: {
          applied_at: string
          applied_by: string | null
          change_set_id: string
          content_hash: string
          id: string
          impacted_scopes: string[]
          model_version_id: string
          program_id: string
          scenario_ids: string[]
          tenant_id: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          change_set_id: string
          content_hash: string
          id?: string
          impacted_scopes: string[]
          model_version_id: string
          program_id: string
          scenario_ids: string[]
          tenant_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          change_set_id?: string
          content_hash?: string
          id?: string
          impacted_scopes?: string[]
          model_version_id?: string
          program_id?: string
          scenario_ids?: string[]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_assumption_apply_log_change_set_id_fkey"
            columns: ["change_set_id"]
            isOneToOne: false
            referencedRelation: "commercial_assumption_change_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_apply_log_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_apply_log_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_apply_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_assumption_change_set_items: {
        Row: {
          assumption_code: string
          change_set_id: string
          created_at: string
          created_by: string | null
          id: string
          impact_scopes: string[]
          previous_value_numeric: number | null
          previous_value_text: string | null
          proposed_value_numeric: number | null
          proposed_value_text: string | null
          rationale: string | null
          scenario_id: string
          tenant_id: string
          unit: string | null
          updated_at: string
          updated_by: string | null
          validation_message: string | null
          validation_status: string
          value_type: string
        }
        Insert: {
          assumption_code: string
          change_set_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          impact_scopes?: string[]
          previous_value_numeric?: number | null
          previous_value_text?: string | null
          proposed_value_numeric?: number | null
          proposed_value_text?: string | null
          rationale?: string | null
          scenario_id: string
          tenant_id: string
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          validation_message?: string | null
          validation_status?: string
          value_type?: string
        }
        Update: {
          assumption_code?: string
          change_set_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          impact_scopes?: string[]
          previous_value_numeric?: number | null
          previous_value_text?: string | null
          proposed_value_numeric?: number | null
          proposed_value_text?: string | null
          rationale?: string | null
          scenario_id?: string
          tenant_id?: string
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          validation_message?: string | null
          validation_status?: string
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_assumption_change_set_items_change_set_id_fkey"
            columns: ["change_set_id"]
            isOneToOne: false
            referencedRelation: "commercial_assumption_change_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_change_set_items_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_change_set_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_assumption_change_sets: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          change_count: number
          content_hash: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          model_version_id: string
          program_id: string
          source_change_set_id: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          validated_at: string | null
          validated_by: string | null
          validation_summary: Json
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          change_count?: number
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          model_version_id: string
          program_id: string
          source_change_set_id?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_summary?: Json
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          change_count?: number
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          model_version_id?: string
          program_id?: string
          source_change_set_id?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "commercial_assumption_change_sets_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_change_sets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_change_sets_source_change_set_id_fkey"
            columns: ["source_change_set_id"]
            isOneToOne: false
            referencedRelation: "commercial_assumption_change_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_assumption_change_sets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_metric_directionality: {
        Row: {
          category: string
          created_at: string
          description: string | null
          higher_is_favorable: boolean
          metric_code: string
          metric_group: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          higher_is_favorable: boolean
          metric_code: string
          metric_group: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          higher_is_favorable?: boolean
          metric_code?: string
          metric_group?: string
          updated_at?: string
        }
        Relationships: []
      }
      commercial_model_activations: {
        Row: {
          activated_at: string
          activated_by: string | null
          activation_reason: string
          activation_snapshot: Json
          blocking_failure_count: number
          certification_hash: string | null
          certification_id: string
          id: string
          lineage_summary: Json
          manifest_hash: string | null
          model_version_id: string
          prior_activation_id: string | null
          prior_active_version_id: string | null
          program_id: string
          readiness_hash: string | null
          snapshot_hash: string | null
          status: string
          superseded_at: string | null
          superseded_by_activation_id: string | null
          tenant_id: string
          warning_count: number
        }
        Insert: {
          activated_at?: string
          activated_by?: string | null
          activation_reason: string
          activation_snapshot?: Json
          blocking_failure_count?: number
          certification_hash?: string | null
          certification_id: string
          id?: string
          lineage_summary?: Json
          manifest_hash?: string | null
          model_version_id: string
          prior_activation_id?: string | null
          prior_active_version_id?: string | null
          program_id: string
          readiness_hash?: string | null
          snapshot_hash?: string | null
          status?: string
          superseded_at?: string | null
          superseded_by_activation_id?: string | null
          tenant_id: string
          warning_count?: number
        }
        Update: {
          activated_at?: string
          activated_by?: string | null
          activation_reason?: string
          activation_snapshot?: Json
          blocking_failure_count?: number
          certification_hash?: string | null
          certification_id?: string
          id?: string
          lineage_summary?: Json
          manifest_hash?: string | null
          model_version_id?: string
          prior_activation_id?: string | null
          prior_active_version_id?: string | null
          program_id?: string
          readiness_hash?: string | null
          snapshot_hash?: string | null
          status?: string
          superseded_at?: string | null
          superseded_by_activation_id?: string | null
          tenant_id?: string
          warning_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "commercial_model_activations_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "commercial_release_certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_activations_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_activations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_activations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_model_results: {
        Row: {
          created_at: string
          fiscal_period: string | null
          formula_code: string
          id: string
          is_approximation: boolean
          lineage_json: Json
          metric_code: string
          metric_group: string
          period_sequence: number | null
          run_id: string
          tenant_id: string
          unit: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          fiscal_period?: string | null
          formula_code: string
          id?: string
          is_approximation?: boolean
          lineage_json?: Json
          metric_code: string
          metric_group: string
          period_sequence?: number | null
          run_id: string
          tenant_id: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          fiscal_period?: string | null
          formula_code?: string
          id?: string
          is_approximation?: boolean
          lineage_json?: Json
          metric_code?: string
          metric_group?: string
          period_sequence?: number | null
          run_id?: string
          tenant_id?: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_model_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_model_run_inputs: {
        Row: {
          assumption_code: string
          confidence: string | null
          created_at: string
          id: string
          input_sequence: number
          run_id: string
          scenario_id: string
          source_reference_id: string | null
          tenant_id: string
          unit: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          assumption_code: string
          confidence?: string | null
          created_at?: string
          id?: string
          input_sequence: number
          run_id: string
          scenario_id: string
          source_reference_id?: string | null
          tenant_id: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          assumption_code?: string
          confidence?: string | null
          created_at?: string
          id?: string
          input_sequence?: number
          run_id?: string
          scenario_id?: string
          source_reference_id?: string | null
          tenant_id?: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_model_run_inputs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_run_inputs_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_run_inputs_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "commercial_source_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_run_inputs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_model_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_code: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          input_hash: string
          model_version_id: string
          program_id: string
          run_scope: string
          scenario_id: string
          started_at: string | null
          status: string
          supersedes_run_id: string | null
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          input_hash: string
          model_version_id: string
          program_id: string
          run_scope: string
          scenario_id: string
          started_at?: string | null
          status?: string
          supersedes_run_id?: string | null
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          input_hash?: string
          model_version_id?: string
          program_id?: string
          run_scope?: string
          scenario_id?: string
          started_at?: string | null
          status?: string
          supersedes_run_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_model_runs_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_runs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_runs_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_runs_supersedes_run_id_fkey"
            columns: ["supersedes_run_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_model_versions: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          activation_id: string | null
          created_at: string
          created_by: string | null
          effective_from: string | null
          formula_catalog_version: string
          id: string
          name: string
          notes: string | null
          program_id: string
          source_file_name: string | null
          source_fingerprint: string | null
          status: string
          superseded_at: string | null
          superseded_by_version_id: string | null
          supersedes_version_id: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version_code: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          activation_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          formula_catalog_version: string
          id?: string
          name: string
          notes?: string | null
          program_id: string
          source_file_name?: string | null
          source_fingerprint?: string | null
          status?: string
          superseded_at?: string | null
          superseded_by_version_id?: string | null
          supersedes_version_id?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version_code: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          activation_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          formula_catalog_version?: string
          id?: string
          name?: string
          notes?: string | null
          program_id?: string
          source_file_name?: string | null
          source_fingerprint?: string | null
          status?: string
          superseded_at?: string | null
          superseded_by_version_id?: string | null
          supersedes_version_id?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_model_versions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_model_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_narrations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          instructions: string
          is_active: boolean
          narration_key: string
          script: string
          speed: number
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          version: number
          voice: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instructions?: string
          is_active?: boolean
          narration_key: string
          script: string
          speed?: number
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          voice?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instructions?: string
          is_active?: boolean
          narration_key?: string
          script?: string
          speed?: number
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          voice?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_narrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_program_metrics: {
        Row: {
          confidence: string
          created_at: string
          created_by: string | null
          id: string
          label: string
          metric_code: string
          metric_date: string | null
          notes: string | null
          numeric_value: number | null
          program_id: string
          source_reference_id: string | null
          tenant_id: string
          text_value: string | null
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          confidence?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          metric_code: string
          metric_date?: string | null
          notes?: string | null
          numeric_value?: number | null
          program_id: string
          source_reference_id?: string | null
          tenant_id: string
          text_value?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          confidence?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          metric_code?: string
          metric_date?: string | null
          notes?: string | null
          numeric_value?: number | null
          program_id?: string
          source_reference_id?: string | null
          tenant_id?: string
          text_value?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_program_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_program_metrics_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "commercial_source_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_program_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_programs: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_gate_code: string | null
          description: string | null
          id: string
          market_segment: string | null
          metadata: Json
          name: string
          partner_name: string | null
          source_status: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_gate_code?: string | null
          description?: string | null
          id?: string
          market_segment?: string | null
          metadata?: Json
          name: string
          partner_name?: string | null
          source_status?: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_gate_code?: string | null
          description?: string | null
          id?: string
          market_segment?: string | null
          metadata?: Json
          name?: string
          partner_name?: string | null
          source_status?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_programs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_release_certifications: {
        Row: {
          blocking_failure_count: number
          certified_at: string | null
          certified_by: string | null
          content_hash: string | null
          control_count: number
          created_at: string
          created_by: string | null
          id: string
          invalidated_at: string | null
          invalidated_by: string | null
          invalidation_reason: string | null
          manifest_hash: string | null
          model_version_id: string
          notes: string | null
          pass_count: number
          program_id: string
          readiness_hash: string | null
          readiness_snapshot: Json
          release_manifest: Json
          source_evidence: Json
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          warning_count: number
        }
        Insert: {
          blocking_failure_count?: number
          certified_at?: string | null
          certified_by?: string | null
          content_hash?: string | null
          control_count?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invalidated_at?: string | null
          invalidated_by?: string | null
          invalidation_reason?: string | null
          manifest_hash?: string | null
          model_version_id: string
          notes?: string | null
          pass_count?: number
          program_id: string
          readiness_hash?: string | null
          readiness_snapshot?: Json
          release_manifest?: Json
          source_evidence?: Json
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          warning_count?: number
        }
        Update: {
          blocking_failure_count?: number
          certified_at?: string | null
          certified_by?: string | null
          content_hash?: string | null
          control_count?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invalidated_at?: string | null
          invalidated_by?: string | null
          invalidation_reason?: string | null
          manifest_hash?: string | null
          model_version_id?: string
          notes?: string | null
          pass_count?: number
          program_id?: string
          readiness_hash?: string | null
          readiness_snapshot?: Json
          release_manifest?: Json
          source_evidence?: Json
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          warning_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "commercial_release_certifications_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_release_certifications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_release_certifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_release_lineage: {
        Row: {
          certification_id: string
          created_at: string
          downstream_id: string | null
          downstream_type: string
          id: string
          metric_code: string | null
          model_version_id: string
          relationship: string
          scenario_id: string | null
          scope: string | null
          source_hash: string | null
          target_hash: string | null
          tenant_id: string
          upstream_id: string | null
          upstream_type: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          downstream_id?: string | null
          downstream_type: string
          id?: string
          metric_code?: string | null
          model_version_id: string
          relationship: string
          scenario_id?: string | null
          scope?: string | null
          source_hash?: string | null
          target_hash?: string | null
          tenant_id: string
          upstream_id?: string | null
          upstream_type: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          downstream_id?: string | null
          downstream_type?: string
          id?: string
          metric_code?: string | null
          model_version_id?: string
          relationship?: string
          scenario_id?: string | null
          scope?: string | null
          source_hash?: string | null
          target_hash?: string | null
          tenant_id?: string
          upstream_id?: string | null
          upstream_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_release_lineage_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "commercial_release_certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_release_lineage_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_release_lineage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_scenario_assumptions: {
        Row: {
          assumption_code: string
          confidence: string
          created_at: string
          created_by: string | null
          id: string
          label: string
          notes: string | null
          numeric_value: number | null
          scenario_id: string
          source_reference_id: string | null
          tenant_id: string
          text_value: string | null
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assumption_code: string
          confidence?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          notes?: string | null
          numeric_value?: number | null
          scenario_id: string
          source_reference_id?: string | null
          tenant_id: string
          text_value?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assumption_code?: string
          confidence?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          notes?: string | null
          numeric_value?: number | null
          scenario_id?: string
          source_reference_id?: string | null
          tenant_id?: string
          text_value?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_scenario_assumptions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_assumptions_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "commercial_source_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_assumptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_scenario_comparison_results: {
        Row: {
          absolute_variance: number | null
          baseline_run_id: string | null
          baseline_scenario_id: string
          baseline_value: number | null
          compared_run_id: string | null
          compared_scenario_id: string
          compared_value: number | null
          comparison_id: string
          comparison_rule: string
          created_at: string
          direction_reason: string | null
          fiscal_period: string | null
          id: string
          lineage_refs: Json
          metric_code: string
          metric_group: string
          percentage_variance: number | null
          period_sequence: number | null
          source_refs: Json
          tenant_id: string
          unit: string | null
          variance_direction: string
        }
        Insert: {
          absolute_variance?: number | null
          baseline_run_id?: string | null
          baseline_scenario_id: string
          baseline_value?: number | null
          compared_run_id?: string | null
          compared_scenario_id: string
          compared_value?: number | null
          comparison_id: string
          comparison_rule?: string
          created_at?: string
          direction_reason?: string | null
          fiscal_period?: string | null
          id?: string
          lineage_refs?: Json
          metric_code: string
          metric_group: string
          percentage_variance?: number | null
          period_sequence?: number | null
          source_refs?: Json
          tenant_id: string
          unit?: string | null
          variance_direction?: string
        }
        Update: {
          absolute_variance?: number | null
          baseline_run_id?: string | null
          baseline_scenario_id?: string
          baseline_value?: number | null
          compared_run_id?: string | null
          compared_scenario_id?: string
          compared_value?: number | null
          comparison_id?: string
          comparison_rule?: string
          created_at?: string
          direction_reason?: string | null
          fiscal_period?: string | null
          id?: string
          lineage_refs?: Json
          metric_code?: string
          metric_group?: string
          percentage_variance?: number | null
          period_sequence?: number | null
          source_refs?: Json
          tenant_id?: string
          unit?: string | null
          variance_direction?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_scenario_comparison_result_baseline_scenario_id_fkey"
            columns: ["baseline_scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparison_result_compared_scenario_id_fkey"
            columns: ["compared_scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparison_results_baseline_run_id_fkey"
            columns: ["baseline_run_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparison_results_compared_run_id_fkey"
            columns: ["compared_run_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparison_results_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenario_comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparison_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_scenario_comparisons: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          baseline_scenario_id: string
          compared_scenario_ids: string[]
          content_hash: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          included_scopes: string[]
          mode: string
          model_version_id: string
          program_id: string
          saved_at: string | null
          saved_by: string | null
          source_run_manifest: Json
          source_run_manifest_hash: string | null
          stale_at_creation: boolean
          status: string
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          warning_summary: Json
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          baseline_scenario_id: string
          compared_scenario_ids: string[]
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          included_scopes?: string[]
          mode: string
          model_version_id: string
          program_id: string
          saved_at?: string | null
          saved_by?: string | null
          source_run_manifest?: Json
          source_run_manifest_hash?: string | null
          stale_at_creation?: boolean
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          warning_summary?: Json
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          baseline_scenario_id?: string
          compared_scenario_ids?: string[]
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          included_scopes?: string[]
          mode?: string
          model_version_id?: string
          program_id?: string
          saved_at?: string | null
          saved_by?: string | null
          source_run_manifest?: Json
          source_run_manifest_hash?: string | null
          stale_at_creation?: boolean
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          warning_summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "commercial_scenario_comparisons_baseline_scenario_id_fkey"
            columns: ["baseline_scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparisons_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparisons_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenario_comparisons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_scenarios: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_baseline: boolean
          name: string
          program_id: string
          source_status: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_baseline?: boolean
          name: string
          program_id: string
          source_status?: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_baseline?: boolean
          name?: string
          program_id?: string
          source_status?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_scenarios_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scenarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_sensitivity_experiments: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assumption_code: string
          baseline_run_manifest: Json
          baseline_run_manifest_hash: string | null
          baseline_scenario_id: string
          completed_at: string | null
          completed_by: string | null
          content_hash: string | null
          created_at: string
          created_by: string | null
          description: string | null
          error_code: string | null
          error_message: string | null
          id: string
          included_scopes: string[]
          model_version_id: string
          perturbation_config: Json
          perturbation_strategy: string
          program_id: string
          stale_at_creation: boolean
          status: string
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          warning_summary: Json
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assumption_code: string
          baseline_run_manifest?: Json
          baseline_run_manifest_hash?: string | null
          baseline_scenario_id: string
          completed_at?: string | null
          completed_by?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          included_scopes?: string[]
          model_version_id: string
          perturbation_config?: Json
          perturbation_strategy: string
          program_id: string
          stale_at_creation?: boolean
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          warning_summary?: Json
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assumption_code?: string
          baseline_run_manifest?: Json
          baseline_run_manifest_hash?: string | null
          baseline_scenario_id?: string
          completed_at?: string | null
          completed_by?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          included_scopes?: string[]
          model_version_id?: string
          perturbation_config?: Json
          perturbation_strategy?: string
          program_id?: string
          stale_at_creation?: boolean
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          warning_summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "commercial_sensitivity_experiments_baseline_scenario_id_fkey"
            columns: ["baseline_scenario_id"]
            isOneToOne: false
            referencedRelation: "commercial_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_experiments_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "commercial_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_experiments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_experiments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_sensitivity_perturbations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          experiment_id: string
          id: string
          input_hash: string | null
          perturbation_index: number
          perturbation_label: string
          perturbed_value: number
          runtime_fingerprint: string | null
          started_at: string | null
          status: string
          temp_run_ids: Json
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          experiment_id: string
          id?: string
          input_hash?: string | null
          perturbation_index: number
          perturbation_label: string
          perturbed_value: number
          runtime_fingerprint?: string | null
          started_at?: string | null
          status?: string
          temp_run_ids?: Json
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          experiment_id?: string
          id?: string
          input_hash?: string | null
          perturbation_index?: number
          perturbation_label?: string
          perturbed_value?: number
          runtime_fingerprint?: string | null
          started_at?: string | null
          status?: string
          temp_run_ids?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_sensitivity_perturbations_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "commercial_sensitivity_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_perturbations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_sensitivity_results: {
        Row: {
          absolute_delta: number | null
          baseline_value: number | null
          created_at: string
          direction_reason: string | null
          elasticity: number | null
          elasticity_reason: string | null
          experiment_id: string
          fiscal_period: string | null
          id: string
          impact_rank: number | null
          metric_code: string
          metric_group: string
          percentage_delta: number | null
          period_sequence: number | null
          perturbation_id: string
          perturbed_value: number | null
          scope: string
          tenant_id: string
          unit: string | null
          variance_direction: string
        }
        Insert: {
          absolute_delta?: number | null
          baseline_value?: number | null
          created_at?: string
          direction_reason?: string | null
          elasticity?: number | null
          elasticity_reason?: string | null
          experiment_id: string
          fiscal_period?: string | null
          id?: string
          impact_rank?: number | null
          metric_code: string
          metric_group: string
          percentage_delta?: number | null
          period_sequence?: number | null
          perturbation_id: string
          perturbed_value?: number | null
          scope: string
          tenant_id: string
          unit?: string | null
          variance_direction?: string
        }
        Update: {
          absolute_delta?: number | null
          baseline_value?: number | null
          created_at?: string
          direction_reason?: string | null
          elasticity?: number | null
          elasticity_reason?: string | null
          experiment_id?: string
          fiscal_period?: string | null
          id?: string
          impact_rank?: number | null
          metric_code?: string
          metric_group?: string
          percentage_delta?: number | null
          period_sequence?: number | null
          perturbation_id?: string
          perturbed_value?: number | null
          scope?: string
          tenant_id?: string
          unit?: string | null
          variance_direction?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_sensitivity_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "commercial_sensitivity_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_results_perturbation_id_fkey"
            columns: ["perturbation_id"]
            isOneToOne: false
            referencedRelation: "commercial_sensitivity_perturbations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_sensitivity_run_results: {
        Row: {
          created_at: string
          fiscal_period: string | null
          id: string
          metric_code: string
          metric_group: string
          period_sequence: number | null
          sensitivity_run_id: string
          tenant_id: string
          unit: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          fiscal_period?: string | null
          id?: string
          metric_code: string
          metric_group: string
          period_sequence?: number | null
          sensitivity_run_id: string
          tenant_id: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          fiscal_period?: string | null
          id?: string
          metric_code?: string
          metric_group?: string
          period_sequence?: number | null
          sensitivity_run_id?: string
          tenant_id?: string
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_sensitivity_run_results_sensitivity_run_id_fkey"
            columns: ["sensitivity_run_id"]
            isOneToOne: false
            referencedRelation: "commercial_sensitivity_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_sensitivity_runs: {
        Row: {
          completed_at: string | null
          error_code: string | null
          error_message: string | null
          experiment_id: string
          id: string
          input_hash: string
          model_version_id: string
          perturbation_id: string
          run_scope: string
          runtime_fingerprint: string
          scenario_id: string
          started_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          error_code?: string | null
          error_message?: string | null
          experiment_id: string
          id?: string
          input_hash: string
          model_version_id: string
          perturbation_id: string
          run_scope: string
          runtime_fingerprint: string
          scenario_id: string
          started_at?: string
          status: string
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          error_code?: string | null
          error_message?: string | null
          experiment_id?: string
          id?: string
          input_hash?: string
          model_version_id?: string
          perturbation_id?: string
          run_scope?: string
          runtime_fingerprint?: string
          scenario_id?: string
          started_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_sensitivity_runs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "commercial_sensitivity_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_runs_perturbation_id_fkey"
            columns: ["perturbation_id"]
            isOneToOne: false
            referencedRelation: "commercial_sensitivity_perturbations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_sensitivity_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_source_references: {
        Row: {
          confidentiality: string
          created_at: string
          created_by: string | null
          external_filename: string | null
          id: string
          notes: string | null
          program_id: string
          source_code: string
          source_date: string | null
          source_type: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          confidentiality?: string
          created_at?: string
          created_by?: string | null
          external_filename?: string | null
          id?: string
          notes?: string | null
          program_id: string
          source_code: string
          source_date?: string | null
          source_type: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          confidentiality?: string
          created_at?: string
          created_by?: string | null
          external_filename?: string | null
          id?: string
          notes?: string | null
          program_id?: string
          source_code?: string
          source_date?: string | null
          source_type?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_source_references_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_source_references_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_stage_gates: {
        Row: {
          account_scope_count: number | null
          account_scope_label: string | null
          created_at: string
          created_by: string | null
          economic_objective: string | null
          gate_code: string
          id: string
          name: string
          operating_objective: string | null
          program_id: string
          sequence_number: number
          status: string
          tenant_id: string
          unlock_conditions: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_scope_count?: number | null
          account_scope_label?: string | null
          created_at?: string
          created_by?: string | null
          economic_objective?: string | null
          gate_code: string
          id?: string
          name: string
          operating_objective?: string | null
          program_id: string
          sequence_number: number
          status?: string
          tenant_id: string
          unlock_conditions?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_scope_count?: number | null
          account_scope_label?: string | null
          created_at?: string
          created_by?: string | null
          economic_objective?: string | null
          gate_code?: string
          id?: string
          name?: string
          operating_objective?: string | null
          program_id?: string
          sequence_number?: number
          status?: string
          tenant_id?: string
          unlock_conditions?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_stage_gates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "commercial_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_stage_gates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          occurred_at: string
          stakeholder_id: string | null
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          occurred_at?: string
          stakeholder_id?: string | null
          subject?: string
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          occurred_at?: string
          stakeholder_id?: string | null
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "crm_stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          account_owner: string | null
          address: string | null
          company_type: string
          created_at: string
          email: string | null
          id: string
          industry: string | null
          lifecycle_stage: string
          name: string
          notes: string | null
          phone: string | null
          priority: string
          status: boolean
          tags: string[]
          tenant_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_owner?: string | null
          address?: string | null
          company_type?: string
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          lifecycle_stage?: string
          name: string
          notes?: string | null
          phone?: string | null
          priority?: string
          status?: boolean
          tags?: string[]
          tenant_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_owner?: string | null
          address?: string | null
          company_type?: string
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          lifecycle_stage?: string
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: string
          status?: boolean
          tags?: string[]
          tenant_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      crm_departments: {
        Row: {
          company_id: string
          created_at: string
          description: string
          head_stakeholder_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string
          head_stakeholder_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          head_stakeholder_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notes: {
        Row: {
          author: string | null
          body: string
          company_id: string
          created_at: string
          id: string
          stakeholder_id: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string
          company_id: string
          created_at?: string
          id?: string
          stakeholder_id?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string
          company_id?: string
          created_at?: string
          id?: string
          stakeholder_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "crm_stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_stakeholders: {
        Row: {
          account_name: string | null
          accountable_for: string | null
          adoption_owner: string | null
          alternate_phone: string | null
          approval_areas: string[] | null
          approval_authority: string | null
          approval_limit: string | null
          approved_at: string | null
          approved_by: string | null
          approver: boolean | null
          archived_at: string | null
          archived_by: string | null
          assumptions: string | null
          attachments: string[] | null
          attitude: string | null
          beneficiary: boolean | null
          business_needs: string | null
          business_unit: string | null
          change_impact_level: string | null
          change_management_strategy: string | null
          change_readiness: string | null
          communication_format: string | null
          communication_frequency: string | null
          communication_method: string | null
          communication_notes: string | null
          communication_owner: string | null
          company_id: string
          constraints: string | null
          consulted_for: string | null
          created_at: string
          created_by: string | null
          current_engagement_level: string | null
          decision_authority: string | null
          decision_maker: boolean | null
          department_id: string | null
          department_name: string | null
          desired_engagement_level: string | null
          direct_indirect: string | null
          emails: string[]
          end_date: string | null
          engagement_gap: string | null
          engagement_owner: string | null
          engagement_strategy: string | null
          escalation_notes: string | null
          escalation_path: string | null
          escalation_required: boolean | null
          first_name: string
          governance_role: string | null
          id: string
          impact_level: string | null
          impacted_by_project: boolean | null
          influence_level: string
          influencer: boolean | null
          information_needs: string | null
          informed_for: string | null
          interest_level: string | null
          internal_external: string | null
          involvement_level: string | null
          issue_history: string | null
          job_title: string | null
          key_concerns: string | null
          key_expectations: string | null
          last_contacted_date: string | null
          last_name: string
          legitimacy_level: string | null
          linkedin: string | null
          location: string | null
          meeting_cadence: string | null
          meeting_notes: string | null
          mitigation_plan: string | null
          next_followup_date: string | null
          notes: string | null
          open_actions: string | null
          organization_name: string | null
          ownership_area: string | null
          pain_points: string | null
          phones: string[]
          photo_url: string | null
          portfolio_name: string | null
          possible_project_impact: string | null
          power_interest_category: string | null
          power_level: string | null
          practice_area: string | null
          preferred_contact_method: string | null
          preferred_contact_time: string | null
          primary_secondary: string | null
          priority_level: string | null
          program_name: string | null
          project_code: string | null
          project_name: string | null
          project_phase: string | null
          raci_role: string | null
          region: string | null
          regulatory_or_compliance_role: boolean | null
          related_documents: string[] | null
          relationship_health: string | null
          reporting_manager_id: string | null
          reporting_needs: string | null
          resistance_reason: string | null
          responsibility: string | null
          responsible_for: string | null
          risk_description: string | null
          risk_sensitivity: string | null
          signoff_required: boolean | null
          signoff_stage: string | null
          stakeholder_category: string | null
          stakeholder_code: string | null
          stakeholder_management_strategy: string | null
          stakeholder_risk_level: string | null
          stakeholder_role: string | null
          stakeholder_type: string | null
          start_date: string | null
          status: boolean
          success_criteria: string | null
          support_level: string | null
          tags: string[]
          team_id: string | null
          time_zone: string | null
          training_required: boolean | null
          updated_at: string
          updated_by: string | null
          urgency_level: string | null
        }
        Insert: {
          account_name?: string | null
          accountable_for?: string | null
          adoption_owner?: string | null
          alternate_phone?: string | null
          approval_areas?: string[] | null
          approval_authority?: string | null
          approval_limit?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approver?: boolean | null
          archived_at?: string | null
          archived_by?: string | null
          assumptions?: string | null
          attachments?: string[] | null
          attitude?: string | null
          beneficiary?: boolean | null
          business_needs?: string | null
          business_unit?: string | null
          change_impact_level?: string | null
          change_management_strategy?: string | null
          change_readiness?: string | null
          communication_format?: string | null
          communication_frequency?: string | null
          communication_method?: string | null
          communication_notes?: string | null
          communication_owner?: string | null
          company_id: string
          constraints?: string | null
          consulted_for?: string | null
          created_at?: string
          created_by?: string | null
          current_engagement_level?: string | null
          decision_authority?: string | null
          decision_maker?: boolean | null
          department_id?: string | null
          department_name?: string | null
          desired_engagement_level?: string | null
          direct_indirect?: string | null
          emails?: string[]
          end_date?: string | null
          engagement_gap?: string | null
          engagement_owner?: string | null
          engagement_strategy?: string | null
          escalation_notes?: string | null
          escalation_path?: string | null
          escalation_required?: boolean | null
          first_name?: string
          governance_role?: string | null
          id?: string
          impact_level?: string | null
          impacted_by_project?: boolean | null
          influence_level?: string
          influencer?: boolean | null
          information_needs?: string | null
          informed_for?: string | null
          interest_level?: string | null
          internal_external?: string | null
          involvement_level?: string | null
          issue_history?: string | null
          job_title?: string | null
          key_concerns?: string | null
          key_expectations?: string | null
          last_contacted_date?: string | null
          last_name?: string
          legitimacy_level?: string | null
          linkedin?: string | null
          location?: string | null
          meeting_cadence?: string | null
          meeting_notes?: string | null
          mitigation_plan?: string | null
          next_followup_date?: string | null
          notes?: string | null
          open_actions?: string | null
          organization_name?: string | null
          ownership_area?: string | null
          pain_points?: string | null
          phones?: string[]
          photo_url?: string | null
          portfolio_name?: string | null
          possible_project_impact?: string | null
          power_interest_category?: string | null
          power_level?: string | null
          practice_area?: string | null
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          primary_secondary?: string | null
          priority_level?: string | null
          program_name?: string | null
          project_code?: string | null
          project_name?: string | null
          project_phase?: string | null
          raci_role?: string | null
          region?: string | null
          regulatory_or_compliance_role?: boolean | null
          related_documents?: string[] | null
          relationship_health?: string | null
          reporting_manager_id?: string | null
          reporting_needs?: string | null
          resistance_reason?: string | null
          responsibility?: string | null
          responsible_for?: string | null
          risk_description?: string | null
          risk_sensitivity?: string | null
          signoff_required?: boolean | null
          signoff_stage?: string | null
          stakeholder_category?: string | null
          stakeholder_code?: string | null
          stakeholder_management_strategy?: string | null
          stakeholder_risk_level?: string | null
          stakeholder_role?: string | null
          stakeholder_type?: string | null
          start_date?: string | null
          status?: boolean
          success_criteria?: string | null
          support_level?: string | null
          tags?: string[]
          team_id?: string | null
          time_zone?: string | null
          training_required?: boolean | null
          updated_at?: string
          updated_by?: string | null
          urgency_level?: string | null
        }
        Update: {
          account_name?: string | null
          accountable_for?: string | null
          adoption_owner?: string | null
          alternate_phone?: string | null
          approval_areas?: string[] | null
          approval_authority?: string | null
          approval_limit?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approver?: boolean | null
          archived_at?: string | null
          archived_by?: string | null
          assumptions?: string | null
          attachments?: string[] | null
          attitude?: string | null
          beneficiary?: boolean | null
          business_needs?: string | null
          business_unit?: string | null
          change_impact_level?: string | null
          change_management_strategy?: string | null
          change_readiness?: string | null
          communication_format?: string | null
          communication_frequency?: string | null
          communication_method?: string | null
          communication_notes?: string | null
          communication_owner?: string | null
          company_id?: string
          constraints?: string | null
          consulted_for?: string | null
          created_at?: string
          created_by?: string | null
          current_engagement_level?: string | null
          decision_authority?: string | null
          decision_maker?: boolean | null
          department_id?: string | null
          department_name?: string | null
          desired_engagement_level?: string | null
          direct_indirect?: string | null
          emails?: string[]
          end_date?: string | null
          engagement_gap?: string | null
          engagement_owner?: string | null
          engagement_strategy?: string | null
          escalation_notes?: string | null
          escalation_path?: string | null
          escalation_required?: boolean | null
          first_name?: string
          governance_role?: string | null
          id?: string
          impact_level?: string | null
          impacted_by_project?: boolean | null
          influence_level?: string
          influencer?: boolean | null
          information_needs?: string | null
          informed_for?: string | null
          interest_level?: string | null
          internal_external?: string | null
          involvement_level?: string | null
          issue_history?: string | null
          job_title?: string | null
          key_concerns?: string | null
          key_expectations?: string | null
          last_contacted_date?: string | null
          last_name?: string
          legitimacy_level?: string | null
          linkedin?: string | null
          location?: string | null
          meeting_cadence?: string | null
          meeting_notes?: string | null
          mitigation_plan?: string | null
          next_followup_date?: string | null
          notes?: string | null
          open_actions?: string | null
          organization_name?: string | null
          ownership_area?: string | null
          pain_points?: string | null
          phones?: string[]
          photo_url?: string | null
          portfolio_name?: string | null
          possible_project_impact?: string | null
          power_interest_category?: string | null
          power_level?: string | null
          practice_area?: string | null
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          primary_secondary?: string | null
          priority_level?: string | null
          program_name?: string | null
          project_code?: string | null
          project_name?: string | null
          project_phase?: string | null
          raci_role?: string | null
          region?: string | null
          regulatory_or_compliance_role?: boolean | null
          related_documents?: string[] | null
          relationship_health?: string | null
          reporting_manager_id?: string | null
          reporting_needs?: string | null
          resistance_reason?: string | null
          responsibility?: string | null
          responsible_for?: string | null
          risk_description?: string | null
          risk_sensitivity?: string | null
          signoff_required?: boolean | null
          signoff_stage?: string | null
          stakeholder_category?: string | null
          stakeholder_code?: string | null
          stakeholder_management_strategy?: string | null
          stakeholder_risk_level?: string | null
          stakeholder_role?: string | null
          stakeholder_type?: string | null
          start_date?: string | null
          status?: boolean
          success_criteria?: string | null
          support_level?: string | null
          tags?: string[]
          team_id?: string | null
          time_zone?: string | null
          training_required?: boolean | null
          updated_at?: string
          updated_by?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_stakeholders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stakeholders_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stakeholders_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "crm_stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stakeholders_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "crm_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_teams: {
        Row: {
          company_id: string
          created_at: string
          department_id: string | null
          description: string
          id: string
          lead_stakeholder_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department_id?: string | null
          description?: string
          id?: string
          lead_stakeholder_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department_id?: string | null
          description?: string
          id?: string
          lead_stakeholder_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      etdm_domains: {
        Row: {
          approval_status: Database["public"]["Enums"]["etdm_domain_approval"]
          business_criticality: Database["public"]["Enums"]["etdm_domain_criticality"]
          business_purpose: string | null
          cloned_from_domain_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          display_order: number
          domain_display_name: string
          effective_date: string | null
          expiration_date: string | null
          external_reference_id: string | null
          governance_notes: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          lifecycle_status: Database["public"]["Enums"]["etdm_domain_lifecycle"]
          master_domain_id: string
          published_version: number
          review_date: string | null
          scope_summary: string | null
          short_name: string | null
          slug: string
          source_of_record: string | null
          tags: string[]
          technology_id: string
          tenant_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["etdm_domain_approval"]
          business_criticality?: Database["public"]["Enums"]["etdm_domain_criticality"]
          business_purpose?: string | null
          cloned_from_domain_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_order?: number
          domain_display_name: string
          effective_date?: string | null
          expiration_date?: string | null
          external_reference_id?: string | null
          governance_notes?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          lifecycle_status?: Database["public"]["Enums"]["etdm_domain_lifecycle"]
          master_domain_id: string
          published_version?: number
          review_date?: string | null
          scope_summary?: string | null
          short_name?: string | null
          slug: string
          source_of_record?: string | null
          tags?: string[]
          technology_id: string
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["etdm_domain_approval"]
          business_criticality?: Database["public"]["Enums"]["etdm_domain_criticality"]
          business_purpose?: string | null
          cloned_from_domain_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_order?: number
          domain_display_name?: string
          effective_date?: string | null
          expiration_date?: string | null
          external_reference_id?: string | null
          governance_notes?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          lifecycle_status?: Database["public"]["Enums"]["etdm_domain_lifecycle"]
          master_domain_id?: string
          published_version?: number
          review_date?: string | null
          scope_summary?: string | null
          short_name?: string | null
          slug?: string
          source_of_record?: string | null
          tags?: string[]
          technology_id?: string
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etdm_domains_cloned_from_domain_id_fkey"
            columns: ["cloned_from_domain_id"]
            isOneToOne: false
            referencedRelation: "etdm_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etdm_domains_master_domain_id_fkey"
            columns: ["master_domain_id"]
            isOneToOne: false
            referencedRelation: "etdm_master_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etdm_domains_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "etdm_technologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etdm_domains_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "etdm_technologies_active"
            referencedColumns: ["id"]
          },
        ]
      }
      etdm_master_domains: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      etdm_record_audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          correlation_id: string | null
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          previous_values: Json | null
          reason: string | null
          source: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          correlation_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          reason?: string | null
          source?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          correlation_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          reason?: string | null
          source?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      etdm_technologies: {
        Row: {
          agent_required: boolean | null
          agentless_supported: boolean | null
          ai_maturity_score: number | null
          ai_opportunity_summary: string | null
          ai_playbooks_available: boolean | null
          ai_ready: boolean | null
          api_available: boolean | null
          approval_status: string
          assessed_by_id: string | null
          audit_logging_supported: boolean | null
          authentication_methods: string[] | null
          authentication_types: string[] | null
          authorization_model: string | null
          automation_integrations: Json | null
          automation_maturity_score: number | null
          automation_opportunity_summary: string | null
          automation_ready: boolean | null
          automations_available: boolean | null
          available_automation_interfaces: Json | null
          backup_supported: boolean | null
          banner_image_url: string | null
          business_criticality: string | null
          business_impact_if_unavailable: string | null
          business_outcome_summary: string | null
          business_owner_id: string | null
          business_purpose: string | null
          category: string | null
          cli_available: boolean | null
          cloned_from_technology_id: string | null
          clustering_supported: boolean | null
          color_theme: string | null
          community_url: string | null
          compliance_standards: string[] | null
          created_at: string
          created_by: string | null
          data_classification: string | null
          data_integrations: Json | null
          data_owner_id: string | null
          data_residency_requirements: string | null
          deleted_at: string | null
          deleted_by: string | null
          deployment_models: string[] | null
          description: string | null
          digital_coworkers_available: boolean | null
          digital_twin_readiness_score: number | null
          disaster_recovery_supported: boolean | null
          documentation_completeness_percentage: number | null
          documentation_url: string | null
          edition: string | null
          effective_date: string | null
          encryption_at_rest: boolean | null
          encryption_in_transit: boolean | null
          end_of_extended_support_date: string | null
          end_of_life_date: string | null
          end_of_mainstream_support_date: string | null
          end_of_sale_date: string | null
          engineering_owner_id: string | null
          escalation_group: string | null
          expiration_date: string | null
          external_reference_id: string | null
          general_availability_date: string | null
          governance_notes: string | null
          graphql_available: boolean | null
          high_availability_supported: boolean | null
          id: string
          infrastructure_as_code_supported: boolean | null
          integration_notes: string | null
          is_active: boolean
          is_deleted: boolean
          is_sample: boolean
          itsm_integrations: Json | null
          knowledge_articles_available: boolean | null
          known_security_considerations: string | null
          last_assessment_date: string | null
          licensing_model: string | null
          lifecycle_notes: string | null
          lifecycle_status: string | null
          mfa_supported: boolean | null
          monitoring_integrations: Json | null
          multi_region_supported: boolean | null
          native_integrations: Json | null
          neurealm_practice: string | null
          operational_maturity_score: number | null
          operations_owner_id: string | null
          overall_maturity_notes: string | null
          powershell_available: boolean | null
          primary_domain: string | null
          product_family: string | null
          product_name: string | null
          product_website_url: string | null
          published_version: number
          rbac_supported: boolean | null
          record_steward_id: string | null
          replacement_technology_id: string | null
          required_security_controls: Json | null
          rest_api_available: boolean | null
          review_date: string | null
          runbooks_available: boolean | null
          scalability_model: string | null
          sdk_available: boolean | null
          secondary_domains: string[] | null
          security_certifications: string[] | null
          security_maturity_score: number | null
          security_owner_id: string | null
          short_name: string | null
          siem_integrations: Json | null
          slug: string
          sop_library_available: boolean | null
          source_of_record: string | null
          strategic_importance: string | null
          support_contract_reference: string | null
          support_group: string | null
          support_readiness_score: number | null
          support_url: string | null
          supported_architectures: string[] | null
          supported_business_services: Json | null
          supported_cloud_providers: string[] | null
          supported_databases: string[] | null
          supported_hypervisors: string[] | null
          supported_industries: string[] | null
          supported_operating_systems: string[] | null
          tags: string[] | null
          target_audiences: string[] | null
          technical_limitations: string | null
          technical_prerequisites: string | null
          technology_icon_url: string | null
          technology_image_crop_metadata: Json | null
          technology_image_height: number | null
          technology_image_last_updated: string | null
          technology_image_last_updated_by: string | null
          technology_image_original_filename: string | null
          technology_image_scale: number | null
          technology_image_storage_path: string | null
          technology_image_type: string | null
          technology_image_url: string | null
          technology_image_width: number | null
          technology_maturity: string | null
          technology_name: string
          technology_owner_id: string | null
          technology_tower: string | null
          technology_type: string | null
          tenant_id: string | null
          tenant_scope: string | null
          third_party_integrations: Json | null
          typical_deployment_size: string | null
          typical_use_cases: Json | null
          updated_at: string
          updated_by: string | null
          upgrade_path: string | null
          vendor_name: string | null
          version: string | null
          visibility: string
          webhooks_available: boolean | null
        }
        Insert: {
          agent_required?: boolean | null
          agentless_supported?: boolean | null
          ai_maturity_score?: number | null
          ai_opportunity_summary?: string | null
          ai_playbooks_available?: boolean | null
          ai_ready?: boolean | null
          api_available?: boolean | null
          approval_status?: string
          assessed_by_id?: string | null
          audit_logging_supported?: boolean | null
          authentication_methods?: string[] | null
          authentication_types?: string[] | null
          authorization_model?: string | null
          automation_integrations?: Json | null
          automation_maturity_score?: number | null
          automation_opportunity_summary?: string | null
          automation_ready?: boolean | null
          automations_available?: boolean | null
          available_automation_interfaces?: Json | null
          backup_supported?: boolean | null
          banner_image_url?: string | null
          business_criticality?: string | null
          business_impact_if_unavailable?: string | null
          business_outcome_summary?: string | null
          business_owner_id?: string | null
          business_purpose?: string | null
          category?: string | null
          cli_available?: boolean | null
          cloned_from_technology_id?: string | null
          clustering_supported?: boolean | null
          color_theme?: string | null
          community_url?: string | null
          compliance_standards?: string[] | null
          created_at?: string
          created_by?: string | null
          data_classification?: string | null
          data_integrations?: Json | null
          data_owner_id?: string | null
          data_residency_requirements?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deployment_models?: string[] | null
          description?: string | null
          digital_coworkers_available?: boolean | null
          digital_twin_readiness_score?: number | null
          disaster_recovery_supported?: boolean | null
          documentation_completeness_percentage?: number | null
          documentation_url?: string | null
          edition?: string | null
          effective_date?: string | null
          encryption_at_rest?: boolean | null
          encryption_in_transit?: boolean | null
          end_of_extended_support_date?: string | null
          end_of_life_date?: string | null
          end_of_mainstream_support_date?: string | null
          end_of_sale_date?: string | null
          engineering_owner_id?: string | null
          escalation_group?: string | null
          expiration_date?: string | null
          external_reference_id?: string | null
          general_availability_date?: string | null
          governance_notes?: string | null
          graphql_available?: boolean | null
          high_availability_supported?: boolean | null
          id?: string
          infrastructure_as_code_supported?: boolean | null
          integration_notes?: string | null
          is_active?: boolean
          is_deleted?: boolean
          is_sample?: boolean
          itsm_integrations?: Json | null
          knowledge_articles_available?: boolean | null
          known_security_considerations?: string | null
          last_assessment_date?: string | null
          licensing_model?: string | null
          lifecycle_notes?: string | null
          lifecycle_status?: string | null
          mfa_supported?: boolean | null
          monitoring_integrations?: Json | null
          multi_region_supported?: boolean | null
          native_integrations?: Json | null
          neurealm_practice?: string | null
          operational_maturity_score?: number | null
          operations_owner_id?: string | null
          overall_maturity_notes?: string | null
          powershell_available?: boolean | null
          primary_domain?: string | null
          product_family?: string | null
          product_name?: string | null
          product_website_url?: string | null
          published_version?: number
          rbac_supported?: boolean | null
          record_steward_id?: string | null
          replacement_technology_id?: string | null
          required_security_controls?: Json | null
          rest_api_available?: boolean | null
          review_date?: string | null
          runbooks_available?: boolean | null
          scalability_model?: string | null
          sdk_available?: boolean | null
          secondary_domains?: string[] | null
          security_certifications?: string[] | null
          security_maturity_score?: number | null
          security_owner_id?: string | null
          short_name?: string | null
          siem_integrations?: Json | null
          slug: string
          sop_library_available?: boolean | null
          source_of_record?: string | null
          strategic_importance?: string | null
          support_contract_reference?: string | null
          support_group?: string | null
          support_readiness_score?: number | null
          support_url?: string | null
          supported_architectures?: string[] | null
          supported_business_services?: Json | null
          supported_cloud_providers?: string[] | null
          supported_databases?: string[] | null
          supported_hypervisors?: string[] | null
          supported_industries?: string[] | null
          supported_operating_systems?: string[] | null
          tags?: string[] | null
          target_audiences?: string[] | null
          technical_limitations?: string | null
          technical_prerequisites?: string | null
          technology_icon_url?: string | null
          technology_image_crop_metadata?: Json | null
          technology_image_height?: number | null
          technology_image_last_updated?: string | null
          technology_image_last_updated_by?: string | null
          technology_image_original_filename?: string | null
          technology_image_scale?: number | null
          technology_image_storage_path?: string | null
          technology_image_type?: string | null
          technology_image_url?: string | null
          technology_image_width?: number | null
          technology_maturity?: string | null
          technology_name: string
          technology_owner_id?: string | null
          technology_tower?: string | null
          technology_type?: string | null
          tenant_id?: string | null
          tenant_scope?: string | null
          third_party_integrations?: Json | null
          typical_deployment_size?: string | null
          typical_use_cases?: Json | null
          updated_at?: string
          updated_by?: string | null
          upgrade_path?: string | null
          vendor_name?: string | null
          version?: string | null
          visibility?: string
          webhooks_available?: boolean | null
        }
        Update: {
          agent_required?: boolean | null
          agentless_supported?: boolean | null
          ai_maturity_score?: number | null
          ai_opportunity_summary?: string | null
          ai_playbooks_available?: boolean | null
          ai_ready?: boolean | null
          api_available?: boolean | null
          approval_status?: string
          assessed_by_id?: string | null
          audit_logging_supported?: boolean | null
          authentication_methods?: string[] | null
          authentication_types?: string[] | null
          authorization_model?: string | null
          automation_integrations?: Json | null
          automation_maturity_score?: number | null
          automation_opportunity_summary?: string | null
          automation_ready?: boolean | null
          automations_available?: boolean | null
          available_automation_interfaces?: Json | null
          backup_supported?: boolean | null
          banner_image_url?: string | null
          business_criticality?: string | null
          business_impact_if_unavailable?: string | null
          business_outcome_summary?: string | null
          business_owner_id?: string | null
          business_purpose?: string | null
          category?: string | null
          cli_available?: boolean | null
          cloned_from_technology_id?: string | null
          clustering_supported?: boolean | null
          color_theme?: string | null
          community_url?: string | null
          compliance_standards?: string[] | null
          created_at?: string
          created_by?: string | null
          data_classification?: string | null
          data_integrations?: Json | null
          data_owner_id?: string | null
          data_residency_requirements?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deployment_models?: string[] | null
          description?: string | null
          digital_coworkers_available?: boolean | null
          digital_twin_readiness_score?: number | null
          disaster_recovery_supported?: boolean | null
          documentation_completeness_percentage?: number | null
          documentation_url?: string | null
          edition?: string | null
          effective_date?: string | null
          encryption_at_rest?: boolean | null
          encryption_in_transit?: boolean | null
          end_of_extended_support_date?: string | null
          end_of_life_date?: string | null
          end_of_mainstream_support_date?: string | null
          end_of_sale_date?: string | null
          engineering_owner_id?: string | null
          escalation_group?: string | null
          expiration_date?: string | null
          external_reference_id?: string | null
          general_availability_date?: string | null
          governance_notes?: string | null
          graphql_available?: boolean | null
          high_availability_supported?: boolean | null
          id?: string
          infrastructure_as_code_supported?: boolean | null
          integration_notes?: string | null
          is_active?: boolean
          is_deleted?: boolean
          is_sample?: boolean
          itsm_integrations?: Json | null
          knowledge_articles_available?: boolean | null
          known_security_considerations?: string | null
          last_assessment_date?: string | null
          licensing_model?: string | null
          lifecycle_notes?: string | null
          lifecycle_status?: string | null
          mfa_supported?: boolean | null
          monitoring_integrations?: Json | null
          multi_region_supported?: boolean | null
          native_integrations?: Json | null
          neurealm_practice?: string | null
          operational_maturity_score?: number | null
          operations_owner_id?: string | null
          overall_maturity_notes?: string | null
          powershell_available?: boolean | null
          primary_domain?: string | null
          product_family?: string | null
          product_name?: string | null
          product_website_url?: string | null
          published_version?: number
          rbac_supported?: boolean | null
          record_steward_id?: string | null
          replacement_technology_id?: string | null
          required_security_controls?: Json | null
          rest_api_available?: boolean | null
          review_date?: string | null
          runbooks_available?: boolean | null
          scalability_model?: string | null
          sdk_available?: boolean | null
          secondary_domains?: string[] | null
          security_certifications?: string[] | null
          security_maturity_score?: number | null
          security_owner_id?: string | null
          short_name?: string | null
          siem_integrations?: Json | null
          slug?: string
          sop_library_available?: boolean | null
          source_of_record?: string | null
          strategic_importance?: string | null
          support_contract_reference?: string | null
          support_group?: string | null
          support_readiness_score?: number | null
          support_url?: string | null
          supported_architectures?: string[] | null
          supported_business_services?: Json | null
          supported_cloud_providers?: string[] | null
          supported_databases?: string[] | null
          supported_hypervisors?: string[] | null
          supported_industries?: string[] | null
          supported_operating_systems?: string[] | null
          tags?: string[] | null
          target_audiences?: string[] | null
          technical_limitations?: string | null
          technical_prerequisites?: string | null
          technology_icon_url?: string | null
          technology_image_crop_metadata?: Json | null
          technology_image_height?: number | null
          technology_image_last_updated?: string | null
          technology_image_last_updated_by?: string | null
          technology_image_original_filename?: string | null
          technology_image_scale?: number | null
          technology_image_storage_path?: string | null
          technology_image_type?: string | null
          technology_image_url?: string | null
          technology_image_width?: number | null
          technology_maturity?: string | null
          technology_name?: string
          technology_owner_id?: string | null
          technology_tower?: string | null
          technology_type?: string | null
          tenant_id?: string | null
          tenant_scope?: string | null
          third_party_integrations?: Json | null
          typical_deployment_size?: string | null
          typical_use_cases?: Json | null
          updated_at?: string
          updated_by?: string | null
          upgrade_path?: string | null
          vendor_name?: string | null
          version?: string | null
          visibility?: string
          webhooks_available?: boolean | null
        }
        Relationships: []
      }
      evidence_files: {
        Row: {
          answer_id: string
          file_name: string
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          answer_id: string
          file_name: string
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          answer_id?: string
          file_name?: string
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_files_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_agent_interactions: {
        Row: {
          answer: string | null
          confidence: number | null
          created_at: string
          escalated: boolean
          escalated_at: string | null
          escalation_note: string | null
          id: string
          matched_catalog_ids: string[]
          question: string
          status: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          confidence?: number | null
          created_at?: string
          escalated?: boolean
          escalated_at?: string | null
          escalation_note?: string | null
          id?: string
          matched_catalog_ids?: string[]
          question: string
          status?: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          answer?: string | null
          confidence?: number | null
          created_at?: string
          escalated?: boolean
          escalated_at?: string | null
          escalation_note?: string | null
          id?: string
          matched_catalog_ids?: string[]
          question?: string
          status?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidance_agent_interactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_automation_capabilities: {
        Row: {
          action_type: string
          allowed_environments: string[]
          created_at: string
          display_name: string
          execution_mode: string
          id: string
          input_schema: Json
          lifecycle_status: string
          module_source: string
          module_version: string
          provider: string
          requires_managed_resource: boolean
          resource_type: string
          updated_at: string
        }
        Insert: {
          action_type: string
          allowed_environments?: string[]
          created_at?: string
          display_name: string
          execution_mode: string
          id?: string
          input_schema?: Json
          lifecycle_status?: string
          module_source: string
          module_version: string
          provider?: string
          requires_managed_resource?: boolean
          resource_type: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          allowed_environments?: string[]
          created_at?: string
          display_name?: string
          execution_mode?: string
          id?: string
          input_schema?: Json
          lifecycle_status?: string
          module_source?: string
          module_version?: string
          provider?: string
          requires_managed_resource?: boolean
          resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      iac_change_package_reviews: {
        Row: {
          comment: string | null
          decision: string
          id: string
          package_id: string
          reviewed_at: string
          reviewed_by: string
        }
        Insert: {
          comment?: string | null
          decision: string
          id?: string
          package_id: string
          reviewed_at?: string
          reviewed_by: string
        }
        Update: {
          comment?: string | null
          decision?: string
          id?: string
          package_id?: string
          reviewed_at?: string
          reviewed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_change_package_reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: true
            referencedRelation: "iac_change_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_change_packages: {
        Row: {
          action_label: string
          action_type: string
          approval_required: boolean
          created_at: string
          created_by: string
          current_state: Json
          executed_by: string | null
          execution_completed_at: string | null
          execution_message: string | null
          execution_started_at: string | null
          id: string
          package_number: string
          parameters: Json
          policy_evidence: Json
          rationale: string
          region: string
          resource_group: string
          risk_level: string
          risk_score: number
          status: string
          submitted_at: string | null
          subscription_id: string
          target_name: string
          target_resource_id: string
          updated_at: string
          validation_plan: Json
        }
        Insert: {
          action_label: string
          action_type: string
          approval_required?: boolean
          created_at?: string
          created_by?: string
          current_state?: Json
          executed_by?: string | null
          execution_completed_at?: string | null
          execution_message?: string | null
          execution_started_at?: string | null
          id?: string
          package_number: string
          parameters?: Json
          policy_evidence?: Json
          rationale: string
          region: string
          resource_group: string
          risk_level: string
          risk_score: number
          status?: string
          submitted_at?: string | null
          subscription_id: string
          target_name: string
          target_resource_id: string
          updated_at?: string
          validation_plan?: Json
        }
        Update: {
          action_label?: string
          action_type?: string
          approval_required?: boolean
          created_at?: string
          created_by?: string
          current_state?: Json
          executed_by?: string | null
          execution_completed_at?: string | null
          execution_message?: string | null
          execution_started_at?: string | null
          id?: string
          package_number?: string
          parameters?: Json
          policy_evidence?: Json
          rationale?: string
          region?: string
          resource_group?: string
          risk_level?: string
          risk_score?: number
          status?: string
          submitted_at?: string | null
          subscription_id?: string
          target_name?: string
          target_resource_id?: string
          updated_at?: string
          validation_plan?: Json
        }
        Relationships: []
      }
      iac_evidence_items: {
        Row: {
          captured_at: string
          content: Json
          content_hash: string | null
          id: string
          kind: string
          name: string
          run_id: string
          source: string
        }
        Insert: {
          captured_at?: string
          content?: Json
          content_hash?: string | null
          id?: string
          kind: string
          name: string
          run_id: string
          source: string
        }
        Update: {
          captured_at?: string
          content?: Json
          content_hash?: string | null
          id?: string
          kind?: string
          name?: string
          run_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_evidence_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "iac_validation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_package_automation_bindings: {
        Row: {
          capability_id: string
          module_source: string
          module_version: string
          package_id: string
          resolved_at: string
          resolved_by: string
          resolved_inputs: Json
        }
        Insert: {
          capability_id: string
          module_source: string
          module_version: string
          package_id: string
          resolved_at?: string
          resolved_by: string
          resolved_inputs: Json
        }
        Update: {
          capability_id?: string
          module_source?: string
          module_version?: string
          package_id?: string
          resolved_at?: string
          resolved_by?: string
          resolved_inputs?: Json
        }
        Relationships: [
          {
            foreignKeyName: "iac_package_automation_bindings_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "iac_automation_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_package_automation_bindings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: true
            referencedRelation: "iac_change_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_terraform_run_events: {
        Row: {
          created_at: string
          detail: Json
          event_type: string
          id: string
          run_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          event_type: string
          id?: string
          run_id: string
        }
        Update: {
          created_at?: string
          detail?: Json
          event_type?: string
          id?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_terraform_run_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "iac_terraform_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_terraform_runs: {
        Row: {
          artifact_uri: string | null
          capability_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_engine: string
          has_destroy: boolean
          has_replace: boolean
          hcp_configuration_version_id: string | null
          hcp_organization: string | null
          hcp_plan_id: string | null
          hcp_plan_json: Json | null
          hcp_run_id: string | null
          hcp_run_status: string | null
          hcp_synced_at: string | null
          hcp_workspace_id: string | null
          hcp_workspace_name: string | null
          id: string
          module_source: string
          module_version: string
          package_id: string
          plan_run_id: string | null
          plan_sha256: string | null
          plan_summary: Json
          reconciliation: Json
          requested_by: string
          resolved_inputs: Json
          run_type: string
          runner_correlation_id: string
          source_revision: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          artifact_uri?: string | null
          capability_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_engine?: string
          has_destroy?: boolean
          has_replace?: boolean
          hcp_configuration_version_id?: string | null
          hcp_organization?: string | null
          hcp_plan_id?: string | null
          hcp_plan_json?: Json | null
          hcp_run_id?: string | null
          hcp_run_status?: string | null
          hcp_synced_at?: string | null
          hcp_workspace_id?: string | null
          hcp_workspace_name?: string | null
          id?: string
          module_source: string
          module_version: string
          package_id: string
          plan_run_id?: string | null
          plan_sha256?: string | null
          plan_summary?: Json
          reconciliation?: Json
          requested_by: string
          resolved_inputs: Json
          run_type: string
          runner_correlation_id: string
          source_revision?: string | null
          started_at?: string | null
          status: string
        }
        Update: {
          artifact_uri?: string | null
          capability_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_engine?: string
          has_destroy?: boolean
          has_replace?: boolean
          hcp_configuration_version_id?: string | null
          hcp_organization?: string | null
          hcp_plan_id?: string | null
          hcp_plan_json?: Json | null
          hcp_run_id?: string | null
          hcp_run_status?: string | null
          hcp_synced_at?: string | null
          hcp_workspace_id?: string | null
          hcp_workspace_name?: string | null
          id?: string
          module_source?: string
          module_version?: string
          package_id?: string
          plan_run_id?: string | null
          plan_sha256?: string | null
          plan_summary?: Json
          reconciliation?: Json
          requested_by?: string
          resolved_inputs?: Json
          run_type?: string
          runner_correlation_id?: string
          source_revision?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_terraform_runs_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "iac_automation_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_terraform_runs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "iac_change_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_terraform_runs_plan_run_id_fkey"
            columns: ["plan_run_id"]
            isOneToOne: false
            referencedRelation: "iac_terraform_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_validation_results: {
        Row: {
          check_code: string
          checked_at: string
          domain: string
          expected: string
          id: string
          measure: string
          observed: string
          raw: Json
          result: string
          run_id: string
          source: string
        }
        Insert: {
          check_code: string
          checked_at?: string
          domain: string
          expected: string
          id?: string
          measure: string
          observed: string
          raw?: Json
          result: string
          run_id: string
          source: string
        }
        Update: {
          check_code?: string
          checked_at?: string
          domain?: string
          expected?: string
          id?: string
          measure?: string
          observed?: string
          raw?: Json
          result?: string
          run_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_validation_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "iac_validation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_validation_runs: {
        Row: {
          after_state: Json
          before_state: Json
          closed_at: string | null
          completed_at: string | null
          confidence: number | null
          created_at: string
          created_by: string
          evidence_hash: string | null
          id: string
          package_id: string
          started_at: string | null
          status: string
          summary: string | null
          updated_at: string
          validated_by: string | null
        }
        Insert: {
          after_state?: Json
          before_state?: Json
          closed_at?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string
          evidence_hash?: string | null
          id?: string
          package_id: string
          started_at?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
          validated_by?: string | null
        }
        Update: {
          after_state?: Json
          before_state?: Json
          closed_at?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string
          evidence_hash?: string | null
          id?: string
          package_id?: string
          started_at?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iac_validation_runs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: true
            referencedRelation: "iac_change_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations_catalog: {
        Row: {
          auth_type: string
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          auth_type?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          auth_type?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          membership_id: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          membership_id: string
          role_id: string
          tenant_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          membership_id?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_roles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "tenant_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          id: string
          joined_at: string | null
          last_active_at: string | null
          status: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_knowledge_base: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          route: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          route: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          route?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_activities: {
        Row: {
          ai_summary: string | null
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          semantic_tags: string[]
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
          workflow_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
          workflow_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_activities_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "org_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      org_business_units: {
        Row: {
          ai_summary: string | null
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          semantic_tags: string[]
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      org_capability_areas: {
        Row: {
          ai_summary: string | null
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          practice_id: string
          semantic_tags: string[]
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          practice_id: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          practice_id?: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_capability_areas_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "org_practices"
            referencedColumns: ["id"]
          },
        ]
      }
      org_practices: {
        Row: {
          ai_summary: string | null
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          semantic_tags: string[]
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      org_service_functions: {
        Row: {
          ai_summary: string | null
          capability_area_id: string
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          semantic_tags: string[]
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          ai_summary?: string | null
          capability_area_id: string
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          ai_summary?: string | null
          capability_area_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_service_functions_capability_area_id_fkey"
            columns: ["capability_area_id"]
            isOneToOne: false
            referencedRelation: "org_capability_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      org_tasks: {
        Row: {
          activity_id: string
          ai_summary: string | null
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          semantic_tags: string[]
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          activity_id: string
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          activity_id?: string
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          semantic_tags?: string[]
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_tasks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "org_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      org_workflows: {
        Row: {
          ai_summary: string | null
          created_at: string
          created_by: string | null
          description: string
          embedding_text: string | null
          id: string
          keywords: string[]
          last_updated_by: string | null
          logo: string | null
          mission: string | null
          name: string
          semantic_tags: string[]
          service_function_id: string
          short_name: string | null
          strategic_themes: string[]
          strategic_value: string | null
          tagline: string | null
          tenant_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name: string
          semantic_tags?: string[]
          service_function_id: string
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          embedding_text?: string | null
          id?: string
          keywords?: string[]
          last_updated_by?: string | null
          logo?: string | null
          mission?: string | null
          name?: string
          semantic_tags?: string[]
          service_function_id?: string
          short_name?: string | null
          strategic_themes?: string[]
          strategic_value?: string | null
          tagline?: string | null
          tenant_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_workflows_service_function_id_fkey"
            columns: ["service_function_id"]
            isOneToOne: false
            referencedRelation: "org_service_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string
          is_system: boolean
          required_for_tenant_administration: boolean
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description: string
          is_system?: boolean
          required_for_tenant_administration?: boolean
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string
          is_system?: boolean
          required_for_tenant_administration?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          company: string | null
          company_id: string | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          hybrid_days: string[] | null
          id: string
          job_title: string | null
          last_name: string | null
          location: string | null
          must_change_password: boolean
          office_site: string | null
          ooo_delegate_user_id: string | null
          ooo_enabled: boolean
          ooo_end: string | null
          ooo_start: string | null
          phone: string | null
          preferred_contact_method: string | null
          preferred_language: string | null
          profile_completed_at: string | null
          time_zone: string | null
          updated_at: string
          user_category: Database["public"]["Enums"]["user_category"] | null
          user_id: string
          weekly_hours: Json | null
          working_location_type: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          hybrid_days?: string[] | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          must_change_password?: boolean
          office_site?: string | null
          ooo_delegate_user_id?: string | null
          ooo_enabled?: boolean
          ooo_end?: string | null
          ooo_start?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          profile_completed_at?: string | null
          time_zone?: string | null
          updated_at?: string
          user_category?: Database["public"]["Enums"]["user_category"] | null
          user_id: string
          weekly_hours?: Json | null
          working_location_type?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          hybrid_days?: string[] | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          must_change_password?: boolean
          office_site?: string | null
          ooo_delegate_user_id?: string | null
          ooo_enabled?: boolean
          ooo_end?: string | null
          ooo_start?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          profile_completed_at?: string | null
          time_zone?: string | null
          updated_at?: string
          user_category?: Database["public"]["Enums"]["user_category"] | null
          user_id?: string
          weekly_hours?: Json | null
          working_location_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_ooo_delegate_fk"
            columns: ["ooo_delegate_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_response_answers: {
        Row: {
          answer: Json | null
          created_at: string
          id: string
          question_id: string
          response_id: string
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          id?: string
          question_id: string
          response_id: string
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_response_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_response_files: {
        Row: {
          content_type: string | null
          created_at: string
          file_name: string
          id: string
          question_id: string | null
          response_id: string
          size_bytes: number | null
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_name: string
          id?: string
          question_id?: string | null
          response_id: string
          size_bytes?: number | null
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_name?: string
          id?: string
          question_id?: string | null
          response_id?: string
          size_bytes?: number | null
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_response_files_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_response_files_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_responses: {
        Row: {
          created_at: string
          id: string
          org_name: string
          respondent_email: string
          respondent_name: string
          respondent_role: string
          respondent_token: string
          share_link_id: string
          started_at: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_name: string
          respondent_email: string
          respondent_name: string
          respondent_role: string
          respondent_token: string
          share_link_id: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_name?: string
          respondent_email?: string
          respondent_name?: string
          respondent_role?: string
          respondent_token?: string
          share_link_id?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sections: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          questionnaire_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          questionnaire_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          questionnaire_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_sections_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_share_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string | null
          questionnaire_id: string
          revoked_at: string | null
          scope: string
          section_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          questionnaire_id: string
          revoked_at?: string | null
          scope: string
          section_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          questionnaire_id?: string
          revoked_at?: string | null
          scope?: string
          section_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_share_links_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_share_links_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          assigned_to_tenant_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
          workstream_id: string
        }
        Insert: {
          assigned_to_tenant_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          workstream_id: string
        }
        Update: {
          assigned_to_tenant_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          workstream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          customer_visible: boolean
          display_order: number
          evidence_requested: string | null
          follow_up_questions: string | null
          id: string
          priority: string | null
          question_id: string
          question_text: string
          question_type: string
          required: boolean
          section_id: string
          updated_at: string
          why_asking: string | null
        }
        Insert: {
          created_at?: string
          customer_visible?: boolean
          display_order?: number
          evidence_requested?: string | null
          follow_up_questions?: string | null
          id?: string
          priority?: string | null
          question_id: string
          question_text: string
          question_type?: string
          required?: boolean
          section_id: string
          updated_at?: string
          why_asking?: string | null
        }
        Update: {
          created_at?: string
          customer_visible?: boolean
          display_order?: number
          evidence_requested?: string | null
          follow_up_questions?: string | null
          id?: string
          priority?: string | null
          question_id?: string
          question_text?: string
          question_type?: string
          required?: boolean
          section_id?: string
          updated_at?: string
          why_asking?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_alerts: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          fired_at: string
          id: string
          metadata: Json
          service_id: string | null
          severity: Database["public"]["Enums"]["runops_severity"]
          slo_id: string | null
          source_system: string
          state: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          fired_at: string
          id?: string
          metadata?: Json
          service_id?: string | null
          severity: Database["public"]["Enums"]["runops_severity"]
          slo_id?: string | null
          source_system?: string
          state?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          fired_at?: string
          id?: string
          metadata?: Json
          service_id?: string | null
          severity?: Database["public"]["Enums"]["runops_severity"]
          slo_id?: string | null
          source_system?: string
          state?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_alerts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_alerts_slo_id_fkey"
            columns: ["slo_id"]
            isOneToOne: false
            referencedRelation: "runops_slos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_approvals: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          decided_at: string | null
          decided_by: string | null
          execution_id: string | null
          external_id: string
          id: string
          metadata: Json
          reason: string | null
          requested_at: string
          requested_by_user_id: string | null
          requested_by_worker_id: string | null
          runbook_id: string | null
          source_system: string
          state: Database["public"]["Enums"]["runops_approval_state"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          decided_at?: string | null
          decided_by?: string | null
          execution_id?: string | null
          external_id: string
          id?: string
          metadata?: Json
          reason?: string | null
          requested_at?: string
          requested_by_user_id?: string | null
          requested_by_worker_id?: string | null
          runbook_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_approval_state"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          decided_at?: string | null
          decided_by?: string | null
          execution_id?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          reason?: string | null
          requested_at?: string
          requested_by_user_id?: string | null
          requested_by_worker_id?: string | null
          runbook_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_approval_state"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_approvals_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "runops_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_approvals_requested_by_worker_id_fkey"
            columns: ["requested_by_worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_approvals_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_audit_events: {
        Row: {
          action: string
          actor_ref: string
          at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          detail: string | null
          id: string
          metadata: Json
          source_system: string
          target_ref: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          action: string
          actor_ref: string
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          detail?: string | null
          id?: string
          metadata?: Json
          source_system?: string
          target_ref: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          action?: string
          actor_ref?: string
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          detail?: string | null
          id?: string
          metadata?: Json
          source_system?: string
          target_ref?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_audit_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_changes: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          deployed_at: string
          external_id: string
          id: string
          linked_incident_id: string | null
          metadata: Json
          requested_by: string | null
          risk: Database["public"]["Enums"]["runops_risk"]
          service_id: string | null
          source_system: string
          state: Database["public"]["Enums"]["runops_change_state"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          deployed_at: string
          external_id: string
          id?: string
          linked_incident_id?: string | null
          metadata?: Json
          requested_by?: string | null
          risk?: Database["public"]["Enums"]["runops_risk"]
          service_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_change_state"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          deployed_at?: string
          external_id?: string
          id?: string
          linked_incident_id?: string | null
          metadata?: Json
          requested_by?: string | null
          risk?: Database["public"]["Enums"]["runops_risk"]
          service_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_change_state"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_changes_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_changes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_changes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_communications: {
        Row: {
          audience: string
          channel: Database["public"]["Enums"]["runops_channel"]
          content: string
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          incident_id: string
          metadata: Json
          sent_at: string | null
          source_system: string
          state: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          audience: string
          channel: Database["public"]["Enums"]["runops_channel"]
          content: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          incident_id: string
          metadata?: Json
          sent_at?: string | null
          source_system?: string
          state?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          audience?: string
          channel?: Database["public"]["Enums"]["runops_channel"]
          content?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          incident_id?: string
          metadata?: Json
          sent_at?: string | null
          source_system?: string
          state?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_communications_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_communications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_components: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          health: Database["public"]["Enums"]["runops_health"]
          id: string
          kind: Database["public"]["Enums"]["runops_component_kind"]
          metadata: Json
          name: string
          service_id: string | null
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          health?: Database["public"]["Enums"]["runops_health"]
          id?: string
          kind: Database["public"]["Enums"]["runops_component_kind"]
          metadata?: Json
          name: string
          service_id?: string | null
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          health?: Database["public"]["Enums"]["runops_health"]
          id?: string
          kind?: Database["public"]["Enums"]["runops_component_kind"]
          metadata?: Json
          name?: string
          service_id?: string | null
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_components_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_components_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_connectors: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          kind: string
          metadata: Json
          name: string
          source_system: string
          state: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          kind: string
          metadata?: Json
          name: string
          source_system?: string
          state?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          kind?: string
          metadata?: Json
          name?: string
          source_system?: string
          state?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_connectors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_corrective_actions: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          due_at: string | null
          external_id: string
          id: string
          metadata: Json
          owner_team_id: string | null
          postmortem_id: string | null
          source_system: string
          state: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          due_at?: string | null
          external_id: string
          id?: string
          metadata?: Json
          owner_team_id?: string | null
          postmortem_id?: string | null
          source_system?: string
          state?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          due_at?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          owner_team_id?: string | null
          postmortem_id?: string | null
          source_system?: string
          state?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_corrective_actions_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "runops_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_corrective_actions_postmortem_id_fkey"
            columns: ["postmortem_id"]
            isOneToOne: false
            referencedRelation: "runops_postmortems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_corrective_actions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_customer_journeys: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          external_id: string
          id: string
          metadata: Json
          name: string
          service_id: string | null
          source_system: string
          steps: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id: string
          id?: string
          metadata?: Json
          name: string
          service_id?: string | null
          source_system?: string
          steps?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          service_id?: string | null
          source_system?: string
          steps?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_customer_journeys_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_customer_journeys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_dependencies: {
        Row: {
          created_at: string
          created_by: string | null
          criticality: string
          data_freshness: string
          description: string | null
          from_service_id: string
          id: string
          metadata: Json
          source_system: string
          tenant_id: string
          to_service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criticality?: string
          data_freshness?: string
          description?: string | null
          from_service_id: string
          id?: string
          metadata?: Json
          source_system?: string
          tenant_id: string
          to_service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criticality?: string
          data_freshness?: string
          description?: string | null
          from_service_id?: string
          id?: string
          metadata?: Json
          source_system?: string
          tenant_id?: string
          to_service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_dependencies_from_service_id_fkey"
            columns: ["from_service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_dependencies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_dependencies_to_service_id_fkey"
            columns: ["to_service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_digital_workers: {
        Row: {
          autonomy: Database["public"]["Enums"]["runops_autonomy"]
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          metadata: Json
          name: string
          role: string
          source_system: string
          status: Database["public"]["Enums"]["runops_worker_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          metadata?: Json
          name: string
          role: string
          source_system?: string
          status?: Database["public"]["Enums"]["runops_worker_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          role?: string
          source_system?: string
          status?: Database["public"]["Enums"]["runops_worker_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_digital_workers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_domain_events: {
        Row: {
          at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          kind: string
          metadata: Json
          payload: Json
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          kind: string
          metadata?: Json
          payload?: Json
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          kind?: string
          metadata?: Json
          payload?: Json
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_domain_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_error_budgets: {
        Row: {
          burn_rate: number | null
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          remaining_percent: number
          slo_id: string
          source_system: string
          tenant_id: string
          time_to_exhaustion_hours: number | null
          updated_at: string
          window: string
        }
        Insert: {
          burn_rate?: number | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          remaining_percent: number
          slo_id: string
          source_system?: string
          tenant_id: string
          time_to_exhaustion_hours?: number | null
          updated_at?: string
          window: string
        }
        Update: {
          burn_rate?: number | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          remaining_percent?: number
          slo_id?: string
          source_system?: string
          tenant_id?: string
          time_to_exhaustion_hours?: number | null
          updated_at?: string
          window?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_error_budgets_slo_id_fkey"
            columns: ["slo_id"]
            isOneToOne: false
            referencedRelation: "runops_slos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_error_budgets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_evidence_items: {
        Row: {
          captured_at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string | null
          hash: string | null
          id: string
          incident_id: string | null
          kind: string
          label: string
          metadata: Json
          reference: string | null
          source_system: string
          step_execution_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          captured_at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string | null
          hash?: string | null
          id?: string
          incident_id?: string | null
          kind: string
          label: string
          metadata?: Json
          reference?: string | null
          source_system?: string
          step_execution_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string | null
          hash?: string | null
          id?: string
          incident_id?: string | null
          kind?: string
          label?: string
          metadata?: Json
          reference?: string | null
          source_system?: string
          step_execution_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_evidence_items_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_evidence_items_step_execution_id_fkey"
            columns: ["step_execution_id"]
            isOneToOne: false
            referencedRelation: "runops_step_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_evidence_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_executions: {
        Row: {
          approval_id: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          ended_at: string | null
          external_id: string
          id: string
          incident_id: string | null
          initiated_by_user_id: string | null
          initiated_by_worker_id: string | null
          metadata: Json
          runbook_id: string
          runbook_version_id: string | null
          source_system: string
          started_at: string | null
          state: Database["public"]["Enums"]["runops_execution_state"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approval_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          ended_at?: string | null
          external_id: string
          id?: string
          incident_id?: string | null
          initiated_by_user_id?: string | null
          initiated_by_worker_id?: string | null
          metadata?: Json
          runbook_id: string
          runbook_version_id?: string | null
          source_system?: string
          started_at?: string | null
          state?: Database["public"]["Enums"]["runops_execution_state"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approval_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          ended_at?: string | null
          external_id?: string
          id?: string
          incident_id?: string | null
          initiated_by_user_id?: string | null
          initiated_by_worker_id?: string | null
          metadata?: Json
          runbook_id?: string
          runbook_version_id?: string | null
          source_system?: string
          started_at?: string | null
          state?: Database["public"]["Enums"]["runops_execution_state"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_executions_approval_fk"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "runops_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_executions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_executions_initiated_by_worker_id_fkey"
            columns: ["initiated_by_worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_executions_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_executions_runbook_version_id_fkey"
            columns: ["runbook_version_id"]
            isOneToOne: false
            referencedRelation: "runops_runbook_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_executions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_hypotheses: {
        Row: {
          confidence: number
          contradictory: Json
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          incident_id: string
          metadata: Json
          source_system: string
          state: string
          statement: string
          supporting: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          confidence?: number
          contradictory?: Json
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          incident_id: string
          metadata?: Json
          source_system?: string
          state?: string
          statement: string
          supporting?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          contradictory?: Json
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          incident_id?: string
          metadata?: Json
          source_system?: string
          state?: string
          statement?: string
          supporting?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_hypotheses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_hypotheses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_incident_events: {
        Row: {
          actor_ref: string
          at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          incident_id: string
          kind: string
          message: string
          metadata: Json
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actor_ref: string
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          incident_id: string
          kind: string
          message: string
          metadata?: Json
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actor_ref?: string
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          incident_id?: string
          kind?: string
          message?: string
          metadata?: Json
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_incident_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_incident_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_incidents: {
        Row: {
          closed_at: string | null
          commander_user_id: string | null
          commander_worker_id: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          findings: Json
          id: string
          metadata: Json
          opened_at: string
          service_id: string | null
          severity: Database["public"]["Enums"]["runops_severity"]
          source_system: string
          state: Database["public"]["Enums"]["runops_incident_state"]
          summary: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          commander_user_id?: string | null
          commander_worker_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          findings?: Json
          id?: string
          metadata?: Json
          opened_at?: string
          service_id?: string | null
          severity: Database["public"]["Enums"]["runops_severity"]
          source_system?: string
          state?: Database["public"]["Enums"]["runops_incident_state"]
          summary?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          commander_user_id?: string | null
          commander_worker_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          findings?: Json
          id?: string
          metadata?: Json
          opened_at?: string
          service_id?: string | null
          severity?: Database["public"]["Enums"]["runops_severity"]
          source_system?: string
          state?: Database["public"]["Enums"]["runops_incident_state"]
          summary?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_incidents_commander_worker_id_fkey"
            columns: ["commander_worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_incidents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_knowledge_items: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          kind: string
          metadata: Json
          ref: string | null
          service_id: string | null
          source_system: string
          summary: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          kind: string
          metadata?: Json
          ref?: string | null
          service_id?: string | null
          source_system?: string
          summary?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          kind?: string
          metadata?: Json
          ref?: string | null
          service_id?: string | null
          source_system?: string
          summary?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_knowledge_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_knowledge_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_known_errors: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          metadata: Json
          problem_id: string | null
          source_system: string
          tenant_id: string
          title: string
          updated_at: string
          workaround: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          metadata?: Json
          problem_id?: string | null
          source_system?: string
          tenant_id: string
          title: string
          updated_at?: string
          workaround?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          metadata?: Json
          problem_id?: string | null
          source_system?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          workaround?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runops_known_errors_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "runops_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_known_errors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_notifications: {
        Row: {
          at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          detail: string | null
          id: string
          kind: string
          metadata: Json
          read: boolean
          source_system: string
          target_user_id: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          detail?: string | null
          id?: string
          kind: string
          metadata?: Json
          read?: boolean
          source_system?: string
          target_user_id?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          detail?: string | null
          id?: string
          kind?: string
          metadata?: Json
          read?: boolean
          source_system?: string
          target_user_id?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_operations_tasks: {
        Row: {
          assigned_team_id: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          due_at: string | null
          external_id: string
          id: string
          metadata: Json
          related_incident_id: string | null
          source_system: string
          state: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_team_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          due_at?: string | null
          external_id: string
          id?: string
          metadata?: Json
          related_incident_id?: string | null
          source_system?: string
          state?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_team_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          due_at?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          related_incident_id?: string | null
          source_system?: string
          state?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_operations_tasks_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "runops_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_operations_tasks_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_operations_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_policies: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          external_id: string
          id: string
          metadata: Json
          name: string
          requires_approval: boolean
          rule_expression: string | null
          scope: string
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id: string
          id?: string
          metadata?: Json
          name: string
          requires_approval?: boolean
          rule_expression?: string | null
          scope?: string
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          requires_approval?: boolean
          rule_expression?: string | null
          scope?: string
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_policy_decisions: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          decided_at: string
          id: string
          metadata: Json
          outcome: Database["public"]["Enums"]["runops_policy_outcome"]
          policy_id: string
          rationale: string | null
          source_system: string
          subject_ref: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          decided_at?: string
          id?: string
          metadata?: Json
          outcome: Database["public"]["Enums"]["runops_policy_outcome"]
          policy_id: string
          rationale?: string | null
          source_system?: string
          subject_ref: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          decided_at?: string
          id?: string
          metadata?: Json
          outcome?: Database["public"]["Enums"]["runops_policy_outcome"]
          policy_id?: string
          rationale?: string | null
          source_system?: string
          subject_ref?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_policy_decisions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "runops_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_policy_decisions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_postmortems: {
        Row: {
          author_user_id: string | null
          contributing_factors: Json
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          incident_id: string | null
          metadata: Json
          published_at: string | null
          source_system: string
          state: Database["public"]["Enums"]["runops_postmortem_state"]
          summary: string | null
          tenant_id: string
          updated_at: string
          what_did_not: Json
          what_worked: Json
        }
        Insert: {
          author_user_id?: string | null
          contributing_factors?: Json
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          incident_id?: string | null
          metadata?: Json
          published_at?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_postmortem_state"]
          summary?: string | null
          tenant_id: string
          updated_at?: string
          what_did_not?: Json
          what_worked?: Json
        }
        Update: {
          author_user_id?: string | null
          contributing_factors?: Json
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          incident_id?: string | null
          metadata?: Json
          published_at?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_postmortem_state"]
          summary?: string | null
          tenant_id?: string
          updated_at?: string
          what_did_not?: Json
          what_worked?: Json
        }
        Relationships: [
          {
            foreignKeyName: "runops_postmortems_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_postmortems_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_problems: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          metadata: Json
          opened_at: string
          service_id: string | null
          source_system: string
          state: Database["public"]["Enums"]["runops_problem_state"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          metadata?: Json
          opened_at?: string
          service_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_problem_state"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          metadata?: Json
          opened_at?: string
          service_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_problem_state"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_problems_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_problems_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          metadata: Json
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          metadata?: Json
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          metadata?: Json
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_remediation_options: {
        Row: {
          confidence: number
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          id: string
          incident_id: string
          metadata: Json
          risk: Database["public"]["Enums"]["runops_risk"]
          runbook_id: string | null
          selected: boolean
          source_system: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          id?: string
          incident_id: string
          metadata?: Json
          risk?: Database["public"]["Enums"]["runops_risk"]
          runbook_id?: string | null
          selected?: boolean
          source_system?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          id?: string
          incident_id?: string
          metadata?: Json
          risk?: Database["public"]["Enums"]["runops_risk"]
          runbook_id?: string | null
          selected?: boolean
          source_system?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_remediation_options_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_remediation_options_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_remediation_options_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_role_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          role: Database["public"]["Enums"]["runops_role"]
          source_system: string
          team_id: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          role: Database["public"]["Enums"]["runops_role"]
          source_system?: string
          team_id?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          role?: Database["public"]["Enums"]["runops_role"]
          source_system?: string
          team_id?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_role_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "runops_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_role_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_runbook_certifications: {
        Row: {
          certified_at: string
          certified_by: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          expires_at: string | null
          fitness_score: number | null
          id: string
          metadata: Json
          runbook_id: string
          source_system: string
          tenant_id: string
          updated_at: string
          version_id: string
        }
        Insert: {
          certified_at?: string
          certified_by?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          expires_at?: string | null
          fitness_score?: number | null
          id?: string
          metadata?: Json
          runbook_id: string
          source_system?: string
          tenant_id: string
          updated_at?: string
          version_id: string
        }
        Update: {
          certified_at?: string
          certified_by?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          expires_at?: string | null
          fitness_score?: number | null
          id?: string
          metadata?: Json
          runbook_id?: string
          source_system?: string
          tenant_id?: string
          updated_at?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_runbook_certifications_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbook_certifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbook_certifications_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "runops_runbook_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_runbook_steps: {
        Row: {
          autonomy: Database["public"]["Enums"]["runops_autonomy"]
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          id: string
          key: string
          kind: string
          label: string
          metadata: Json
          position: number
          required_approval: boolean
          runbook_version_id: string
          source_system: string
          tenant_id: string
          tool_grants: Json
          updated_at: string
        }
        Insert: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          id?: string
          key: string
          kind: string
          label: string
          metadata?: Json
          position: number
          required_approval?: boolean
          runbook_version_id: string
          source_system?: string
          tenant_id: string
          tool_grants?: Json
          updated_at?: string
        }
        Update: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          id?: string
          key?: string
          kind?: string
          label?: string
          metadata?: Json
          position?: number
          required_approval?: boolean
          runbook_version_id?: string
          source_system?: string
          tenant_id?: string
          tool_grants?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_runbook_steps_runbook_version_id_fkey"
            columns: ["runbook_version_id"]
            isOneToOne: false
            referencedRelation: "runops_runbook_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbook_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_runbook_tests: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          expected_outcome: string | null
          id: string
          metadata: Json
          name: string
          runbook_id: string
          scenario_ref: string | null
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          expected_outcome?: string | null
          id?: string
          metadata?: Json
          name: string
          runbook_id: string
          scenario_ref?: string | null
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          expected_outcome?: string | null
          id?: string
          metadata?: Json
          name?: string
          runbook_id?: string
          scenario_ref?: string | null
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_runbook_tests_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbook_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_runbook_triggers: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          expression: string
          id: string
          kind: string
          metadata: Json
          runbook_id: string
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          expression: string
          id?: string
          kind: string
          metadata?: Json
          runbook_id: string
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          expression?: string
          id?: string
          kind?: string
          metadata?: Json
          runbook_id?: string
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_runbook_triggers_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbook_triggers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_runbook_versions: {
        Row: {
          changelog: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          runbook_id: string
          source_system: string
          state: Database["public"]["Enums"]["runops_runbook_state"]
          tenant_id: string
          updated_at: string
          version: string
        }
        Insert: {
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          runbook_id: string
          source_system?: string
          state?: Database["public"]["Enums"]["runops_runbook_state"]
          tenant_id: string
          updated_at?: string
          version: string
        }
        Update: {
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          runbook_id?: string
          source_system?: string
          state?: Database["public"]["Enums"]["runops_runbook_state"]
          tenant_id?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_runbook_versions_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "runops_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbook_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_runbooks: {
        Row: {
          autonomy: Database["public"]["Enums"]["runops_autonomy"]
          created_at: string
          created_by: string | null
          current_version_id: string | null
          data_freshness: string
          external_id: string
          fitness_score: number
          id: string
          metadata: Json
          owner_team_id: string | null
          service_id: string | null
          source_system: string
          state: Database["public"]["Enums"]["runops_runbook_state"]
          tags: string[]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          data_freshness?: string
          external_id: string
          fitness_score?: number
          id?: string
          metadata?: Json
          owner_team_id?: string | null
          service_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_runbook_state"]
          tags?: string[]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          data_freshness?: string
          external_id?: string
          fitness_score?: number
          id?: string
          metadata?: Json
          owner_team_id?: string | null
          service_id?: string | null
          source_system?: string
          state?: Database["public"]["Enums"]["runops_runbook_state"]
          tags?: string[]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_runbooks_current_version_fk"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "runops_runbook_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbooks_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "runops_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbooks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_runbooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_scenario_events: {
        Row: {
          actor: string | null
          at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          index: number
          label: string
          metadata: Json
          scenario_instance_id: string
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actor?: string | null
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          index: number
          label: string
          metadata?: Json
          scenario_instance_id: string
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actor?: string | null
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          index?: number
          label?: string
          metadata?: Json
          scenario_instance_id?: string
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_scenario_events_scenario_instance_id_fkey"
            columns: ["scenario_instance_id"]
            isOneToOne: false
            referencedRelation: "runops_scenario_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_scenario_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_scenario_instances: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          external_id: string
          id: string
          metadata: Json
          name: string
          source_system: string
          stage_index: number
          stages: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id: string
          id?: string
          metadata?: Json
          name: string
          source_system?: string
          stage_index?: number
          stages?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          source_system?: string
          stage_index?: number
          stages?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_scenario_instances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_service_owners: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          primary_user_id: string | null
          secondary_user_id: string | null
          service_id: string
          source_system: string
          team_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          primary_user_id?: string | null
          secondary_user_id?: string | null
          service_id: string
          source_system?: string
          team_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          primary_user_id?: string | null
          secondary_user_id?: string | null
          service_id?: string
          source_system?: string
          team_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_service_owners_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_service_owners_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "runops_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_service_owners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_services: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          environment: Database["public"]["Enums"]["runops_env"]
          error_budget_remaining: number | null
          external_id: string
          health: Database["public"]["Enums"]["runops_health"]
          id: string
          metadata: Json
          name: string
          owner_team_id: string | null
          region: string
          slo_availability: number | null
          slo_latency_ms: number | null
          source_system: string
          tenant_id: string
          tier: Database["public"]["Enums"]["runops_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          environment?: Database["public"]["Enums"]["runops_env"]
          error_budget_remaining?: number | null
          external_id: string
          health?: Database["public"]["Enums"]["runops_health"]
          id?: string
          metadata?: Json
          name: string
          owner_team_id?: string | null
          region: string
          slo_availability?: number | null
          slo_latency_ms?: number | null
          source_system?: string
          tenant_id: string
          tier: Database["public"]["Enums"]["runops_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          environment?: Database["public"]["Enums"]["runops_env"]
          error_budget_remaining?: number | null
          external_id?: string
          health?: Database["public"]["Enums"]["runops_health"]
          id?: string
          metadata?: Json
          name?: string
          owner_team_id?: string | null
          region?: string
          slo_availability?: number | null
          slo_latency_ms?: number | null
          source_system?: string
          tenant_id?: string
          tier?: Database["public"]["Enums"]["runops_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_services_owner_team_id_fkey"
            columns: ["owner_team_id"]
            isOneToOne: false
            referencedRelation: "runops_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_slis: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          metadata: Json
          name: string
          query_ref: string | null
          service_id: string
          source_system: string
          tenant_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          metadata?: Json
          name: string
          query_ref?: string | null
          service_id: string
          source_system?: string
          tenant_id: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          query_ref?: string | null
          service_id?: string
          source_system?: string
          tenant_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_slis_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_slis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_slos: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          external_id: string
          id: string
          metadata: Json
          service_id: string
          sli_id: string
          source_system: string
          target: number
          tenant_id: string
          updated_at: string
          window: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id: string
          id?: string
          metadata?: Json
          service_id: string
          sli_id: string
          source_system?: string
          target: number
          tenant_id: string
          updated_at?: string
          window: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          external_id?: string
          id?: string
          metadata?: Json
          service_id?: string
          sli_id?: string
          source_system?: string
          target?: number
          tenant_id?: string
          updated_at?: string
          window?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_slos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_slos_sli_id_fkey"
            columns: ["sli_id"]
            isOneToOne: false
            referencedRelation: "runops_slis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_slos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_step_executions: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          ended_at: string | null
          execution_id: string
          id: string
          message: string | null
          metadata: Json
          source_system: string
          started_at: string | null
          state: Database["public"]["Enums"]["runops_step_state"]
          step_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          ended_at?: string | null
          execution_id: string
          id?: string
          message?: string | null
          metadata?: Json
          source_system?: string
          started_at?: string | null
          state?: Database["public"]["Enums"]["runops_step_state"]
          step_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          ended_at?: string | null
          execution_id?: string
          id?: string
          message?: string | null
          metadata?: Json
          source_system?: string
          started_at?: string | null
          state?: Database["public"]["Enums"]["runops_step_state"]
          step_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_step_executions_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "runops_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_step_executions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "runops_runbook_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_step_executions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_teams: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          id: string
          metadata: Json
          name: string
          source_system: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id: string
          id?: string
          metadata?: Json
          name: string
          source_system?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          source_system?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_telemetry_snapshots: {
        Row: {
          captured_at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          name: string
          points: Json
          service_id: string
          source_system: string
          tenant_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          captured_at: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          name: string
          points?: Json
          service_id: string
          source_system?: string
          tenant_id: string
          unit: string
          updated_at?: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          name?: string
          points?: Json
          service_id?: string
          source_system?: string
          tenant_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_telemetry_snapshots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "runops_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_telemetry_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_tenants: {
        Row: {
          created_at: string
          external_id: string
          id: string
          metadata: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          metadata?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          metadata?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      runops_worker_capabilities: {
        Row: {
          autonomy: Database["public"]["Enums"]["runops_autonomy"]
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          id: string
          metadata: Json
          name: string
          source_system: string
          tenant_id: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          source_system?: string
          tenant_id: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          autonomy?: Database["public"]["Enums"]["runops_autonomy"]
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          source_system?: string
          tenant_id?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_worker_capabilities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_capabilities_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_worker_evaluations: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          notes: string | null
          outcome: string
          score: number | null
          source_system: string
          tenant_id: string
          updated_at: string
          window: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          notes?: string | null
          outcome: string
          score?: number | null
          source_system?: string
          tenant_id: string
          updated_at?: string
          window: string
          worker_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          notes?: string | null
          outcome?: string
          score?: number | null
          source_system?: string
          tenant_id?: string
          updated_at?: string
          window?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_worker_evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_evaluations_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_worker_events: {
        Row: {
          at: string
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          kind: string
          message: string
          metadata: Json
          session_id: string | null
          source_system: string
          tenant_id: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          kind: string
          message: string
          metadata?: Json
          session_id?: string | null
          source_system?: string
          tenant_id: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          at?: string
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          kind?: string
          message?: string
          metadata?: Json
          session_id?: string | null
          source_system?: string
          tenant_id?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_worker_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "runops_worker_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_events_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_worker_sessions: {
        Row: {
          context_incident_id: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          ended_at: string | null
          id: string
          metadata: Json
          source_system: string
          started_at: string
          tenant_id: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          context_incident_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          ended_at?: string | null
          id?: string
          metadata?: Json
          source_system?: string
          started_at?: string
          tenant_id: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          context_incident_id?: string | null
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          ended_at?: string | null
          id?: string
          metadata?: Json
          source_system?: string
          started_at?: string
          tenant_id?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_worker_sessions_context_incident_id_fkey"
            columns: ["context_incident_id"]
            isOneToOne: false
            referencedRelation: "runops_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_sessions_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      runops_worker_tool_grants: {
        Row: {
          created_at: string
          created_by: string | null
          data_freshness: string
          id: string
          metadata: Json
          requires_approval: boolean
          scope: string
          source_system: string
          tenant_id: string
          tool_name: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          requires_approval?: boolean
          scope?: string
          source_system?: string
          tenant_id: string
          tool_name: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_freshness?: string
          id?: string
          metadata?: Json
          requires_approval?: boolean
          scope?: string
          source_system?: string
          tenant_id?: string
          tool_name?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runops_worker_tool_grants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "runops_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runops_worker_tool_grants_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "runops_digital_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      servicenow_intake_events: {
        Row: {
          created_at: string
          detail: Json
          event_type: string
          id: string
          request_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          event_type: string
          id?: string
          request_id: string
        }
        Update: {
          created_at?: string
          detail?: Json
          event_type?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicenow_intake_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "servicenow_intake_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      servicenow_intake_requests: {
        Row: {
          analyzed_at: string | null
          azure_observation: Json
          change_package_id: string | null
          clarification_note: string | null
          created_at: string
          error_message: string | null
          id: string
          llm_analysis: Json
          normalized_request: Json
          payload_hash: string
          received_at: string
          requested_by_user_id: string | null
          service_now_sys_id: string | null
          status: string
          ticket_number: string
          ticket_payload: Json
          ticket_updated_at: string | null
          updated_at: string
        }
        Insert: {
          analyzed_at?: string | null
          azure_observation?: Json
          change_package_id?: string | null
          clarification_note?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          llm_analysis?: Json
          normalized_request?: Json
          payload_hash: string
          received_at?: string
          requested_by_user_id?: string | null
          service_now_sys_id?: string | null
          status?: string
          ticket_number: string
          ticket_payload?: Json
          ticket_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          analyzed_at?: string | null
          azure_observation?: Json
          change_package_id?: string | null
          clarification_note?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          llm_analysis?: Json
          normalized_request?: Json
          payload_hash?: string
          received_at?: string
          requested_by_user_id?: string | null
          service_now_sys_id?: string | null
          status?: string
          ticket_number?: string
          ticket_payload?: Json
          ticket_updated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicenow_intake_requests_change_package_id_fkey"
            columns: ["change_package_id"]
            isOneToOne: false
            referencedRelation: "iac_change_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_registers: {
        Row: {
          company: string | null
          created_at: string
          department: string | null
          email: string | null
          engagement_strategy: string | null
          id: string
          influence_level: string
          notes: string | null
          phone: string | null
          priority: string
          register_id: string
          role: string | null
          stakeholder_name: string
          status: boolean
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          engagement_strategy?: string | null
          id?: string
          influence_level?: string
          notes?: string | null
          phone?: string | null
          priority?: string
          register_id: string
          role?: string | null
          stakeholder_name: string
          status?: boolean
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          engagement_strategy?: string | null
          id?: string
          influence_level?: string
          notes?: string | null
          phone?: string | null
          priority?: string
          register_id?: string
          role?: string | null
          stakeholder_name?: string
          status?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tenant_invitation_roles: {
        Row: {
          assigned_at: string
          invitation_id: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          assigned_at?: string
          invitation_id: string
          role_id: string
          tenant_id: string
        }
        Update: {
          assigned_at?: string
          invitation_id?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitation_roles_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "tenant_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitation_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "tenant_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitation_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          normalized_email: string
          status: Database["public"]["Enums"]["invitation_status"]
          tenant_id: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          normalized_email: string
          status?: Database["public"]["Enums"]["invitation_status"]
          tenant_id: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          normalized_email?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          tenant_id?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_role_permissions: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          permission_code: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          permission_code: string
          role_id: string
          tenant_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          permission_code?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "tenant_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "tenant_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_role_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_roles: {
        Row: {
          archived_at: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system_protected: boolean
          name: string
          status: Database["public"]["Enums"]["tenant_role_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_protected?: boolean
          name: string
          status?: Database["public"]["Enums"]["tenant_role_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_protected?: boolean
          name?: string
          status?: Database["public"]["Enums"]["tenant_role_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          default_currency_code: string
          default_timezone: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          default_currency_code?: string
          default_timezone?: string
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          default_currency_code?: string
          default_timezone?: string
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Relationships: []
      }
      tools_catalog: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          route: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          route?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          route?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_contact_methods: {
        Row: {
          created_at: string
          id: string
          label: string | null
          method_type: string
          updated_at: string
          user_id: string
          value: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          method_type: string
          updated_at?: string
          user_id: string
          value: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          method_type?: string
          updated_at?: string
          user_id?: string
          value?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_contact_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_login_events: {
        Row: {
          action: string
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          login_method: string | null
          source: string
          traits: Json
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          login_method?: string | null
          source?: string
          traits?: Json
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          login_method?: string | null
          source?: string
          traits?: Json
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_rules: {
        Row: {
          channels: string[]
          created_at: string
          escalate_after_minutes: number | null
          id: string
          priority: string
          timing: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          escalate_after_minutes?: number | null
          id?: string
          priority: string
          timing?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          escalate_after_minutes?: number | null
          id?: string
          priority?: string
          timing?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_page_activity: {
        Row: {
          entered_at: string
          id: string
          page_title: string | null
          path: string
          user_id: string
        }
        Insert: {
          entered_at?: string
          id?: string
          page_title?: string | null
          path: string
          user_id: string
        }
        Update: {
          entered_at?: string
          id?: string
          page_title?: string | null
          path?: string
          user_id?: string
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
      workstreams: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          program_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          program_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workstreams_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      etdm_technologies_active: {
        Row: {
          agent_required: boolean | null
          agentless_supported: boolean | null
          ai_maturity_score: number | null
          ai_opportunity_summary: string | null
          ai_playbooks_available: boolean | null
          ai_ready: boolean | null
          api_available: boolean | null
          approval_status: string | null
          assessed_by_id: string | null
          audit_logging_supported: boolean | null
          authentication_methods: string[] | null
          authentication_types: string[] | null
          authorization_model: string | null
          automation_integrations: Json | null
          automation_maturity_score: number | null
          automation_opportunity_summary: string | null
          automation_ready: boolean | null
          automations_available: boolean | null
          available_automation_interfaces: Json | null
          backup_supported: boolean | null
          banner_image_url: string | null
          business_criticality: string | null
          business_impact_if_unavailable: string | null
          business_outcome_summary: string | null
          business_owner_id: string | null
          business_purpose: string | null
          category: string | null
          cli_available: boolean | null
          cloned_from_technology_id: string | null
          clustering_supported: boolean | null
          color_theme: string | null
          community_url: string | null
          compliance_standards: string[] | null
          created_at: string | null
          created_by: string | null
          data_classification: string | null
          data_integrations: Json | null
          data_owner_id: string | null
          data_residency_requirements: string | null
          deleted_at: string | null
          deleted_by: string | null
          deployment_models: string[] | null
          description: string | null
          digital_coworkers_available: boolean | null
          digital_twin_readiness_score: number | null
          disaster_recovery_supported: boolean | null
          documentation_completeness_percentage: number | null
          documentation_url: string | null
          edition: string | null
          effective_date: string | null
          encryption_at_rest: boolean | null
          encryption_in_transit: boolean | null
          end_of_extended_support_date: string | null
          end_of_life_date: string | null
          end_of_mainstream_support_date: string | null
          end_of_sale_date: string | null
          engineering_owner_id: string | null
          escalation_group: string | null
          expiration_date: string | null
          external_reference_id: string | null
          general_availability_date: string | null
          governance_notes: string | null
          graphql_available: boolean | null
          high_availability_supported: boolean | null
          id: string | null
          infrastructure_as_code_supported: boolean | null
          integration_notes: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          is_sample: boolean | null
          itsm_integrations: Json | null
          knowledge_articles_available: boolean | null
          known_security_considerations: string | null
          last_assessment_date: string | null
          licensing_model: string | null
          lifecycle_notes: string | null
          lifecycle_status: string | null
          mfa_supported: boolean | null
          monitoring_integrations: Json | null
          multi_region_supported: boolean | null
          native_integrations: Json | null
          operational_maturity_score: number | null
          operations_owner_id: string | null
          overall_maturity_notes: string | null
          powershell_available: boolean | null
          primary_domain: string | null
          product_family: string | null
          product_name: string | null
          product_website_url: string | null
          published_version: number | null
          rbac_supported: boolean | null
          record_steward_id: string | null
          replacement_technology_id: string | null
          required_security_controls: Json | null
          rest_api_available: boolean | null
          review_date: string | null
          runbooks_available: boolean | null
          scalability_model: string | null
          sdk_available: boolean | null
          secondary_domains: string[] | null
          security_certifications: string[] | null
          security_maturity_score: number | null
          security_owner_id: string | null
          short_name: string | null
          siem_integrations: Json | null
          slug: string | null
          sop_library_available: boolean | null
          source_of_record: string | null
          strategic_importance: string | null
          support_contract_reference: string | null
          support_group: string | null
          support_readiness_score: number | null
          support_url: string | null
          supported_architectures: string[] | null
          supported_business_services: Json | null
          supported_cloud_providers: string[] | null
          supported_databases: string[] | null
          supported_hypervisors: string[] | null
          supported_industries: string[] | null
          supported_operating_systems: string[] | null
          tags: string[] | null
          target_audiences: string[] | null
          technical_limitations: string | null
          technical_prerequisites: string | null
          technology_icon_url: string | null
          technology_maturity: string | null
          technology_name: string | null
          technology_owner_id: string | null
          technology_tower: string | null
          technology_type: string | null
          tenant_id: string | null
          tenant_scope: string | null
          third_party_integrations: Json | null
          typical_deployment_size: string | null
          typical_use_cases: Json | null
          updated_at: string | null
          updated_by: string | null
          upgrade_path: string | null
          vendor_name: string | null
          version: string | null
          visibility: string | null
          webhooks_available: boolean | null
        }
        Insert: {
          agent_required?: boolean | null
          agentless_supported?: boolean | null
          ai_maturity_score?: number | null
          ai_opportunity_summary?: string | null
          ai_playbooks_available?: boolean | null
          ai_ready?: boolean | null
          api_available?: boolean | null
          approval_status?: string | null
          assessed_by_id?: string | null
          audit_logging_supported?: boolean | null
          authentication_methods?: string[] | null
          authentication_types?: string[] | null
          authorization_model?: string | null
          automation_integrations?: Json | null
          automation_maturity_score?: number | null
          automation_opportunity_summary?: string | null
          automation_ready?: boolean | null
          automations_available?: boolean | null
          available_automation_interfaces?: Json | null
          backup_supported?: boolean | null
          banner_image_url?: string | null
          business_criticality?: string | null
          business_impact_if_unavailable?: string | null
          business_outcome_summary?: string | null
          business_owner_id?: string | null
          business_purpose?: string | null
          category?: string | null
          cli_available?: boolean | null
          cloned_from_technology_id?: string | null
          clustering_supported?: boolean | null
          color_theme?: string | null
          community_url?: string | null
          compliance_standards?: string[] | null
          created_at?: string | null
          created_by?: string | null
          data_classification?: string | null
          data_integrations?: Json | null
          data_owner_id?: string | null
          data_residency_requirements?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deployment_models?: string[] | null
          description?: string | null
          digital_coworkers_available?: boolean | null
          digital_twin_readiness_score?: number | null
          disaster_recovery_supported?: boolean | null
          documentation_completeness_percentage?: number | null
          documentation_url?: string | null
          edition?: string | null
          effective_date?: string | null
          encryption_at_rest?: boolean | null
          encryption_in_transit?: boolean | null
          end_of_extended_support_date?: string | null
          end_of_life_date?: string | null
          end_of_mainstream_support_date?: string | null
          end_of_sale_date?: string | null
          engineering_owner_id?: string | null
          escalation_group?: string | null
          expiration_date?: string | null
          external_reference_id?: string | null
          general_availability_date?: string | null
          governance_notes?: string | null
          graphql_available?: boolean | null
          high_availability_supported?: boolean | null
          id?: string | null
          infrastructure_as_code_supported?: boolean | null
          integration_notes?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_sample?: boolean | null
          itsm_integrations?: Json | null
          knowledge_articles_available?: boolean | null
          known_security_considerations?: string | null
          last_assessment_date?: string | null
          licensing_model?: string | null
          lifecycle_notes?: string | null
          lifecycle_status?: string | null
          mfa_supported?: boolean | null
          monitoring_integrations?: Json | null
          multi_region_supported?: boolean | null
          native_integrations?: Json | null
          operational_maturity_score?: number | null
          operations_owner_id?: string | null
          overall_maturity_notes?: string | null
          powershell_available?: boolean | null
          primary_domain?: string | null
          product_family?: string | null
          product_name?: string | null
          product_website_url?: string | null
          published_version?: number | null
          rbac_supported?: boolean | null
          record_steward_id?: string | null
          replacement_technology_id?: string | null
          required_security_controls?: Json | null
          rest_api_available?: boolean | null
          review_date?: string | null
          runbooks_available?: boolean | null
          scalability_model?: string | null
          sdk_available?: boolean | null
          secondary_domains?: string[] | null
          security_certifications?: string[] | null
          security_maturity_score?: number | null
          security_owner_id?: string | null
          short_name?: string | null
          siem_integrations?: Json | null
          slug?: string | null
          sop_library_available?: boolean | null
          source_of_record?: string | null
          strategic_importance?: string | null
          support_contract_reference?: string | null
          support_group?: string | null
          support_readiness_score?: number | null
          support_url?: string | null
          supported_architectures?: string[] | null
          supported_business_services?: Json | null
          supported_cloud_providers?: string[] | null
          supported_databases?: string[] | null
          supported_hypervisors?: string[] | null
          supported_industries?: string[] | null
          supported_operating_systems?: string[] | null
          tags?: string[] | null
          target_audiences?: string[] | null
          technical_limitations?: string | null
          technical_prerequisites?: string | null
          technology_icon_url?: string | null
          technology_maturity?: string | null
          technology_name?: string | null
          technology_owner_id?: string | null
          technology_tower?: string | null
          technology_type?: string | null
          tenant_id?: string | null
          tenant_scope?: string | null
          third_party_integrations?: Json | null
          typical_deployment_size?: string | null
          typical_use_cases?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          upgrade_path?: string | null
          vendor_name?: string | null
          version?: string | null
          visibility?: string | null
          webhooks_available?: boolean | null
        }
        Update: {
          agent_required?: boolean | null
          agentless_supported?: boolean | null
          ai_maturity_score?: number | null
          ai_opportunity_summary?: string | null
          ai_playbooks_available?: boolean | null
          ai_ready?: boolean | null
          api_available?: boolean | null
          approval_status?: string | null
          assessed_by_id?: string | null
          audit_logging_supported?: boolean | null
          authentication_methods?: string[] | null
          authentication_types?: string[] | null
          authorization_model?: string | null
          automation_integrations?: Json | null
          automation_maturity_score?: number | null
          automation_opportunity_summary?: string | null
          automation_ready?: boolean | null
          automations_available?: boolean | null
          available_automation_interfaces?: Json | null
          backup_supported?: boolean | null
          banner_image_url?: string | null
          business_criticality?: string | null
          business_impact_if_unavailable?: string | null
          business_outcome_summary?: string | null
          business_owner_id?: string | null
          business_purpose?: string | null
          category?: string | null
          cli_available?: boolean | null
          cloned_from_technology_id?: string | null
          clustering_supported?: boolean | null
          color_theme?: string | null
          community_url?: string | null
          compliance_standards?: string[] | null
          created_at?: string | null
          created_by?: string | null
          data_classification?: string | null
          data_integrations?: Json | null
          data_owner_id?: string | null
          data_residency_requirements?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deployment_models?: string[] | null
          description?: string | null
          digital_coworkers_available?: boolean | null
          digital_twin_readiness_score?: number | null
          disaster_recovery_supported?: boolean | null
          documentation_completeness_percentage?: number | null
          documentation_url?: string | null
          edition?: string | null
          effective_date?: string | null
          encryption_at_rest?: boolean | null
          encryption_in_transit?: boolean | null
          end_of_extended_support_date?: string | null
          end_of_life_date?: string | null
          end_of_mainstream_support_date?: string | null
          end_of_sale_date?: string | null
          engineering_owner_id?: string | null
          escalation_group?: string | null
          expiration_date?: string | null
          external_reference_id?: string | null
          general_availability_date?: string | null
          governance_notes?: string | null
          graphql_available?: boolean | null
          high_availability_supported?: boolean | null
          id?: string | null
          infrastructure_as_code_supported?: boolean | null
          integration_notes?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_sample?: boolean | null
          itsm_integrations?: Json | null
          knowledge_articles_available?: boolean | null
          known_security_considerations?: string | null
          last_assessment_date?: string | null
          licensing_model?: string | null
          lifecycle_notes?: string | null
          lifecycle_status?: string | null
          mfa_supported?: boolean | null
          monitoring_integrations?: Json | null
          multi_region_supported?: boolean | null
          native_integrations?: Json | null
          operational_maturity_score?: number | null
          operations_owner_id?: string | null
          overall_maturity_notes?: string | null
          powershell_available?: boolean | null
          primary_domain?: string | null
          product_family?: string | null
          product_name?: string | null
          product_website_url?: string | null
          published_version?: number | null
          rbac_supported?: boolean | null
          record_steward_id?: string | null
          replacement_technology_id?: string | null
          required_security_controls?: Json | null
          rest_api_available?: boolean | null
          review_date?: string | null
          runbooks_available?: boolean | null
          scalability_model?: string | null
          sdk_available?: boolean | null
          secondary_domains?: string[] | null
          security_certifications?: string[] | null
          security_maturity_score?: number | null
          security_owner_id?: string | null
          short_name?: string | null
          siem_integrations?: Json | null
          slug?: string | null
          sop_library_available?: boolean | null
          source_of_record?: string | null
          strategic_importance?: string | null
          support_contract_reference?: string | null
          support_group?: string | null
          support_readiness_score?: number | null
          support_url?: string | null
          supported_architectures?: string[] | null
          supported_business_services?: Json | null
          supported_cloud_providers?: string[] | null
          supported_databases?: string[] | null
          supported_hypervisors?: string[] | null
          supported_industries?: string[] | null
          supported_operating_systems?: string[] | null
          tags?: string[] | null
          target_audiences?: string[] | null
          technical_limitations?: string | null
          technical_prerequisites?: string | null
          technology_icon_url?: string | null
          technology_maturity?: string | null
          technology_name?: string | null
          technology_owner_id?: string | null
          technology_tower?: string | null
          technology_type?: string | null
          tenant_id?: string | null
          tenant_scope?: string | null
          third_party_integrations?: Json | null
          typical_deployment_size?: string | null
          typical_use_cases?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          upgrade_path?: string | null
          vendor_name?: string | null
          version?: string | null
          visibility?: string | null
          webhooks_available?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      _commercial_require_perm: {
        Args: { _perm: string; _tenant_id: string }
        Returns: undefined
      }
      accept_invitation: { Args: { _token: string }; Returns: Json }
      admin_get_user_login_history: {
        Args: { _email?: string; _limit?: number; _user_id: string }
        Returns: {
          action: string
          actor_email: string
          created_at: string
          id: string
          ip_address: string
          traits: Json
        }[]
      }
      admin_user_page_activity: {
        Args: { _days?: number; _limit?: number; _user_id: string }
        Returns: {
          duration_ms: number
          entered_at: string
          id: string
          left_at: string
          page_title: string
          path: string
          referrer_path: string
          session_id: string
          user_agent: string
        }[]
      }
      archive_tenant_role: { Args: { _role_id: string }; Returns: undefined }
      assign_membership_role: {
        Args: { _membership_id: string; _role_id: string }
        Returns: string
      }
      assign_role_permission: {
        Args: { _permission_code: string; _role_id: string }
        Returns: undefined
      }
      audio_admin_create_narrative: {
        Args: {
          _audience?: string
          _call_id: string
          _change_summary?: string
          _default_locale?: string
          _description?: string
          _estimated_duration_seconds?: number
          _module_key: string
          _name: string
          _scope_reference?: string
          _scope_type?: string
          _source_text?: string
          _speech_profile_id?: string
          _speech_text?: string
          _tenant_id: string
          _topic_key: string
        }
        Returns: string
      }
      audio_admin_duplicate_narrative: {
        Args: { _narrative_id: string; _new_call_id: string; _new_name: string }
        Returns: string
      }
      audio_admin_list_narratives: {
        Args: { _tenant_id: string }
        Returns: {
          active_version_id: string
          active_version_no: number
          audience: string
          call_id: string
          default_locale: string
          description: string
          enabled_placement_count: number
          id: string
          module_key: string
          name: string
          owner_name: string
          owner_user_id: string
          placement_count: number
          scope_reference: string
          scope_type: string
          speech_profile_id: string
          speech_profile_name: string
          status: string
          tenant_id: string
          topic_key: string
          updated_at: string
          version_count: number
        }[]
      }
      audio_admin_narrative_audit: {
        Args: { _narrative_id: string }
        Returns: {
          action_code: string
          actor_name: string
          actor_user_id: string
          comment: string
          id: string
          new_status: string
          object_id: string
          object_type: string
          occurred_at: string
          previous_status: string
          version_no: number
        }[]
      }
      audio_admin_set_narrative_status: {
        Args: { _narrative_id: string; _status: string }
        Returns: undefined
      }
      audio_analytics_overview: {
        Args: { _days?: number; _tenant_id: string }
        Returns: Json
      }
      audio_can_manage: {
        Args: { _permission_code: string; _tenant_id: string }
        Returns: boolean
      }
      audio_can_view: { Args: { _tenant_id: string }; Returns: boolean }
      audio_record_event: {
        Args: {
          _audience?: string
          _browser_capability?: string
          _call_id?: string
          _char_count?: number
          _duration_ms?: number
          _error_category?: string
          _error_code?: string
          _event_type: string
          _locale?: string
          _module_key?: string
          _page_key?: string
          _placement_key?: string
          _playback_state?: string
          _section_key?: string
          _version_no?: number
          _voice_name?: string
        }
        Returns: boolean
      }
      audio_resolve_call: {
        Args: { _call_id: string; _placement_key?: string }
        Returns: Json
      }
      audio_variable_registry: {
        Args: { _tenant_id?: string }
        Returns: {
          description: string
          display_format: string
          display_name: string
          is_authorized: boolean
          is_enabled: boolean
          missing_fallback: string
          module_key: string
          required_context: string[]
          required_permission_code: string
          resolver_key: string
          sensitivity: string
          spoken_format: string
          value_type: string
          variable_key: string
        }[]
      }
      audio_version_create_draft_from: {
        Args: { _change_summary?: string; _source_version_id: string }
        Returns: string
      }
      audio_version_transition: {
        Args: { _action: string; _comment?: string; _version_id: string }
        Returns: Json
      }
      begin_iac_vm_execution: {
        Args: { p_package_id: string }
        Returns: {
          action_label: string
          action_type: string
          approval_required: boolean
          created_at: string
          created_by: string
          current_state: Json
          executed_by: string | null
          execution_completed_at: string | null
          execution_message: string | null
          execution_started_at: string | null
          id: string
          package_number: string
          parameters: Json
          policy_evidence: Json
          rationale: string
          region: string
          resource_group: string
          risk_level: string
          risk_score: number
          status: string
          submitted_at: string | null
          subscription_id: string
          target_name: string
          target_resource_id: string
          updated_at: string
          validation_plan: Json
        }
        SetofOptions: {
          from: "*"
          to: "iac_change_packages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      bootstrap_commercial_workspace: { Args: never; Returns: Json }
      bootstrap_tenant_default_roles: {
        Args: { _actor: string; _tenant_id: string }
        Returns: undefined
      }
      cancel_invitation: {
        Args: { _invitation_id: string }
        Returns: undefined
      }
      commercial_assumption_impact: {
        Args: { _code: string }
        Returns: string[]
      }
      commercial_can_write: {
        Args: { _permission_code: string; _tenant_id: string }
        Returns: boolean
      }
      commercial_change_set_apply: {
        Args: { _change_set_id: string }
        Returns: Json
      }
      commercial_change_set_cancel: {
        Args: { _change_set_id: string; _reason: string }
        Returns: undefined
      }
      commercial_change_set_compute_hash: {
        Args: { _change_set_id: string }
        Returns: string
      }
      commercial_change_set_create: {
        Args: {
          _description: string
          _model_version_id: string
          _program_id: string
          _tenant_id: string
          _title: string
        }
        Returns: string
      }
      commercial_change_set_hash: {
        Args: { _change_set_id: string }
        Returns: string
      }
      commercial_change_set_remove_item: {
        Args: { _item_id: string }
        Returns: undefined
      }
      commercial_change_set_upsert_item: {
        Args: {
          _assumption_code: string
          _change_set_id: string
          _proposed_value_numeric: number
          _proposed_value_text: string
          _rationale: string
          _scenario_id: string
        }
        Returns: string
      }
      commercial_change_set_validate: {
        Args: { _change_set_id: string }
        Returns: Json
      }
      commercial_classify_impact: { Args: { _code: string }; Returns: string[] }
      commercial_comparison_archive: {
        Args: { _comparison_id: string }
        Returns: undefined
      }
      commercial_comparison_assumptions: {
        Args: { _comparison_id: string }
        Returns: {
          assumption_code: string
          differs_from_baseline: boolean
          is_baseline: boolean
          label: string
          numeric_value: number
          scenario_id: string
          text_value: string
          unit: string
        }[]
      }
      commercial_comparison_build_manifest: {
        Args: { _comparison_id: string }
        Returns: Json
      }
      commercial_comparison_calculate: {
        Args: { _comparison_id: string }
        Returns: {
          absolute_variance: number
          baseline_run_id: string
          baseline_value: number
          compared_run_id: string
          compared_scenario_id: string
          compared_value: number
          direction_reason: string
          fiscal_period: string
          metric_code: string
          metric_group: string
          percentage_variance: number
          period_sequence: number
          unit: string
          variance_direction: string
        }[]
      }
      commercial_comparison_compute_hash: {
        Args: { _comparison_id: string }
        Returns: string
      }
      commercial_comparison_create: {
        Args: {
          _baseline_scenario_id: string
          _compared_scenario_ids: string[]
          _description?: string
          _included_scopes: string[]
          _mode: string
          _model_version_id: string
          _program_id: string
          _title: string
        }
        Returns: string
      }
      commercial_comparison_list_selectable_runs: {
        Args: {
          _model_version_id: string
          _program_id: string
          _scenario_id: string
          _scope: string
        }
        Returns: {
          completed_at: string
          input_hash: string
          is_latest: boolean
          run_id: string
          run_scope: string
          status: string
        }[]
      }
      commercial_comparison_readiness: {
        Args: { _comparison_id: string }
        Returns: {
          is_missing: boolean
          is_stale: boolean
          latest_apply_at: string
          latest_completed_at: string
          latest_run_id: string
          scenario_id: string
          scope: string
        }[]
      }
      commercial_comparison_save: {
        Args: { _comparison_id: string }
        Returns: Json
      }
      commercial_comparison_update_draft: {
        Args: {
          _baseline_scenario_id?: string
          _compared_scenario_ids?: string[]
          _comparison_id: string
          _description?: string
          _included_scopes?: string[]
          _mode?: string
          _title?: string
        }
        Returns: undefined
      }
      commercial_compute_input_hash: {
        Args: {
          _formula_catalog_version: string
          _inputs: Json
          _model_version_id: string
          _run_scope: string
          _scenario_id: string
        }
        Returns: string
      }
      commercial_is_member_with_view: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      commercial_model_run_complete: {
        Args: { _run_id: string }
        Returns: undefined
      }
      commercial_model_run_fail: {
        Args: { _error_code: string; _error_message: string; _run_id: string }
        Returns: undefined
      }
      commercial_model_run_mark_running: {
        Args: { _run_id: string }
        Returns: undefined
      }
      commercial_model_run_persist_result: {
        Args: {
          _fiscal_period: string
          _formula_code: string
          _is_approximation: boolean
          _lineage: Json
          _metric_code: string
          _metric_group: string
          _period_sequence: number
          _run_id: string
          _unit: string
          _value_numeric: number
          _value_text: string
        }
        Returns: string
      }
      commercial_model_run_persist_results_batch: {
        Args: { _results: Json; _run_id: string }
        Returns: number
      }
      commercial_model_run_start: {
        Args: {
          _model_version_id: string
          _program_id: string
          _run_scope: string
          _scenario_id: string
        }
        Returns: Json
      }
      commercial_model_run_supersede: {
        Args: { _run_id: string; _superseded_by: string }
        Returns: undefined
      }
      commercial_model_version_activate: {
        Args: {
          _certification_id: string
          _model_version_id: string
          _reason: string
        }
        Returns: string
      }
      commercial_model_version_create_successor: {
        Args: {
          _model_version_id: string
          _name?: string
          _version_code: string
        }
        Returns: string
      }
      commercial_program_run_staleness: {
        Args: { _program_id: string }
        Returns: {
          is_stale: boolean
          last_apply_at: string
          latest_completed_at: string
          latest_run_id: string
          run_scope: string
          scenario_id: string
        }[]
      }
      commercial_release_authoritative_runs: {
        Args: { _model_version_id: string; _program_id: string }
        Returns: {
          completed_at: string
          input_count: number
          input_hash: string
          result_count: number
          run_id: string
          run_scope: string
          scenario_id: string
          supersedes_run_id: string
        }[]
      }
      commercial_release_build_manifest: {
        Args: { _model_version_id: string }
        Returns: Json
      }
      commercial_release_certification_certify: {
        Args: { _certification_id: string; _note?: string }
        Returns: string
      }
      commercial_release_certification_create: {
        Args: { _model_version_id: string; _notes?: string }
        Returns: string
      }
      commercial_release_certification_invalidate: {
        Args: { _certification_id: string; _reason: string }
        Returns: string
      }
      commercial_release_certification_refresh: {
        Args: { _certification_id: string }
        Returns: string
      }
      commercial_release_hash: { Args: { _payload: Json }; Returns: string }
      commercial_release_readiness: {
        Args: { _model_version_id: string }
        Returns: {
          actual_value: string
          blocking: boolean
          category: string
          control_code: string
          evidence_reference: string
          expected_value: string
          label: string
          object_id: string
          object_type: string
          remediation_hint: string
          severity: string
          status: string
        }[]
      }
      commercial_release_readiness_snapshot: {
        Args: { _model_version_id: string }
        Returns: Json
      }
      commercial_sensitivity_archive: {
        Args: { _experiment_id: string }
        Returns: undefined
      }
      commercial_sensitivity_build_manifest: {
        Args: { _experiment_id: string }
        Returns: Json
      }
      commercial_sensitivity_compute_hash: {
        Args: { _experiment_id: string }
        Returns: string
      }
      commercial_sensitivity_create: {
        Args: {
          _assumption_code: string
          _baseline_scenario_id: string
          _description?: string
          _included_scopes: string[]
          _model_version_id: string
          _perturbation_config: Json
          _perturbation_strategy: string
          _program_id: string
          _title: string
        }
        Returns: string
      }
      commercial_sensitivity_fail: {
        Args: {
          _error_code: string
          _error_message: string
          _experiment_id: string
        }
        Returns: undefined
      }
      commercial_sensitivity_finalize: {
        Args: { _experiment_id: string }
        Returns: Json
      }
      commercial_sensitivity_list_baseline_runs: {
        Args: {
          _model_version_id: string
          _program_id: string
          _scenario_id: string
          _scopes: string[]
        }
        Returns: {
          completed_at: string
          input_hash: string
          run_id: string
          scope: string
        }[]
      }
      commercial_sensitivity_readiness: {
        Args: { _experiment_id: string }
        Returns: {
          is_missing: boolean
          is_stale: boolean
          latest_completed_at: string
          latest_run_id: string
          scope: string
        }[]
      }
      commercial_sensitivity_record_perturbation_run: {
        Args: {
          _input_hash: string
          _perturbation_id: string
          _results: Json
          _run_scope: string
          _runtime_fingerprint: string
        }
        Returns: string
      }
      commercial_sensitivity_reset_to_draft: {
        Args: { _experiment_id: string; _reason?: string }
        Returns: {
          experiment_id: string
          perturbations_removed: number
          reset_at: string
          status: string
        }[]
      }
      commercial_sensitivity_start_execution: {
        Args: { _experiment_id: string; _perturbations: Json }
        Returns: Json
      }
      commercial_sensitivity_update_draft: {
        Args: {
          _description: string
          _experiment_id: string
          _included_scopes: string[]
          _perturbation_config: Json
          _perturbation_strategy: string
          _title: string
        }
        Returns: undefined
      }
      commercial_snapshot_scenario_assumptions: {
        Args: { _scenario_id: string }
        Returns: Json
      }
      complete_iac_vm_execution: {
        Args: { p_message: string; p_package_id: string; p_success: boolean }
        Returns: {
          action_label: string
          action_type: string
          approval_required: boolean
          created_at: string
          created_by: string
          current_state: Json
          executed_by: string | null
          execution_completed_at: string | null
          execution_message: string | null
          execution_started_at: string | null
          id: string
          package_number: string
          parameters: Json
          policy_evidence: Json
          rationale: string
          region: string
          resource_group: string
          risk_level: string
          risk_score: number
          status: string
          submitted_at: string | null
          subscription_id: string
          target_name: string
          target_resource_id: string
          updated_at: string
          validation_plan: Json
        }
        SetofOptions: {
          from: "*"
          to: "iac_change_packages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      count_active_tenant_admins: {
        Args: { _exclude_membership?: string; _tenant_id: string }
        Returns: number
      }
      create_tenant_role: {
        Args: {
          _code: string
          _description?: string
          _name: string
          _tenant_id: string
        }
        Returns: string
      }
      emit_audit_event: {
        Args: {
          _action_code: string
          _after?: Json
          _before?: Json
          _metadata?: Json
          _object_id: string
          _object_type: string
          _reason?: string
          _tenant_id: string
        }
        Returns: string
      }
      etdm_auto_build_domains: {
        Args: { _master_domain_ids: string[]; _technology_id: string }
        Returns: Json
      }
      etdm_clone_domain: {
        Args: { _source_id: string }
        Returns: {
          approval_status: Database["public"]["Enums"]["etdm_domain_approval"]
          business_criticality: Database["public"]["Enums"]["etdm_domain_criticality"]
          business_purpose: string | null
          cloned_from_domain_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          display_order: number
          domain_display_name: string
          effective_date: string | null
          expiration_date: string | null
          external_reference_id: string | null
          governance_notes: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          lifecycle_status: Database["public"]["Enums"]["etdm_domain_lifecycle"]
          master_domain_id: string
          published_version: number
          review_date: string | null
          scope_summary: string | null
          short_name: string | null
          slug: string
          source_of_record: string | null
          tags: string[]
          technology_id: string
          tenant_id: string | null
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "etdm_domains"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      etdm_clone_technology: {
        Args: { _source_id: string }
        Returns: {
          agent_required: boolean | null
          agentless_supported: boolean | null
          ai_maturity_score: number | null
          ai_opportunity_summary: string | null
          ai_playbooks_available: boolean | null
          ai_ready: boolean | null
          api_available: boolean | null
          approval_status: string
          assessed_by_id: string | null
          audit_logging_supported: boolean | null
          authentication_methods: string[] | null
          authentication_types: string[] | null
          authorization_model: string | null
          automation_integrations: Json | null
          automation_maturity_score: number | null
          automation_opportunity_summary: string | null
          automation_ready: boolean | null
          automations_available: boolean | null
          available_automation_interfaces: Json | null
          backup_supported: boolean | null
          banner_image_url: string | null
          business_criticality: string | null
          business_impact_if_unavailable: string | null
          business_outcome_summary: string | null
          business_owner_id: string | null
          business_purpose: string | null
          category: string | null
          cli_available: boolean | null
          cloned_from_technology_id: string | null
          clustering_supported: boolean | null
          color_theme: string | null
          community_url: string | null
          compliance_standards: string[] | null
          created_at: string
          created_by: string | null
          data_classification: string | null
          data_integrations: Json | null
          data_owner_id: string | null
          data_residency_requirements: string | null
          deleted_at: string | null
          deleted_by: string | null
          deployment_models: string[] | null
          description: string | null
          digital_coworkers_available: boolean | null
          digital_twin_readiness_score: number | null
          disaster_recovery_supported: boolean | null
          documentation_completeness_percentage: number | null
          documentation_url: string | null
          edition: string | null
          effective_date: string | null
          encryption_at_rest: boolean | null
          encryption_in_transit: boolean | null
          end_of_extended_support_date: string | null
          end_of_life_date: string | null
          end_of_mainstream_support_date: string | null
          end_of_sale_date: string | null
          engineering_owner_id: string | null
          escalation_group: string | null
          expiration_date: string | null
          external_reference_id: string | null
          general_availability_date: string | null
          governance_notes: string | null
          graphql_available: boolean | null
          high_availability_supported: boolean | null
          id: string
          infrastructure_as_code_supported: boolean | null
          integration_notes: string | null
          is_active: boolean
          is_deleted: boolean
          is_sample: boolean
          itsm_integrations: Json | null
          knowledge_articles_available: boolean | null
          known_security_considerations: string | null
          last_assessment_date: string | null
          licensing_model: string | null
          lifecycle_notes: string | null
          lifecycle_status: string | null
          mfa_supported: boolean | null
          monitoring_integrations: Json | null
          multi_region_supported: boolean | null
          native_integrations: Json | null
          neurealm_practice: string | null
          operational_maturity_score: number | null
          operations_owner_id: string | null
          overall_maturity_notes: string | null
          powershell_available: boolean | null
          primary_domain: string | null
          product_family: string | null
          product_name: string | null
          product_website_url: string | null
          published_version: number
          rbac_supported: boolean | null
          record_steward_id: string | null
          replacement_technology_id: string | null
          required_security_controls: Json | null
          rest_api_available: boolean | null
          review_date: string | null
          runbooks_available: boolean | null
          scalability_model: string | null
          sdk_available: boolean | null
          secondary_domains: string[] | null
          security_certifications: string[] | null
          security_maturity_score: number | null
          security_owner_id: string | null
          short_name: string | null
          siem_integrations: Json | null
          slug: string
          sop_library_available: boolean | null
          source_of_record: string | null
          strategic_importance: string | null
          support_contract_reference: string | null
          support_group: string | null
          support_readiness_score: number | null
          support_url: string | null
          supported_architectures: string[] | null
          supported_business_services: Json | null
          supported_cloud_providers: string[] | null
          supported_databases: string[] | null
          supported_hypervisors: string[] | null
          supported_industries: string[] | null
          supported_operating_systems: string[] | null
          tags: string[] | null
          target_audiences: string[] | null
          technical_limitations: string | null
          technical_prerequisites: string | null
          technology_icon_url: string | null
          technology_image_crop_metadata: Json | null
          technology_image_height: number | null
          technology_image_last_updated: string | null
          technology_image_last_updated_by: string | null
          technology_image_original_filename: string | null
          technology_image_scale: number | null
          technology_image_storage_path: string | null
          technology_image_type: string | null
          technology_image_url: string | null
          technology_image_width: number | null
          technology_maturity: string | null
          technology_name: string
          technology_owner_id: string | null
          technology_tower: string | null
          technology_type: string | null
          tenant_id: string | null
          tenant_scope: string | null
          third_party_integrations: Json | null
          typical_deployment_size: string | null
          typical_use_cases: Json | null
          updated_at: string
          updated_by: string | null
          upgrade_path: string | null
          vendor_name: string | null
          version: string | null
          visibility: string
          webhooks_available: boolean | null
        }
        SetofOptions: {
          from: "*"
          to: "etdm_technologies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      etdm_reorder_domains: {
        Args: { _ordered_ids: string[]; _technology_id: string }
        Returns: undefined
      }
      get_current_access_context: {
        Args: { _tenant_id?: string }
        Returns: Json
      }
      get_platform_home_summary: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      has_permission: {
        Args: { _permission_code: string; _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_member: {
        Args: {
          _email: string
          _expires_in_days?: number
          _role_codes?: string[]
          _tenant_id: string
        }
        Returns: Json
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
      is_valid_timezone: { Args: { _tz: string }; Returns: boolean }
      list_audit_events: {
        Args: {
          p_action?: string
          p_actor?: string
          p_from?: string
          p_limit?: number
          p_object_type?: string
          p_offset?: number
          p_search?: string
          p_tenant_id: string
          p_to?: string
        }
        Returns: {
          action_code: string
          actor_email: string
          actor_user_id: string
          after_values: Json
          before_values: Json
          correlation_id: string
          event_id: string
          object_id: string
          object_type: string
          occurred_at: string
          reason: string
          source: string
          total_count: number
        }[]
      }
      list_authorized_tenants: {
        Args: never
        Returns: {
          default_currency_code: string
          default_timezone: string
          membership_status: string
          name: string
          platform_admin: boolean
          slug: string
          status: string
          tenant_id: string
        }[]
      }
      list_tenant_invitations: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_tenant_id: string
        }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          invitation_id: string
          invited_by: string
          roles: Json
          status: string
          total_count: number
        }[]
      }
      list_tenant_members: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
          p_tenant_id: string
        }
        Returns: {
          display_name: string
          email: string
          joined_at: string
          last_active_at: string
          membership_id: string
          roles: Json
          status: string
          total_count: number
          user_id: string
        }[]
      }
      list_tenant_roles: {
        Args: { p_include_archived?: boolean; p_tenant_id: string }
        Returns: {
          code: string
          description: string
          is_system_protected: boolean
          member_count: number
          name: string
          permission_codes: string[]
          role_id: string
          status: string
        }[]
      }
      normalize_slug: { Args: { _s: string }; Returns: string }
      provision_tenant: {
        Args: {
          _admin_user_id: string
          _currency?: string
          _name: string
          _slug: string
          _timezone?: string
        }
        Returns: Json
      }
      record_user_login_event: {
        Args: {
          _action?: string
          _email?: string
          _ip_address?: string
          _login_method?: string
          _source?: string
          _traits?: Json
          _user_agent?: string
          _user_id: string
        }
        Returns: string
      }
      remove_membership_role: {
        Args: { _membership_id: string; _role_id: string }
        Returns: undefined
      }
      remove_role_permission: {
        Args: { _permission_code: string; _role_id: string }
        Returns: undefined
      }
      resend_invitation: {
        Args: { _expires_in_days?: number; _invitation_id: string }
        Returns: Json
      }
      review_iac_change_package: {
        Args: { p_comment?: string; p_decision: string; p_package_id: string }
        Returns: {
          comment: string | null
          decision: string
          id: string
          package_id: string
          reviewed_at: string
          reviewed_by: string
        }
        SetofOptions: {
          from: "*"
          to: "iac_change_package_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      runops_advance_scenario: {
        Args: { _actor: string; _scenario_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          external_id: string
          id: string
          metadata: Json
          name: string
          source_system: string
          stage_index: number
          stages: Json
          tenant_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "runops_scenario_instances"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      runops_approve_change: {
        Args: { _actor: string; _change_id: string }
        Returns: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          deployed_at: string
          external_id: string
          id: string
          linked_incident_id: string | null
          metadata: Json
          requested_by: string | null
          risk: Database["public"]["Enums"]["runops_risk"]
          service_id: string | null
          source_system: string
          state: Database["public"]["Enums"]["runops_change_state"]
          tenant_id: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "runops_changes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      runops_approve_execution: {
        Args: { _actor: string; _approval_id: string }
        Returns: Json
      }
      runops_bootstrap_current_user: { Args: never; Returns: Json }
      runops_can_write: { Args: { _tenant_id: string }; Returns: boolean }
      runops_certify_runbook_version: {
        Args: { _actor: string; _version_id: string }
        Returns: Json
      }
      runops_deny_execution: {
        Args: { _actor: string; _approval_id: string; _reason: string }
        Returns: Json
      }
      runops_has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["runops_role"][]
          _tenant_id: string
        }
        Returns: boolean
      }
      runops_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["runops_role"]
          _tenant_id: string
        }
        Returns: boolean
      }
      runops_has_tenant_access: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      runops_reset_scenario: {
        Args: { _actor: string; _scenario_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          data_freshness: string
          description: string | null
          external_id: string
          id: string
          metadata: Json
          name: string
          source_system: string
          stage_index: number
          stages: Json
          tenant_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "runops_scenario_instances"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      runops_resolve_incident: {
        Args: { _actor: string; _incident_id: string }
        Returns: {
          closed_at: string | null
          commander_user_id: string | null
          commander_worker_id: string | null
          created_at: string
          created_by: string | null
          data_freshness: string
          external_id: string
          findings: Json
          id: string
          metadata: Json
          opened_at: string
          service_id: string | null
          severity: Database["public"]["Enums"]["runops_severity"]
          source_system: string
          state: Database["public"]["Enums"]["runops_incident_state"]
          summary: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "runops_incidents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      seed_project_momentous_foundation: { Args: never; Returns: Json }
      seed_project_momentous_scenarios: { Args: never; Returns: Json }
      seed_user_defaults: {
        Args: { _email: string; _user_id: string }
        Returns: undefined
      }
      set_membership_status: {
        Args: {
          _membership_id: string
          _reason?: string
          _status: Database["public"]["Enums"]["membership_status"]
        }
        Returns: Json
      }
      update_tenant: {
        Args: {
          p_default_currency_code: string
          p_default_timezone: string
          p_name: string
          p_slug: string
          p_tenant_id: string
        }
        Returns: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          default_currency_code: string
          default_timezone: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_tenant_role: {
        Args: { _description: string; _name: string; _role_id: string }
        Returns: undefined
      }
    }
    Enums: {
      answer_status:
        | "Not Started"
        | "In Progress"
        | "Answered"
        | "Needs Follow Up"
        | "Needs Evidence"
        | "Validated"
        | "Deferred"
        | "Not Applicable"
      app_role: "platform_admin" | "platform_support"
      etdm_domain_approval:
        | "Draft"
        | "In Review"
        | "Approved"
        | "Rejected"
        | "Retired"
      etdm_domain_criticality:
        | "Mission Critical"
        | "Business Critical"
        | "Important"
        | "Standard"
        | "Noncritical"
      etdm_domain_lifecycle:
        | "Emerging"
        | "Evaluation"
        | "Strategic"
        | "Active"
        | "Maintenance"
        | "Legacy"
        | "Deprecated"
        | "End of Support"
        | "Retired"
      invitation_status: "pending" | "accepted" | "expired" | "cancelled"
      membership_status: "invited" | "active" | "suspended" | "deactivated"
      runops_approval_state:
        | "Pending"
        | "Approved"
        | "Denied"
        | "Expired"
        | "Revoked"
      runops_autonomy:
        | "Documentation Only"
        | "Human Guided"
        | "AI Recommended"
        | "Human Initiated Automation"
        | "Approval Gated Automation"
        | "Supervised Autonomous"
        | "Policy Bounded Autonomous"
      runops_change_state:
        | "Planned"
        | "Approved"
        | "Deploying"
        | "Deployed"
        | "Reverted"
        | "Failed"
      runops_channel:
        | "Status Page"
        | "Email"
        | "Chat"
        | "Executive Brief"
        | "Customer Notice"
      runops_component_kind:
        | "api"
        | "compute"
        | "database"
        | "cache"
        | "queue"
        | "network"
        | "identity"
        | "vendor"
        | "storage"
        | "function"
      runops_env: "Production" | "Staging" | "Development"
      runops_execution_state:
        | "Pending"
        | "Awaiting Approval"
        | "Queued"
        | "Running"
        | "Paused"
        | "Validating"
        | "Rolling Back"
        | "Completed"
        | "Failed"
        | "Cancelled"
      runops_health:
        | "Healthy"
        | "At Risk"
        | "Degraded"
        | "Severely Degraded"
        | "Unavailable"
        | "Recovering"
      runops_incident_state:
        | "Detected"
        | "Triaged"
        | "Declared"
        | "Investigating"
        | "Mitigating"
        | "Monitoring"
        | "Resolved"
        | "Closed"
      runops_policy_outcome: "Allow" | "Require Approval" | "Deny"
      runops_postmortem_state: "Drafting" | "Review" | "Published" | "Archived"
      runops_problem_state:
        | "Open"
        | "Investigating"
        | "Known Error"
        | "Resolved"
        | "Closed"
      runops_risk: "Low" | "Medium" | "High" | "Critical"
      runops_role:
        | "sre_engineer"
        | "noc_operator"
        | "incident_commander"
        | "service_owner"
        | "runbook_author"
        | "change_manager"
        | "digital_worker_administrator"
        | "platform_engineer"
        | "auditor"
        | "executive"
        | "read_only_user"
        | "demo_controller"
      runops_runbook_state:
        | "Draft"
        | "In Review"
        | "Approved"
        | "Certified"
        | "Published"
        | "Deprecated"
        | "Retired"
      runops_severity: "SEV 1" | "SEV 2" | "SEV 3" | "SEV 4"
      runops_step_state:
        | "Pending"
        | "Running"
        | "Skipped"
        | "Succeeded"
        | "Failed"
        | "Compensated"
      runops_tier: "Tier 1" | "Tier 2" | "Tier 3"
      runops_worker_status:
        | "Idle"
        | "Investigating"
        | "Recommending"
        | "Executing"
        | "Validating"
        | "Paused"
        | "Disabled"
      tenant_role_status: "active" | "archived"
      tenant_status: "active" | "suspended" | "archived"
      user_category: "neurealm_employee" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      answer_status: [
        "Not Started",
        "In Progress",
        "Answered",
        "Needs Follow Up",
        "Needs Evidence",
        "Validated",
        "Deferred",
        "Not Applicable",
      ],
      app_role: ["platform_admin", "platform_support"],
      etdm_domain_approval: [
        "Draft",
        "In Review",
        "Approved",
        "Rejected",
        "Retired",
      ],
      etdm_domain_criticality: [
        "Mission Critical",
        "Business Critical",
        "Important",
        "Standard",
        "Noncritical",
      ],
      etdm_domain_lifecycle: [
        "Emerging",
        "Evaluation",
        "Strategic",
        "Active",
        "Maintenance",
        "Legacy",
        "Deprecated",
        "End of Support",
        "Retired",
      ],
      invitation_status: ["pending", "accepted", "expired", "cancelled"],
      membership_status: ["invited", "active", "suspended", "deactivated"],
      runops_approval_state: [
        "Pending",
        "Approved",
        "Denied",
        "Expired",
        "Revoked",
      ],
      runops_autonomy: [
        "Documentation Only",
        "Human Guided",
        "AI Recommended",
        "Human Initiated Automation",
        "Approval Gated Automation",
        "Supervised Autonomous",
        "Policy Bounded Autonomous",
      ],
      runops_change_state: [
        "Planned",
        "Approved",
        "Deploying",
        "Deployed",
        "Reverted",
        "Failed",
      ],
      runops_channel: [
        "Status Page",
        "Email",
        "Chat",
        "Executive Brief",
        "Customer Notice",
      ],
      runops_component_kind: [
        "api",
        "compute",
        "database",
        "cache",
        "queue",
        "network",
        "identity",
        "vendor",
        "storage",
        "function",
      ],
      runops_env: ["Production", "Staging", "Development"],
      runops_execution_state: [
        "Pending",
        "Awaiting Approval",
        "Queued",
        "Running",
        "Paused",
        "Validating",
        "Rolling Back",
        "Completed",
        "Failed",
        "Cancelled",
      ],
      runops_health: [
        "Healthy",
        "At Risk",
        "Degraded",
        "Severely Degraded",
        "Unavailable",
        "Recovering",
      ],
      runops_incident_state: [
        "Detected",
        "Triaged",
        "Declared",
        "Investigating",
        "Mitigating",
        "Monitoring",
        "Resolved",
        "Closed",
      ],
      runops_policy_outcome: ["Allow", "Require Approval", "Deny"],
      runops_postmortem_state: ["Drafting", "Review", "Published", "Archived"],
      runops_problem_state: [
        "Open",
        "Investigating",
        "Known Error",
        "Resolved",
        "Closed",
      ],
      runops_risk: ["Low", "Medium", "High", "Critical"],
      runops_role: [
        "sre_engineer",
        "noc_operator",
        "incident_commander",
        "service_owner",
        "runbook_author",
        "change_manager",
        "digital_worker_administrator",
        "platform_engineer",
        "auditor",
        "executive",
        "read_only_user",
        "demo_controller",
      ],
      runops_runbook_state: [
        "Draft",
        "In Review",
        "Approved",
        "Certified",
        "Published",
        "Deprecated",
        "Retired",
      ],
      runops_severity: ["SEV 1", "SEV 2", "SEV 3", "SEV 4"],
      runops_step_state: [
        "Pending",
        "Running",
        "Skipped",
        "Succeeded",
        "Failed",
        "Compensated",
      ],
      runops_tier: ["Tier 1", "Tier 2", "Tier 3"],
      runops_worker_status: [
        "Idle",
        "Investigating",
        "Recommending",
        "Executing",
        "Validating",
        "Paused",
        "Disabled",
      ],
      tenant_role_status: ["active", "archived"],
      tenant_status: ["active", "suspended", "archived"],
      user_category: ["neurealm_employee", "customer"],
    },
  },
} as const
