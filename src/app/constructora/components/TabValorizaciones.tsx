'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, Plus, Search, FileText,
    Printer, Download, CheckCircle, Clock,
    MoreVertical, X, Filter, Hammer, ArrowRight,
    Calculator, Layers, ChevronDown, Save, Loader2, Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function TabValorizaciones() {
    const [valorizaciones, setValorizaciones] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewModal, setShowNewModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        numero: '', periodo_desde: '', periodo_hasta: '',
        fecha_presentacion: new Date().toISOString().split('T')[0],
        proyecto_id: '', monto_valorizado: '', monto_neto: '',
        avance_periodo: '0', estado: 'pendiente'
    })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: v }, { data: p }] = await Promise.all([
            supabase.from('con_valorizaciones').select('*, con_proyectos(nombre, codigo)').order('numero', { ascending: false }),
            supabase.from('con_proyectos').select('id, nombre, codigo').order('nombre')
        ])
        if (v) setValorizaciones(v)
        if (p) setProyectos(p)
        setLoading(false)
    }

    async function handleSave() {
        if (!form.numero || !form.proyecto_id) { toast.error('Complete los campos obligatorios'); return }
        setSaving(true)
        const { error } = await supabase.from('con_valorizaciones').insert([{
            ...form,
            monto_valorizado: Number(form.monto_valorizado),
            monto_neto: Number(form.monto_neto),
            avance_periodo: Number(form.avance_periodo)
        }])
        setSaving(false)
        if (error) { toast.error(error.message) } else {
            toast.success('Valorización registrada')
            setShowNewModal(false); load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_valorizaciones').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Valorización eliminada'); load()
        }
    }

    const stats = {
        total: valorizaciones.reduce((a, v) => a + (Number(v.monto_valorizado) || 0), 0),
        pendiente: valorizaciones.filter(v => v.estado !== 'pagada').reduce((a, v) => a + (Number(v.monto_neto) || 0), 0)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Valorizaciones de Obra</h3>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Certificación periódica de avance para facturación.</p>
                </div>
                <button onClick={() => { setForm({ numero: `VAL-${valorizaciones.length + 1}`, periodo_desde: '', periodo_hasta: '', fecha_presentacion: new Date().toISOString().split('T')[0], proyecto_id: '', monto_valorizado: '', monto_neto: '', avance_periodo: '0', estado: 'pendiente' }); setShowNewModal(true) }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Nueva Valorización
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase inline-block mb-3">Total Valorizado</p>
                    <h4 className="text-2xl font-black text-slate-900 leading-none">S/ {stats.total.toLocaleString()}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase inline-block mb-3">Pendiente de Cobro</p>
                    <h4 className="text-2xl font-black text-slate-900 leading-none">S/ {stats.pendiente.toLocaleString()}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase inline-block mb-3">Retenciones (Est.)</p>
                    <h4 className="text-2xl font-black text-slate-900 leading-none">S/ {(stats.total * 0.1).toLocaleString()}</h4>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">N°</th>
                            <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Periodo / Fecha</th>
                            <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Proyecto</th>
                            <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bruto</th>
                            <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Neto</th>
                            <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                            <th className="px-6 py-5 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? [1, 2, 3].map(i => <tr key={i} className="h-20 bg-slate-50/20 animate-pulse"><td colSpan={7} /></tr>) :
                            valorizaciones.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-20 text-slate-400 font-bold">Sin valorizaciones generadas</td></tr>
                            ) : valorizaciones.map(val => (
                                <tr key={val.id} className="group hover:bg-slate-50 transition-all">
                                    <td className="px-6 py-5 text-center"><span className="text-xs font-black text-slate-900 px-3 py-1 bg-slate-100 rounded-xl">{val.numero}</span></td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-slate-800">{val.periodo_desde} - {val.periodo_hasta}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pres. {val.fecha_presentacion}</p>
                                    </td>
                                    <td className="px-6 py-5"><p className="text-sm font-bold text-slate-800 line-clamp-1">{val.con_proyectos?.nombre}</p></td>
                                    <td className="px-6 py-5"><p className="text-sm font-black text-slate-900">S/ {(val.monto_valorizado || 0).toLocaleString()}</p></td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-blue-600">S/ {(val.monto_neto || 0).toLocaleString()}</p>
                                        <span className="text-[9px] text-emerald-500 font-black uppercase">{val.avance_periodo}% Avance</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase ${val.estado === 'pagada' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{val.estado}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button onClick={() => handleDelete(val.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

            {/* Modal Nueva Valorización */}
            <AnimatePresence>
                {showNewModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white">
                                <h3 className="text-xl font-black">Certificar Nueva Valorización</h3>
                                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5 text-white/50" /></button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">N° Valorización</label>
                                        <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none bg-white">
                                            <option value="">Seleccione Proyecto...</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Monto Bruto (S/)</label>
                                        <input type="number" value={form.monto_valorizado} onChange={e => setForm(f => ({ ...f, monto_valorizado: e.target.value, monto_neto: (Number(e.target.value) * 0.9).toString() }))}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Monto Neto (S/) - Post Retención 10%</label>
                                        <input type="number" value={form.monto_neto} onChange={e => setForm(f => ({ ...f, monto_neto: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none bg-slate-50" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Avance Periodo (%)</label>
                                        <input type="number" value={form.avance_periodo} onChange={e => setForm(f => ({ ...f, avance_periodo: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha Presentación</label>
                                        <input type="date" value={form.fecha_presentacion} onChange={e => setForm(f => ({ ...f, fecha_presentacion: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-t flex justify-end gap-3">
                                <button onClick={() => setShowNewModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                                <button disabled={saving} onClick={handleSave} className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Generar Valorización
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
