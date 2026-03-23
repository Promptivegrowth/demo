'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Search, Plus, ArrowUp,
    ArrowDown, History, AlertTriangle,
    CheckCircle2, Box, Layers, MoreVertical,
    Filter, ArrowLeftRight, HardHat, Warehouse
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabAlmacen() {
    const [inventario, setInventario] = useState<any[]>([])
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'stock' | 'movimientos'>('stock')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const [invRes, movRes] = await Promise.all([
                conQuery.getAlmacen(),
                conQuery.getMovimientosAlmacen()
            ])
            if (invRes.data) setInventario(invRes.data)
            if (movRes.data) setMovimientos(movRes.data)
            setLoading(false)
        }
        load()
    }, [])

    const filteredInv = inventario.filter(i =>
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const ItemCard = ({ item }: { item: any }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
        >
            <div className={`absolute top-0 right-0 w-2 h-full ${item.stock_actual <= item.stock_minimo ? 'bg-rose-500' :
                    item.stock_actual <= item.stock_minimo * 1.5 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />

            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Box className="w-6 h-6" />
                </div>
                {item.stock_actual <= item.stock_minimo && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                        <AlertTriangle className="w-3 h-3" /> Stock Crítico
                    </div>
                )}
            </div>

            <div className="mb-6">
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">{item.categoria}</p>
                <h4 className="text-lg font-black text-slate-900 leading-tight h-12 line-clamp-2">{item.nombre}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{item.codigo}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Stock Actual</p>
                    <p className={`text-xl font-black ${item.stock_actual <= item.stock_minimo ? 'text-rose-600' : 'text-slate-900'}`}>{item.stock_actual} <span className="text-[10px] font-bold text-slate-400">{item.unidad}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Stock Mín.</p>
                    <p className="text-xl font-black text-slate-300">{item.stock_minimo}</p>
                </div>
            </div>
        </motion.div>
    )

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[60px] -ml-16 -mb-16 rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-lg">
                            <Warehouse className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter italic leading-none">Control de Almacén</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Inventario centralizado y movimientos de materiales.</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/5 relative z-10">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'
                            }`}
                    >
                        Stock Real
                    </button>
                    <button
                        onClick={() => setActiveTab('movimientos')}
                        className={`px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'movimientos' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'
                            }`}
                    >
                        Movimientos
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
                        Configurar Alertas
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">
                        <ArrowLeftRight className="w-4 h-4" /> Registrar Movimiento
                    </button>
                </div>
            </div>

            {activeTab === 'stock' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[32px]" />)
                    ) : filteredInv.map((item) => <ItemCard key={item.id} item={item} />)}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha / Hora</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ítem de Almacén</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable / Destino</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {movimientos.map((mov) => (
                                <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-900">{mov.fecha}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Manual</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className={`p-2 rounded-xl inline-flex ${mov.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                            {mov.tipo === 'entrada' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-800">{mov.con_almacen?.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Obra Central</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`text-sm font-black ${mov.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">AL</div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Almacenero Jefe</p>
                                                <p className="text-[10px] text-slate-400 italic">Ref: {mov.referencia || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
