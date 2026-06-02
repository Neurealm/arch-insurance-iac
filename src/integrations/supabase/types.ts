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
        Relationships: [
          {
            foreignKeyName: "crm_companies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          location: string | null
          phone: string | null
          preferred_language: string | null
          time_zone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          phone?: string | null
          preferred_language?: string | null
          time_zone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          phone?: string | null
          preferred_language?: string | null
          time_zone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      tenant_agent_assignments: {
        Row: {
          agent_id: string
          created_at: string
          enabled: boolean
          id: string
          tenant_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          tenant_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_agent_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_incidents: {
        Row: {
          created_at: string
          created_by: string | null
          external_id: string | null
          id: string
          incident_number: string | null
          mttr_minutes: number | null
          opened_at: string
          owner: string | null
          raw: Json
          resolved_at: string | null
          service: string | null
          severity: string
          source: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          id?: string
          incident_number?: string | null
          mttr_minutes?: number | null
          opened_at?: string
          owner?: string | null
          raw?: Json
          resolved_at?: string | null
          service?: string | null
          severity?: string
          source?: string
          status?: string
          tenant_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          id?: string
          incident_number?: string | null
          mttr_minutes?: number | null
          opened_at?: string
          owner?: string | null
          raw?: Json
          resolved_at?: string | null
          service?: string | null
          severity?: string
          source?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_integrations: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          integration_id: string
          settings: Json
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          integration_id: string
          settings?: Json
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          integration_id?: string
          settings?: Json
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_memberships: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_tool_assignments: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          tenant_id: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          tenant_id: string
          tool_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          tenant_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_tool_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_tool_assignments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          data_mode: string
          db_connection_id: string | null
          id: string
          logo_url: string | null
          name: string
          primary_admin_email: string | null
          slug: string
          source_company_id: string | null
          status: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_mode?: string
          db_connection_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_admin_email?: string | null
          slug: string
          source_company_id?: string | null
          status?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_mode?: string
          db_connection_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_admin_email?: string | null
          slug?: string
          source_company_id?: string | null
          status?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_source_company_id_fkey"
            columns: ["source_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
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
      user_agent_assignments: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_agent_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      user_tool_assignments: {
        Row: {
          created_at: string
          id: string
          tenant_id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tenant_id: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tenant_id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tool_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tool_assignments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_catalog"
            referencedColumns: ["id"]
          },
        ]
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
      has_tenant_role: {
        Args: {
          _role: Database["public"]["Enums"]["tenant_role"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "platform_admin" | "platform_support"
      tenant_role: "tenant_admin" | "tenant_manager" | "tenant_member"
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
      app_role: ["platform_admin", "platform_support"],
      tenant_role: ["tenant_admin", "tenant_manager", "tenant_member"],
    },
  },
} as const
