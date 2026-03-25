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
import { Portal } from '@/components/shared/Portal'

export function TabAgriCRM() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedClient, setSelectedClient] = useState<any>(null)
    const [showAuditModal, setShowAuditModal] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [stats, preds, fidel] = await Promise.all([
                agriService.getCRMAnalytics(),
                agriService.getPurchasePredictions(),
                agriService.getFidelizacion()
            ])
            setAnalytics({ ...stats, predicciones: preds, fidelizacion: fidel })
        } catch (err) {
            toast.error('Error al cargar datos de CRM')
        } finally {
            setLoading(false)
        }
    }

    const openWhatsApp = (clientName: string, product: string) => {
        const phone = "51916854842" // Número proporcionado por el usuario para pruebas
        const message = `Hola ${clientName}, en base a tu historial de compras de ${product}, te informamos que pronto podrías necesitar una reposición. Tenemos una oferta exclusiva del 15% para ti hoy. ¿Te interesa?`
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
        toast.success('Abriendo WhatsApp con mensaje personalizado...')
    }

    const handleViewAudit = (client: any) => {
        setSelectedClient(client)
        setShowAuditModal(true)
    }

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#166534] animate-pulse">Sincronizando Cerebro de Ventas...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* CRM Header - Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Agricultores Fieles', val: analytics?.clientesFieles || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Prob. Recompra', val: `${analytics?.probabilidadRecompra}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Predicciones Activas', val: analytics?.predicciones?.length || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Proyectos Monitoreo', val: analytics?.proyectosEnCurso || 0, icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((s, i) => (
                    <div key={i} className={`${s.bg} p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all`}>
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
                                <p className="text-sm text-slate-400 font-medium tracking-tight">IA Sugerencias basadas en ciclo de cultivo y compras históricas</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analytics?.predicciones?.map((p: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 group hover:bg-white hover:shadow-2xl hover:border-green-100 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Confianza {p.probabilidad}%
                                        </div>
                                        <button
                                            onClick={() => openWhatsApp(p.cliente, p.producto)}
                                            className="p-2.5 bg-white rounded-xl shadow-sm text-[#166534] hover:bg-[#166534] hover:text-white transition-all border border-slate-100"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h5 className="font-black text-slate-800 uppercase text-sm mb-1">{p.cliente}</h5>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 mr-1">Requiere: <span className="text-slate-600">{p.producto}</span></p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end text-[10px] font-black text-slate-400 uppercase">
                                            <span>Próxima Demanda</span>
                                            <span className="text-slate-800">En 5-7 días</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${p.probabilidad}%` }} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openWhatsApp(p.cliente, p.producto)}
                                        className="w-full mt-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all tracking-widest"
                                    >
                                        Enviar Oferta WhatsApp
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Seguimiento de Proyectos</h4>
                                <p className="text-sm text-slate-400 font-medium tracking-tight">Monitoreo dinámico de etapas de siembra según compras</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { client: 'Fundo Esperanza', project: 'Campaña Arroz 2026', progress: 45, stage: 'Fertilización', phone: '51916854842' },
                                { client: 'Parcela San José', project: 'Siembra Algodón', progress: 15, stage: 'Preparación', phone: '51916854842' },
                                { client: 'Agrícola Norte', project: 'Cosecha Sorgo', progress: 90, stage: 'Maduración', phone: '51916854842' },
                            ].map((proj, i) => (
                                <div key={i} className="flex items-center justify-between p-7 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-green-200 hover:bg-white hover:shadow-lg transition-all group">
                                    <div className="flex items-center gap-8">
                                        <div className="w-12 h-12 rounded-[1.25rem] bg-white shadow-sm flex items-center justify-center font-black text-[#166534] border border-slate-100 group-hover:scale-110 transition-transform">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 uppercase text-xs tracking-tight mb-0.5">{proj.project}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{proj.client} • {proj.stage}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="flex flex-col gap-2 w-40 hidden md:flex">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                                                <span>Progreso</span>
                                                <span>{proj.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#166534] rounded-full" style={{ width: `${proj.progress}%` }} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewAudit(proj)}
                                            className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#166534] hover:border-[#166534] transition-all shadow-sm"
                                        >
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
                    <div className="bg-[#052c16] rounded-[3rem] p-10 text-white shadow-2xl shadow-green-950/40 relative overflow-hidden group">
                        <Gift className="absolute -top-6 -right-6 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-[30deg] transition-transform duration-700" />
                        <h4 className="text-xl font-black tracking-tighter mb-8 uppercase">Elite Growers Club</h4>

                        <div className="space-y-8">
                            {analytics?.fidelizacion?.slice(0, 3).map((c: any, i: number) => (
                                <div key={i} className="flex items-center gap-5 group/item">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-green-400 border border-white/10 group-hover/item:bg-white/20 transition-all">
                                            {c.nombre[0]}
                                        </div>
                                        {i === 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-[#052c16] flex items-center justify-center shadow-lg"><Star className="w-2.5 h-2.5 text-white fill-current" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase truncate tracking-tight">{c.nombre}</p>
                                        <p className="text-[9px] font-black text-green-400/60 uppercase tracking-widest">{c.puntos.toLocaleString()} pts loyalty</p>
                                    </div>
                                    <motion.div whileHover={{ x: 5 }}>
                                        <ArrowRight className="w-4 h-4 text-green-400/40 cursor-pointer hover:text-green-400" />
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-5 bg-green-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 active:scale-95 transition-all shadow-xl shadow-green-900/40">
                            Generar Vales de Descuento
                        </button>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-lg font-black tracking-tight text-slate-800 uppercase">Inteligencia de Ventas</h4>
                            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: 'Kit Siembra Arroz', msg: '3 clientes listos para re-abono esta semana', type: 'Repetición' },
                                { title: 'Anomalía Lambayeque', msg: 'Caída de ventas de urea detectada', type: 'Riesgo' },
                                { title: 'Inactividad 60d', msg: 'Fundo Los Rosales no compra desde Enero', type: 'Churn' },
                            ].map((alert, i) => (
                                <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-green-200 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{alert.type}</p>
                                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-green-500 transition-colors" />
                                    </div>
                                    <p className="text-xs font-black text-slate-800 uppercase mb-1">{alert.title}</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">{alert.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Auditoría de Cliente */}
            {showAuditModal && selectedClient && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setShowAuditModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 max-w-4xl w-full z-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-3xl text-slate-300">
                                        {selectedClient.client[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-2">{selectedClient.client}</h3>
                                        <div className="flex gap-3">
                                            <span className="px-3 py-1 bg-[#166534] text-white rounded-full text-[9px] font-black uppercase tracking-widest">Premium Grower</span>
                                            <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">ID: {Math.floor(Math.random() * 9000) + 1000}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowAuditModal(false)} className="text-slate-300 hover:text-slate-600 font-bold uppercase text-[10px] tracking-widest">Cerrar</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Ficha Técnica y Predicciones</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Gasto Promedio Mensual</p>
                                                <p className="text-xl font-black text-slate-800">S/ 4,500.00</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Insumo más Comprado</p>
                                                <p className="text-xl font-black text-slate-800">Urea Premium</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análisis de Ciclo de Compra</h4>
                                        <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100 relative overflow-hidden">
                                            <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-green-200 opacity-30" />
                                            <p className="text-xs font-medium text-green-800 leading-relaxed mb-6">
                                                El cliente suele comprar fertilizantes cada **22 días**. Según su última compra (hace 18 días), es altamente probable que necesite re-stock de **Sustrato Orgánico** este fin de semana.
                                            </p>
                                            <button
                                                onClick={() => openWhatsApp(selectedClient.client, "Sustrato Orgánico")}
                                                className="px-6 py-3 bg-[#166534] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                            >
                                                Lanzar Oferta de Re-stock
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canales de Contacto</h4>
                                    <div className="space-y-3">
                                        <button className="w-full p-5 bg-white border border-slate-200 rounded-[1.5rem] flex items-center justify-between hover:border-[#166534] transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-slate-600">WhatsApp</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-green-500" />
                                        </button>
                                        <button className="w-full p-5 bg-white border border-slate-200 rounded-[1.5rem] flex items-center justify-between hover:border-blue-500 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-slate-600">Agendar Cita</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
