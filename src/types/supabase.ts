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
      inventory: {
        Row: {
          id: string
          job_name: string
          job_number: string
          manufacturer_order_number: string
          item_type: 'windows' | 'siding' | 'security-doors' | 'entry-doors' | 'other'
          quantity: number
          notes: string | null
          date_added: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_name: string
          job_number: string
          manufacturer_order_number: string
          item_type: 'windows' | 'siding' | 'security-doors' | 'entry-doors' | 'other'
          quantity?: number
          notes?: string | null
          date_added?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_name?: string
          job_number?: string
          manufacturer_order_number?: string
          item_type?: 'windows' | 'siding' | 'security-doors' | 'entry-doors' | 'other'
          quantity?: number
          notes?: string | null
          date_added?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table definitions as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      item_type: 'windows' | 'siding' | 'security-doors' | 'entry-doors' | 'other'
      material_status: 'needed' | 'ordered' | 'received'
      task_status: 'pending' | 'in-progress' | 'completed'
      priority_level: 'low' | 'medium' | 'high'
    }
  }
}