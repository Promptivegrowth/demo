'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, MapPin, Smartphone, TrendingUp,
    Target, Calendar, CheckCircle2, Clock,
    ChevronRight, Phone, MessageSquare, Briefcase
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriAgentes() {
    const [agentes, setAgentes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAgent, setSelectedAgent] = useState<any>(null)

    useEffect(() => {
        async function load() {
            try {
                const data = await agriService.getAgentes()
                setAgentes(data)
                if (data.length > 0) setSelectedAgent(data[0])
            } catch (err) {
                toast.error('Error al cargar agentes')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div className="h-full flex items-center justify-center">Cargando Agentes...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[85vh]">
            {/* Agents List (Left) */}
            <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-2">
                    <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs">Fuerza de Venta en Campo</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asesores Técnicos Activos</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {agentes.map(agente => (
                        <motion.div
                            key={agente.id}
                            onClick={() => setSelectedAgent(agente)}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedAgent?.id === agente.id
                                    ? 'bg-[#052c16] border-[#052c16] text-white shadow-xl shadow-green-950/40'
                                    : 'bg-white border-slate-100 text-slate-800 hover:border-green-200'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${selectedAgent?.id === agente.id ? 'bg-white/10 text-white' : 'bg-green-50 text-[#166534]'
                                }`}>
                                {agente.nombre[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{agente.nombre}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${agente.estado === 'Activo' ? 'bg-green-400' : 'bg-slate-300'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedAgent?.id === agente.id ? 'text-green-300' : 'text-slate-400'}`}>
                                        {agente.especialidad || 'Asesor General'}
                                    </span>
                                </div>
                            </div>
                            {selectedAgent?.id === agente.id && <ChevronRight className="w-5 h-5 text-white/40" />}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Agent Detail / Performance (Right) */}
            <div className="lg:col-span-8 overflow-hidden h-full">
                {selectedAgent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col gap-6"
                    >
                        {/* Profile Header */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Smartphone className="w-32 h-32" />
                            </div>

                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-3xl font-black text-white shadow-lg text-shadow-sm">
                                {selectedAgent.nombre[0]}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{selectedAgent.nombre}</h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                                        <Phone className="w-3 h-3" />
                                        {selectedAgent.telefono}
                                    </div>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <div className="flex items-center gap-1 text-[#166534] font-black text-xs uppercase tracking-widest">
                                        <Briefcase className="w-3 h-3" />
                                        {selectedAgent.especialidad}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all border border-green-100">
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                                <button className="px-6 py-3 bg-[#166534] text-white rounded-2xl font-bold shadow-lg shadow-green-950/20 hover:scale-105 transition-all text-sm">
                                    Llamar Ahora
                                </button>
                            </div>
                        </div>

                        {/* KPIs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Ventas Mes', val: 'S/ 48.5K', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Visitas Hoy', val: '12 / 15', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Efectividad', val: '92%', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'NPS Campo', val: '4.8', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((kpi, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                                    <p className="text-xl font-black text-slate-800 tracking-tighter">{kpi.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Activity & Map Simulation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                            <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm flex flex-col">
                                <h4 className="font-black text-slate-800 tracking-tight mb-6">Pedidos Recientes</h4>
                                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-green-200 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 font-bold text-xs text-slate-400 tracking-tighter">
                                                PED-{100 + i}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-800">Agricultor Test {i}</p>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-tighter">S/ 1,250.00 • Lambayeque</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black uppercase text-green-600">Completado</span>
                                                <p className="text-[8px] font-bold text-slate-300 uppercase">Hace 2 horas</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[3rem] p-8 relative overflow-hidden flex flex-col items-center justify-center border-4 border-slate-800 shadow-2xl">
                                {/* Map Visual Simulation */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.google.com/maps/vt/pb=!1m5!1m4!1i10!2i256!3i385!4i256!2m3!1e0!2sm!3i420120488!3m8!2ses!3sPE!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2')] bg-cover" />

                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative z-10 w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl"
                                >
                                    <MapPin className="w-8 h-8 text-green-400" />
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                </motion.div>

                                <div className="relative z-10 mt-6 text-center">
                                    <p className="text-white font-black text-lg tracking-tight">Ruta Lambayeque-Sector 4</p>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">En Tiempo Real</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Batería</p>
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-3 h-3 text-green-400" />
                                            <span className="text-xs font-black text-white">85%</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Última Sinc.</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-blue-400" />
                                            <span className="text-xs font-black text-white">4 min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
