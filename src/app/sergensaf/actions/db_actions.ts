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
