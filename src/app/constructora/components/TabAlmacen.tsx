'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Boxes, Plus, Search, X, Save, Loader2,
    Trash2, AlertTriangle, ArrowUpCircle, ArrowDownCircle, History, Package
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function TabAlmacen() {
    const [items, setItems] = useState<any[]>([])
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [tab, setTab] = useState<'inventario' | 'movimientos'>('inventario')
    const [showModal, setShowModal] = useState(false)
    const [showMovModal, setShowMovModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        nombre: '', descripcion: '', unidad: 'UND', categoria: '',
        stock_actual: 0, stock_minimo: 5, proyecto_id: '', ubicacion: ''
    })
    const [movForm, setMovForm] = useState({
        tipo: 'entrada', cantidad: 1, precio_unitario: 0,
        motivo: '', referencia: '', fecha: new Date().toISOString().split('T')[0],
        almacen_id: ''
    })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: a }, { data: m }, { data: p }] = await Promise.all([
            supabase.from('con_almacen').select('*, con_proyectos(nombre)').order('nombre'),
            supabase.from('con_movimientos_almacen').select('*, con_almacen(nombre)').order('fecha', { ascending: false }).limit(100),
            supabase.from('con_proyectos').select('id, nombre').order('nombre')
        ])
        if (a) setItems(a)
        if (m) setMovimientos(m)
        if (p) setProyectos(p)
        setLoading(false)
    }

    const filtered = items.filter(i =>
        i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const criticos = items.filter(i => (i.stock_actual || 0) <= (i.stock_minimo || 5))

    async function handleSaveItem() {
        if (!form.nombre) { toast.error('Nombre obligatorio'); return }
        setSaving(true)
        const payload = { ...form, stock_actual: Number(form.stock_actual), stock_minimo: Number(form.stock_minimo), proyecto_id: form.proyecto_id || null }
        const funct = selectedItem
            ? supabase.from('con_almacen').update(payload).eq('id', selectedItem.id)
            : supabase.from('con_almacen').insert([payload])
        const { error } = await funct
        setSaving(false)
        if (error) { toast.error(error.message) } else {
            toast.success(selectedItem ? 'Ítem actualizado' : 'Ítem agregado al almacén')
            setShowModal(false); setSelectedItem(null); load()
        }
    }

    async function handleMovimiento() {
        if (!movForm.almacen_id) { toast.error('Selecciona el ítem'); return }
        setSaving(true)
        const item = items.find(i => i.id === movForm.almacen_id)
        const nuevoCantidad = movForm.tipo === 'entrada'
            ? (item?.stock_actual || 0) + Number(movForm.cantidad)
            : Math.max(0, (item?.stock_actual || 0) - Number(movForm.cantidad))

        const [res1] = await Promise.all([
            supabase.from('con_movimientos_almacen').insert([{
                ...movForm, cantidad: Number(movForm.cantidad),
                precio_unitario: Number(movForm.precio_unitario),
                total: Number(movForm.cantidad) * Number(movForm.precio_unitario)
            }]),
            supabase.from('con_almacen').update({ stock_actual: nuevoCantidad }).eq('id', movForm.almacen_id)
        ])
        setSaving(false)
        if (res1.error) { toast.error(res1.error.message) } else {
            toast.success(`Movimiento de ${movForm.tipo} registrado`)
            setShowMovModal(false); load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_almacen').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Ítem eliminado'); load()
        }
    }

    return (
        <div className="space-y-6">
            {/* Alerts */}
            {criticos.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {criticos.length} ítem(s) con stock crítico: {criticos.map(i => i.nombre).slice(0, 3).join(', ')}{criticos.length > 3 ? '...' : ''}
                </div>
            )}

            {/* Tab switcher */}
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                    {[{ id: 'inventario', label: 'Inventario' }, { id: 'movimientos', label: 'Kardex / Movimientos' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as any)}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setMovForm({ tipo: 'entrada', cantidad: 1, precio_unitario: 0, motivo: '', referencia: '', fecha: new Date().toISOString().split('T')[0], almacen_id: '' }); setShowMovModal(true) }}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
                        <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> Movimiento
                    </button>
                    <button onClick={() => { setForm({ nombre: '', descripcion: '', unidad: 'UND', categoria: '', stock_actual: 0, stock_minimo: 5, proyecto_id: '', ubicacion: '' }); setSelectedItem(null); setShowModal(true) }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> Nuevo Ítem
                    </button>
                </div>
            </div>

            {tab === 'inventario' ? (
                <>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Buscar material o categoría..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                    </div>
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>{['Material / Insumo', 'Categoría', 'Unidad', 'Stock', 'Mínimo', 'Proyecto', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? [1, 2, 3].map(i => <tr key={i}><td colSpan={7} className="px-6 py-4 h-14"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                                    filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                                            <Boxes className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-bold">Almacén vacío</p>
                                            <button onClick={() => setShowModal(true)} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Registrar primer ítem</button>
                                        </td></tr>
                                    ) : filtered.map(item => {
                                        const isCritico = (item.stock_actual || 0) <= (item.stock_minimo || 5)
                                        return (
                                            <tr key={item.id} className="group hover:bg-blue-50/20 transition-all">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                                                    {item.ubicacion && <p className="text-[10px] text-slate-400">{item.ubicacion}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">{item.categoria || '—'}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.unidad}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-lg font-black ${isCritico ? 'text-red-600' : 'text-slate-900'}`}>{item.stock_actual || 0}</span>
                                                    {isCritico && <span className="ml-2 text-[8px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">Crítico</span>}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400">{item.stock_minimo || 5}</td>
                                                <td className="px-6 py-4 text-xs text-slate-500">{item.con_proyectos?.nombre || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setSelectedItem(item); setForm({ nombre: item.nombre, descripcion: item.descripcion || '', unidad: item.unidad, categoria: item.categoria || '', stock_actual: item.stock_actual, stock_minimo: item.stock_minimo, proyecto_id: item.proyecto_id || '', ubicacion: item.ubicacion || '' }); setShowModal(true) }}
                                                            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500"><Package className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>{['Fecha', 'Ítem', 'Tipo', 'Cantidad', 'P. Unit.', 'Total', 'Motivo'].map(h => (
                                <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? [1, 2, 3].map(i => <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                                movimientos.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                                        <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">Sin movimientos registrados</p>
                                    </td></tr>
                                ) : movimientos.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 text-xs text-slate-500">{m.fecha}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{m.con_almacen?.nombre || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase w-fit px-2 py-1 rounded-full ${m.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {m.tipo === 'entrada' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                                {m.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">{m.cantidad}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">S/ {(m.precio_unitario || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">S/ {(m.total || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{m.motivo || '—'}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Ítem Almacén */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <h3 className="text-xl font-black text-slate-900">{selectedItem ? 'Editar Ítem' : 'Nuevo Ítem de Almacén'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Material *</label>
                                        <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    {[
                                        { label: 'Unidad', name: 'unidad', options: ['UND', 'M2', 'M3', 'ML', 'KG', 'TN', 'GLB', 'BLS', 'GAL', 'LT'] },
                                        { label: 'Categoría', name: 'categoria' },
                                        { label: 'Stock Actual', name: 'stock_actual', type: 'number' },
                                        { label: 'Stock Mínimo', name: 'stock_minimo', type: 'number' },
                                        { label: 'Ubicación', name: 'ubicacion' },
                                    ].map(({ label, name, type, options }: any) => (
                                        <div key={name}>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                                            {options ? (
                                                <select value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                                    {options.map((o: string) => <option key={o}>{o}</option>)}
                                                </select>
                                            ) : (
                                                <input type={type || 'text'} value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                            )}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                            <option value="">General</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSaveItem}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : (selectedItem ? 'Actualizar' : 'Agregar')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Movimiento */}
            <AnimatePresence>
                {showMovModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowMovModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <h3 className="text-xl font-black text-slate-900">Registrar Movimiento</h3>
                                <button onClick={() => setShowMovModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo</label>
                                    <div className="flex gap-3">
                                        {['entrada', 'salida'].map(t => (
                                            <button key={t} onClick={() => setMovForm(f => ({ ...f, tipo: t }))}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${movForm.tipo === t ? (t === 'entrada' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                                {t === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ítem *</label>
                                    <select value={movForm.almacen_id} onChange={e => setMovForm(f => ({ ...f, almacen_id: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                        <option value="">-- Seleccionar material --</option>
                                        {items.map(i => <option key={i.id} value={i.id}>{i.nombre} (Stock: {i.stock_actual})</option>)}
                                    </select>
                                </div>
                                {[
                                    { label: 'Cantidad', name: 'cantidad', type: 'number' },
                                    { label: 'Precio Unitario (S/)', name: 'precio_unitario', type: 'number' },
                                    { label: 'Fecha', name: 'fecha', type: 'date' },
                                    { label: 'Motivo / Referencia', name: 'motivo' },
                                ].map(({ label, name, type }: any) => (
                                    <div key={name}>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                                        <input type={type || 'text'} value={(movForm as any)[name]} onChange={e => setMovForm(f => ({ ...f, [name]: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                ))}
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowMovModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleMovimiento}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Registrando...' : 'Registrar Movimiento'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
