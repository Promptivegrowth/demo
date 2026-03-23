'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign, Plus, Search, TrendingUp,
    TrendingDown, ArrowUpRight, ArrowDownRight,
    Filter, Calendar, Download, Building,
    CreditCard, Wallet, AlertCircle, History,
    HardHat, MoreVertical, ChevronRight, X,
    CheckCircle2, PieChart
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabCaja() {
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFinTab, setActiveFinTab] = useState<'efectivo' | 'cobrar' | 'pagar'>('efectivo')
    const [showNewMov, setShowNewMov] = useState(false)
    const [selectedMov, setSelectedMov] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const { data } = await conQuery.getMovimientosCaja()
            if (data) setMovimientos(data)
            setLoading(false)
        }
        load()
    }, [])

    const StatBox = ({ label, value, trend, isPositive, color }: any) => (
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-2xl -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-150`} />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-end gap-3">
                <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">S/ {value.toLocaleString()}</h4>
                <div className={`flex items-center gap-0.5 text-[10px] font-black pb-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}%
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Financial Dashboard Header */}
            <div className="bg-slate-900 p-10 rounded-[40px] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] -mr-48 -mt-48 rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 blur-[80px] -ml-24 -mb-24 rounded-full" />

                <div className="relative z-10 flex gap-6 items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-sm">
                        <PieChart className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-4xl font-black tracking-tighter leading-none mb-2">Control Financiero</h3>
                        <div className="flex items-center gap-4">
                            <p className="text-slate-400 text-sm font-medium">Tesorería, Cobranzas y Pagos de Obra.</p>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Saldo Saludable</span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/5 p-2 rounded-[30px] border border-white/5 relative z-10 shrink-0 backdrop-blur-md">
                    {[
                        { id: 'efectivo', label: 'Caja & Bancos', icon: Wallet },
                        { id: 'cobrar', label: 'Cuentas Cobrar', icon: TrendingUp },
                        { id: 'pagar', label: 'Cuentas Pagar', icon: TrendingDown }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveFinTab(t.id as any)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeFinTab === t.id ? 'bg-white text-slate-900 shadow-2xl scale-105' : 'text-white/40 hover:text-white/80'
                                }`}
                        >
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBox label="Saldo Disponible" value={145230.12} trend={4.2} isPositive={true} color="bg-blue-600" />
                <StatBox label="Cobros Pendientes" value={92340.00} trend={12.5} isPositive={true} color="bg-emerald-600" />
                <StatBox label="Pagos Pendientes" value={45120.50} trend={2.1} isPositive={false} color="bg-rose-600" />
                <StatBox label="Caja Chica Obra" value={3500.00} trend={8.3} isPositive={false} color="bg-amber-600" />
            </div>

            {activeFinTab === 'efectivo' ? (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Movimientos de Caja</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tesorería Central</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"><Download className="w-4 h-4 text-slate-400" /></button>
                            <button
                                onClick={() => setShowNewMov(true)}
                                className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                            >
                                <Plus className="w-4 h-4 text-emerald-400" /> Nuevo Ingreso/Egreso
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 italic">
                                    <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha / Ref.</th>
                                    <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto & Descripción</th>
                                    <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                                    <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                                    <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [1, 2, 3].map(i => <tr key={i} className="h-20 animate-pulse bg-slate-50/20"><td colSpan={5} /></tr>)
                                ) : movimientos.map((mov) => (
                                    <tr key={mov.id} onClick={() => setSelectedMov(mov)} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="py-6 px-4">
                                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{mov.fecha}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {mov.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="py-6 px-4">
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{mov.referencia || 'Sin Concepto'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium italic">Cat: {mov.categoria || 'N/A'}</p>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-black uppercase">{mov.tipo === 'ingreso' ? 'Operativo' : 'Gasto Obra'}</span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <p className={`text-base font-black italic ${mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {mov.tipo === 'ingreso' ? '+' : '-'} S/ {mov.monto?.toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Conciliado
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Accounts Payable/Receivable Table Simulation */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h5 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">{activeFinTab === 'cobrar' ? 'Cobranzas Pendientes' : 'Pagos a Proveedores'}</h5>
                            <button className="text-blue-500 hover:underline text-xs font-black uppercase tracking-widest">Gestionar Todo</button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-5 border border-slate-100 rounded-3xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeFinTab === 'cobrar' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                <Building className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{activeFinTab === 'cobrar' ? 'Inmobiliaria Los Pinos' : 'Cementos Lima SAC'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Vence: 12 Abr 2025</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-black text-slate-900 italic">S/ 12,500.00</p>
                                            <p className="text-[9px] text-rose-500 font-black uppercase">Faltan 5 días</p>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${activeFinTab === 'cobrar' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: '65%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* petty cash log per project */}
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <div className="relative z-10">
                            <h5 className="text-lg font-black tracking-tight uppercase tracking-wider mb-8 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-amber-500" /> Historial Caja Chica Obra
                            </h5>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                            <div className="w-0.5 flex-1 bg-slate-800 my-1" />
                                        </div>
                                        <div className="pb-6 flex-1 border-b border-slate-800">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold text-slate-100 leading-tight">Compra de implementos menores EPP</p>
                                                <span className="text-[10px] font-black text-rose-500">- S/ 145.00</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase">
                                                <span>21 Mar</span>
                                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                <span>Fac: E001-245</span>
                                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                <span className="text-amber-400">Obra Sur</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                Rendir Gastos del Día <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Nuevo Movimiento (Minimalistic) */}
            <AnimatePresence>
                {showNewMov && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewMov(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Registrar Movimiento</h3>
                                <button onClick={() => setShowNewMov(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                    <button className="flex-1 py-3 bg-white text-emerald-600 rounded-xl shadow-sm font-black text-[10px] uppercase tracking-widest">Ingreso</button>
                                    <button className="flex-1 py-3 text-slate-400 hover:text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Egreso</button>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Monto (S/)</label>
                                    <input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-2xl font-black italic text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción / Concepto</label>
                                    <textarea placeholder="Ej: Pago de materiales eléctricos Obra B" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button onClick={() => setShowNewMov(false)} className="py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                                    <button onClick={() => { toast.success('Movimiento registrado'); setShowNewMov(false); }} className="py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        Guardar <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalles de Movimiento */}
            <AnimatePresence>
                {selectedMov && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedMov(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${selectedMov.tipo === 'ingreso' ? 'bg-emerald-500' : 'bg-rose-500'} opacity-20 blur-3xl -mr-16 -mt-16 rounded-full`} />
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detalle de Transacción</p>
                                        <h3 className="text-2xl font-black italic">S/ {selectedMov.monto?.toLocaleString()}</h3>
                                    </div>
                                    <button onClick={() => setSelectedMov(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5 text-white/50" /></button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${selectedMov.tipo === 'ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {selectedMov.tipo}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                                        <p className="text-xs font-bold text-slate-900">{selectedMov.fecha}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Concepto / Referencia</p>
                                        <p className="text-sm font-bold text-slate-800 uppercase leading-tight">{selectedMov.referencia || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoría</p>
                                        <p className="text-xs font-bold text-slate-700">{selectedMov.categoria}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Método de Pago</p>
                                        <p className="text-xs font-bold text-slate-700 capitalize">{selectedMov.metodo_pago || 'Desconocido'}</p>
                                    </div>
                                </div>
                                {selectedMov.notas && (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas Adicionales</p>
                                        <p className="text-xs text-slate-600 italic">"{selectedMov.notas}"</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-8 py-6 border-t bg-slate-50/50 flex justify-end">
                                <button onClick={() => setSelectedMov(null)} className="px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest">Cerrar Detalle</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
