'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    Package,
    CalendarClock,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Activity,
    MapPin,
    Building2,
    Scale,
    FileText,
    ArrowRight,
    Edit2,
    FileCheck,
    Eye
} from 'lucide-react'

const ecoBadge = (tipo: string) => {
    const map: any = {
        municipal: ['bg-emerald-100 text-emerald-700 border-emerald-200', 'Municipal'],
        industrial: ['bg-blue-100 text-blue-700 border-blue-200', 'Industrial'],
        hospital: ['bg-purple-100 text-purple-700 border-purple-200', 'Hospital'],
        construccion: ['bg-amber-100 text-amber-700 border-amber-200', 'Construcción'],
        peligroso: ['bg-rose-100 text-rose-700 border-rose-200', 'Peligroso'],
        mixto: ['bg-slate-100 text-slate-700 border-slate-200', 'Mixto'],
    }
    const [style, txt] = map[tipo] || ['bg-slate-100 text-slate-700 border-slate-200', tipo]
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>{txt}</span>
}

const ecoEstadoBadge = (estado: string) => {
    const map: any = {
        programado: ['bg-blue-50 text-blue-600 border-blue-200', 'Programado', Clock],
        en_ruta: ['bg-amber-50 text-amber-600 border-amber-200', 'En Ruta', Truck],
        recogido: ['bg-emerald-50 text-emerald-600 border-emerald-200', 'Recogido', Package],
        en_planta: ['bg-teal-50 text-teal-600 border-teal-200', 'En Planta', Building2],
        completado: ['bg-emerald-100 text-emerald-700 border-emerald-300', 'Completado', CheckCircle2],
        cancelado: ['bg-rose-50 text-rose-600 border-rose-200', 'Cancelado', AlertCircle],
    }
    const [style, txt, Icon] = map[estado] || ['bg-slate-50 text-slate-600 border-slate-200', estado, Activity]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
            <Icon className="w-3 h-3" /> {txt}
        </span>
    )
}

export default function TabEcoOrdenes({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [vehiculos, setVehiculos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [pillActivo, setPillActivo] = useState('Hoy')

    const [modal, setModal] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [detalleData, setDetalleData] = useState<any>(null)

    const cargar = async () => {
        setLoading(true)
        const [ords, clis, vehi] = await Promise.all([
            ecoQuery('eco_ordenes', { select: '*,eco_clientes(razon_social,ruc,direccion,distrito),eco_flota(placa,tipo)', filters: ['order=created_at.desc'] }),
            ecoQuery('eco_clientes', { select: 'id,razon_social', filters: ['estado=eq.activo', 'order=razon_social.asc'] }),
            ecoQuery('eco_flota', { select: 'id,placa,tipo', filters: ['estado=eq.activo'] })
        ])
        const arr = Array.isArray(ords) ? ords : []
        setData(arr);
        setClientes(Array.isArray(clis) ? clis : [])
        setVehiculos(Array.isArray(vehi) ? vehi : [])
        filtrar(arr, buscar, pillActivo)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string, pill: string) => {
        let res = lista
        if (busq) {
            const b = busq.toLowerCase()
            res = res.filter((c: any) => c.numero?.toLowerCase().includes(b) || c.eco_clientes?.razon_social?.toLowerCase().includes(b))
        }

        const today = new Date().toISOString().split('T')[0]
        if (pill === 'Hoy') res = res.filter((c: any) => c.fecha_programada === today)
        else if (pill === 'Pendientes') res = res.filter((c: any) => ['programado', 'en_ruta', 'recogido', 'en_planta'].includes(c.estado))
        else if (pill === 'Completados') res = res.filter((c: any) => c.estado === 'completado')
        else if (pill === 'Por Asignar') res = res.filter((c: any) => !c.vehiculo_id && c.estado !== 'cancelado' && c.estado !== 'completado')

        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v, pillActivo) }
    const handlePill = (p: string) => { setPillActivo(p); filtrar(data, buscar, p) }

    const abrirNuevo = () => {
        const today = new Date().toISOString().split('T')[0]
        const nextNum = `OS-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${String(data.length + 1).padStart(3, '0')}`
        setFormData({ estado: 'programado', numero: nextNum, tipo_residuo: 'municipal', fecha_programada: today })
        setModal('nuevo')
    }

    const abrirAsignar = (ord: any) => { setFormData({ id: ord.id, vehiculo_id: ord.vehiculo_id || '' }); setModal('asignar') }
    const abrirCierre = (ord: any) => { setFormData({ id: ord.id, kg_reales: ord.peso_estimado || '' }); setModal('cierre') }
    const verDetalle = (ord: any) => { setDetalleData(ord); setModal('detalle') }

    const guardar = async () => {
        setSaving(true)
        try {
            if (modal === 'nuevo') {
                if (!formData.cliente_id || !formData.fecha_programada || !formData.peso_estimado) {
                    showToast('Complete cliente, fecha y peso', 'error'); setSaving(false); return
                }
                const r = await ecoQuery('eco_ordenes', { insert: { numero: formData.numero, cliente_id: formData.cliente_id, fecha_programada: formData.fecha_programada, tipo_residuo: formData.tipo_residuo, peso_estimado: formData.peso_estimado, observaciones: formData.observaciones, estado: 'programado' } })
                if (Array.isArray(r) && r.length > 0) { showToast('Orden creada exitosamente', 'success'); setModal(null); cargar() }
                else showToast('Error al crear orden', 'error')
            } else if (modal === 'asignar') {
                await ecoQuery('eco_ordenes', { update: { vehiculo_id: formData.vehiculo_id, estado: 'en_ruta' }, id: formData.id })
                showToast('Vehículo asignado e iniciado ruta', 'success'); setModal(null); cargar()
            } else if (modal === 'cierre') {
                if (!formData.kg_reales) { showToast('Ingrese el peso real recabado', 'error'); setSaving(false); return }
                const payload: any = { estado: 'completado', kg_reales: formData.kg_reales }
                await ecoQuery('eco_ordenes', { update: payload, id: formData.id })
                showToast('Orden completada', 'success'); setModal(null); cargar()
            }
        } finally { setSaving(false) }
    }

    const setEstadoDirecto = async (id: string, st: string) => {
        if (!confirm(`¿Actualizar estado a ${st}?`)) return
        await ecoQuery('eco_ordenes', { update: { estado: st }, id })
        showToast(`Orden actualizada a ${st}`, 'success'); cargar()
    }

    const pills = ['Todos', 'Hoy', 'Pendientes', 'Completados', 'Por Asignar']
    const today = new Date().toISOString().split('T')[0]

    // KPI Data
    const ordenesHoy = data.filter(c => c.fecha_programada === today)
    const pendientesHoy = ordenesHoy.filter(c => ['programado', 'en_ruta', 'recogido', 'en_planta'].includes(c.estado)).length
    const completadosHoy = ordenesHoy.filter(c => c.estado === 'completado').length
    const sinAsignar = data.filter(c => !c.vehiculo_id && ['programado', 'en_ruta'].includes(c.estado)).length
    const pctHoy = ordenesHoy.length ? Math.round((completadosHoy / ordenesHoy.length) * 100) : 0

    const FormModals = () => {
        if (!modal || modal === 'detalle') return null

        const isNuevo = modal === 'nuevo'
        const isAsignar = modal === 'asignar'
        const isCierre = modal === 'cierre'

        let titulo = isNuevo ? 'Generar Orden de Servicio' : isAsignar ? 'Asignar Vehículo' : 'Cierre y Recepción'
        let Icono = isNuevo ? Package : isAsignar ? Truck : CheckCircle2

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Icono className={`w-5 h-5 ${isCierre ? 'text-emerald-500' : isAsignar ? 'text-amber-500' : 'text-indigo-500'}`} />
                            {titulo}
                        </h3>
                        <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">

                        {isNuevo && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Cliente / Generador <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                        value={formData.cliente_id || ''} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                                    >
                                        <option value="" disabled>Seleccione un cliente...</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">N° de OS <span className="text-rose-500">*</span></label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none font-mono"
                                        value={formData.numero || ''} readOnly
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Fecha Programada <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={formData.fecha_programada || ''} onChange={e => setFormData({ ...formData, fecha_programada: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Clase de Residuo</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                        value={formData.tipo_residuo || 'municipal'} onChange={e => setFormData({ ...formData, tipo_residuo: e.target.value })}
                                    >
                                        <option value="municipal">Municipal</option>
                                        <option value="industrial">Industrial</option>
                                        <option value="peligroso">Peligroso</option>
                                        <option value="hospitalario">Hospitalario</option>
                                        <option value="construccion">Construcción</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Volumen/Peso Estimado (kg) <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                                        placeholder="0.00"
                                        value={formData.peso_estimado || ''} onChange={e => setFormData({ ...formData, peso_estimado: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Observaciones</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-24 resize-none"
                                        placeholder="Instrucciones especiales para el recojo..."
                                        value={formData.observaciones || ''} onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {isAsignar && (
                            <div className="space-y-5">
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Despacho de Unidad</p>
                                        <p className="text-sm text-amber-700 mt-0.5">Asigne un vehículo disponible en flota. La orden cambiará de estado automáticamente a <span className="font-bold">En Ruta</span> y el conductor será notificado.</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Vehículo a Despachar <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer text-lg font-medium"
                                        value={formData.vehiculo_id || ''} onChange={e => setFormData({ ...formData, vehiculo_id: e.target.value })}
                                    >
                                        <option value="" disabled>Seleccione placa...</option>
                                        {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} ({v.tipo})</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {isCierre && (
                            <div className="space-y-5">
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">Recepción en Planta y Cierre</p>
                                        <p className="text-sm text-emerald-700 mt-0.5">Registre el pesaje real comprobado en planta para certificar la OS y emitir el Manifiesto final.</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Peso Bruto Verificado (kg) <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xl rounded-xl pl-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-black tracking-tight"
                                            placeholder="0.00"
                                            value={formData.kg_reales || ''} onChange={e => setFormData({ ...formData, kg_reales: e.target.value })}
                                        />
                                        <span className="absolute right-4 top-4 text-emerald-600 font-bold uppercase tracking-wider">KG</span>
                                    </div>
                                </div>
                            </div>
                        )}

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
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center gap-2 ${isCierre ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                                    isAsignar ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' :
                                        'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                                }`}
                        >
                            {saving ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                            ) : (
                                <><Icono className="w-4 h-4" /> {isCierre ? 'Certificar y Cerrar' : isAsignar ? 'Despachar a Ruta' : 'Generar OS'}</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    const DetalleModal = () => !detalleData ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-indigo-600 font-mono tracking-tight">{detalleData.numero}</h3>
                            {ecoEstadoBadge(detalleData.estado)}
                            {detalleData.fecha_programada === today && <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">Servicio Hoy</span>}
                        </div>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5"><CalendarClock className="w-4 h-4" /> Programado para: {detalleData.fecha_programada}</p>
                    </div>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Generador Info */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Generador / Cliente</h4>

                            <p className="text-base font-bold text-slate-800 mb-1">{detalleData.eco_clientes?.razon_social || 'Cliente Sin Nombre'}</p>
                            <p className="text-sm text-slate-500 font-mono mb-4">RUC: {detalleData.eco_clientes?.ruc || 'N/A'}</p>

                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-700 leading-snug">{detalleData.eco_clientes?.direccion || '—'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{detalleData.eco_clientes?.distrito || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Servicio Info */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Detalle Biológico/Físico</h4>

                            <div className="mb-4">
                                <p className="text-xs text-slate-500 font-semibold mb-1.5">Clasificación Declarada</p>
                                {ecoBadge(detalleData.tipo_residuo)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4">
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold mb-1">Vol. Estimado</p>
                                    <p className="text-sm font-bold text-slate-800 font-mono">{Number(detalleData.peso_estimado).toLocaleString()} kg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-600 font-bold mb-1">Peso Real (Planta)</p>
                                    <p className={`text-lg font-black font-mono ${detalleData.kg_reales ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {detalleData.kg_reales ? `${Number(detalleData.kg_reales).toLocaleString()} kg` : 'S/R'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logistica */}
                    <div className="mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Truck className="w-4 h-4" /> Control Logístico</h4>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Unidad de Transporte</p>
                                {detalleData.eco_flota ? (
                                    <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        Placa <span className="bg-slate-200 px-2 py-0.5 rounded text-sm font-mono tracking-widest">{detalleData.eco_flota.placa}</span> ({detalleData.eco_flota.tipo})
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Sin vehículo asignado a la ruta</p>
                                        <button onClick={() => { setModal(null); abrirAsignar(detalleData) }} className="text-xs font-bold text-indigo-600 hover:underline">Asignar Ahora →</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {detalleData.observaciones && (
                        <div className="mt-6 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-900 text-sm">
                            <span className="font-bold text-amber-700 mb-1 block">Observaciones:</span>
                            {detalleData.observaciones}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {['programado', 'en_ruta', 'recogido', 'en_planta'].includes(detalleData.estado) && (
                            <button
                                onClick={() => { setModal(null); abrirCierre(detalleData) }}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Certificar OS
                            </button>
                        )}
                        {detalleData.estado === 'programado' && (
                            <button
                                onClick={() => setEstadoDirecto(detalleData.id, 'cancelado')}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                            >
                                Cancelar Servicio
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setModal(null)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cerrar Resumen
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AnimatePresence>
                <FormModals />
                <DetalleModal />
            </AnimatePresence>

            {/* Cabecera y KPIs */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                <div className="xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <Package className="w-6 h-6 text-[#00c96e]" />
                            Órdenes de Servicio (OS)
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Control logístico y trazabilidad de recolecciones.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="OS-2024... o Empresa"
                                value={buscar} onChange={e => handleBuscar(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <button
                            onClick={abrirNuevo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00c96e] hover:bg-[#00b060] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#00c96e]/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Generar OS
                        </button>
                    </div>
                </div>

                {/* Micro KPIs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#00c96e]/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><CalendarClock className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hoy</p>
                        <p className="text-4xl font-black text-slate-800 mt-1">{ordenesHoy.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Activity className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">En Proceso</p>
                        <p className="text-4xl font-black text-blue-500 mt-1">{pendientesHoy}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><AlertCircle className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sin Asignar Ruta</p>
                        <p className="text-4xl font-black text-amber-500 mt-1">{sinAsignar}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><CheckCircle2 className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Eficiencia Hoy</p>
                        <p className="text-4xl font-black text-emerald-500 mt-1">{pctHoy}%</p>
                    </div>
                </div>
            </div>

            {/* Listado Principal */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
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

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                                <th className="px-6 py-4 whitespace-nowrap">N° Orden</th>
                                <th className="px-6 py-4 whitespace-nowrap">Generador Confirmado</th>
                                <th className="px-6 py-4 whitespace-nowrap">Carga / Volumen</th>
                                <th className="px-6 py-4 whitespace-nowrap">Logística Ruteo</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Progreso / Estado</th>
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
                                        <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><Package className="w-6 h-6" /></div>
                                        <p className="font-semibold text-slate-700">Canal Despejado</p>
                                        <p className="text-sm mt-1">No se encontraron órdenes para esta vista.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtrado.map((c: any) => {
                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-indigo-600 font-mono text-sm">{c.numero}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{c.fecha_programada}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800 max-w-[200px] truncate">{c.eco_clientes?.razon_social || 'Desconocido'}</p>
                                                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {c.eco_clientes?.distrito || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="mb-1.5">{ecoBadge(c.tipo_residuo)}</div>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {c.estado === 'completado' ? (
                                                        <span className="text-emerald-600 font-bold">{c.kg_reales} kg Reales</span>
                                                    ) : (
                                                        <span>{c.peso_estimado} kg Estimado</span>
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.vehiculo_id ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><Truck className="w-4 h-4" /></div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700">Unidad Asignada</p>
                                                            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500">{c.eco_flota?.placa}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold"><AlertCircle className="w-3.5 h-3.5" /> Sin Vehículo</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    {ecoEstadoBadge(c.estado)}

                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => verDetalle(c)}
                                                            className="px-2 py-1 flex items-center gap-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-bold uppercase transition-colors"
                                                            title="Ver Detalle OS"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> Detalle
                                                        </button>

                                                        {!c.vehiculo_id && c.estado !== 'cancelado' && (
                                                            <button
                                                                onClick={() => abrirAsignar(c)}
                                                                className="px-2 py-1 flex items-center gap-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 text-[10px] font-bold uppercase transition-colors"
                                                            >
                                                                <Truck className="w-3.5 h-3.5" /> Despachar
                                                            </button>
                                                        )}

                                                        {['programado', 'en_ruta', 'recogido', 'en_planta'].includes(c.estado) && (
                                                            <button
                                                                onClick={() => abrirCierre(c)}
                                                                className="px-2 py-1 flex items-center gap-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold uppercase transition-colors"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Certificar
                                                            </button>
                                                        )}
                                                    </div>
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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </motion.div>
    )
}
