'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Edit2, Trash2, Package,
    AlertTriangle, Filter, ChevronRight, Save, X, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { retQuery } from '@/lib/retQuery'

export function TabRetailInventario() {
    const [productos, setProductos] = useState<any[]>([])
    const [categorias, setCategorias] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingProd, setEditingProd] = useState<any>(null)
    const [form, setForm] = useState({
        nombre: '',
        sku: '',
        categoria_id: '',
        precio_compra: 0,
        precio_venta: 0,
        stock_minimo: 5,
        unidad: 'UND'
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [p, c] = await Promise.all([
                retQuery.getProductos(),
                retQuery.getCategorias()
            ])
            setProductos(p)
            setCategorias(c)
            setLoading(false)
        } catch (error) {
            toast.error('Error al cargar inventario')
        }
    }

    const handleSave = async () => {
        if (!form.nombre || !form.categoria_id) {
            toast.warning('Completa los campos obligatorios')
            return
        }
        try {
            await retQuery.saveProducto(editingProd ? { ...form, id: editingProd.id } : form)
            toast.success(editingProd ? 'Producto actualizado' : 'Producto creado')
            setShowModal(false)
            setEditingProd(null)
            loadData()
        } catch (error) {
            toast.error('Error al guardar producto')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return
        try {
            await retQuery.deleteProducto(id)
            toast.success('Producto eliminado')
            loadData()
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Maestro de Artículos</h3>
                    <p className="text-sm text-slate-500">Gestiona tus productos, precios y niveles de stock.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500" />
                        <input
                            type="text" placeholder="Buscar..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingProd(null); setForm({ nombre: '', sku: '', categoria_id: '', precio_compra: 0, precio_venta: 0, stock_minimo: 5, unidad: 'UND' }); setShowModal(true) }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Producto
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((p) => (
                        <motion.div
                            layout key={p.id}
                            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-slate-50 ${p.stock_actual <= p.stock_minimo ? 'bg-red-50' : 'group-hover:bg-emerald-50'} transition-colors`}>
                                    <Package className={`w-6 h-6 ${p.stock_actual <= p.stock_minimo ? 'text-red-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingProd(p); setForm(p); setShowModal(true) }} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{p.ret_categorias?.nombre}</p>
                                <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{p.nombre}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU: {p.sku || 'S/N'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stock</p>
                                    <p className={`text-sm font-black ${p.stock_actual <= p.stock_minimo ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>{p.stock_actual} {p.unidad}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">P. Venta</p>
                                    <p className="text-sm font-black text-slate-900 uppercase">S/ {p.precio_venta.toFixed(2)}</p>
                                </div>
                            </div>

                            {p.stock_actual <= p.stock_minimo && (
                                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Stock Crítico</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal de Producto */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-900 text-white p-8">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-2xl font-black">{editingProd ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">{editingProd ? editingProd.sku : 'Registro Maestro'}</p>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre del Producto</label>
                                    <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">SKU / Código</label>
                                    <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Categoría</label>
                                    <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none">
                                        <option value="">Seleccionar...</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Precio Compra</label>
                                    <input type="number" value={form.precio_compra} onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Precio Venta</label>
                                    <input type="number" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                                </div>
                            </div>

                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 font-bold rounded-3xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest text-center">Cancelar</button>
                                <button onClick={handleSave} className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-3xl transition-all uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> Guardar Producto
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
