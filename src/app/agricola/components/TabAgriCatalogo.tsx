'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, ShoppingCart, Info,
    AlertCircle, CheckCircle2, Package, Boxes,
    ChevronRight, Tag, Droplet, Zap
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

interface TabAgriCatalogoProps {
    onTabChange: (tab: string) => void
}

export function TabAgriCatalogo({ onTabChange }: TabAgriCatalogoProps) {
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('Todos')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const data = await agriService.getProductos()
                setProductos(data)
            } catch (err) {
                toast.error('Error al cargar catálogo')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const categories = ['Todos', 'Herbicidas', 'Insecticidas', 'Fungicidas', 'Fertilizantes', 'Semillas']

    const filtered = productos.filter(p => {
        const matchesCat = filter === 'Todos' || p.categoria === filter
        const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.marca.toLowerCase().includes(search.toLowerCase())
        return matchesCat && matchesSearch
    })

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-slate-200 rounded-[2.5rem]" />)}
    </div>

    return (
        <div className="space-y-8">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2 ${filter === cat
                                    ? 'bg-[#166534] text-white border-[#166534] shadow-lg shadow-green-900/20'
                                    : 'bg-white text-slate-500 border-slate-100 hover:border-green-200 hover:text-green-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full md:w-80 shadow-sm focus-within:border-green-500 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o marca..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 font-medium"
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filtered.map((prod) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={prod.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-green-900/5 transition-all group flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${prod.categoria === 'Herbicidas' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            prod.categoria === 'Insecticidas' ? 'bg-red-50 text-red-600 border-red-100' :
                                                prod.categoria === 'Fertilizantes' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                        {prod.categoria}
                                    </span>
                                    {prod.stock_actual <= prod.stock_minimo && (
                                        <div className="flex items-center gap-1 text-red-500">
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">Stock Bajo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 mb-4">
                                    <h3 className="font-black text-slate-800 leading-tight group-hover:text-[#166534] transition-colors line-clamp-2 min-h-[2.5rem]">{prod.nombre}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{prod.marca}</p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-3 space-y-2 mb-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 px-1">
                                        <span>Presentación:</span>
                                        <span className="text-slate-600">{prod.presentacion}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-bold text-slate-500">Contado:</span>
                                        <span className="text-lg font-black text-slate-800 tracking-tighter">S/ {prod.precio_contado.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-bold text-amber-600">Crédito:</span>
                                        <span className="text-sm font-black text-amber-700">S/ {prod.precio_credito?.toFixed(2) || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <Boxes className="w-4 h-4 text-slate-300" />
                                        <span className={`text-xs font-bold ${prod.stock_actual <= prod.stock_minimo ? 'text-red-500' : 'text-slate-600'}`}>
                                            {prod.stock_actual} disp.
                                        </span>
                                    </div>
                                    <button className="p-2 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100 group/info">
                                        <Info className="w-4 h-4 text-slate-300 group-hover/info:text-green-600" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => onTabChange('pos')}
                                className="w-full py-4 bg-slate-50 border-t border-slate-100 group-hover:bg-[#166534] group-hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Venta Rápida
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                    <div className="p-6 bg-slate-50 rounded-full border border-dashed border-slate-200">
                        <Package className="w-12 h-12 opacity-20" />
                    </div>
                    <p className="font-bold">No se encontraron insumos con esos criterios</p>
                </div>
            )}
        </div>
    )
}
