'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, Plus, Search, X, Save, Loader2,
    Trash2, Edit3, Package, TrendingUp, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const statusColor: Record<string, string> = {
    borrador: 'bg-slate-100 text-slate-500',
    enviada: 'bg-blue-100 text-blue-600',
    recibida: 'bg-emerald-100 text-emerald-600',
    cancelada: 'bg-red-100 text-red-600',
    parcial: 'bg-amber-100 text-amber-600',
}

const EMPTY_ITEM = { descripcion: '', unidad: 'UND', cantidad: 1, precio_unitario: 0 }

export function TabCompras() {
    const [ordenes, setOrdenes] = useState<any[]>([])
    const [proveedores, setProveedores] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showProvModal, setShowProvModal] = useState(false)
    const [selectedOC, setSelectedOC] = useState<any>(null)
    const [ocItems, setOcItems] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [items, setItems] = useState([{ ...EMPTY_ITEM }])
    const [form, setForm] = useState({
        numero: '', proveedor_id: '', proyecto_id: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_entrega: '', estado: 'borrador', condiciones_pago: 'Contado', notas: ''
    })
    const [formProv, setFormProv] = useState({ razon_social: '', ruc: '', contacto: '', telefono: '', email: '', banco: '', cuenta_bancaria: '' })
    const [loadingItems, setLoadingItems] = useState(false)

    useEffect(() => { load() }, [])

    useEffect(() => {
        if (selectedOC?.id) loadItems(selectedOC.id)
    }, [selectedOC])

    async function loadItems(id: string) {
        setLoadingItems(true)
        const { data } = await supabase.from('con_items_oc').select('*').eq('orden_id', id)
        if (data) setOcItems(data)
        setLoadingItems(false)
    }

    async function load() {
        setLoading(true)
        const [{ data: o }, { data: prov }, { data: p }] = await Promise.all([
            supabase.from('con_ordenes_compra').select('*, con_proveedores(razon_social, ruc), con_proyectos(nombre, codigo)').order('created_at', { ascending: false }),
            supabase.from('con_proveedores').select('id, razon_social, ruc').order('razon_social'),
            supabase.from('con_proyectos').select('id, nombre, codigo').order('nombre')
        ])
        if (o) setOrdenes(o)
        if (prov) setProveedores(prov)
        if (p) setProyectos(p)
        setLoading(false)
    }

    const filtered = ordenes.filter(o =>
        o.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.con_proveedores?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const subtotal = items.reduce((a, i) => a + (Number(i.cantidad) * Number(i.precio_unitario)), 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv

    function openNew() {
        const n = `OC-${String(ordenes.length + 1).padStart(4, '0')}`
        setForm({ numero: n, proveedor_id: '', proyecto_id: '', fecha_emision: new Date().toISOString().split('T')[0], fecha_entrega: '', estado: 'borrador', condiciones_pago: 'Contado', notas: '' })
        setItems([{ ...EMPTY_ITEM }])
        setShowModal(true)
    }

    async function handleSave() {
        if (!form.proveedor_id) { toast.error('Selecciona un proveedor'); return }
        setSaving(true)
        const { data: oc, error } = await supabase.from('con_ordenes_compra').insert([{
            ...form, subtotal, igv, total,
            proyecto_id: form.proyecto_id || null
        }]).select().single()
        if (error || !oc) { toast.error('Error: ' + error?.message); setSaving(false); return }
        const itemsToInsert = items.filter(i => i.descripcion).map(i => ({
            orden_id: oc.id, descripcion: i.descripcion, unidad: i.unidad,
            cantidad: Number(i.cantidad), precio_unitario: Number(i.precio_unitario),
            subtotal: Number(i.cantidad) * Number(i.precio_unitario)
        }))
        if (itemsToInsert.length > 0) await supabase.from('con_items_oc').insert(itemsToInsert)
        setSaving(false)
        toast.success('Orden de Compra creada')
        setShowModal(false); load()
    }

    async function handleSaveProv() {
        if (!formProv.razon_social) { toast.error('Nombre del proveedor es obligatorio'); return }
        const { error } = await supabase.from('con_proveedores').insert([formProv])
        if (error) { toast.error(error.message) } else {
            toast.success('Proveedor registrado')
            setShowProvModal(false)
            const { data } = await supabase.from('con_proveedores').select('id, razon_social, ruc').order('razon_social')
            if (data) setProveedores(data)
        }
    }

    async function updateEstado(id: string, estado: string) {
        await supabase.from('con_ordenes_compra').update({ estado }).eq('id', id)
        toast.success('Estado actualizado')
        setSelectedOC((p: any) => ({ ...p, estado })); load()
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_ordenes_compra').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('OC eliminada'); setSelectedOC(null); load()
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total OC', val: ordenes.length },
                    { label: 'Enviadas', val: ordenes.filter(o => o.estado === 'enviada').length },
                    { label: 'Recibidas', val: ordenes.filter(o => o.estado === 'recibida').length },
                    { label: 'Monto Total', val: `S/ ${ordenes.reduce((a, o) => a + (o.total || 0), 0).toLocaleString()}` }
                ].map(item => (
                    <div key={item.label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-2xl font-black text-slate-900">{item.val}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar OC o proveedor..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setFormProv({ razon_social: '', ruc: '', contacto: '', telefono: '', email: '', banco: '', cuenta_bancaria: '' }); setShowProvModal(true) }}
                        className="px-4 py-3 border border-slate-200 bg-white text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">
                        + Proveedor
                    </button>
                    <button onClick={openNew}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> Nueva OC
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>{['N° OC', 'Proveedor', 'Proyecto', 'Total', 'F. Entrega', 'Estado', ''].map(h => (
                                <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? [1, 2, 3].map(i => <tr key={i}><td colSpan={7} className="px-6 py-3 h-14"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                                filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">No hay órdenes de compra</p>
                                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Crear primera OC</button>
                                    </td></tr>
                                ) : filtered.map(o => (
                                    <tr key={o.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => setSelectedOC(o)}>
                                        <td className="px-6 py-4"><span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{o.numero}</span></td>
                                        <td className="px-6 py-4"><p className="text-sm font-bold text-slate-800">{o.con_proveedores?.razon_social || '—'}</p></td>
                                        <td className="px-6 py-4 text-xs text-slate-500 italic">{o.con_proyectos?.nombre || '—'}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">S/ {(o.total || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{o.fecha_entrega || '—'}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${statusColor[o.estado] || ''}`}>{o.estado}</span></td>
                                        <td className="px-6 py-4">
                                            <button onClick={e => { e.stopPropagation(); handleDelete(o.id) }}
                                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg text-red-500 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nueva OC */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Nueva Orden de Compra</h3>
                                    <p className="text-xs text-slate-400">{form.numero}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'N° OC', name: 'numero' },
                                        { label: 'F. Emisión', name: 'fecha_emision', type: 'date' },
                                        { label: 'F. Entrega', name: 'fecha_entrega', type: 'date' },
                                    ].map(({ label, name, type }: any) => (
                                        <div key={name}>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                                            <input type={type || 'text'} value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                    ))}
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proveedor *</label>
                                        <div className="flex gap-2">
                                            <select value={form.proveedor_id} onChange={e => setForm(f => ({ ...f, proveedor_id: e.target.value }))}
                                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                                <option value="">-- Seleccionar --</option>
                                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                                            </select>
                                            <button onClick={() => setShowProvModal(true)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 whitespace-nowrap">+ Nuevo</button>
                                        </div>
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
                                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Materiales / Servicios</h4>
                                        <button onClick={() => setItems(p => [...p, { ...EMPTY_ITEM }])} className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                            <Plus className="w-3.5 h-3.5" /> Agregar ítem
                                        </button>
                                    </div>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 w-1/2">Descripción</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400">Unid.</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 text-right">Cant.</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 text-right">P. Unit.</th>
                                                    <th className="px-4 py-3 text-[9px] font-bold text-slate-400 text-right">Subtotal</th>
                                                    <th className="w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {items.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-2 py-2"><input value={item.descripcion} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, descripcion: e.target.value } : it))} placeholder="Material o servicio..." className="w-full px-2 py-1.5 text-xs border border-transparent hover:border-slate-200 focus:border-blue-400 rounded-lg outline-none" /></td>
                                                        <td className="px-2 py-2"><select value={item.unidad} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, unidad: e.target.value } : it))} className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white w-20">{['UND', 'M2', 'M3', 'ML', 'KG', 'TN', 'GLB', 'BLS', 'BOL'].map(u => <option key={u}>{u}</option>)}</select></td>
                                                        <td className="px-2 py-2"><input type="number" value={item.cantidad} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, cantidad: Number(e.target.value) } : it))} className="w-20 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-blue-400" /></td>
                                                        <td className="px-2 py-2"><input type="number" value={item.precio_unitario} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, precio_unitario: Number(e.target.value) } : it))} className="w-28 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-blue-400" /></td>
                                                        <td className="px-4 py-2 text-xs font-black text-right">{(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                        <td className="px-2 py-2"><button onClick={() => setItems(p => p.filter((_, idx) => idx !== i))} className="p-1 hover:bg-red-100 rounded text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totales */}
                                <div className="flex justify-end">
                                    <div className="bg-slate-50 p-5 rounded-2xl w-64 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-bold">S/ {subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-sm text-slate-600"><span>IGV 18%</span><span className="font-bold">S/ {igv.toFixed(2)}</span></div>
                                        <div className="h-px bg-slate-200" />
                                        <div className="flex justify-between items-center"><span className="font-black text-sm text-slate-900">Total</span><span className="text-xl font-black text-slate-900">S/ {total.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Crear OC'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Proveedor Rápido */}
            <AnimatePresence>
                {showProvModal && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowProvModal(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-md rounded-[28px] shadow-2xl p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900">Nuevo Proveedor</h3>
                                <button onClick={() => setShowProvModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Razón Social *', name: 'razon_social' },
                                    { label: 'RUC', name: 'ruc' },
                                    { label: 'Contacto', name: 'contacto' },
                                    { label: 'Teléfono', name: 'telefono' },
                                    { label: 'Email', name: 'email', type: 'email' },
                                ].map(({ label, name, type }: any) => (
                                    <div key={name}>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                                        <input type={type || 'text'} value={(formProv as any)[name]} onChange={e => setFormProv(f => ({ ...f, [name]: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowProvModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold">Cancelar</button>
                                <button onClick={handleSaveProv}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800">
                                    Guardar Proveedor
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalle OC */}
            <AnimatePresence>
                {selectedOC && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedOC(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="bg-slate-900 text-white p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{selectedOC.numero}</p>
                                        <h3 className="text-xl font-black">{selectedOC.con_proveedores?.razon_social || 'Proveedor'}</h3>
                                        <p className="text-slate-400 text-sm">{selectedOC.con_proyectos?.nombre || 'Sin proyecto'}</p>
                                    </div>
                                    <button onClick={() => setSelectedOC(null)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="mt-4">
                                    <p className="text-4xl font-black">S/ {(selectedOC.total || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Subtotal</p><p className="text-sm font-bold mt-1">S/ {(selectedOC.subtotal || 0).toLocaleString()}</p></div>
                                    <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IGV</p><p className="text-sm font-bold mt-1">S/ {(selectedOC.igv || 0).toLocaleString()}</p></div>
                                    <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">F. Emisión</p><p className="text-sm font-bold mt-1">{selectedOC.fecha_emision || '—'}</p></div>
                                    <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">F. Entrega</p><p className="text-sm font-bold mt-1">{selectedOC.fecha_entrega || '—'}</p></div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cambiar Estado</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.keys(statusColor).map(s => (
                                            <button key={s} onClick={() => updateEstado(selectedOC.id, s)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedOC.estado === s ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 pt-0 space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Materiales / Servicios</p>
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                                                <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Cant.</th>
                                                <th className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {loadingItems ? <tr><td colSpan={3} className="p-4 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-400" /></td></tr> :
                                                ocItems.length === 0 ? <tr><td colSpan={3} className="p-4 text-center text-[10px] text-slate-400">Sin ítems</td></tr> :
                                                    ocItems.map((it, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-2 text-xs font-bold text-slate-700">{it.descripcion}</td>
                                                            <td className="px-4 py-2 text-xs text-slate-500 text-right">{it.cantidad} {it.unidad}</td>
                                                            <td className="px-4 py-2 text-xs font-black text-slate-900 text-right">S/ {(it.subtotal || 0).toLocaleString()}</td>
                                                        </tr>
                                                    ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => { setSelectedOC(null); toast.success('Reporte generado') }}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Imprimir OC</button>
                                <button onClick={() => handleDelete(selectedOC.id)}
                                    className="px-5 py-3 bg-rose-50 text-rose-500 rounded-2xl font-bold hover:bg-rose-100 transition-all">
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
