export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_number: string | null
          contract_number_type: string
          created_at: string | null
          created_by: string | null
          current_km: string
          customer_address: string | null
          customer_classification: string | null
          customer_date_of_birth: string | null
          customer_id_number: string | null
          customer_id_type: string | null
          customer_license_type: string | null
          customer_name: string | null
          customer_type: string
          daily_rental_rate: number
          documents: Json | null
          documents_count: number | null
          end_date: string
          excess_km_rate: number
          hourly_delay_rate: number
          id: string
          inspector_name: string
          insurance_type: string
          membership_enabled: boolean | null
          payment_method: string
          permitted_daily_km: number
          rental_days: number
          selected_customer_id: string | null
          selected_inspector: string
          selected_vehicle_id: string
          start_date: string
          status: string | null
          tajeer_number: string | null
          total_amount: number
          type: string
          updated_at: string | null
          updated_by: string | null
          vehicle_plate: string
          vehicle_serial_number: string
        }
        Insert: {
          contract_number?: string | null
          contract_number_type: string
          created_at?: string | null
          created_by?: string | null
          current_km: string
          customer_address?: string | null
          customer_classification?: string | null
          customer_date_of_birth?: string | null
          customer_id_number?: string | null
          customer_id_type?: string | null
          customer_license_type?: string | null
          customer_name?: string | null
          customer_type: string
          daily_rental_rate: number
          documents?: Json | null
          documents_count?: number | null
          end_date: string
          excess_km_rate: number
          hourly_delay_rate: number
          id?: string
          inspector_name: string
          insurance_type: string
          membership_enabled?: boolean | null
          payment_method: string
          permitted_daily_km: number
          rental_days: number
          selected_customer_id?: string | null
          selected_inspector: string
          selected_vehicle_id: string
          start_date: string
          status?: string | null
          tajeer_number?: string | null
          total_amount: number
          type: string
          updated_at?: string | null
          updated_by?: string | null
          vehicle_plate: string
          vehicle_serial_number: string
        }
        Update: {
          contract_number?: string | null
          contract_number_type?: string
          created_at?: string | null
          created_by?: string | null
          current_km?: string
          customer_address?: string | null
          customer_classification?: string | null
          customer_date_of_birth?: string | null
          customer_id_number?: string | null
          customer_id_type?: string | null
          customer_license_type?: string | null
          customer_name?: string | null
          customer_type?: string
          daily_rental_rate?: number
          documents?: Json | null
          documents_count?: number | null
          end_date?: string
          excess_km_rate?: number
          hourly_delay_rate?: number
          id?: string
          inspector_name?: string
          insurance_type?: string
          membership_enabled?: boolean | null
          payment_method?: string
          permitted_daily_km?: number
          rental_days?: number
          selected_customer_id?: string | null
          selected_inspector?: string
          selected_vehicle_id?: string
          start_date?: string
          status?: string | null
          tajeer_number?: string | null
          total_amount?: number
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          vehicle_plate?: string
          vehicle_serial_number?: string
        }
        Relationships: []
      }
      customer_branches: {
        Row: {
          address: string | null
          branch_code: string
          branch_name: string
          contact_person: string | null
          created_at: string | null
          customer_id: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          branch_code: string
          branch_name: string
          contact_person?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          branch_code?: string
          branch_name?: string
          contact_person?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_branches_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contracts: {
        Row: {
          contract_number: string
          contract_type: string | null
          created_at: string | null
          customer_id: string | null
          daily_rate: number
          deposit_amount: number | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          contract_number: string
          contract_type?: string | null
          created_at?: string | null
          customer_id?: string | null
          daily_rate: number
          deposit_amount?: number | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          contract_number?: string
          contract_type?: string | null
          created_at?: string | null
          customer_id?: string | null
          daily_rate?: number
          deposit_amount?: number | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          created_at: string | null
          customer_id: string | null
          document_name: string
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          document_name: string
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          document_name?: string
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_finance: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          payment_method: string | null
          reference_number: string | null
          status: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_finance_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_invoices: {
        Row: {
          contract_id: string | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "customer_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_penalties: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          penalty_date: string
          penalty_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          penalty_date: string
          penalty_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          penalty_date?: string
          penalty_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_penalties_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "customer_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_penalties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          classification: string
          created_at: string | null
          date_of_birth: string | null
          id: string
          id_number: string
          id_type: string
          license_type: string
          membership_benefits: string | null
          membership_id: string | null
          membership_points: number | null
          membership_tier: string | null
          membership_valid_until: string | null
          mobile_number: string | null
          name: string
          nationality: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          classification: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          id_number: string
          id_type: string
          license_type: string
          membership_benefits?: string | null
          membership_id?: string | null
          membership_points?: number | null
          membership_tier?: string | null
          membership_valid_until?: string | null
          mobile_number?: string | null
          name: string
          nationality?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          classification?: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          id_number?: string
          id_type?: string
          license_type?: string
          membership_benefits?: string | null
          membership_id?: string | null
          membership_points?: number | null
          membership_tier?: string | null
          membership_valid_until?: string | null
          mobile_number?: string | null
          name?: string
          nationality?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      insurance_options: {
        Row: {
          code: number
          created_at: string
          deductible_premium: number
          id: string
          is_active: boolean | null
          name: string
          rental_increase_percentage: number | null
          rental_increase_type: string
          rental_increase_value: number | null
          updated_at: string
        }
        Insert: {
          code?: number
          created_at?: string
          deductible_premium: number
          id?: string
          is_active?: boolean | null
          name: string
          rental_increase_percentage?: number | null
          rental_increase_type: string
          rental_increase_value?: number | null
          updated_at?: string
        }
        Update: {
          code?: number
          created_at?: string
          deductible_premium?: number
          id?: string
          is_active?: boolean | null
          name?: string
          rental_increase_percentage?: number | null
          rental_increase_type?: string
          rental_increase_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          created_at: string
          deductible_premium: number
          expiry_date: string
          id: string
          is_active: boolean | null
          name: string
          policy_amount: number
          policy_company: string
          policy_number: string
          policy_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deductible_premium: number
          expiry_date: string
          id?: string
          is_active?: boolean | null
          name: string
          policy_amount: number
          policy_company: string
          policy_number: string
          policy_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deductible_premium?: number
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          policy_amount?: number
          policy_company?: string
          policy_number?: string
          policy_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_actual_users: {
        Row: {
          address: string | null
          code: string
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      vehicle_colors: {
        Row: {
          code: number
          created_at: string | null
          created_by: string | null
          description: string | null
          hex_code: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hex_code?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hex_code?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_url: string | null
          id: string
          updated_at: string | null
          uploaded_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_url?: string | null
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_url?: string | null
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_features: {
        Row: {
          code: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      vehicle_inspections: {
        Row: {
          created_at: string | null
          id: string
          inspection_date: string
          inspection_id: string
          inspection_type: string
          inspector: string | null
          status: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inspection_date: string
          inspection_id: string
          inspection_type: string
          inspector?: string | null
          status: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inspection_date?: string
          inspection_id?: string
          inspection_type?: string
          inspector?: string | null
          status?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance_logs: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          invoice_number: string | null
          maintenance_date: string
          maintenance_type: string
          notes: string | null
          supplier: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          maintenance_date: string
          maintenance_type: string
          notes?: string | null
          supplier?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          maintenance_date?: string
          maintenance_type?: string
          notes?: string | null
          supplier?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_makes: {
        Row: {
          code: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          code: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          make_id: string | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          make_id?: string | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          make_id?: string | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_notes: {
        Row: {
          created_at: string | null
          id: string
          note_date: string
          note_text: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_date: string
          note_text: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          note_date?: string
          note_text?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_notes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_oil_changes: {
        Row: {
          created_at: string | null
          id: string
          last_change_date: string | null
          next_change_date: string | null
          oil_change_km: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_change_date?: string | null
          next_change_date?: string | null
          oil_change_km?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_change_date?: string | null
          next_change_date?: string | null
          oil_change_km?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_oil_changes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_owners: {
        Row: {
          address: string | null
          code: string
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      vehicle_penalties: {
        Row: {
          amount: number
          contract_number: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          penalty_date: string
          reason: string
          status: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          amount: number
          contract_number?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          penalty_date: string
          reason: string
          status: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          amount?: number
          contract_number?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          penalty_date?: string
          reason?: string
          status?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_penalties_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_service_logs: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          service_date: string
          service_type: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          service_date: string
          service_type: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          service_date?: string
          service_type?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_service_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_statuses: {
        Row: {
          code: number
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          code?: never
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          code?: never
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      vehicle_warranties: {
        Row: {
          coverage_until_km: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          coverage_until_km?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          coverage_until_km?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_warranties_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          actual_user_id: string | null
          age_range: string | null
          branch: string | null
          car_class: string | null
          color_id: string | null
          created_at: string | null
          daily_excess_km_rate: number | null
          daily_hourly_delay_rate: number | null
          daily_minimum_rate: number | null
          daily_open_km_rate: number | null
          daily_permitted_km: number | null
          daily_rental_rate: number | null
          depreciation_years: number | null
          documents: Json | null
          expected_sale_price: number | null
          features: string | null
          form_license_expiration: string | null
          hourly_excess_km_rate: number | null
          hourly_permitted_km: number | null
          hourly_rental_rate: number | null
          id: string
          insurance_policy_expiration: string | null
          internal_reference: string | null
          lease_amount_increase: number | null
          make_id: string | null
          make_year: string
          mileage: number | null
          model_id: string | null
          monthly_excess_km_rate: number | null
          monthly_hourly_delay_rate: number | null
          monthly_minimum_rate: number | null
          monthly_open_km_rate: number | null
          monthly_permitted_km: number | null
          monthly_rental_rate: number | null
          notes: string | null
          operating_card_expiration: string | null
          owner_id: string | null
          owner_name: string | null
          periodic_inspection_end: string | null
          plate_number: string
          plate_registration_type: string
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string
          status_id: string | null
          updated_at: string | null
          user_id: string | null
          year_of_manufacture: number | null
        }
        Insert: {
          actual_user_id?: string | null
          age_range?: string | null
          branch?: string | null
          car_class?: string | null
          color_id?: string | null
          created_at?: string | null
          daily_excess_km_rate?: number | null
          daily_hourly_delay_rate?: number | null
          daily_minimum_rate?: number | null
          daily_open_km_rate?: number | null
          daily_permitted_km?: number | null
          daily_rental_rate?: number | null
          depreciation_years?: number | null
          documents?: Json | null
          expected_sale_price?: number | null
          features?: string | null
          form_license_expiration?: string | null
          hourly_excess_km_rate?: number | null
          hourly_permitted_km?: number | null
          hourly_rental_rate?: number | null
          id?: string
          insurance_policy_expiration?: string | null
          internal_reference?: string | null
          lease_amount_increase?: number | null
          make_id?: string | null
          make_year: string
          mileage?: number | null
          model_id?: string | null
          monthly_excess_km_rate?: number | null
          monthly_hourly_delay_rate?: number | null
          monthly_minimum_rate?: number | null
          monthly_open_km_rate?: number | null
          monthly_permitted_km?: number | null
          monthly_rental_rate?: number | null
          notes?: string | null
          operating_card_expiration?: string | null
          owner_id?: string | null
          owner_name?: string | null
          periodic_inspection_end?: string | null
          plate_number: string
          plate_registration_type: string
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number: string
          status_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          year_of_manufacture?: number | null
        }
        Update: {
          actual_user_id?: string | null
          age_range?: string | null
          branch?: string | null
          car_class?: string | null
          color_id?: string | null
          created_at?: string | null
          daily_excess_km_rate?: number | null
          daily_hourly_delay_rate?: number | null
          daily_minimum_rate?: number | null
          daily_open_km_rate?: number | null
          daily_permitted_km?: number | null
          daily_rental_rate?: number | null
          depreciation_years?: number | null
          documents?: Json | null
          expected_sale_price?: number | null
          features?: string | null
          form_license_expiration?: string | null
          hourly_excess_km_rate?: number | null
          hourly_permitted_km?: number | null
          hourly_rental_rate?: number | null
          id?: string
          insurance_policy_expiration?: string | null
          internal_reference?: string | null
          lease_amount_increase?: number | null
          make_id?: string | null
          make_year?: string
          mileage?: number | null
          model_id?: string | null
          monthly_excess_km_rate?: number | null
          monthly_hourly_delay_rate?: number | null
          monthly_minimum_rate?: number | null
          monthly_open_km_rate?: number | null
          monthly_permitted_km?: number | null
          monthly_rental_rate?: number | null
          notes?: string | null
          operating_card_expiration?: string | null
          owner_id?: string | null
          owner_name?: string | null
          periodic_inspection_end?: string | null
          plate_number?: string
          plate_registration_type?: string
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string
          status_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          year_of_manufacture?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_actual_user_id_fkey"
            columns: ["actual_user_id"]
            isOneToOne: false
            referencedRelation: "vehicle_actual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "vehicle_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vehicle_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "vehicle_statuses"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const

