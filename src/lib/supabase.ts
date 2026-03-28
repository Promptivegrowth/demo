import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export async function signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
    return await supabase.auth.signOut()
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getUserProfile() {
    const user = await getUser()
    if (!user) return null

    // Intento 1
    let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

    // Intento 2 con pequeño delay (Buffer de propagación para nuevos usuarios demo)
    if (!data && !error) {
        await new Promise(r => setTimeout(r, 800))
        const retry = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        data = retry.data
    }

    return data
}

export async function createUserAccount(email: string, password: string, fullName: string, role: 'admin' | 'operativo') {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } }
    })
    if (authError) throw authError

    // Create profile
    if (authData.user) {
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            full_name: fullName,
            email,
            role,
            org_id: orgResult.data?.id
        })
        if (profileError) throw profileError
    }

    return authData
}
