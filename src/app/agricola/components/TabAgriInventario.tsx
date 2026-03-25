'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Boxes, Search, AlertTriangle,
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

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.marca.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="h-full flex items-center justify-center">Cargando Inventario...</div>

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header & Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                        <Boxes className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumos Totales</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">{productos.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Crítico</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">
                            {productos.filter(p => Number(p.stock_actual) <= Number(p.stock_minimo)).length}
                        </p>
                    </div>
                </div>

                <div className="bg-[#052c16] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex items-center gap-6 text-white">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Package className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-green-400/60 uppercase tracking-widest">Valorización</p>
                        <p className="text-xl font-black tracking-tighter">S/ {productos.reduce((acc, p) => acc + (Number(p.stock_actual) * Number(p.precio_contado)), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('kardex')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'kardex' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Kárdex de Stock
                            </button>
                            <button
                                onClick={() => setViewMode('historial')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'historial' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Historial Completo
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 gap-3 border border-slate-200 focus-within:border-green-500 transition-all">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-32 md:w-48 font-bold"
                            />
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="px-6 py-3 bg-white border-2 border-slate-100 text-[#166534] rounded-2xl font-black text-[10px] hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" />
                            Exportar Excel
                        </button>
                        <button
                            onClick={() => {
                                setSelectedProduct(null)
                                setShowAjuste(true)
                            }}
                            className="px-6 py-3 bg-[#166534] text-white rounded-2xl font-black text-[10px] hover:scale-105 transition-all shadow-lg shadow-green-900/20 uppercase tracking-widest"
                        >
                            + Nuevo Ajuste
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-8">
                    {viewMode === 'kardex' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto h-full pr-2 custom-scrollbar">
                            {filtered
                                .map(p => (
                                    <motion.div
                                        key={p.id}
                                        whileHover={{ y: -5 }}
                                        className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
                                    >
                                        {p.stock_actual <= p.stock_minimo && (
                                            <div className="absolute top-4 right-4 text-red-500 animate-pulse">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                        )}

                                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Package className={`w-6 h-6 ${p.stock_actual <= p.stock_minimo ? 'text-red-500' : 'text-[#166534]'}`} />
                                        </div>

                                        <h5 className="font-black text-slate-800 tracking-tight uppercase text-xs mb-1 truncate">{p.nombre}</h5>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{p.categoria}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Stock</p>
                                                <p className={`text-sm font-black ${p.stock_actual <= p.stock_minimo ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {p.stock_actual} <span className="text-[10px]">{p.presentacion}</span>
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Precio</p>
                                                <p className="text-sm font-black text-[#166534]">S/ {p.precio_contado}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedProduct(p)
                                                setShowAjuste(true)
                                            }}
                                            className="w-full py-3 bg-slate-50 text-slate-400 hover:bg-[#166534] hover:text-white rounded-2xl font-black text-[10px] transition-all uppercase tracking-widest border border-slate-100 hover:border-[#166534]"
                                        >
                                            Ajustar Stock
                                        </button>
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden h-full flex flex-col shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h5 className="font-black text-slate-800 tracking-tight uppercase text-xs">Historial Global de Movimientos</h5>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Últimos {movimientos.length} registros</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cantidad</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {movimientos.map((m, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5 text-xs font-medium text-slate-500">{new Date(m.created_at).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-xs font-black text-slate-800 uppercase tracking-tight">{m.agri_productos?.nombre}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${m.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {m.tipo}
                                                    </span>
                                                </td>
                                                <td className={`px-8 py-5 text-sm font-black text-right ${m.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {m.cantidad > 0 ? '+' : ''}{m.cantidad}
                                                </td>
                                                <td className="px-8 py-5 text-xs text-slate-500 font-medium italic">{m.motivo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ajuste */}
            {showAjuste && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowAjuste(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[3rem] p-10 max-w-lg w-full z-10 shadow-2xl relative"
                    >
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Ajuste de Stock</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Corregir inventario físico de {selectedProduct?.nombre}</p>

                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Stock Sistema</p>
                                    <p className="text-xl font-black text-slate-800">{selectedProduct?.stock_actual}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Precio Compra</p>
                                    <p className="text-xl font-black text-[#166534]">S/ {selectedProduct?.precio_contado}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variación de Unidades (+/-)</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setAjusteQty(prev => prev - 1)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xl hover:bg-red-50 hover:text-red-600 transition-all">-</button>
                                    <input
                                        type="number"
                                        value={ajusteQty}
                                        onChange={(e) => setAjusteQty(Number(e.target.value))}
                                        className="flex-1 text-center bg-slate-900 text-white rounded-2xl h-12 font-black text-lg outline-none focus:ring-4 ring-green-500/20"
                                    />
                                    <button onClick={() => setAjusteQty(prev => prev + 1)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xl hover:bg-green-50 hover:text-green-600 transition-all">+</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo del Ajuste</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none focus:border-[#166534]"
                                    value={ajusteMotivo}
                                    onChange={(e) => setAjusteMotivo(e.target.value)}
                                >
                                    <option value="">Seleccione motivo...</option>
                                    <option value="Merma/Deterioro">Merma / Deterioro</option>
                                    <option value="Error ingreso manual">Error ingreso manual</option>
                                    <option value="Donacion/Venta Interna">Donación / Venta Interna</option>
                                    <option value="Devolucion Proveedor">Devolución Proveedor</option>
                                    <option value="Inventario Ciego">Conteo Inventario Ciego</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowAjuste(false)}
                                    className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAjuste}
                                    className="flex-[2] py-4 bg-[#166534] text-white rounded-2xl font-black shadow-xl shadow-green-950/20 hover:scale-105 transition-all"
                                >
                                    Aplicar Ajuste
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
