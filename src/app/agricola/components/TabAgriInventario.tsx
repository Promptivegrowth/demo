'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Boxes, Search, AlertTriangle, TrendingUp,
    ArrowUpRight, ArrowDownRight, Package,
    Plus, CheckCircle2, AlertCircle, Download
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriInventario() {
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showAjuste, setShowAjuste] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [ajusteQty, setAjusteQty] = useState(0)
    const [ajusteMotivo, setAjusteMotivo] = useState('')
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [viewMode, setViewMode] = useState<'kardex' | 'historial'>('kardex')
    const [isAdjusting, setIsAdjusting] = useState(false)

    const exportToExcel = () => {
        if (productos.length === 0) return toast.error('No hay datos para exportar')
        const headers = ['Producto', 'Categoria', 'Stock Actual', 'Stock Minimo', 'Costo', 'Precio']
        const csvContent = "data:text/csv;charset=utf-8," +
            headers.join(",") + "\n" +
            productos.map(p => `${p.nombre},${p.categoria},${p.stock_actual},${p.stock_minimo},${p.costo_promedio},${p.precio_contado}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Inventario_Consolidado_Agro.csv");
        document.body.appendChild(link);
        link.click();
        toast.success('Inventario exportado correctamente')
    }

    async function load() {
        setLoading(true)
        try {
            const [pData, mData] = await Promise.all([
                agriService.getProductos(),
                agriService.getMovimientos()
            ])
            setProductos(pData)
            setMovimientos(mData)
        } catch (err) {
            toast.error('Error al cargar inventario')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleAjuste = async () => {
        if (!selectedProduct || !ajusteMotivo) return toast.error('Complete todos los campos');
        try {
            await agriService.registrarAjuste(selectedProduct.id, ajusteQty, ajusteMotivo);
            toast.success('Ajuste registrado correctamente');
            setShowAjuste(false);
            setAjusteQty(0);
            setAjusteMotivo('');
            load();
        } catch (err) {
            toast.error('Error al realizar ajuste');
        }
    }

    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<any>(null)

    const handleSaveEdit = async () => {
        if (!editData) return;
        try {
            await agriService.updateProducto(editData.id, editData);
            toast.success('Producto actualizado');
            setIsEditing(false);
            load();
        } catch (err) {
            toast.error('Error al actualizar');
        }
    }

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.marca && p.marca.toLowerCase().includes(search.toLowerCase()))
    )

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#166534] animate-pulse">Sincronizando Kárdex...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header & Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Insumos Totales', val: productos.length, icon: Boxes, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Stock Crítico', val: productos.filter(p => Number(p.stock_actual) <= Number(p.stock_minimo)).length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Valorización Total', val: `S/ ${productos.reduce((acc, p) => acc + (Number(p.stock_actual) * Number(p.precio_contado)), 0).toLocaleString()}`, icon: Package, color: 'text-green-400', bg: 'bg-[#052c16] text-white' }
                ].map((s, i) => (
                    <div key={i} className={`${s.bg} p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-8 group`}>
                        <div className={`w-16 h-16 rounded-2xl ${s.bg.includes('052c16') ? 'bg-white/10' : 'bg-white'} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                            <s.icon className={`w-8 h-8 ${s.color}`} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${s.bg.includes('052c16') ? 'text-green-400/60' : 'text-slate-400'}`}>{s.label}</p>
                            <p className="text-3xl font-black tracking-tighter">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[600px] relative">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('kardex')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'kardex' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Kárdex Maestra
                            </button>
                            <button
                                onClick={() => setViewMode('historial')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'historial' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Historial de Auditoría
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-3 gap-4 border border-slate-200 focus-within:ring-4 ring-green-500/10 transition-all">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar insumo o marca..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-48 font-bold"
                            />
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="px-8 py-4 bg-white border-2 border-slate-100 text-[#166534] rounded-2xl font-black text-[10px] hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3 uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" />
                            Exportar Data
                        </button>
                        <button
                            onClick={() => {
                                setSelectedProduct(null)
                                setShowAjuste(true)
                            }}
                            className="px-8 py-4 bg-[#166534] text-white rounded-2xl font-black text-[10px] hover:scale-105 transition-all shadow-xl shadow-green-950/20 uppercase tracking-widest"
                        >
                            + Registrar Ajuste
                        </button>
                    </div>
                </div>

                <div className="p-8 flex-1">
                    {viewMode === 'kardex' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 h-full max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                            {filtered.map(p => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 relative group hover:bg-white hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${p.stock_actual <= p.stock_minimo ? 'bg-red-50 border-red-100' : 'bg-white border-white shadow-sm'}`}>
                                            <Package className={`w-7 h-7 ${p.stock_actual <= p.stock_minimo ? 'text-red-500' : 'text-[#166534]'}`} />
                                        </div>
                                        <button
                                            onClick={() => { setIsEditing(true); setEditData(p); }}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-green-600"
                                        >
                                            <Plus className="w-4 h-4 rotate-45" /> Elinar
                                        </button>
                                    </div>

                                    <h5 className="font-black text-slate-800 text-sm tracking-tight mb-1 uppercase">{p.nombre}</h5>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{p.categoria} • {p.marca || 'Genérico'}</p>

                                    {p.ficha_tecnica && (
                                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 line-clamp-2 italic font-medium">
                                            "{p.ficha_tecnica}"
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                                            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Stock Actual</p>
                                            <p className={`text-lg font-black ${p.stock_actual <= p.stock_minimo ? 'text-red-600' : 'text-slate-800'}`}>
                                                {p.stock_actual} <span className="text-[10px] text-slate-400">{p.presentacion}</span>
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                                            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">P. Contado</p>
                                            <p className="text-lg font-black text-[#166534]">S/ {p.precio_contado}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedProduct(p); setShowAjuste(true); }}
                                            className="flex-1 py-4 bg-white text-[#166534] border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-[#166534] hover:text-white transition-all"
                                        >
                                            Ajustar Stock
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(true); setEditData(p); }}
                                            className="px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all"
                                        >
                                            Ficha
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden h-full flex flex-col shadow-inner">
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha / Auditor</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Movimiento</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Variación</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo / Ref</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {movimientos.map((m, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="text-[11px] font-bold text-slate-800">{new Date(m.created_at).toLocaleDateString()}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black">{new Date(m.created_at).toLocaleTimeString()}</p>
                                                </td>
                                                <td className="px-8 py-6 text-xs font-black text-slate-900 uppercase">{m.agri_productos?.nombre}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : m.tipo === 'Salida' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {m.tipo}
                                                    </span>
                                                </td>
                                                <td className={`px-8 py-6 text-sm font-black text-right ${m.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {m.cantidad > 0 ? '+' : ''}{m.cantidad}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs text-slate-500 font-medium italic">{m.motivo || m.referencia}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Edición / Ficha Técnica */}
            {isEditing && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setIsEditing(false)} />
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3rem] p-12 max-w-2xl w-full z-10 shadow-2xl relative flex flex-col gap-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">Ficha del Producto</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Técnica e Inventario</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Nombre Comercial</label>
                                <input
                                    value={editData?.nombre}
                                    onChange={e => setEditData({ ...editData, nombre: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Marca / Laboratorio</label>
                                <input
                                    value={editData?.marca}
                                    onChange={e => setEditData({ ...editData, marca: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Stock Mínimo</label>
                                <input
                                    type="number"
                                    value={editData?.stock_minimo}
                                    onChange={e => setEditData({ ...editData, stock_minimo: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Precio Sugerido</label>
                                <input
                                    type="number"
                                    value={editData?.precio_contado}
                                    onChange={e => setEditData({ ...editData, precio_contado: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase px-1">Especificaciones / Ficha Técnica</label>
                            <textarea
                                rows={4}
                                value={editData?.ficha_tecnica}
                                onChange={e => setEditData({ ...editData, ficha_tecnica: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 font-medium text-xs resize-none"
                                placeholder="Describa el producto..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                            <button onClick={handleSaveEdit} className="flex-[2] py-5 bg-[#166534] text-white rounded-2xl font-black shadow-xl shadow-green-950/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Guardar Cambios</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal Ajuste Kárdex */}
            {showAjuste && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAjuste(false)} />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-12 max-w-lg w-full z-10 shadow-2xl relative">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">Ajuste de Stock</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">Corrección de inventario para: {selectedProduct?.nombre || 'General'}</p>

                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Stock Sistema</p>
                                    <p className="text-2xl font-black text-slate-800">{selectedProduct?.stock_actual || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Referencia</p>
                                    <p className="text-2xl font-black text-[#166534] uppercase tracking-tighter">{selectedProduct?.presentacion || 'UND'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 group flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    Cantidad a Ajustar (+/-)
                                </label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setAjusteQty(prev => prev - 1)} className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-2xl hover:bg-red-50 hover:text-red-600 transition-all">-</button>
                                    <input
                                        type="number"
                                        value={ajusteQty}
                                        onChange={(e) => setAjusteQty(Number(e.target.value))}
                                        className="flex-1 text-center bg-slate-900 text-white rounded-3xl h-16 font-black text-2xl outline-none focus:ring-8 ring-green-500/10"
                                    />
                                    <button onClick={() => setAjusteQty(prev => prev + 1)} className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-2xl hover:bg-green-50 hover:text-green-600 transition-all">+</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Motivo del Ajuste</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold text-sm outline-none focus:border-[#166534] focus:bg-white transition-all appearance-none"
                                    value={ajusteMotivo}
                                    onChange={(e) => setAjusteMotivo(e.target.value)}
                                >
                                    <option value="">Seleccione motivo oficial...</option>
                                    <option value="Merma/Deterioro">Merma / Deterioro en Campo</option>
                                    <option value="Error ingreso manual">Error ingreso manual previo</option>
                                    <option value="Devolucion Proveedor">Devolución a Proveedor</option>
                                    <option value="Inventario Ciego">Sobrante/Faltante Conteo Físico</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button onClick={() => setShowAjuste(false)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600">Cancelar</button>
                                <button onClick={handleAjuste} className="flex-[2] py-5 bg-[#166534] text-white rounded-3xl font-black shadow-2xl shadow-green-950/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Confirmar Ajuste</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
