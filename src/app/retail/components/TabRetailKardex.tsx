'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, ArrowUpRight, ArrowDownRight, RefreshCcw, Filter, Search, Loader2 } from 'lucide-react'
import { retQuery } from '@/lib/retQuery'

export function TabRetailKardex({ onTabChange }: { onTabChange?: (t: string) => void }) {
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const data = await retQuery.getKardex()
            setMovimientos(data)
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const filtered = movimientos.filter(m =>
        m.ret_productos?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        m.referencia?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Kardex de Inventario</h3>
                    <p className="text-sm text-slate-500">Historial completo de entradas y salidas de mercadería.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text" placeholder="Buscar por producto..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none w-64"
                        />
                    </div>
                    <button onClick={loadData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <RefreshCcw className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cantidad</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo / Ref</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Sin movimientos registrados</td></tr>
                                ) : (
                                    filtered.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-600 leading-tight">{new Date(m.created_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">{m.ret_productos?.nombre}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{m.ret_productos?.sku}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`mx-auto w-fit flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-600' : m.tipo === 'salida' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {m.tipo === 'entrada' ? <ArrowDownRight className="w-3 h-3" /> : m.tipo === 'salida' ? <ArrowUpRight className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3" />}
                                                    {m.tipo}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-slate-900'}`}>{m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${m.ret_proveedores?.razon_social ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-tighter truncate max-w-[150px]">{m.ret_proveedores?.razon_social || 'Venta / Ajuste'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{m.motivo || 'Operación POS'}</p>
                                                <p className="text-[9px] text-slate-400 font-bold">Ref: {m.referencia || 'N/A'}</p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
