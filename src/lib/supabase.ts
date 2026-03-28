import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export async function signIn(email: string, password: string) {
    let lastError = null;

    // Implementación de Re-intentos (Retry Logic) para manejar "Lock broken"
    for (let i = 0; i < 3; i++) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                // Si es un error de bloqueo de recursos, reinteramos con delay
                if (error.message.includes('Lock broken') || error.message.includes('AbortError')) {
                    lastError = error;
                    await new Promise(r => setTimeout(r, 500 * (i + 1)));
                    continue;
                }
                return { data, error };
            }
            return { data, error: null };
        } catch (err: any) {
            lastError = err;
            await new Promise(r => setTimeout(r, 500 * (i + 1)));
        }
    }
    return { data: null, error: lastError };
}

export async function signOut() {
    try {
        // Limpiamos también el storage local por si acaso hay locks corruptos
        if (typeof window !== 'undefined') {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.includes('supabase.auth.token') || key.includes('sb-')) {
                    localStorage.removeItem(key);
                }
            }
        }
    } catch (e) { }

    return await supabase.auth.signOut();
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

    // Attempt 1: Database fetch
    let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

    // Attempt 2: Auto-repair for demo users (RLS Fix)
    if ((!data || !data.org_id) && (user.email?.endsWith('@promptive.pe') || user.email?.includes('sergensaf.com'))) {
        console.log('[SUPABASE] Auto-repairing session context for demo user')
        const { data: orgData } = await supabase.from('organizations').select('id').limit(1).maybeSingle()
        if (orgData) {
            return {
                ...data,
                id: user.id,
                email: user.email,
                full_name: data?.full_name || user.user_metadata?.full_name || 'Usuario Demo',
                role: data?.role || 'admin',
                org_id: orgData.id // Ensure RLS passes
            }
        }
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
