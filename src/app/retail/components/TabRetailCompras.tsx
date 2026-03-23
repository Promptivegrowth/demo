'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ClipboardList, Plus, Search, Truck,
    Calendar, Package, Save, X, Trash2,
    ArrowDownRight, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { retQuery } from '@/lib/retQuery'

export function TabRetailCompras() {
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [search, setSearch] = useState('')

    // Formulario de compra
    const [form, setForm] = useState({
        producto_id: '',
        cantidad: 0,
        precio_compra: 0,
        motivo: 'Compra a Proveedor',
        referencia: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const p = await retQuery.getProductos()
            setProductos(p)
            setLoading(false)
        } catch (error) {
            toast.error('Error al cargar productos')
        }
    }

    const handleRegister = async () => {
        if (!form.producto_id || form.cantidad <= 0) {
            toast.warning('Ingresa producto y cantidad válida')
            return
        }
        setProcessing(true)
        try {
            const prod = productos.find(p => p.id === form.producto_id)
            await retQuery.saveMovimiento({
                producto_id: form.producto_id,
                tipo: 'entrada',
                cantidad: form.cantidad,
                precio_unitario: form.precio_compra || prod.precio_compra,
                total: (form.precio_compra || prod.precio_compra) * form.cantidad,
                motivo: form.motivo,
                referencia: form.referencia || `OC-${Date.now().toString().slice(-6)}`
            })
            toast.success('Ingreso de mercadería registrado')
            setShowModal(false)
            setForm({ producto_id: '', cantidad: 0, precio_compra: 0, motivo: 'Compra a Proveedor', referencia: '' })
            loadData()
        } catch (error) {
            toast.error('Error al registrar compra')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Abastecimiento / Compras</h3>
                    <p className="text-sm text-slate-500">Registra ingresos de mercadería para reponer tu inventario.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                    <Plus className="w-5 h-5" /> Nueva Entrada
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Proveedores Sugeridos / Links */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-x-20 -translate-y-20 blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                    <div className="relative z-10">
                        <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Truck className="w-6 h-6 text-emerald-400" /> Proveedores Activos
                        </h4>
                        <div className="space-y-4">
                            {[
                                { name: 'Arca Continental Lindley', cat: 'Bebidas', status: 'Llega mañana' },
                                { name: 'Alicorp S.A.A', cat: 'Abarrotes', status: 'Pedido en proceso' },
                                { name: 'Gloria S.A', cat: 'Lácteos', status: 'Al día' },
                            ].map((prov, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-emerald-400 text-xs">
                                            {prov.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{prov.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{prov.cat}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                            {prov.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Gestionar Proveedores
                        </button>
                    </div>
                </div>

                {/* Dashboard de Compras Breve */}
                <div className="bg-white rounded-[40px] p-8 border border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-emerald-500" /> Resumen de Reposición
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Stock Bajo</p>
                            <p className="text-3xl font-black text-slate-900">{productos.filter(p => p.stock_actual <= p.stock_minimo).length}</p>
                            <p className="text-[10px] text-red-500 font-bold mt-2 italic">Requiere Acción</p>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100/50">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Último Ingreso</p>
                            <p className="text-3xl font-black text-emerald-700">Hace 2h</p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-2">Bebidas 24u</p>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <p className="text-xs font-bold text-slate-600">Próximo cierre de mes</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">En 12 días</p>
                    </div>
                </div>
            </div>

            {/* Modal de Nueva Entrada */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-900 text-white p-10">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-2xl font-black flex items-center gap-2">
                                        <ArrowDownRight className="w-6 h-6 text-emerald-400" /> Nuevo Ingreso
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/10 rounded-2xl"><X className="w-6 h-6" /></button>
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Maestro de Mercaderías</p>
                            </div>

                            <div className="p-10 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Seleccionar Producto</label>
                                    <select
                                        value={form.producto_id}
                                        onChange={e => {
                                            const p = productos.find(x => x.id === e.target.value)
                                            setForm({ ...form, producto_id: e.target.value, precio_compra: p?.precio_compra || 0 })
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    >
                                        <option value="">Selecciona un artículo...</option>
                                        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (SKU: {p.sku})</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cantidad Ingresante</label>
                                        <input
                                            type="number"
                                            value={form.cantidad}
                                            onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Costo Unitario (Comp)</label>
                                        <input
                                            type="number"
                                            value={form.precio_compra}
                                            onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none"
                                            placeholder="S/ 0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Referencia / Factura N°</label>
                                    <input
                                        type="text"
                                        value={form.referencia}
                                        onChange={e => setForm({ ...form, referencia: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                                        placeholder="Ej: F001-000456"
                                    />
                                </div>
                            </div>

                            <div className="px-10 pb-10 flex gap-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-3xl hover:bg-slate-50 transition-all">Descartar</button>
                                <button
                                    onClick={handleRegister}
                                    disabled={processing}
                                    className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Registrar Ingreso</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
