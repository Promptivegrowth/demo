'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ScrollText, Plus, Search, DollarSign,
    ShieldCheck, AlertTriangle, FileCheck,
    ChevronRight, Building, User, Calendar,
    TrendingDown, CheckCircle2, History, X
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabContratos() {
    const [contratos, setContratos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedContrato, setSelectedContrato] = useState<any>(null)
    const [showLiquidarModal, setShowLiquidarModal] = useState(false)

    useEffect(() => {
        loadContratos()
    }, [])

    async function loadContratos() {
        setLoading(true)
        const { data } = await conQuery.getContratos()
        if (data) setContratos(data)
        setLoading(false)
    }

    const StatusCard = ({ label, value, color, icon: Icon }: any) => (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl transition-colors ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Finanzas</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">S/ {value.toLocaleString()}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -ml-16 -mb-16 rounded-full" />

                <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter mb-2 italic">Contratos de Obra</h3>
                    <p className="text-slate-400 text-sm font-medium">Gestión financiera y administrativa de compromisos contractuales.</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95">
                    Registrar Nuevo Contrato
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contracts List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-3xl" />)
                    ) : contratos.map((contra) => (
                        <motion.div
                            key={contra.id}
                            whileHover={{ x: 10 }}
                            onClick={() => setSelectedContrato(contra)}
                            className={`bg-white p-6 rounded-[32px] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedContrato?.id === contra.id ? 'border-blue-500 shadow-xl shadow-blue-500/10 bg-blue-50/20' : 'border-slate-200 hover:border-slate-400 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
                                    <ScrollText className="w-7 h-7" />
                                </div>
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black uppercase">{contra.numero}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{contra.fecha_firma}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight truncate">{contra.con_proyectos?.nombre}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{contra.con_clientes?.razon_social}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-right shrink-0">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Monto Total</p>
                                    <p className="text-base font-black text-slate-900 tracking-tight">S/ {contra.monto_contrato?.toLocaleString()}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${contra.estado === 'vigente' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {contra.estado}
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sidebar Status / Actions */}
                <div className="space-y-6">
                    {selectedContrato ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-lg shadow-slate-200/50 space-y-6">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Detalle Financiero</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Monto Contractual</span>
                                        <span className="font-black text-slate-900">S/ {selectedContrato.monto_contrato?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Amortizaciones</span>
                                        <span className="font-black text-emerald-600">- S/ {(selectedContrato.monto_contrato * 0.4).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Fondo de Garantía (10%)</span>
                                        <span className="font-black text-amber-600">S/ {(selectedContrato.monto_contrato * 0.1).toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo por Cobrar</span>
                                        <span className="text-xl font-black italic text-blue-600 leading-none">S/ {(selectedContrato.monto_contrato * 0.5).toLocaleString()}</span>
                                    </div>

                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-6">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }} />
                                    </div>
                                    <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest mt-2 px-4">Progreso de Facturación: 40%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex-1 p-5 bg-white border border-slate-200 rounded-3xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex flex-col items-center gap-3">
                                    <History className="w-5 h-5 text-slate-400" /> Historial Pagos
                                </button>
                                <button
                                    onClick={() => setShowLiquidarModal(true)}
                                    className="flex-1 p-5 bg-red-50 border border-red-100 text-red-600 rounded-3xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex flex-col items-center gap-3 shadow-lg shadow-red-500/10 active:scale-95"
                                >
                                    <ShieldCheck className="w-5 h-5" /> Liquidar Obra
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                            <ScrollText className="w-16 h-16 text-slate-200 mb-6" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Selecciona un contrato para ver auditoría financiera</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Liquidación de Contrato */}
            <AnimatePresence>
                {showLiquidarModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLiquidarModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-red-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-red-600/30">
                                        <AlertTriangle className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cierre & Liquidación</h3>
                                        <p className="text-sm text-slate-500 font-medium">Finalización oficial de compromisos contractuales</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLiquidarModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Checklist de Liquidación</h5>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                <span className="text-sm font-bold text-slate-700">Protocolo de entrega firmado</span>
                                            </div>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-black uppercase">Listos</span>
                                        </div>
                                        <div className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                <span className="text-sm font-bold text-slate-700">Planos post-construcción (As-Built)</span>
                                            </div>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-black uppercase">Cargado</span>
                                        </div>
                                        <div className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
                                                <span className="text-sm font-bold text-slate-700">Regularización de saldos y multas</span>
                                            </div>
                                            <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded font-black uppercase">Pendiente</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                                    <p className="text-xs text-red-700 font-medium leading-relaxed">
                                        <strong>Advertencia:</strong> La liquidación liberará las retenciones de garantía y cerrará el flujo financiero del contrato. Asegúrese de que no existan controversias técnicas pendientes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowLiquidarModal(false)} className="flex-1 py-5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-transparent">Posponer Cierre</button>
                                <button onClick={() => { toast.success('Contrato liquidado exitosamente'); setShowLiquidarModal(false); }} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Finalizar & Generar Acta <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ArrowRight({ className }: any) { return <ArrowRightIcon className={className} /> }
import { ArrowRight as ArrowRightIcon } from 'lucide-react'
