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
import { Portal } from '@/components/shared/Portal'

export function TabAgriFacturacion() {
    const [facturas, setFacturas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showNewModal, setShowNewModal] = useState(false)
    const [agricultores, setAgricultores] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [saving, setSaving] = useState(false)

    // Form State
    const [selectedAgriId, setSelectedAgriId] = useState('')
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [tipoDoc, setTipoDoc] = useState('Factura')
    const [metodoPago, setMetodoPago] = useState('Contado')

    useEffect(() => {
        loadData()
        loadRefs()
    }, [])

    async function loadRefs() {
        const [a, p] = await Promise.all([
            agriService.getAgricultores(),
            agriService.getProductos()
        ])
        setAgricultores(a)
        setProductos(p)
    }

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

    const addItem = (prod: any) => {
        const existing = selectedItems.find(i => i.id === prod.id)
        if (existing) {
            setSelectedItems(selectedItems.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario } : i))
        } else {
            setSelectedItems([...selectedItems, {
                id: prod.id,
                nombre: prod.nombre,
                cantidad: 1,
                precio_unitario: prod.precio_contado,
                subtotal: prod.precio_contado
            }])
        }
    }

    const removeItem = (id: string) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id))
    }

    const totalVenta = selectedItems.reduce((acc, i) => acc + i.subtotal, 0)

    const handleCreateFactura = async () => {
        if (!selectedAgriId || selectedItems.length === 0) {
            toast.error('Seleccione un cliente y al menos un producto')
            return
        }
        setSaving(true)
        try {
            await agriService.crearFacturaCompleta({
                agricultor_id: selectedAgriId,
                tipo: tipoDoc,
                total: totalVenta,
                metodo_pago: metodoPago,
                items: selectedItems
            })
            toast.success(`${tipoDoc} emitida correctamente`)
            setShowNewModal(false)
            setSelectedItems([])
            setSelectedAgriId('')
            loadData()
        } catch (err) {
            toast.error('Error al emitir factura')
        } finally {
            setSaving(false)
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
                    <p className="text-slate-500 font-medium tracking-tight">Facturación Electrónica y Boletas de Venta • OSE/SUNAT Connect</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="px-8 py-4 bg-[#166534] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-950/20 flex items-center gap-3"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Factura / Boleta
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
                    <div key={i} className={`${s.bg} p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group hover:shadow-md transition-all`}>
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <s.icon className={`w-8 h-8 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-3xl font-black tracking-tighter tabular-nums">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invoices Table Area */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[600px] overflow-hidden">
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
                    <button className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-[#166534] transition-all">
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
                                            <span className="text-[10px] font-black uppercase text-green-700">Emitido SUNAT</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{f.tipo_documento} {f.serie_correlativo}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{f.metodo_pago}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-700">{f.agri_agricultores?.nombre}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase">DNI/RUC: {f.agri_agricultores?.dni || '--------'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-medium text-slate-600">{new Date(f.created_at).toLocaleDateString()}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(f.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-black text-[#166534] tabular-nums">S/ {Number(f.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
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

            {/* Modal Nueva Factura */}
            {showNewModal && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 max-w-5xl w-full z-10 shadow-2xl relative grid grid-cols-1 md:grid-cols-12 gap-10 max-h-[90vh] overflow-y-auto"
                        >

                            <div className="md:col-span-12 flex items-center justify-between border-b border-slate-100 pb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-1">Nueva Emisión Electrónica</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Configuración de Comprobante de Pago</p>
                                </div>
                                <button onClick={() => setShowNewModal(false)} className="text-slate-300 hover:text-slate-600 font-bold uppercase text-[10px] tracking-widest">Cerrar</button>
                            </div>

                            {/* Left: Client & Doc Type */}
                            <div className="md:col-span-4 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Agricultor</label>
                                    <select
                                        value={selectedAgriId}
                                        onChange={(e) => setSelectedAgriId(e.target.value)}
                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-xs outline-none focus:ring-4 ring-green-500/10 transition-all"
                                    >
                                        <option value="">Buscar agricultor...</option>
                                        {agricultores.map(a => (
                                            <option key={a.id} value={a.id}>{a.nombre} - {a.dni_ruc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documento</label>
                                        <select
                                            value={tipoDoc}
                                            onChange={(e) => setTipoDoc(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] outline-none"
                                        >
                                            <option value="Factura">Factura</option>
                                            <option value="Boleta">Boleta</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pago</label>
                                        <select
                                            value={metodoPago}
                                            onChange={(e) => setMetodoPago(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] outline-none"
                                        >
                                            <option value="Contado">Contado</option>
                                            <option value="Línea de Crédito">Línea de Crédito</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-[#166534] p-8 rounded-[2.5rem] text-white">
                                    <p className="text-[9px] font-black uppercase text-green-300 mb-2 tracking-widest">Total a Pagar</p>
                                    <p className="text-4xl font-black tracking-tighter tabular-nums">S/ {totalVenta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[9px] font-medium text-green-200 mt-4 italic opacity-70">El IGV (18%) se calculará automáticamente en la representación impresa.</p>
                                </div>

                                <button
                                    onClick={handleCreateFactura}
                                    disabled={saving}
                                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-950/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Emitiendo...' : 'Confirmar y Emitir'}
                                </button>
                            </div>

                            {/* Right: Product Selector & Items */}
                            <div className="md:col-span-8 space-y-8 border-l border-slate-100 pl-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agregar Insumos / Semillas</label>
                                    <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {productos.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => addItem(p)}
                                                className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-start hover:border-green-500 transition-all text-left shadow-sm group"
                                            >
                                                <p className="text-[10px] font-black text-slate-800 uppercase leading-tight mb-1">{p.nombre}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.presentacion} • Stock: {p.stock_actual}</p>
                                                <p className="text-xs font-black text-[#166534] mt-2 group-hover:scale-105 transition-transform">S/ {p.precio_contado}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalle del Comprobante</h4>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedItems.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-slate-400 border border-slate-100">
                                                        {item.cantidad}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-800 uppercase">{item.nombre}</p>
                                                        <p className="text-[9px] font-black text-[#166534] uppercase tracking-widest">S/ {item.precio_unitario} c/u</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <p className="text-sm font-black text-slate-800 tabular-nums">S/ {item.subtotal.toLocaleString()}</p>
                                                    <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-all">
                                                        <AlertCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedItems.length === 0 && (
                                            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
                                                <Plus className="w-8 h-8 mb-2" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Agregue items para pre-visualizar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
