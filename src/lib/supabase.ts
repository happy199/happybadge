import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client pour les composants côté client
export const createClientComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Client pour les composants côté serveur
export const createServerComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

