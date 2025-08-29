import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          trip_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      riding_dates: {
        Row: {
          id: string
          trip_id: string
          date: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          date: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          date?: string
          description?: string | null
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          voter_name: string
          trip_id: string
          destination_id: string | null
          date_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          voter_name: string
          trip_id: string
          destination_id?: string | null
          date_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          voter_name?: string
          trip_id?: string
          destination_id?: string | null
          date_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
