import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export interface CloudGraph {
  id: string
  name: string
  description: string
  data: object
  is_public: boolean
  share_token: string
  created_at: string
  updated_at: string
}