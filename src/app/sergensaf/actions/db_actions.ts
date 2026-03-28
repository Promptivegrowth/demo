'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, supabaseServiceRole)

export async function adminUpsert(table: string, data: any) {
    try {
        const { data: res, error } = await adminClient.from(table).upsert(data)
        if (error) throw error
        return { success: true, data: res }
    } catch (err: any) {
        console.error(`Error in adminUpsert (${table}):`, err)
        return { success: false, error: err.message }
    }
}

export async function adminInsert(table: string, data: any) {
    try {
        const { data: res, error } = await adminClient.from(table).insert(data)
        if (error) throw error
        return { success: true, data: res }
    } catch (err: any) {
        console.error(`Error in adminInsert (${table}):`, err)
        return { success: false, error: err.message }
    }
}

export async function adminUpdate(table: string, data: any, eqField: string, eqValue: any) {
    try {
        const { data: res, error } = await adminClient.from(table).update(data).eq(eqField, eqValue)
        if (error) throw error
        return { success: true, data: res }
    } catch (err: any) {
        console.error(`Error in adminUpdate (${table}):`, err)
        return { success: false, error: err.message }
    }
}

export async function ensureConfirmedDemoUser(email: string, password: string, fullName: string) {
    try {
        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
        if (listError) throw listError

        let user = users.find(u => u.email === email)

        if (!user) {
            const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName, role: 'admin' }
            })
            if (createError) throw createError
            user = createData.user
        } else {
            const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
                email_confirm: true,
                user_metadata: { full_name: fullName, role: 'admin' }
            })
            if (updateError) throw updateError
        }

        if (user) {
            // BUSCAR ORG_ID VÁLIDO (De la primera organización o del perfil admin)
            const { data: orgData } = await adminClient.from('organizations').select('id').limit(1).single()

            await adminClient.from('profiles').upsert({
                id: user.id,
                email,
                full_name: fullName,
                role: 'admin',
                org_id: orgData?.id // CRÍTICO: Sin esto el Dashboard aparece en 0 por RLS
            })
        }

        return { success: true }
    } catch (err: any) {
        console.error('Error in ensureConfirmedDemoUser:', err)
        return { success: false, error: err.message }
    }
}
