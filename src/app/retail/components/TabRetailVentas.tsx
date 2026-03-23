'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileBarChart, Search, Eye, Download, X, Printer, CheckCircle2, Loader2, CreditCard, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { retQuery } from '@/lib/retQuery'

export function TabRetailVentas() {
    const [ventas, setVentas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedVenta, setSelectedVenta] = useState<any>(null)
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [loadingItems, setLoadingItems] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const data = await retQuery.getVentas()
            setVentas(data)
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const loadDetalle = async (v: any) => {
        setSelectedVenta(v)
        setLoadingItems(true)
        try {
            const data = await retQuery.getVentaDetalle(v.id)
            setSelectedItems(data)
        } catch (error) {
            toast.error('Error al cargar detalle')
        } finally {
            setLoadingItems(false)
        }
    }

    const filtered = ventas.filter(v =>
        v.numero.toLowerCase().includes(search.toLowerCase()) ||
        (v.cliente_nombre && v.cliente_nombre.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6 text-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Historial de Ventas</h3>
                    <p className="text-sm text-slate-500">Auditoría de transacciones y generación de comprobantes.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text" placeholder="Buscar por número..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none w-64"
                    />
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
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comprobante</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pago</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {filtered.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 text-slate-900 font-black tracking-tight">{v.numero}</td>
                                        <td className="px-6 py-4 text-slate-500 font-bold">{new Date(v.fecha).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-700 font-bold">{v.cliente_nombre || 'Clientes Varios'}</td>
                                        <td className="px-6 py-4">
                                            <div className="mx-auto w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                                                {v.metodo_pago === 'efectivo' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                                {v.metodo_pago}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900 text-base">S/ {(v.total || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => loadDetalle(v)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => toast.success('Reimprimiendo ticket...')} className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"><Printer className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Detalle Venta */}
            <AnimatePresence>
                {selectedVenta && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVenta(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-900 text-white p-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Comprobante de Pago</p>
                                        <h3 className="text-3xl font-black">{selectedVenta.numero}</h3>
                                        <p className="text-slate-400 text-sm font-bold mt-1">Fecha: {new Date(selectedVenta.fecha).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => setSelectedVenta(null)} className="p-3 hover:bg-white/10 rounded-2xl"><X className="w-6 h-6" /></button>
                                </div>
                                <div className="flex items-center gap-4 py-6 border-t border-slate-800">
                                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Estado</p>
                                        <p className="text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Pagado</p>
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Método</p>
                                        <p className="text-white font-bold capitalize">{selectedVenta.metodo_pago}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalle de Productos</p>
                                    {loadingItems ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div> :
                                        selectedItems.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black text-slate-900">{item.nombre_producto}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{item.cantidad} und x S/ {item.precio_unitario.toFixed(2)}</p>
                                                </div>
                                                <p className="text-sm font-black text-slate-950">S/ {item.subtotal.toFixed(2)}</p>
                                            </div>
                                        ))
                                    }
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                        <span className="text-sm font-bold text-slate-800">S/ {selectedVenta.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">IGV (18%)</span>
                                        <span className="text-sm font-bold text-slate-800">S/ {selectedVenta.igv.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-4">
                                        <span className="text-lg font-black text-slate-900 uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black text-slate-950">S/ {selectedVenta.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 pb-10 flex gap-3">
                                <button onClick={() => toast.success('Ticket descargado')} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> PDF
                                </button>
                                <button onClick={() => toast.success('Imprimiendo copia...')} className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
                                    <Printer className="w-4 h-4" /> Reimprimir Ticket
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
