import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase

export interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  company?: string
  project_type?: string
  timestamp: string
  created_at: string
}

export interface AuthToken {
  id: number
  service: string
  token: string
  refresh_token?: string
  expires_at?: string
  created_at: string
}

export interface RepositorySettings {
  id: number
  hidden_repos: string[]
  featured_repos: string[]
  updated_at: string
}

export interface ActivitySettings {
  id: number
  show_discord: boolean
  show_spotify: boolean
  show_general: boolean
  updated_at: string
}