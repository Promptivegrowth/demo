'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Package, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ConductorGpsPage({ params }: { params: { token: string } }) {
    const [viaje, setViaje] = useState<any>(null)
    const [isTracking, setIsTracking] = useState(false)
    const [loading, setLoading] = useState(true)
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)

    useEffect(() => {
        const fetchViaje = async () => {
            try {
                // En un caso real, validaríamos el token. Aquí buscamos el viaje más reciente 'en_curso'
                const { data, error } = await supabase
                    .from('saf_viajes')
                    .select('*, saf_flota(placa, marca, modelo), saf_conductores(nombres, apellidos)')
                    .eq('estado', 'en_curso')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (data) setViaje(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchViaje()
    }, [])

    const toggleTracking = () => {
        if (!isTracking) {
            if ("geolocation" in navigator) {
                setIsTracking(true)
                startPinging()
            } else {
                alert("GPS no soportado en este dispositivo")
            }
        } else {
            setIsTracking(false)
        }
    }

    const startPinging = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords
            setLocation({ lat: latitude, lng: longitude })
            // Aquí iría el fetch a /api/gps/ping
            console.log("Ping GPS:", latitude, longitude)
        })
    }

    if (loading) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#f0a500]">Cargando sesión de viaje...</div>

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-4 font-sans flex flex-col items-center">
            <header className="w-full max-w-md flex justify-between items-center mb-8 pt-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-rajdhani font-bold text-[#f0a500] tracking-tighter">DRIVER APP</h1>
                    <span className="text-[10px] text-[#8b949e] uppercase tracking-widest font-bold">Sergensaf Logistics</span>
                </div>
                <div className="flex items-center gap-2 bg-[#238636]/10 px-3 py-1 rounded-full border border-[#238636]/30">
                    <div className="h-2 w-2 bg-[#238636] rounded-full animate-pulse" />
                    <span className="text-[10px] text-[#238636] font-bold">SESIÓN ACTIVA</span>
                </div>
            </header>

            <main className="w-full max-w-md space-y-6">
                {/* CARD VIAJE */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Navigation className="h-20 w-20" /></div>

                    <div className="flex gap-4 items-center mb-6">
                        <div className="w-16 h-16 bg-[#f0a500] rounded-2xl flex items-center justify-center text-[#0d1117]">
                            <Package className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Viaje en Curso</p>
                            <h2 className="text-xl font-bold text-white leading-tight">{viaje?.destino || 'Sin Destino Asignado'}</h2>
                            <p className="text-xs text-[#f0a500] font-medium">{viaje?.saf_flota?.placa} - {viaje?.saf_flota?.marca}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-6 border-b border-[#30363d]">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#8b949e] uppercase">Conductor</span>
                            <span className="text-sm font-bold">{viaje?.saf_conductores?.nombres} {viaje?.saf_conductores?.apellidos}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-[#8b949e] uppercase">Cliente</span>
                            <span className="text-sm font-bold">{viaje?.cliente || 'S/N'}</span>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col items-center">
                        <button
                            onClick={toggleTracking}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${isTracking ? 'bg-[#da3633] text-white' : 'bg-[#f0a500] text-[#0d1117]'}`}
                        >
                            <MapPin className={`h-6 w-6 ${isTracking ? 'animate-bounce' : ''}`} />
                            {isTracking ? 'DETENER SEGUIMIENTO' : 'INICIAR RUTA'}
                        </button>
                        <p className="text-[10px] text-[#8b949e] mt-4 text-center">
                            {isTracking ? 'Transmitiendo ubicación en tiempo real a la central...' : 'Haz clic para iniciar el reporte de GPS por seguridad.'}
                        </p>
                    </div>
                </div>

                {/* ALERTAS/RECOMENDACIONES */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-2xl">
                        <ShieldAlert className="h-5 w-5 text-[#f0a500] mb-2" />
                        <p className="text-xs font-bold text-white">Botón Pánico</p>
                        <p className="text-[10px] text-[#8b949e]">Emergencias 24/7</p>
                    </div>
                    <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-2xl">
                        <CheckCircle className="h-5 w-5 text-[#238636] mb-2" />
                        <p className="text-xs font-bold text-white">Llegada</p>
                        <p className="text-[10px] text-[#8b949e]">Reportar Entrega</p>
                    </div>
                </div>
            </main>

            <footer className="mt-auto pb-4">
                <p className="text-[9px] text-[#8b949e] uppercase font-bold tracking-[0.2em]">Antigravity Intelligence Systems © 2024</p>
            </footer>
        </div>
    )
}
