import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isUrlValid = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))

if (!isUrlValid) {
  console.error('ERRO: VITE_SUPABASE_URL inválida ou mal formatada! Ela deve começar com http:// ou https://')
}

export const supabase = isUrlValid 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Helper to get current company from user profile
 */
export async function getCurrentCompany() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, companies(*)')
    .eq('id', user.id)
    .single()

  return profile?.companies || null
}
