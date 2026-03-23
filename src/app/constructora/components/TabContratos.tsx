'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ScrollText, Plus, Search, X, Save, Loader2,
    DollarSign, Building, Calendar, Edit3, Trash2,
    ChevronRight, TrendingUp, FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const statusColor: Record<string, string> = {
    borrador: 'bg-slate-100 text-slate-500',
    vigente: 'bg-emerald-100 text-emerald-600',
    adendado: 'bg-blue-100 text-blue-600',
    resuelto: 'bg-amber-100 text-amber-600',
    liquidado: 'bg-purple-100 text-purple-600',
}

export function TabContratos() {
    const [contratos, setContratos] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedContrato, setSelectedContrato] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        numero: '', cliente_id: '', proyecto_id: '',
        fecha_firma: new Date().toISOString().split('T')[0],
        monto_contrato: '', adelanto_porcentaje: 30,
        plazo_dias: 60, estado: 'vigente',
        tipo: 'suma_alzada', moneda: 'PEN', notas: ''
    })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: c }, { data: cl }, { data: p }] = await Promise.all([
            supabase.from('con_contratos').select('*, con_clientes(razon_social, ruc), con_proyectos(nombre, codigo)').order('created_at', { ascending: false }),
            supabase.from('con_clientes').select('id, razon_social').order('razon_social'),
            supabase.from('con_proyectos').select('id, nombre, codigo').order('nombre')
        ])
        if (c) setContratos(c)
        if (cl) setClientes(cl)
        if (p) setProyectos(p)
        setLoading(false)
    }

    const filtered = contratos.filter(c =>
        c.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.con_clientes?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function openNew() {
        const nextNum = `CONT-${String(contratos.length + 1).padStart(4, '0')}`
        setForm({ numero: nextNum, cliente_id: '', proyecto_id: '', fecha_firma: new Date().toISOString().split('T')[0], monto_contrato: '', adelanto_porcentaje: 30, plazo_dias: 60, estado: 'vigente', tipo: 'suma_alzada', moneda: 'PEN', notas: '' })
        setEditingId(null)
        setShowModal(true)
    }

    function openEdit(c: any) {
        setForm({ numero: c.numero || '', cliente_id: c.cliente_id || '', proyecto_id: c.proyecto_id || '', fecha_firma: c.fecha_firma || '', monto_contrato: c.monto_contrato || '', adelanto_porcentaje: c.adelanto_porcentaje || 30, plazo_dias: c.plazo_dias || 60, estado: c.estado || 'vigente', tipo: c.tipo || 'suma_alzada', moneda: c.moneda || 'PEN', notas: c.notas || '' })
        setEditingId(c.id)
        setShowModal(true)
        setSelectedContrato(null)
    }

    async function handleSave() {
        if (!form.numero || !form.cliente_id) { toast.error('Número y cliente son obligatorios'); return }
        setSaving(true)
        const payload = { ...form, monto_contrato: parseFloat(String(form.monto_contrato)) || 0, cliente_id: form.cliente_id || null, proyecto_id: form.proyecto_id || null }
        let error: any
        if (editingId) {
            const res = await supabase.from('con_contratos').update(payload).eq('id', editingId)
            error = res.error
        } else {
            const res = await supabase.from('con_contratos').insert([payload])
            error = res.error
        }
        setSaving(false)
        if (error) { toast.error(error.message) } else {
            toast.success(editingId ? 'Contrato actualizado' : 'Contrato creado')
            setShowModal(false); load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_contratos').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Contrato eliminado')
            setSelectedContrato(null); load()
        }
    }

    async function cambiarEstado(id: string, estado: string) {
        await supabase.from('con_contratos').update({ estado }).eq('id', id)
        toast.success('Estado actualizado')
        setSelectedContrato((prev: any) => ({ ...prev, estado }))
        load()
    }

    const adelantoMonto = (c: any) => ((parseFloat(c.monto_contrato) || 0) * (c.adelanto_porcentaje || 0)) / 100

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Contratos', val: contratos.length, color: 'text-slate-900' },
                    { label: 'Vigentes', val: contratos.filter(c => c.estado === 'vigente').length, color: 'text-emerald-600' },
                    { label: 'Monto Total', val: `S/ ${contratos.reduce((a, c) => a + (parseFloat(c.monto_contrato) || 0), 0).toLocaleString()}`, color: 'text-blue-600' },
                    { label: 'Liquidados', val: contratos.filter(c => c.estado === 'liquidado').length, color: 'text-purple-600' },
                ].map(item => (
                    <div key={item.label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className={`text-2xl font-black ${item.color}`}>{item.val}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar contrato o cliente..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Nuevo Contrato
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {['N° Contrato', 'Cliente', 'Proyecto', 'Monto', 'Adelanto', 'Plazo', 'Estado', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? [1, 2, 3].map(i => <tr key={i}><td colSpan={8} className="px-6 py-4 h-14"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                                filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                                        <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">No hay contratos registrados</p>
                                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Crear primer contrato</button>
                                    </td></tr>
                                ) : filtered.map(c => (
                                    <tr key={c.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => setSelectedContrato(c)}>
                                        <td className="px-6 py-4"><span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{c.numero}</span></td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{c.con_clientes?.razon_social || '—'}</p>
                                            <p className="text-[9px] text-slate-400">RUC: {c.con_clientes?.ruc || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 italic">{c.con_proyectos?.nombre || '—'}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">S/ {(parseFloat(c.monto_contrato) || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{c.adelanto_porcentaje}% · S/ {adelantoMonto(c).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{c.plazo_dias} días</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${statusColor[c.estado] || ''}`}>{c.estado}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={e => { e.stopPropagation(); openEdit(c) }} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button>
                                                <button onClick={e => { e.stopPropagation(); handleDelete(c.id) }} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Crear/Editar */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <h3 className="text-xl font-black text-slate-900">{editingId ? 'Editar Contrato' : 'Nuevo Contrato'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'N° Contrato *', name: 'numero' },
                                        { label: 'Estado', name: 'estado', options: Object.keys(statusColor).map(s => ({ value: s, label: s })) },
                                        { label: 'Fecha de Firma', name: 'fecha_firma', type: 'date' },
                                        { label: 'Tipo', name: 'tipo', options: [{ value: 'suma_alzada', label: 'Suma Alzada' }, { value: 'precios_unitarios', label: 'Precios Unitarios' }, { value: 'administracion_directa', label: 'Adm. Directa' }] },
                                    ].map(({ label, name, type, options }: any) => (
                                        <div key={name}>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                                            {options ? (
                                                <select value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white capitalize">
                                                    {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            ) : (
                                                <input type={type || 'text'} value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                            )}
                                        </div>
                                    ))}
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cliente *</label>
                                        <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                            <option value="">-- Seleccionar --</option>
                                            {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                            <option value="">-- Sin proyecto --</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Monto Contrato (S/)</label>
                                        <input type="number" value={form.monto_contrato} onChange={e => setForm(f => ({ ...f, monto_contrato: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Plazo (días)</label>
                                        <input type="number" value={form.plazo_dias} onChange={e => setForm(f => ({ ...f, plazo_dias: Number(e.target.value) }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">% Adelanto: {form.adelanto_porcentaje}%</label>
                                        <input type="range" min={0} max={100} value={form.adelanto_porcentaje}
                                            onChange={e => setForm(f => ({ ...f, adelanto_porcentaje: Number(e.target.value) }))}
                                            className="w-full accent-blue-600" />
                                        <p className="text-xs text-slate-500 mt-1">Monto adelanto: S/ {(parseFloat(String(form.monto_contrato || 0)) * form.adelanto_porcentaje / 100).toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notas</label>
                                        <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Contrato')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalle */}
            <AnimatePresence>
                {selectedContrato && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedContrato(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="bg-slate-900 text-white p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{selectedContrato.numero} · {selectedContrato.tipo?.replace('_', ' ')}</p>
                                        <h3 className="text-xl font-black">{selectedContrato.con_clientes?.razon_social}</h3>
                                        <p className="text-slate-400 text-sm">{selectedContrato.con_proyectos?.nombre || 'Sin proyecto'}</p>
                                    </div>
                                    <button onClick={() => setSelectedContrato(null)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
                                </div>
                                <p className="text-4xl font-black">S/ {(parseFloat(selectedContrato.monto_contrato) || 0).toLocaleString()}</p>
                                <p className="text-slate-400 text-xs mt-1">Monto contractual · {selectedContrato.moneda}</p>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Adelanto', val: `${selectedContrato.adelanto_porcentaje}% · S/ ${adelantoMonto(selectedContrato).toLocaleString()}` },
                                        { label: 'Plazo', val: `${selectedContrato.plazo_dias} días calendario` },
                                        { label: 'Fecha Firma', val: selectedContrato.fecha_firma ? new Date(selectedContrato.fecha_firma).toLocaleDateString('es-PE') : '—' },
                                        { label: 'Estado', val: selectedContrato.estado },
                                    ].map(item => (
                                        <div key={item.label} className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cambiar Estado</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.keys(statusColor).map(s => (
                                            <button key={s} onClick={() => cambiarEstado(selectedContrato.id, s)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedContrato.estado === s ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => openEdit(selectedContrato)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
                                    <Edit3 className="w-4 h-4" /> Editar
                                </button>
                                <button onClick={() => handleDelete(selectedContrato.id)} className="px-5 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
