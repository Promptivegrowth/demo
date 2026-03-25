'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Target, TrendingUp, Calendar,
    MessageSquare, Gift, Bell, Search,
    ChevronRight, Star, Clock, ArrowRight
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriCRM() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const data = await agriService.getCRMAnalytics()
            setAnalytics(data)
        } catch (err) {
            toast.error('Error al cargar datos de CRM')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#166534] animate-pulse">Sincronizando Cerebro de Ventas...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* CRM Header - Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Agricultores Oro', val: analytics?.fidelizacion?.total_oro || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Retención Mensual', val: '88%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Predicciones Mes', val: analytics?.predicciones?.length || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Ofertas Activas', val: 5, icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((s, i) => (
                    <div key={i} className={`${s.bg} p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group`}>
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <s.icon className={`w-7 h-7 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className="text-2xl font-black tracking-tight">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Predictions & Re-Purchase Engine */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Motor de Predicción de Re-compra</h4>
                                <p className="text-sm text-slate-400 font-medium">Sugerencias basadas en ciclo de cultivo y compras históricas</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analytics?.predicciones?.map((p: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 group hover:bg-white hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            Confianza {p.probabilidad}%
                                        </div>
                                        <button className="p-2 bg-white rounded-xl shadow-sm text-[#166534] hover:bg-[#166534] hover:text-white transition-all">
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h5 className="font-black text-slate-800 uppercase text-sm mb-1">{p.cliente}</h5>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Requiere: {p.producto_sugerido}</p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end text-[10px] font-black text-slate-400 uppercase">
                                            <span>Próxima Demanda</span>
                                            <span className="text-slate-800">En 5-7 días</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${p.probabilidad}%` }} />
                                        </div>
                                    </div>

                                    <button className="w-full mt-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                                        Enviar Oferta Personalizada
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Seguimiento de Proyectos</h4>
                                <p className="text-sm text-slate-400 font-medium">Monitoreo de etapas de siembra por cliente</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { client: 'Fundo Esperanza', project: 'Campaña Arroz 2026', progress: 45, stage: 'Fertilización' },
                                { client: 'Parcela San José', project: 'Siembra Algodón', progress: 15, stage: 'Preparación' },
                                { client: 'Agrícola Norte', project: 'Cosecha Sorgo', progress: 90, stage: 'Cortes Fin' },
                            ].map((proj, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-green-200 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-[#166534] border border-slate-100">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 uppercase text-xs">{proj.project}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{proj.client} • {proj.stage}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden hidden md:block">
                                            <div className="h-full bg-[#166534] rounded-full" style={{ width: `${proj.progress}%` }} />
                                        </div>
                                        <button className="p-3 bg-white rounded-xl text-slate-400 hover:text-[#166534] transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Loyalty & Alerts */}
                <div className="space-y-8">
                    <div className="bg-[#052c16] rounded-[3rem] p-10 text-white shadow-2xl shadow-green-950/40 relative overflow-hidden">
                        <Gift className="absolute -top-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
                        <h4 className="text-xl font-black tracking-tighter mb-6 uppercase">Club del Agricultor</h4>

                        <div className="space-y-8">
                            {analytics?.fidelizacion?.top_clientes?.map((c: any, i: number) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-green-400">
                                            {c.nombre[0]}
                                        </div>
                                        {i === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"><Star className="w-2 h-2 text-white fill-current" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase truncate">{c.nombre}</p>
                                        <p className="text-[9px] font-black text-green-400/60 uppercase tracking-widest">{c.total_compras.toLocaleString()} pts fidelización</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-green-400/40" />
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-5 bg-green-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 active:scale-95 transition-all shadow-xl shadow-green-900/40">
                            Generar Vales Premia
                        </button>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-lg font-black tracking-tight text-slate-800 uppercase">Alertas de Oferta</h4>
                            <span className="flex h-2 w-2 rounded-full bg-red-500" />
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: 'Kit Siembra Arroz', msg: '3 clientes listos para re-abono', type: 'Re-compra' },
                                { title: 'Deterioro Lambayeque', msg: 'Lanzar fungicida promocional', type: 'Inteligente' },
                                { title: 'Inactividad 60d', msg: 'Llamar a Fundo Los Rosales', type: 'Recuperación' },
                            ].map((alert, i) => (
                                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-200 transition-all cursor-pointer group">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{alert.type}</p>
                                    <p className="text-xs font-black text-slate-800 uppercase mb-1">{alert.title}</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">{alert.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
