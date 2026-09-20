import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://tuguxuxhdmnxkpzjwjga.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Z3V4dXhoZG1ueGtwemp3amdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTM4NjUsImV4cCI6MjA5OTA2OTg2NX0.yPBjLavsZXdZK2WS2JsB9j06RsUH6C0cQGgmOZ4aETk'

const url = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY

let client: SupabaseClient
try {
  client = createClient(url, key)
} catch {
  client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY)
}

export const supabase = client
