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
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version_code: string
        }
        Insert: {
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
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version_code: string
        }
        Update: {
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
      bootstrap_commercial_workspace: { Args: never; Returns: Json }
      bootstrap_tenant_default_roles: {
        Args: { _actor: string; _tenant_id: string }
        Returns: undefined
      }
      cancel_invitation: {
        Args: { _invitation_id: string }
        Returns: undefined
      }
      commercial_can_write: {
        Args: { _permission_code: string; _tenant_id: string }
        Returns: boolean
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
      commercial_snapshot_scenario_assumptions: {
        Args: { _scenario_id: string }
        Returns: Json
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
