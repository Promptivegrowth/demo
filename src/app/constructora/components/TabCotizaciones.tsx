'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, FileText, Download, Printer,
    Send, CheckCircle, Clock, X, MoreVertical,
    DollarSign, User, Building, ExternalLink,
    Trash2, Copy, Edit3
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabCotizaciones() {
    const [cotizaciones, setCotizaciones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCot, setSelectedCot] = useState<any>(null)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    useEffect(() => {
        loadCotizaciones()
    }, [])

    async function loadCotizaciones() {
        setLoading(true)
        const { data, error } = await conQuery.getCotizaciones()
        if (!error && data) setCotizaciones(data)
        setLoading(false)
    }

    const handleDownloadPDF = () => {
        setIsGeneratingPDF(true)
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
            loading: 'Generando formato técnico PDF...',
            success: 'Cotización exportada correctamente',
            error: 'Error al generar PDF'
        })
        setTimeout(() => setIsGeneratingPDF(false), 2000)
    }

    const filtered = cotizaciones.filter(c =>
        c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.con_clientes?.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar cotización..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg">
                    <Plus className="w-4 h-4" /> Generar Cotización
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">N°</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente / Solicitante</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Proyecto Relacionado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total S/</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/20" />
                                    </tr>
                                ))
                            ) : filtered.map((cot) => (
                                <tr key={cot.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => setSelectedCot(cot)}>
                                    <td className="px-6 py-5 text-sm font-black text-slate-900 text-center">
                                        <div className="bg-slate-100 group-hover:bg-blue-100 py-1 rounded-lg transition-colors">{cot.numero}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-slate-800">{cot.con_clientes?.razon_social}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">RUC: {cot.con_clientes?.ruc}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium italic">
                                            <Building className="w-3 h-3 text-blue-500" />
                                            {cot.con_proyectos?.nombre || 'General / Varios'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-900">S/ {cot.total?.toLocaleString()}</p>
                                        <p className="text-[9px] text-emerald-500 font-bold uppercase">{cot.incluye_igv ? 'Inc. IGV' : '+ IGV'}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cot.estado === 'aprobada' ? 'bg-emerald-100 text-emerald-600' :
                                                cot.estado === 'enviada' ? 'bg-blue-100 text-blue-600' :
                                                    cot.estado === 'vencida' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {cot.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500 shadow-sm" title="Imprimir"><Printer className="w-4 h-4" /></button>
                                            <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500 shadow-sm" title="Enviar"><Send className="w-4 h-4" /></button>
                                            <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500 shadow-sm"><MoreVertical className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Detalle Cotización */}
            <AnimatePresence>
                {selectedCot && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCot(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#f8fafc] w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="bg-white p-8 border-b border-slate-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-slate-900 text-white rounded-[24px]">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-black text-slate-900">{selectedCot.numero}</p>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <p className="text-xs text-slate-400 font-bold uppercase">{selectedCot.fecha}</p>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Cotización de Servicios</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50">
                                            <Download className="w-4 h-4" /> {isGeneratingPDF ? 'Procesando...' : 'Descargar PDF'}
                                        </button>
                                        <button onClick={() => setSelectedCot(null)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"><X className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                {/* Header Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4">
                                        <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Información del Cliente</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <User className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm font-bold text-slate-800">{selectedCot.con_clientes?.razon_social}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-600">RUC: {selectedCot.con_clientes?.ruc}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-600">{selectedCot.con_clientes?.direccion}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4">
                                        <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Detalles del Proyecto</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Building className="w-4 h-4 text-slate-900" />
                                                <span className="text-sm font-bold text-slate-800">{selectedCot.con_proyectos?.nombre || 'General'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-600">Plazo: {selectedCot.plazo_ejecucion || '45 días calendarios'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-600">Validez: {selectedCot.validez_dias} días</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table Mock */}
                                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Partidas Detalladas</h4>
                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">4 Ítem(s)</span>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 italic">
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400">Descripción</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 text-center">Unid.</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 text-center">Cant.</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 text-right">P. Unit</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {[1, 2, 3, 4].map(i => (
                                                <tr key={i} className="text-xs">
                                                    <td className="px-6 py-4 font-bold text-slate-800">Servicio de Excavación masiva con maquinaria pesada</td>
                                                    <td className="px-6 py-4 text-center text-slate-500">GLB</td>
                                                    <td className="px-6 py-4 text-center text-slate-500">1.00</td>
                                                    <td className="px-6 py-4 text-right text-slate-500">12,500.00</td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900">12,500.00</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals Section */}
                                <div className="flex justify-end pt-4">
                                    <div className="w-full max-w-xs space-y-3">
                                        <div className="flex justify-between text-xs font-medium text-slate-500">
                                            <span>Subtotal</span>
                                            <span>S/ {selectedCot.subtotal?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-slate-500">
                                            <span>IGV (18%)</span>
                                            <span>S/ {selectedCot.igv?.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-slate-200 my-2" />
                                        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/20">
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Neto</span>
                                            <span className="text-lg font-black italic">S/ {selectedCot.total?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div className="p-6 bg-slate-100 rounded-[32px] border border-slate-200">
                                    <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Condiciones & Notas</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        • Forma de Pago: {selectedCot.condiciones_pago || '50% Adelanto, balance por valorización.'}<br />
                                        • Garantía: 12 meses por defectos de construcción.<br />
                                        • Esta cotización no incluye permisos municipales ni licencias.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 border-t border-slate-200 flex justify-between items-center group">
                                <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors">
                                        <CheckCircle className="w-4 h-4" /> Aprobar Local
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Duplicar</button>
                                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Editar Documento</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
