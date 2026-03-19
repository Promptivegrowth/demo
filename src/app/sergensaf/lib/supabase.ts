import { createClient } from '@supabase/supabase-js'

// El prompt solicita guardar las credenciales como constantes reutilizables
// Para un entorno real de producción deben venir de variables de entorno.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto-supabase.supabase.co'
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-anon-key-aqui'

// Instancia global reutilizable en todo el módulo
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
