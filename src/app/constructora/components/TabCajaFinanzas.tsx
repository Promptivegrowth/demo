'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign, Plus, Search, X, Save, Loader2,
    TrendingUp, TrendingDown, Calendar, Wallet, Layers, Trash2, ArrowRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function TabCajaFinanzas() {
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        tipo: 'egreso', categoria: 'Materiales', monto: '',
        fecha: new Date().toISOString().split('T')[0],
        proyecto_id: '', referencia: '', metodo_pago: 'Efectivo', notas: ''
    })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: m }, { data: p }] = await Promise.all([
            supabase.from('con_caja').select('*, con_proyectos(nombre)').order('fecha', { ascending: false }),
            supabase.from('con_proyectos').select('id, nombre').order('nombre')
        ])
        if (m) setMovimientos(m)
        if (p) setProyectos(p)
        setLoading(false)
    }

    const filtered = movimientos.filter(m =>
        m.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        ingresos: movimientos.filter(m => m.tipo === 'ingreso').reduce((a, m) => a + (Number(m.monto) || 0), 0),
        egresos: movimientos.filter(m => m.tipo === 'egreso').reduce((a, m) => a + (Number(m.monto) || 0), 0),
    }

    async function handleSave() {
        if (!form.monto || Number(form.monto) <= 0) { toast.error('Monto inválido'); return }
        setSaving(true)
        const { error } = await supabase.from('con_caja').insert([{
            ...form,
            monto: Number(form.monto),
            proyecto_id: form.proyecto_id || null
        }])
        setSaving(false)
        if (error) { toast.error(error.message) } else {
            toast.success('Movimiento registrado')
            setShowModal(false); load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_caja').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Movimiento eliminado'); load()
        }
    }

    return (
        <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Balance General</p>
                        <p className="text-3xl font-black">S/ {(stats.ingresos - stats.egresos).toLocaleString()}</p>
                        <div className="mt-4 flex gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                                <TrendingUp className="w-3 h-3 text-emerald-400" /> S/ {stats.ingresos.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                                <TrendingDown className="w-3 h-3 text-rose-400" /> S/ {stats.egresos.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos Totales</p>
                            <p className="text-xl font-black text-slate-900">S/ {stats.ingresos.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Egresos Totales</p>
                            <p className="text-xl font-black text-slate-900">S/ {stats.egresos.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar categoría o referencia..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                </div>
                <button onClick={() => { setForm({ tipo: 'egreso', categoria: 'Materiales', monto: '', fecha: new Date().toISOString().split('T')[0], proyecto_id: '', referencia: '', metodo_pago: 'Efectivo', notas: '' }); setShowModal(true) }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Nuevo Movimiento
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>{['Fecha', 'Categoría / Detalle', 'Proyecto', 'Monto', 'Método', ''].map(h => (
                            <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? [1, 2, 3].map(i => <tr key={i}><td colSpan={6} className="px-6 py-4 h-16 animate-pulse bg-slate-50/50" /></tr>) :
                            filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-bold">Sin movimientos registrados</td></tr>
                            ) : filtered.map(m => (
                                <tr key={m.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{m.fecha}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800">{m.categoria}</p>
                                        <p className="text-[10px] text-slate-400 italic">{m.referencia || 'Sin referencia'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-slate-500 font-bold uppercase">{m.con_proyectos?.nombre || 'General'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-black ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {m.tipo === 'ingreso' ? '+' : '-'} S/ {(m.monto || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">{m.metodo_pago}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(m.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 rounded-lg transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Nuevo Movimiento */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <h3 className="text-xl font-black text-slate-900">Registrar Movimiento de Caja</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-8 space-y-5">
                                <div className="flex gap-3">
                                    {['ingreso', 'egreso'].map(t => (
                                        <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t as any }))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold capitalize transition-all ${form.tipo === t ? (t === 'ingreso' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-rose-600 text-white shadow-lg shadow-rose-200') : 'bg-slate-50 text-slate-400'}`}>
                                            {t === 'ingreso' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {t}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Monto (S/) *</label>
                                        <input type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                                            className="w-full text-2xl font-black border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-all" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Categoría</label>
                                        <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            {['Planilla', 'Materiales', 'Servicios', 'Herramientas', 'Transporte', 'Alimentación', 'Otros'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Método de Pago</label>
                                        <select value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            {['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta'].map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha</label>
                                        <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            <option value="">General</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Referencia / Glosa</label>
                                        <input value={form.referencia} onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" placeholder="Factura, recibo, detalle..." />
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Registrar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
