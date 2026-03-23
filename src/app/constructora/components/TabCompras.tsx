'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingBag, Plus, Search, FileText,
    Download, Printer, Send, CheckCircle,
    Clock, X, MoreVertical, Truck, Package,
    Trash2, Edit3, ArrowUpRight, ChevronRight
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabCompras() {
    const [compras, setCompras] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOC, setSelectedOC] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const { data } = await conQuery.getOrdenesCompra()
            if (data) setCompras(data)
            setLoading(false)
        }
        load()
    }, [])

    const filtered = compras.filter(c =>
        c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.con_proveedores?.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const StatusBadge = ({ status }: { status: string }) => {
        const config: any = {
            borrador: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Borrador' },
            enviada: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Enviada' },
            recibida: { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Recibida' },
            cancelada: { bg: 'bg-rose-100', text: 'text-rose-600', label: 'Cancelada' },
        }
        const s = config[status] || config.borrador
        return <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${s.bg} ${s.text}`}>{s.label}</span>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <div className="relative group flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar Órden de Compra o Proveedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                        />
                    </div>
                    <select className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm">
                        <option>Estado: Todos</option>
                        <option>Borrador</option>
                        <option>Enviada</option>
                        <option>Recibida</option>
                    </select>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Generar Orden de Compra
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-[32px]" />)
                ) : filtered.map((oc) => (
                    <motion.div
                        key={oc.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedOC(oc)}
                        className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                <ShoppingBag className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <StatusBadge status={oc.estado} />
                        </div>

                        <div className="space-y-1 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{oc.numero}</span>
                                <span className="text-[10px] text-slate-300 font-bold">• {oc.fecha}</span>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{oc.con_proveedores?.razon_social}</h4>
                            <p className="text-xs text-slate-400 font-medium truncate italic">Proyecto: {oc.con_proyectos?.nombre || 'General'}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Importe Total</span>
                                <span className="text-sm font-black text-slate-900">S/ {oc.total?.toLocaleString()}</span>
                            </div>
                            <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal: Detalle OC */}
            <AnimatePresence>
                {selectedOC && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOC(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="bg-slate-900 p-8 shrink-0 flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/10 rounded-[20px] border border-white/10">
                                        <Truck className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-blue-500 rounded text-[10px] font-black uppercase">{selectedOC.numero}</span>
                                            <StatusBadge status={selectedOC.estado} />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight italic">Orden de Abastecimiento Logístico</h3>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOC(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                                {/* Info Header */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-100">
                                    <div>
                                        <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Proveedor Seleccionado</h5>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900">{selectedOC.con_proveedores?.razon_social}</p>
                                            <p className="text-xs text-slate-500">RUC: {selectedOC.con_proveedores?.ruc}</p>
                                            <p className="text-xs text-slate-500">{selectedOC.con_proveedores?.contacto}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Entrega en Obra</h5>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900">{selectedOC.con_proyectos?.nombre}</p>
                                            <p className="text-xs text-slate-500 italic">{selectedOC.con_proyectos?.distrito}, {selectedOC.con_proyectos?.departamento}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Condiciones de Compra</h5>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900">Pago a 15 días</p>
                                            <p className="text-xs text-slate-500">Moneda: Soles (PEN)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="space-y-4">
                                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Package className="w-4 h-4 text-blue-500" /> Lista de Materiales / Servicios
                                    </h5>
                                    <div className="border border-slate-100 rounded-[32px] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/80">
                                                <tr className="italic">
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Descripción Ítem</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Und.</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">P. Unit</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {[1, 2, 3].map(i => (
                                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <p className="text-sm font-bold text-slate-800">Bolsa de Cemento Portland Tipo I (42.5kg)</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Marca: Sol / Andino</p>
                                                        </td>
                                                        <td className="px-6 py-5 text-center text-slate-500 font-bold">UND</td>
                                                        <td className="px-6 py-5 text-center text-slate-900 font-black">150.00</td>
                                                        <td className="px-6 py-5 text-right text-slate-500 font-bold">28.50</td>
                                                        <td className="px-6 py-5 text-right text-slate-900 font-black">4,275.00</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary Footer */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex-1 max-w-sm">
                                        <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Observaciones de Logística</h5>
                                        <p className="text-xs text-slate-500 font-medium italic">"Se requiere la entrega antes de las 9:00 AM para evitar congestión en el acceso a la torre B. Adjuntar certificado de calidad."</p>
                                    </div>
                                    <div className="w-full max-w-xs space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold">VALOR VENTA</span>
                                            <span className="font-black text-slate-900">S/ {(selectedOC.total / 1.18).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold">IGV (18%)</span>
                                            <span className="font-black text-slate-900">S/ {(selectedOC.total - (selectedOC.total / 1.18)).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-slate-200" />
                                        <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Total Orden</span>
                                            <span className="text-xl font-black italic">S/ {selectedOC.total?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-[#f8fafc] border-t border-slate-200 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 p-3 hover:bg-slate-200 rounded-2xl text-slate-400 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-widest">
                                        <Trash2 className="w-4 h-4" /> Anular OC
                                    </button>
                                    <button className="flex items-center gap-2 p-3 hover:bg-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest">
                                        <Download className="w-4 h-4" /> Exportar
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Editar Borrador</button>
                                    <button onClick={() => { toast.success('Orden de Compra enviada con éxito'); setSelectedOC(null); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2">
                                        Enviar al Proveedor <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
