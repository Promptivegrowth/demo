'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    CreditCard,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Activity,
    FileText,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Receipt
} from 'lucide-react'

const estadoBadge = (estado: string) => {
    const map: any = {
        emitida: ['bg-blue-50 text-blue-600 border-blue-200', 'Emitida', Clock],
        pagada: ['bg-emerald-50 text-emerald-600 border-emerald-200', 'Pagada', CheckCircle2],
        vencida: ['bg-rose-50 text-rose-600 border-rose-200', 'Vencida', AlertCircle],
        anulada: ['bg-slate-50 text-slate-500 border-slate-200', 'Anulada', X],
    }
    const [style, txt, Icon] = map[estado] || ['bg-slate-50 text-slate-600 border-slate-200', estado, Activity]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
            <Icon className="w-3 h-3" /> {txt}
        </span>
    )
}

export default function TabEcoCobranzas({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [pillActivo, setPillActivo] = useState('Pendientes')

    const [modal, setModal] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [clientes, setClientes] = useState<any[]>([])

    const cargar = async () => {
        setLoading(true)
        const [facs, clis] = await Promise.all([
            ecoQuery('eco_facturacion', {
                select: '*,eco_clientes(razon_social,ruc),eco_ordenes(numero)',
                filters: ['order=fecha_emision.desc']
            }),
            ecoQuery('eco_clientes', { select: 'id,razon_social', filters: ['estado=eq.activo', 'order=razon_social.asc'] })
        ])

        const arr = Array.isArray(facs) ? facs : []
        setData(arr)
        setClientes(Array.isArray(clis) ? clis : [])
        filtrar(arr, buscar, pillActivo)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string, pill: string) => {
        let res = lista
        if (busq) {
            const b = busq.toLowerCase()
            res = res.filter((c: any) =>
                c.numero_factura?.toLowerCase().includes(b) ||
                c.eco_clientes?.razon_social?.toLowerCase().includes(b) ||
                c.eco_ordenes?.numero?.toLowerCase().includes(b)
            )
        }

        if (pill === 'Pendientes') res = res.filter((c: any) => c.estado === 'emitida')
        else if (pill === 'Pagadas') res = res.filter((c: any) => c.estado === 'pagada')
        else if (pill === 'Vencidas') res = res.filter((c: any) => c.estado === 'vencida' || (c.estado === 'emitida' && new Date(c.fecha_vencimiento) < new Date()))

        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v, pillActivo) }
    const handlePill = (p: string) => { setPillActivo(p); filtrar(data, buscar, p) }

    const abrirNuevo = () => {
        const today = new Date().toISOString().split('T')[0]
        const vDate = new Date()
        vDate.setDate(vDate.getDate() + 15) // +15 dias por defecto

        setFormData({
            estado: 'emitida',
            fecha_emision: today,
            fecha_vencimiento: vDate.toISOString().split('T')[0]
        })
        setModal('nuevo')
    }

    const marcarPagado = async (id: string) => {
        if (!confirm('¿Registrar pago de esta factura?')) return
        await ecoQuery('eco_facturacion', { update: { estado: 'pagada' }, id })
        showToast('Pago registrado correctamente', 'success'); cargar()
    }

    const guardar = async () => {
        if (!formData.cliente_id || !formData.numero_factura || !formData.monto_total) {
            showToast('Complete cliente, factura y monto', 'error'); return
        }

        setSaving(true)
        try {
            const r = await ecoQuery('eco_facturacion', {
                insert: {
                    cliente_id: formData.cliente_id,
                    numero_factura: formData.numero_factura,
                    monto_total: formData.monto_total,
                    fecha_emision: formData.fecha_emision,
                    fecha_vencimiento: formData.fecha_vencimiento,
                    estado: 'emitida'
                }
            })
            if (Array.isArray(r) && r.length > 0) {
                showToast('Factura registrada', 'success')
                setModal(null); cargar()
            } else showToast('Error al registrar factura', 'error')
        } finally { setSaving(false) }
    }

    const pills = ['Todos', 'Pendientes', 'Pagadas', 'Vencidas']

    // Financial KPIs
    const formatPEN = (val: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val || 0)

    // Auto-update vencidas
    const hoy = new Date()
    data.forEach(c => {
        if (c.estado === 'emitida' && new Date(c.fecha_vencimiento) < hoy) {
            c.estado = 'vencida' // Visual update solo
        }
    })

    const totPendiente = data.filter(c => c.estado === 'emitida' || c.estado === 'vencida').reduce((acc, c) => acc + Number(c.monto_total), 0)
    const totPagadoMes = data.filter(c => c.estado === 'pagada' && new Date(c.fecha_emision).getMonth() === hoy.getMonth()).reduce((acc, c) => acc + Number(c.monto_total), 0)
    const totVencido = data.filter(c => c.estado === 'vencida').reduce((acc, c) => acc + Number(c.monto_total), 0)

    const FormModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-indigo-500" /> Emitir Factura / CP
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Cliente / Cuenta <span className="text-rose-500">*</span></label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                value={formData.cliente_id || ''} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                            >
                                <option value="" disabled>Seleccione cliente a facturar...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">N° Factura / Boleta <span className="text-rose-500">*</span></label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                                placeholder="Ej: F001-000456"
                                value={formData.numero_factura || ''} onChange={e => setFormData({ ...formData, numero_factura: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Importe Total (PEN) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
                                    placeholder="0.00"
                                    value={formData.monto_total || ''} onChange={e => setFormData({ ...formData, monto_total: e.target.value })}
                                />
                                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Fecha de Emisión <span className="text-rose-500">*</span></label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.fecha_emision || ''} onChange={e => setFormData({ ...formData, fecha_emision: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Fecha de Vto. <span className="text-rose-500">*</span></label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 text-rose-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                value={formData.fecha_vencimiento || ''} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        onClick={() => setModal(null)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardar} disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> Registrar Cuentas x Cobrar</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AnimatePresence>
                {modal === 'nuevo' && <FormModal />}
            </AnimatePresence>

            {/* Cabecera y KPIs Financieros */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                <div className="xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-[#00c96e]" />
                            Gestión de Cobranzas
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Cuentas por cobrar, facturación y control de flujos de caja operativos.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="N° Doc o Cliente..."
                                value={buscar} onChange={e => handleBuscar(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <button
                            onClick={abrirNuevo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Registrar Facturación
                        </button>
                    </div>
                </div>

                {/* Micro KPIs Financieros */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><TrendingUp className="w-24 h-24" /></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4 text-amber-500" /> Cuentas por Cobrar</p>
                    <p className="text-3xl font-black text-amber-500 mt-2 font-mono tracking-tight">{formatPEN(totPendiente)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#00c96e]/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><DollarSign className="w-24 h-24" /></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4 text-[#00c96e]" /> Recaudación del Mes</p>
                    <p className="text-3xl font-black text-[#00c96e] mt-2 font-mono tracking-tight">{formatPEN(totPagadoMes)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-500/30 transition-colors xl:col-span-2">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><AlertCircle className="w-24 h-24 text-rose-500" /></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-500" /> Capital en Riesgo (Vencido)</p>
                    <p className="text-3xl font-black text-rose-500 mt-2 font-mono tracking-tight">{formatPEN(totVencido)}</p>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${totPendiente ? (totVencido / totPendiente) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{totPendiente ? Math.round((totVencido / totPendiente) * 100) : 0}% del CxC</span>
                    </div>
                </div>
            </div>

            {/* Listado de Facturación */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
                    {pills.map(p => {
                        const isA = pillActivo === p
                        return (
                            <button
                                key={p} onClick={() => handlePill(p)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isA ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    })}
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                                <th className="px-6 py-4 whitespace-nowrap">Comprobante</th>
                                <th className="px-6 py-4 whitespace-nowrap">Razón Social y RUC</th>
                                <th className="px-6 py-4 whitespace-nowrap">Vencimiento</th>
                                <th className="px-6 py-4 whitespace-nowrap">Importe Deuda</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Estatus Financiero</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="p-6"><div className="h-12 bg-slate-50 rounded-xl animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filtrado.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><Receipt className="w-6 h-6" /></div>
                                        <p className="font-semibold text-slate-700">Libre de Deudas</p>
                                        <p className="text-sm mt-1">No se encontraron facturas en este criterio de búsqueda.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtrado.map((c: any) => {
                                    const vDate = new Date(`${c.fecha_vencimiento}T00:00:00`)
                                    const isVencida = c.estado === 'emitida' && (vDate < hoy)
                                    const statusToUse = isVencida ? 'vencida' : c.estado

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-lg ${statusToUse === 'pagada' ? 'bg-emerald-50 text-emerald-600' : statusToUse === 'vencida' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 font-mono tracking-wide">{c.numero_factura}</p>
                                                        {c.eco_ordenes?.numero && (
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Ref OS: {c.eco_ordenes.numero}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 max-w-[250px] truncate" title={c.eco_clientes?.razon_social}>{c.eco_clientes?.razon_social || 'Desconocido'}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">RUC: {c.eco_clientes?.ruc}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs font-semibold text-slate-500">Emisión: {c.fecha_emision}</p>
                                                    <p className={`text-sm font-bold ${isVencida ? 'text-rose-600' : 'text-slate-800'}`}>
                                                        Vto: {c.fecha_vencimiento}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-black font-mono px-3 py-1.5 rounded-lg border ${statusToUse === 'pagada' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        statusToUse === 'vencida' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {formatPEN(c.monto_total)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    {estadoBadge(statusToUse)}

                                                    {statusToUse !== 'pagada' && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => marcarPagado(c.id)}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                                                            >
                                                                <DollarSign className="w-3.5 h-3.5" /> Registrar Recepción de Pago
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </motion.div>
    )
}
