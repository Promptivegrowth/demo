export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple API Route para recibir coordinadas
// En producción usaríamos variables de entorno seguras
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key-for-build'
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, lat, lng, speed, viaje_id } = body

        // 1. Validar Token (Mock)
        // 2. Insertar en tabla de ubicaciones si existe (o actualizar viaje)

        // Aquí actualizamos el viaje para mostrar "última ubicación"
        if (viaje_id) {
            await supabaseAdmin
                .from('saf_viajes')
                .update({
                    last_lat: lat,
                    last_lng: lng,
                    last_ping: new Date().toISOString()
                })
                .eq('id', viaje_id)
        }

        return NextResponse.json({ success: true, message: 'Ping received' })
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }
}
