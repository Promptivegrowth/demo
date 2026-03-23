'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, Plus, Search, FileText,
    Printer, Download, CheckCircle, Clock,
    MoreVertical, X, Filter, Hammer, ArrowRight,
    Calculator, Layers, ChevronDown
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabValorizaciones() {
    const [valorizaciones, setValorizaciones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewModal, setShowNewModal] = useState(false)
    const [activeView, setActiveView] = useState<'table' | 'grid'>('table')

    useEffect(() => {
        async function load() {
            const { data } = await conQuery.getValorizaciones()
            if (data) setValorizaciones(data)
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Valorizaciones de Obra</h3>
                    <p className="text-sm text-slate-500 font-medium">Certificación periódica de avance para facturación.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"><Filter className="w-4 h-4" /></button>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"><Printer className="w-4 h-4" /></button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Nueva Valorización
                    </button>
                </div>
            </div>

            {/* Grid of Summaries (Optional WOW) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase inline-block mb-3">Total Valorizado</p>
                    <h4 className="text-2xl font-black text-slate-900 leading-none">S/ 450,230.50</h4>
                    <p className="text-xs text-slate-400 mt-2">Monto acumulado pagado por clientes</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase inline-block mb-3">Pendiente</p>
                    <h4 className="text-2xl font-black text-slate-900 leading-none">S/ 120,450.00</h4>
                    <p className="text-xs text-slate-400 mt-2">2 valorizaciones presentadas en revisión</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group cursor-pointer">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 -mr-8 -mt-8 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <p className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase inline-block mb-3">Retenciones</p>
                    <h4 className="text-2xl font-black text-slate-900 leading-none group-hover:text-amber-600 transition-colors">S/ 24,500.00</h4>
                    <p className="text-xs text-slate-400 mt-2">Fondo de garantía acumulado por liquidar</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">N°</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Periodo / Fecha</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Proyecto / Cliente</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Monto Valorizado</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Monto Neto</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="h-20 bg-slate-50/20 animate-pulse"><td colSpan={6} /></tr>)
                            ) : valorizaciones.map((val) => (
                                <tr key={val.id} className="group hover:bg-slate-50 transition-all cursor-pointer">
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-black text-slate-900 px-3 py-1 bg-slate-100 rounded-xl">{val.numero}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-slate-800">{val.periodo_desde} — {val.periodo_hasta}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Pres. {val.fecha_presentacion}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{val.con_proyectos?.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{val.con_clientes?.razon_social}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-900">S/ {val.monto_valorizado?.toLocaleString()}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">Bruto Periodo</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-blue-600">S/ {val.monto_neto?.toLocaleString()}</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-emerald-500 font-black uppercase">-{val.avance_periodo}% Amort.</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase inline-flex items-center gap-1.5 ${val.estado === 'pagada' ? 'bg-emerald-100 text-emerald-600' :
                                                val.estado === 'aprobada' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {val.estado === 'pagada' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {val.estado}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Nueva Valorización (S10 Style) */}
            <AnimatePresence>
                {showNewModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-8 bg-slate-900 text-white shrink-0 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center border border-white/10 shadow-lg">
                                        <Calculator className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter">Planilla de Valorización Técnica</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hoja de Cálculo de Metrados y Avances</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowNewModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Proyecto</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                                            <option>Edificio Residencial Los Pinos</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Periodo</label>
                                        <input type="month" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none" defaultValue="2025-03" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Presupuesto</label>
                                        <div className="w-full bg-slate-900/5 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600">S/ 920,000.00</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Avance Acum. Ant.</label>
                                        <div className="w-full bg-slate-900/5 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-600">35.40%</div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-800/80">
                                            <tr>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter w-20">Item</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter">Descripción de Partida</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-center">Und.</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-right">Metrado Total</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-right text-blue-400">Metr. Anterior</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-right text-amber-400">Metr. Periodo</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-right">Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-500">02.0{i}</td>
                                                    <td className="px-6 py-4 font-bold text-white">Concreto en losas f'c=210 kg/cm2</td>
                                                    <td className="px-6 py-4 text-center text-slate-500">m3</td>
                                                    <td className="px-6 py-4 text-right font-bold">210.00</td>
                                                    <td className="px-6 py-4 text-right">85.00</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <input type="number" defaultValue="45" className="bg-slate-800 border border-slate-700 w-20 px-2 py-1 rounded-lg text-amber-400 font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-all text-right" />
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-500 font-bold">80.00</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-8 bg-white border-t border-slate-200 flex justify-between items-center">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 italic">Monto Valorizado</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">S/ 24,560.80</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 italic">Retención Fondo Gar. (10%)</p>
                                        <p className="text-xl font-black text-amber-600 tracking-tight">S/ 2,456.08</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200" />
                                    <div>
                                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1 italic">TOTAL NETO A PAGAR</p>
                                        <p className="text-2xl font-black text-blue-600 tracking-tight leading-none italic">S/ 22,104.72</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowNewModal(false)} className="px-8 py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Guardar Borrador</button>
                                    <button onClick={() => { toast.success('Valorización procesada correctamente'); setShowNewModal(false); }} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-900/40 transition-all active:scale-95 flex items-center gap-2">
                                        Procesar Certificación <TrendingUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
