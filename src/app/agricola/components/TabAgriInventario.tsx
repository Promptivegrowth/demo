'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Boxes, Search, Filter, AlertTriangle,
    ArrowUpRight, ArrowDownRight, Package,
    History, Info, MoreVertical, Plus,
    CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriInventario() {
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const data = await agriService.getProductos()
                setProductos(data)
            } catch (err) {
                toast.error('Error al cargar inventario')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.marca.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="h-full flex items-center justify-center">Cargando Inventario...</div>

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header & Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-green-50 flex items-center justify-center">
                        <Boxes className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumos Totales</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tighter">{productos.length}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Crítico</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tighter">
                            {productos.filter(p => p.stock_actual <= p.stock_minimo).length}
                        </p>
                    </div>
                </div>

                <div className="bg-[#052c16] p-8 rounded-[3rem] border border-slate-800 shadow-xl flex items-center gap-6 text-white">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center">
                        <Package className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-green-400/60 uppercase tracking-widest">Valorización</p>
                        <p className="text-2xl font-black tracking-tighter">S/ {productos.reduce((acc, p) => acc + (p.stock_actual * p.precio_contado), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-black text-slate-800 tracking-tight">Kardex de Almacén</h4>
                        <p className="text-xs text-slate-400 font-medium">Control físico y valorizado de insidumos</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 gap-3 border border-slate-200 focus-within:border-green-500 transition-all">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filtrar lote o insumo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-48 font-bold"
                            />
                        </div>
                        <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 border border-slate-200"><Filter className="w-5 h-5" /></button>
                        <button className="px-6 py-2.5 bg-[#166534] text-white rounded-xl font-bold text-xs shadow-lg shadow-green-950/20 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Nuevo Ajuste
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10">
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Producto / Marca</th>
                                <th className="px-8 py-5 text-center">Stock Actual</th>
                                <th className="px-8 py-5 text-center">Presentación</th>
                                <th className="px-8 py-5 text-center">Estado</th>
                                <th className="px-8 py-5 text-right">Inversión</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((p) => (
                                <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{p.nombre}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{p.marca}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-black tracking-tighter ${p.stock_actual <= p.stock_minimo ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#166534]'
                                            }`}>
                                            {p.stock_actual}
                                            {p.stock_actual <= p.stock_minimo ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center text-xs font-bold text-slate-500">{p.presentacion}</td>
                                    <td className="px-8 py-6 text-center">
                                        {p.stock_actual <= p.stock_minimo ? (
                                            <div className="flex items-center gap-1 justify-center text-red-500">
                                                <AlertCircle className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase">REABASTECER</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 justify-center text-green-500">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase">OPTIMO</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="font-black text-slate-800 text-sm tracking-tighter">S/ {(p.stock_actual * p.precio_contado).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-slate-100 shadow-sm text-slate-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Sincronizado con Central</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span>Alertas de Vencimiento Lotes</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Página 1 de 1</span>
                        <div className="flex gap-1 ml-2">
                            <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center opacity-50"><ChevronRight className="w-3 h-3 rotate-180" /></button>
                            <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center"><ChevronRight className="w-3 h-3" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
