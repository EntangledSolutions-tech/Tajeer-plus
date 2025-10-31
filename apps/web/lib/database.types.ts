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
    PostgrestVersion: "13.0.4"
  }
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
      branches: {
        Row: {
          address: string | null
          branch_license_number: string | null
          city_region: string | null
          code: string
          commercial_registration_number: string | null
          created_at: string | null
          email: string | null
          has_cars_and_employees: boolean | null
          has_no_cars: boolean | null
          has_shift_system_support: boolean | null
          id: string
          is_active: boolean | null
          is_limousine_office: boolean | null
          is_maintenance_center: boolean | null
          is_rental_office: boolean | null
          manager_name: string | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          branch_license_number?: string | null
          city_region?: string | null
          code: string
          commercial_registration_number?: string | null
          created_at?: string | null
          email?: string | null
          has_cars_and_employees?: boolean | null
          has_no_cars?: boolean | null
          has_shift_system_support?: boolean | null
          id?: string
          is_active?: boolean | null
          is_limousine_office?: boolean | null
          is_maintenance_center?: boolean | null
          is_rental_office?: boolean | null
          manager_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          branch_license_number?: string | null
          city_region?: string | null
          code?: string
          commercial_registration_number?: string | null
          created_at?: string | null
          email?: string | null
          has_cars_and_employees?: boolean | null
          has_no_cars?: boolean | null
          has_shift_system_support?: boolean | null
          id?: string
          is_active?: boolean | null
          is_limousine_office?: boolean | null
          is_maintenance_center?: boolean | null
          is_rental_office?: boolean | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      contract_add_ons: {
        Row: {
          amount: number
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
          amount: number
          code?: number
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
          amount?: number
          code?: number
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
      contract_statuses: {
        Row: {
          code: number
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          add_ons: Json | null
          branch_id: string | null
          contract_number: string | null
          contract_number_type: string | null
          created_at: string | null
          current_km: string
          customer_address: string | null
          customer_classification: string | null
          customer_date_of_birth: string | null
          customer_id_number: string | null
          customer_id_type: string | null
          customer_license_type: string | null
          customer_mobile: string | null
          customer_name: string | null
          customer_nationality: string | null
          customer_status_id: string | null
          daily_rental_rate: number
          deposit: number
          documents: Json | null
          documents_count: number | null
          duration_in_days: number | null
          duration_type: string | null
          end_date: string
          excess_km_rate: number
          hold_comments: string | null
          hold_date: string | null
          hold_reason: string | null
          hourly_delay_rate: number
          id: string
          inspector_name: string
          insurance_type: string | null
          membership_enabled: boolean | null
          payment_method: string
          permitted_daily_km: number
          rental_days: number
          selected_customer_id: string | null
          selected_inspector: string
          selected_vehicle_id: string
          start_date: string
          status_id: string | null
          tajeer_number: string | null
          total_amount: number
          total_fees: number | null
          type: string | null
          updated_at: string | null
          user_id: string
          vehicle_color: string | null
          vehicle_daily_rent_rate: number | null
          vehicle_excess_km_rate: number | null
          vehicle_hourly_delay_rate: number | null
          vehicle_make: string | null
          vehicle_make_year: string | null
          vehicle_mileage: number | null
          vehicle_model: string | null
          vehicle_permitted_daily_km: number | null
          vehicle_plate: string
          vehicle_plate_registration_type: string | null
          vehicle_serial_number: string
          vehicle_status: string | null
        }
        Insert: {
          add_ons?: Json | null
          branch_id?: string | null
          contract_number?: string | null
          contract_number_type?: string | null
          created_at?: string | null
          current_km: string
          customer_address?: string | null
          customer_classification?: string | null
          customer_date_of_birth?: string | null
          customer_id_number?: string | null
          customer_id_type?: string | null
          customer_license_type?: string | null
          customer_mobile?: string | null
          customer_name?: string | null
          customer_nationality?: string | null
          customer_status_id?: string | null
          daily_rental_rate: number
          deposit?: number
          documents?: Json | null
          documents_count?: number | null
          duration_in_days?: number | null
          duration_type?: string | null
          end_date: string
          excess_km_rate: number
          hold_comments?: string | null
          hold_date?: string | null
          hold_reason?: string | null
          hourly_delay_rate: number
          id?: string
          inspector_name: string
          insurance_type?: string | null
          membership_enabled?: boolean | null
          payment_method: string
          permitted_daily_km: number
          rental_days: number
          selected_customer_id?: string | null
          selected_inspector: string
          selected_vehicle_id: string
          start_date: string
          status_id?: string | null
          tajeer_number?: string | null
          total_amount: number
          total_fees?: number | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_color?: string | null
          vehicle_daily_rent_rate?: number | null
          vehicle_excess_km_rate?: number | null
          vehicle_hourly_delay_rate?: number | null
          vehicle_make?: string | null
          vehicle_make_year?: string | null
          vehicle_mileage?: number | null
          vehicle_model?: string | null
          vehicle_permitted_daily_km?: number | null
          vehicle_plate: string
          vehicle_plate_registration_type?: string | null
          vehicle_serial_number: string
          vehicle_status?: string | null
        }
        Update: {
          add_ons?: Json | null
          branch_id?: string | null
          contract_number?: string | null
          contract_number_type?: string | null
          created_at?: string | null
          current_km?: string
          customer_address?: string | null
          customer_classification?: string | null
          customer_date_of_birth?: string | null
          customer_id_number?: string | null
          customer_id_type?: string | null
          customer_license_type?: string | null
          customer_mobile?: string | null
          customer_name?: string | null
          customer_nationality?: string | null
          customer_status_id?: string | null
          daily_rental_rate?: number
          deposit?: number
          documents?: Json | null
          documents_count?: number | null
          duration_in_days?: number | null
          duration_type?: string | null
          end_date?: string
          excess_km_rate?: number
          hold_comments?: string | null
          hold_date?: string | null
          hold_reason?: string | null
          hourly_delay_rate?: number
          id?: string
          inspector_name?: string
          insurance_type?: string | null
          membership_enabled?: boolean | null
          payment_method?: string
          permitted_daily_km?: number
          rental_days?: number
          selected_customer_id?: string | null
          selected_inspector?: string
          selected_vehicle_id?: string
          start_date?: string
          status_id?: string | null
          tajeer_number?: string | null
          total_amount?: number
          total_fees?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_color?: string | null
          vehicle_daily_rent_rate?: number | null
          vehicle_excess_km_rate?: number | null
          vehicle_hourly_delay_rate?: number | null
          vehicle_make?: string | null
          vehicle_make_year?: string | null
          vehicle_mileage?: number | null
          vehicle_model?: string | null
          vehicle_permitted_daily_km?: number | null
          vehicle_plate?: string
          vehicle_plate_registration_type?: string | null
          vehicle_serial_number?: string
          vehicle_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_customer_status_id_fkey"
            columns: ["customer_status_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "contract_statuses"
            referencedColumns: ["id"]
          },
        ]
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
      customer_classifications: {
        Row: {
          classification: string
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          classification: string
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          classification?: string
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          file_name: string | null
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
          file_name?: string | null
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
          file_name?: string | null
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
      customer_finance_transactions: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          penalty_reason: string | null
          transaction_category: string
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          penalty_reason?: string | null
          transaction_category: string
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          penalty_reason?: string | null
          transaction_category?: string
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_finance_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_finance_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
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
      customer_license_types: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          license_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_nationalities: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          nationality: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          nationality: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          nationality?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      customer_professions: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          profession: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          profession: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          profession?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_statuses: {
        Row: {
          code: number
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          branch_id: string | null
          classification_id: string
          created_at: string | null
          date_of_birth: string | null
          id: string
          id_number: string
          id_type: string
          license_type_id: string
          membership_benefits: string | null
          membership_id: string | null
          membership_points: number | null
          membership_tier: string | null
          membership_valid_until: string | null
          mobile_number: string | null
          name: string
          nationality_id: string
          status_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          classification_id: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          id_number: string
          id_type: string
          license_type_id: string
          membership_benefits?: string | null
          membership_id?: string | null
          membership_points?: number | null
          membership_tier?: string | null
          membership_valid_until?: string | null
          mobile_number?: string | null
          name: string
          nationality_id: string
          status_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          classification_id?: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          id_number?: string
          id_type?: string
          license_type_id?: string
          membership_benefits?: string | null
          membership_id?: string | null
          membership_points?: number | null
          membership_tier?: string | null
          membership_valid_until?: string | null
          mobile_number?: string | null
          name?: string
          nationality_id?: string
          status_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "customer_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_license_type_id_fkey"
            columns: ["license_type_id"]
            isOneToOne: false
            referencedRelation: "customer_license_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "customer_nationalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_summaries: {
        Row: {
          created_at: string | null
          entity_id: string | null
          fuel_costs: number | null
          id: string
          insurance_costs: number | null
          maintenance_costs: number | null
          net_profit: number | null
          penalty_income: number | null
          rental_income: number | null
          summary_date: string
          summary_type: string
          total_expenses: number | null
          total_revenue: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          fuel_costs?: number | null
          id?: string
          insurance_costs?: number | null
          maintenance_costs?: number | null
          net_profit?: number | null
          penalty_income?: number | null
          rental_income?: number | null
          summary_date: string
          summary_type: string
          total_expenses?: number | null
          total_revenue?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          fuel_costs?: number | null
          id?: string
          insurance_costs?: number | null
          maintenance_costs?: number | null
          net_profit?: number | null
          penalty_income?: number | null
          rental_income?: number | null
          summary_date?: string
          summary_type?: string
          total_expenses?: number | null
          total_revenue?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_transaction_types: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          branch_id: string | null
          contract_id: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          description: string | null
          employee_name: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          net_invoice: number
          payment_type: string | null
          remaining_amount: number | null
          status: string | null
          total_amount: number
          total_discount: number | null
          total_paid: number | null
          transaction_date: string
          transaction_number: string
          transaction_type_id: string
          updated_at: string | null
          user_id: string
          vat_amount: number | null
          vat_included: boolean | null
          vat_rate: number | null
          vehicle_id: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          employee_name?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          net_invoice: number
          payment_type?: string | null
          remaining_amount?: number | null
          status?: string | null
          total_amount: number
          total_discount?: number | null
          total_paid?: number | null
          transaction_date: string
          transaction_number: string
          transaction_type_id: string
          updated_at?: string | null
          user_id: string
          vat_amount?: number | null
          vat_included?: boolean | null
          vat_rate?: number | null
          vehicle_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          employee_name?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          net_invoice?: number
          payment_type?: string | null
          remaining_amount?: number | null
          status?: string | null
          total_amount?: number
          total_discount?: number | null
          total_paid?: number | null
          transaction_date?: string
          transaction_number?: string
          transaction_type_id?: string
          updated_at?: string | null
          user_id?: string
          vat_amount?: number | null
          vat_included?: boolean | null
          vat_rate?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "finance_transaction_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          first_name: string
          id: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_expenses: {
        Row: {
          created_at: string | null
          expense_type: string
          id: string
          receipt_date: string | null
          receipt_number: string | null
          transaction_id: string
          updated_at: string | null
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          created_at?: string | null
          expense_type: string
          id?: string
          receipt_date?: string | null
          receipt_number?: string | null
          transaction_id: string
          updated_at?: string | null
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          created_at?: string | null
          expense_type?: string
          id?: string
          receipt_date?: string | null
          receipt_number?: string | null
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_expenses_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_income: {
        Row: {
          created_at: string | null
          id: string
          income_type: string
          source: string | null
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          income_type: string
          source?: string | null
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          income_type?: string
          source?: string | null
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_income_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_accidents: {
        Row: {
          accident_date: string
          created_at: string | null
          details: string
          id: string
          log_maintenance_update: boolean | null
          net_invoice: number | null
          statement_type: string | null
          total_amount: number | null
          total_discount: number | null
          total_paid: number | null
          updated_at: string | null
          user_id: string | null
          vat: number | null
          vehicle_id: string | null
        }
        Insert: {
          accident_date: string
          created_at?: string | null
          details: string
          id?: string
          log_maintenance_update?: boolean | null
          net_invoice?: number | null
          statement_type?: string | null
          total_amount?: number | null
          total_discount?: number | null
          total_paid?: number | null
          updated_at?: string | null
          user_id?: string | null
          vat?: number | null
          vehicle_id?: string | null
        }
        Update: {
          accident_date?: string
          created_at?: string | null
          details?: string
          id?: string
          log_maintenance_update?: boolean | null
          net_invoice?: number | null
          statement_type?: string | null
          total_amount?: number | null
          total_discount?: number | null
          total_paid?: number | null
          updated_at?: string | null
          user_id?: string | null
          vat?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_accidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_actual_users: {
        Row: {
          address: string | null
          code: string
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_colors: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          hex_code: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          hex_code?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          hex_code?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_features: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_finance_transactions: {
        Row: {
          accident_description: string | null
          created_at: string | null
          expected_sale_price: number | null
          id: string
          insurance_company: string | null
          lease_amount_increase: number | null
          maintenance_type: string | null
          penalty_date: string | null
          penalty_reason: string | null
          policy_number: string | null
          service_type: string | null
          transaction_category: string
          transaction_id: string
          updated_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          accident_description?: string | null
          created_at?: string | null
          expected_sale_price?: number | null
          id?: string
          insurance_company?: string | null
          lease_amount_increase?: number | null
          maintenance_type?: string | null
          penalty_date?: string | null
          penalty_reason?: string | null
          policy_number?: string | null
          service_type?: string | null
          transaction_category: string
          transaction_id: string
          updated_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          accident_description?: string | null
          created_at?: string | null
          expected_sale_price?: number | null
          id?: string
          insurance_company?: string | null
          lease_amount_increase?: number | null
          maintenance_type?: string | null
          penalty_date?: string | null
          penalty_reason?: string | null
          policy_number?: string | null
          service_type?: string | null
          transaction_category?: string
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_finance_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_finance_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          code: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          make_id: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          make_id?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          make_id?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
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
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: never
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_total_loss: {
        Row: {
          created_at: string | null
          depreciation_date: string
          details: string
          id: string
          insurance_amount: number
          insurance_company: string
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          depreciation_date: string
          details: string
          id?: string
          insurance_amount: number
          insurance_company: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          depreciation_date?: string
          details?: string
          id?: string
          insurance_amount?: number
          insurance_company?: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_total_loss_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_transfers: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          details: string
          from_branch_id: string | null
          from_location: string | null
          id: string
          to_branch_id: string | null
          to_location: string | null
          transfer_date: string
          transfer_type: string
          updated_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          details: string
          from_branch_id?: string | null
          from_location?: string | null
          id?: string
          to_branch_id?: string | null
          to_location?: string | null
          transfer_date?: string
          transfer_type: string
          updated_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          details?: string
          from_branch_id?: string | null
          from_location?: string | null
          id?: string
          to_branch_id?: string | null
          to_location?: string | null
          transfer_date?: string
          transfer_type?: string
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_transfers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
          acquisition_date: string | null
          actual_user_id: string | null
          actual_user_id_number: string | null
          actual_user_name: string | null
          age_range: string | null
          branch: string | null
          branch_id: string | null
          car_class: string | null
          car_pricing: number | null
          chassis_number: string | null
          color_id: string | null
          created_at: string | null
          daily_excess_km_rate: number | null
          daily_hourly_delay_rate: number | null
          daily_minimum_rate: number | null
          daily_open_km_rate: number | null
          daily_permitted_km: number | null
          daily_rental_rate: number | null
          depreciation_rate: number | null
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
          insurance_policy_id: string | null
          insurance_value: number | null
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
          operation_date: string | null
          owner_id: string | null
          periodic_inspection_end: string | null
          plate_number: string
          plate_registration_type: string
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string
          status_id: string | null
          technical_number: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_load_capacity: string | null
          year_of_manufacture: number | null
        }
        Insert: {
          acquisition_date?: string | null
          actual_user_id?: string | null
          actual_user_id_number?: string | null
          actual_user_name?: string | null
          age_range?: string | null
          branch?: string | null
          branch_id?: string | null
          car_class?: string | null
          car_pricing?: number | null
          chassis_number?: string | null
          color_id?: string | null
          created_at?: string | null
          daily_excess_km_rate?: number | null
          daily_hourly_delay_rate?: number | null
          daily_minimum_rate?: number | null
          daily_open_km_rate?: number | null
          daily_permitted_km?: number | null
          daily_rental_rate?: number | null
          depreciation_rate?: number | null
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
          insurance_policy_id?: string | null
          insurance_value?: number | null
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
          operation_date?: string | null
          owner_id?: string | null
          periodic_inspection_end?: string | null
          plate_number: string
          plate_registration_type: string
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number: string
          status_id?: string | null
          technical_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_load_capacity?: string | null
          year_of_manufacture?: number | null
        }
        Update: {
          acquisition_date?: string | null
          actual_user_id?: string | null
          actual_user_id_number?: string | null
          actual_user_name?: string | null
          age_range?: string | null
          branch?: string | null
          branch_id?: string | null
          car_class?: string | null
          car_pricing?: number | null
          chassis_number?: string | null
          color_id?: string | null
          created_at?: string | null
          daily_excess_km_rate?: number | null
          daily_hourly_delay_rate?: number | null
          daily_minimum_rate?: number | null
          daily_open_km_rate?: number | null
          daily_permitted_km?: number | null
          daily_rental_rate?: number | null
          depreciation_rate?: number | null
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
          insurance_policy_id?: string | null
          insurance_value?: number | null
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
          operation_date?: string | null
          owner_id?: string | null
          periodic_inspection_end?: string | null
          plate_number?: string
          plate_registration_type?: string
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string
          status_id?: string | null
          technical_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_load_capacity?: string | null
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
            foreignKeyName: "vehicles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
            foreignKeyName: "vehicles_insurance_policy_id_fkey"
            columns: ["insurance_policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
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
      calculate_net_invoice: {
        Args: {
          total_amount: number
          total_discount?: number
          vat_amount?: number
          vat_included?: boolean
        }
        Returns: number
      }
      calculate_remaining_amount: {
        Args: { net_invoice: number; total_paid?: number }
        Returns: number
      }
      calculate_vat_amount: {
        Args: {
          total_amount: number
          vat_included?: boolean
          vat_rate?: number
        }
        Returns: number
      }
      generate_transaction_number: {
        Args: { transaction_type_code: string }
        Returns: string
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          avatar_url: string
          id: string
          name: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
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
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
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
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
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
