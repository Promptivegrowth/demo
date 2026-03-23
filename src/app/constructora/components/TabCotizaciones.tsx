'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, FileText, Download, Send,
    CheckCircle, Clock, X, DollarSign, User,
    Building, Trash2, Edit3, Save, Loader2,
    Printer, XCircle, Copy
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const statusColor: Record<string, string> = {
    borrador: 'bg-slate-100 text-slate-500',
    enviada: 'bg-blue-100 text-blue-600',
    aprobada: 'bg-emerald-100 text-emerald-600',
    rechazada: 'bg-red-100 text-red-600',
    vencida: 'bg-amber-100 text-amber-600',
}

const EMPTY_ITEM = { descripcion: '', unidad: 'GLB', cantidad: 1, precio_unitario: 0 }

export function TabCotizaciones() {
    const [cotizaciones, setCotizaciones] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCot, setSelectedCot] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        numero: '', cliente_id: '', proyecto_id: '',
        fecha: new Date().toISOString().split('T')[0],
        validez_dias: 15, plazo_ejecucion: '',
        condiciones_pago: '50% adelanto, saldo a la entrega',
        estado: 'borrador', incluye_igv: true, notas: ''
    })
    const [items, setItems] = useState([{ ...EMPTY_ITEM }])

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: c }, { data: cl }, { data: p }] = await Promise.all([
            supabase.from('con_cotizaciones').select('*, con_clientes(razon_social, ruc), con_proyectos(nombre, codigo)').order('created_at', { ascending: false }),
            supabase.from('con_clientes').select('id, razon_social, ruc, direccion').order('razon_social'),
            supabase.from('con_proyectos').select('id, nombre, codigo').order('nombre')
        ])
        if (c) setCotizaciones(c)
        if (cl) setClientes(cl)
        if (p) setProyectos(p)
        setLoading(false)
    }

    const subtotal = items.reduce((a, i) => a + ((i.cantidad || 0) * (i.precio_unitario || 0)), 0)
    const igv = form.incluye_igv ? subtotal * 0.18 : 0
    const total = subtotal + igv

    const filtered = cotizaciones.filter(c =>
        c.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.con_clientes?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function openNew() {
        const nextNum = `COT-${String(cotizaciones.length + 1).padStart(4, '0')}`
        setForm({ numero: nextNum, cliente_id: '', proyecto_id: '', fecha: new Date().toISOString().split('T')[0], validez_dias: 15, plazo_ejecucion: '', condiciones_pago: '50% adelanto, saldo a la entrega', estado: 'borrador', incluye_igv: true, notas: '' })
        setItems([{ ...EMPTY_ITEM }])
        setShowModal(true)
    }

    function addItem() { setItems(prev => [...prev, { ...EMPTY_ITEM }]) }
    function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
    function updateItem(i: number, field: string, val: any) {
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
    }

    async function handleSave() {
        if (!form.cliente_id) { toast.error('Selecciona un cliente'); return }
        if (items.every(i => !i.descripcion)) { toast.error('Agrega al menos un ítem'); return }
        setSaving(true)
        const { data: cot, error } = await supabase.from('con_cotizaciones').insert([{
            ...form,
            subtotal, igv, total,
            proyecto_id: form.proyecto_id || null,
            validez_dias: Number(form.validez_dias)
        }]).select().single()

        if (error || !cot) { toast.error('Error: ' + error?.message); setSaving(false); return }

        // Insert items
        const itemsToInsert = items.filter(i => i.descripcion).map(i => ({
            cotizacion_id: cot.id,
            descripcion: i.descripcion,
            unidad: i.unidad,
            cantidad: Number(i.cantidad),
            precio_unitario: Number(i.precio_unitario),
            subtotal: Number(i.cantidad) * Number(i.precio_unitario)
        }))
        if (itemsToInsert.length > 0) {
            await supabase.from('con_cotizacion_items').insert(itemsToInsert)
        }

        setSaving(false)
        toast.success('Cotización creada exitosamente')
        setShowModal(false)
        load()
    }

    async function updateEstado(id: string, estado: string) {
        const { error } = await supabase.from('con_cotizaciones').update({ estado }).eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success(`Estado actualizado a: ${estado}`)
            setSelectedCot((prev: any) => ({ ...prev, estado }))
            load()
        }
    }

    async function handleDelete(id: string) {
        await supabase.from('con_cotizacion_items').delete().eq('cotizacion_id', id)
        const { error } = await supabase.from('con_cotizaciones').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Cotización eliminada')
            setSelectedCot(null); load()
        }
    }

    const clienteInfo = clientes.find(c => c.id === form.cliente_id)

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar número o cliente..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Nueva Cotización
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                {['N°', 'Cliente', 'Proyecto', 'Total', 'Validez', 'Estado', 'Acciones'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? [1, 2, 3].map(i => <tr key={i}><td colSpan={7} className="px-6 py-4 h-16"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                                filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">No hay cotizaciones</p>
                                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Crear primera cotización</button>
                                    </td></tr>
                                ) : filtered.map(cot => (
                                    <tr key={cot.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => setSelectedCot(cot)}>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{cot.numero}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-800">{cot.con_clientes?.razon_social}</p>
                                            <p className="text-[10px] text-slate-400">RUC: {cot.con_clientes?.ruc || '—'}</p>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-500 italic">{cot.con_proyectos?.nombre || 'General'}</td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-slate-900">S/ {(cot.total || 0).toLocaleString()}</p>
                                            <p className="text-[9px] text-emerald-500 font-bold">{cot.incluye_igv ? 'Inc. IGV' : 'Sin IGV'}</p>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-500">{cot.validez_dias || 15} días</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${statusColor[cot.estado] || ''}`}>{cot.estado}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={e => { e.stopPropagation(); toast.info('Función de impresión próximamente') }}
                                                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500 shadow-sm"><Printer className="w-4 h-4" /></button>
                                                <button onClick={e => { e.stopPropagation(); handleDelete(cot.id) }}
                                                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nueva Cotización */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Nueva Cotización</h3>
                                    <p className="text-xs text-slate-400">{form.numero}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {/* Header form */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">N° Cotización</label>
                                        <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha</label>
                                        <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Validez (días)</label>
                                        <input type="number" value={form.validez_dias} onChange={e => setForm(f => ({ ...f, validez_dias: Number(e.target.value) }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="col-span-2 md:col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cliente *</label>
                                        <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                            <option value="">-- Seleccionar cliente --</option>
                                            {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                            <option value="">General</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Ítems / Partidas</h4>
                                        <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                                            <Plus className="w-3.5 h-3.5" /> Agregar ítem
                                        </button>
                                    </div>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase w-1/2">Descripción</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Unid.</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Cant.</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">P. Unit. S/</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Subtotal</th>
                                                    <th className="px-4 py-3 w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {items.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-2 py-2">
                                                            <input value={item.descripcion} onChange={e => updateItem(i, 'descripcion', e.target.value)}
                                                                placeholder="Descripción del servicio..."
                                                                className="w-full px-2 py-1.5 text-xs border border-transparent hover:border-slate-200 focus:border-blue-400 rounded-lg outline-none" />
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <select value={item.unidad} onChange={e => updateItem(i, 'unidad', e.target.value)}
                                                                className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white w-20">
                                                                {['GLB', 'M2', 'M3', 'ML', 'UND', 'KG', 'TN', 'DIA'].map(u => <option key={u}>{u}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <input type="number" value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)}
                                                                className="w-20 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <input type="number" value={item.precio_unitario} onChange={e => updateItem(i, 'precio_unitario', e.target.value)}
                                                                className="w-28 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                                        </td>
                                                        <td className="px-4 py-2 text-xs font-black text-slate-900 text-right">
                                                            {((item.cantidad || 0) * (item.precio_unitario || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <button onClick={() => removeItem(i)} className="p-1 hover:bg-red-100 rounded text-slate-300 hover:text-red-500 transition-all">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totales + Condiciones */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Condiciones de Pago</label>
                                            <input value={form.condiciones_pago} onChange={e => setForm(f => ({ ...f, condiciones_pago: e.target.value }))}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Plazo de Ejecución</label>
                                            <input value={form.plazo_ejecucion} onChange={e => setForm(f => ({ ...f, plazo_ejecucion: e.target.value }))}
                                                placeholder="Ej: 45 días calendarios"
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={form.incluye_igv} onChange={e => setForm(f => ({ ...f, incluye_igv: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                                            <span className="text-sm font-bold text-slate-700">Precio incluye IGV (18%)</span>
                                        </label>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Subtotal</span><span className="font-bold">S/ {subtotal.toFixed(2)}</span>
                                        </div>
                                        {form.incluye_igv && (
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>IGV (18%)</span><span className="font-bold">S/ {igv.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-slate-200" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total</span>
                                            <span className="text-xl font-black text-slate-900">S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Crear Cotización'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalle */}
            <AnimatePresence>
                {selectedCot && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedCot(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[#f8fafc] w-full max-w-3xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="bg-white p-8 border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedCot.numero} · {selectedCot.fecha}</p>
                                        <h3 className="text-2xl font-black text-slate-900">Cotización de Servicios</h3>
                                        <p className="text-sm text-slate-500 mt-1">Cliente: {selectedCot.con_clientes?.razon_social}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${statusColor[selectedCot.estado] || ''}`}>{selectedCot.estado}</span>
                                        <button onClick={() => setSelectedCot(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Cliente</p>
                                        <p className="font-bold text-slate-800">{selectedCot.con_clientes?.razon_social}</p>
                                        <p className="text-xs text-slate-500">RUC: {selectedCot.con_clientes?.ruc || '—'}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Detalles</p>
                                        <p className="text-xs text-slate-600">Validez: <strong>{selectedCot.validez_dias} días</strong></p>
                                        <p className="text-xs text-slate-600">Plazo: <strong>{selectedCot.plazo_ejecucion || '—'}</strong></p>
                                        <p className="text-xs text-slate-600">Pago: <strong>{selectedCot.condiciones_pago || '—'}</strong></p>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                    <div className="flex justify-between mb-2 text-sm text-slate-600">
                                        <span>Subtotal</span><span className="font-bold">S/ {(selectedCot.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    {selectedCot.incluye_igv && (
                                        <div className="flex justify-between mb-2 text-sm text-slate-600">
                                            <span>IGV (18%)</span><span className="font-bold">S/ {(selectedCot.igv || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-slate-100 my-3" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-slate-900">TOTAL</span>
                                        <span className="text-2xl font-black text-slate-900">S/ {(selectedCot.total || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Actions de estado */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Cambiar Estado</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'].map(s => (
                                            <button key={s} onClick={() => updateEstado(selectedCot.id, s)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${selectedCot.estado === s ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 border-t flex justify-between items-center">
                                <button onClick={() => handleDelete(selectedCot.id)}
                                    className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                                <button onClick={() => toast.info('Exportación PDF próximamente')}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg transition-all">
                                    <Download className="w-4 h-4" /> Descargar PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
