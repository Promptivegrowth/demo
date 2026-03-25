'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Receipt, FileText, Download, Search,
    Filter, Printer, CheckCircle2, Clock,
    AlertCircle, ExternalLink, Plus
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriFacturacion() {
    const [facturas, setFacturas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const data = await agriService.getFacturas()
            setFacturas(data)
        } catch (err) {
            toast.error('Error al cargar comprobantes')
        } finally {
            setLoading(false)
        }
    }

    const filtered = (facturas || []).filter(f => {
        const serieStr = (f.serie_correlativo || '').toLowerCase();
        const clientStr = (f.agri_agricultores?.nombre || '').toLowerCase();
        const searchStr = search.toLowerCase();
        return serieStr.includes(searchStr) || clientStr.includes(searchStr);
    })

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#166534] animate-pulse">Cargando Sistema de Facturación...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Facturación Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Gestión de Comprobantes</h2>
                    <p className="text-slate-500 font-medium">Facturación Electrónica y Boletas de Venta</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                    <button className="px-8 py-4 bg-[#166534] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-green-950/20 flex items-center gap-3">
                        <Plus className="w-4 h-4" />
                        Nueva Factura
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Emitidos Hoy', val: facturas.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pendientes SUNAT', val: 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Total Facturado', val: `S/ ${facturas.reduce((acc, f) => acc + Number(f.total), 0).toLocaleString()}`, icon: Receipt, color: 'text-green-600', bg: 'bg-green-50' }
                ].map((s, i) => (
                    <div key={i} className={`${s.bg} p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8`}>
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-inner">
                            <s.icon className={`w-8 h-8 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-3xl font-black tracking-tighter">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invoices Table Area */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-3 gap-4 border border-slate-200 focus-within:ring-4 ring-green-500/10 transition-all w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por serie o cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs w-full font-bold"
                        />
                    </div>
                    <button className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">
                        <Download className="w-4 h-4" />
                        Descargar Reporte Mensual
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto p-8">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 rounded-2xl">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest first:rounded-l-2xl">Estado</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Emisión</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Total</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest last:rounded-r-2xl text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((f, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-[10px] font-black uppercase text-green-700">Aceptado SUNAT</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{f.tipo_documento} {f.serie_correlativo}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{f.metodo_pago}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-700">{f.agri_agricultores?.nombre}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase">RUC: {f.agri_agricultores?.dni_ruc || '--------'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-medium text-slate-600">{new Date(f.created_at).toLocaleDateString()}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(f.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-black text-[#166534]">S/ {Number(f.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#166534] hover:border-[#166534] transition-all shadow-sm">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <Receipt className="w-16 h-16 mb-4" />
                            <p className="font-black text-xs uppercase tracking-widest">No se encontraron comprobantes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
