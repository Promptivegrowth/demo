'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    FileText,
    Calendar,
    Briefcase,
    Building2,
    CalendarClock,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Edit2,
    Power,
    FileSignature,
    Clock,
    Activity
} from 'lucide-react'

const ecoBadge = (tipo: string) => {
    const map: any = {
        municipal: ['bg-emerald-100 text-emerald-700 border-emerald-200', 'Municipal'],
        industrial: ['bg-blue-100 text-blue-700 border-blue-200', 'Industrial'],
        hospital: ['bg-purple-100 text-purple-700 border-purple-200', 'Hospital'],
        construccion: ['bg-amber-100 text-amber-700 border-amber-200', 'Construcción'],
        mixto: ['bg-slate-100 text-slate-700 border-slate-200', 'Mixto'],
    }
    const [style, txt] = map[tipo] || ['bg-slate-100 text-slate-700 border-slate-200', tipo]
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>{txt}</span>
}

export default function TabEcoContratos({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [pillActivo, setPillActivo] = useState('Todos')
    const [modal, setModal] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [detalleData, setDetalleData] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    const cargar = async () => {
        setLoading(true)
        const [conts, clis] = await Promise.all([
            ecoQuery('eco_contratos', { select: '*,eco_clientes(razon_social,ruc)', filters: ['order=created_at.desc'] }),
            ecoQuery('eco_clientes', { select: 'id,razon_social,ruc,estado', filters: ['estado=eq.activo', 'order=razon_social.asc'] })
        ])
        const arr = Array.isArray(conts) ? conts : []
        setData(arr); setFiltrado(arr)
        setClientes(Array.isArray(clis) ? clis : [])
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string, pill: string) => {
        let res = lista
        if (busq) {
            const b = busq.toLowerCase()
            res = res.filter((c: any) => c.numero?.toLowerCase().includes(b) || c.eco_clientes?.razon_social?.toLowerCase().includes(b))
        }
        if (pill !== 'Todos') {
            if (pill === 'Activos') res = res.filter((c: any) => c.estado === 'activo')
            else if (pill === 'Próximos a Vencer') {
                const limit = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                const today = new Date().toISOString().split('T')[0]
                res = res.filter((c: any) => c.estado === 'activo' && c.fecha_fin >= today && c.fecha_fin <= limit)
            }
            else if (pill === 'Vencidos') {
                const today = new Date().toISOString().split('T')[0]
                res = res.filter((c: any) => c.fecha_fin < today || c.estado === 'vencido')
            }
            else if (pill === 'Inactivos') res = res.filter((c: any) => c.estado === 'inactivo')
        }
        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v, pillActivo) }
    const handlePill = (p: string) => { setPillActivo(p); filtrar(data, buscar, p) }

    const abrirEditar = (item: any) => { setFormData({ ...item }); setModal('editar') }
    const abrirDetalle = (item: any) => { setDetalleData(item); setModal('detalle') }
    const abrirNuevo = () => {
        const nextNum = `CT-${new Date().getFullYear()}-${String(data.length + 1).padStart(4, '0')}`
        setFormData({ estado: 'activo', numero: nextNum, tipo_residuo: 'municipal' })
        setModal('nuevo')
    }

    const guardar = async () => {
        if (!formData.cliente_id || !formData.fecha_inicio || !formData.fecha_fin) {
            showToast('Complete los campos obligatorios', 'error'); return
        }
        if (formData.fecha_inicio > formData.fecha_fin) {
            showToast('La fecha de inicio no puede ser posterior al fin', 'error'); return
        }

        setSaving(true)
        try {
            if (modal === 'nuevo') {
                const r = await ecoQuery('eco_contratos', { insert: { numero: formData.numero, cliente_id: formData.cliente_id, fecha_inicio: formData.fecha_inicio, fecha_fin: formData.fecha_fin, tipo_residuo: formData.tipo_residuo, estado: 'activo' } })
                if (Array.isArray(r) && r.length > 0) {
                    await ecoQuery('eco_clientes', { update: { tiene_contrato: true }, id: formData.cliente_id })
                    showToast('Contrato registrado exitosamente', 'success')
                    setModal(null); cargar()
                } else showToast('Error al registrar', 'error')
            } else {
                const r = await ecoQuery('eco_contratos', { update: { numero: formData.numero, cliente_id: formData.cliente_id, fecha_inicio: formData.fecha_inicio, fecha_fin: formData.fecha_fin, tipo_residuo: formData.tipo_residuo }, id: formData.id })
                if (Array.isArray(r) || !r.error) {
                    showToast('Contrato actualizado', 'success')
                    setModal(null); cargar()
                } else showToast('Error al actualizar', 'error')
            }
        } finally { setSaving(false) }
    }

    const setEstado = async (id: string, nuevoEstado: string) => {
        if (!confirm(`¿Marcar contrato como ${nuevoEstado}?`)) return
        await ecoQuery('eco_contratos', { update: { estado: nuevoEstado }, id })
        showToast(`Contrato ${nuevoEstado}`, 'success')
        cargar()
    }

    const pills = ['Todos', 'Activos', 'Próximos a Vencer', 'Vencidos', 'Inactivos']
    const today = new Date().toISOString().split('T')[0]
    const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    // KPI Data
    const activos = data.filter(c => c.estado === 'activo').length
    const vencidos = data.filter(c => c.fecha_fin < today || c.estado === 'vencido').length
    const porVencer = data.filter(c => c.estado === 'activo' && c.fecha_fin >= today && c.fecha_fin <= in30Days).length
    const pctActivos = data.length ? Math.round((activos / data.length) * 100) : 0

    const getProgresoContrato = (ini: string, fin: string) => {
        const dIni = new Date(ini).getTime()
        const dFin = new Date(fin).getTime()
        const dHoy = Date.now()
        if (dHoy < dIni) return 0
        if (dHoy > dFin) return 100
        return Math.round(((dHoy - dIni) / (dFin - dIni)) * 100)
    }

    const FormModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {modal === 'nuevo' ? <FileSignature className="w-5 h-5 text-[#00c96e]" /> : <Edit2 className="w-5 h-5 text-indigo-500" />}
                        {modal === 'nuevo' ? 'Registrar Nuevo Contrato' : 'Editar Contrato'}
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Cliente Asociado <span className="text-rose-500">*</span></label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all cursor-pointer"
                                value={formData.cliente_id || ''} onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                            >
                                <option value="" disabled>Seleccione un cliente...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social} (RUC: {c.ruc})</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">N° de Contrato <span className="text-rose-500">*</span></label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none font-mono"
                                placeholder="Ej: CT-2024-001"
                                value={formData.numero || ''} onChange={e => setFormData({ ...formData, numero: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Tipo de Residuo</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all cursor-pointer"
                                value={formData.tipo_residuo || 'municipal'} onChange={e => setFormData({ ...formData, tipo_residuo: e.target.value })}
                            >
                                <option value="municipal">Municipal (R.S.M.)</option>
                                <option value="industrial">Industrial No Peligroso (R.S.I.)</option>
                                <option value="peligroso">Peligroso (R.P.)</option>
                                <option value="hospitalario">Hospitalario Biocontaminado (R.H.)</option>
                                <option value="construccion">Construcción y Demolición (R.C.D.)</option>
                                <option value="mixto">Mixto Institucional</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <div className="h-px bg-slate-100 my-2" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vigencia del Contrato</h4>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Fecha de Inicio <span className="text-rose-500">*</span></label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                value={formData.fecha_inicio || ''} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Fecha de Término <span className="text-rose-500">*</span></label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                value={formData.fecha_fin || ''} onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
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
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> {modal === 'nuevo' ? 'Registrar Contrato' : 'Guardar Cambios'}</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )

    const DetalleModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> Detalle del Contrato {detalleData?.numero}
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Cliente Asociado</span>
                            <span className="text-sm font-bold text-slate-800">{detalleData?.eco_clientes?.razon_social || 'Desconocido'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">RUC Cliente</span>
                            <span className="text-sm font-mono text-slate-800">{detalleData?.eco_clientes?.ruc || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Tipo de Residuo</span>
                            <span className="text-sm font-bold text-slate-800 uppercase">{detalleData?.tipo_residuo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Fecha Inicio</span>
                            <span className="text-sm font-bold text-slate-800">{detalleData?.fecha_inicio}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Fecha Vencimiento</span>
                            <span className="text-sm font-bold text-rose-500">{detalleData?.fecha_fin}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Estado</span>
                            <span className="text-sm font-bold text-slate-800 uppercase">{detalleData?.estado}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500">ID del Contrato interno: {detalleData?.id}</p>
                            <p className="text-xs text-slate-500">Fecha de Creación: {new Date(detalleData?.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all">
                        Cerrar Detalle
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AnimatePresence>
                {(modal === 'nuevo' || modal === 'editar') && <FormModal key="form" />}
                {modal === 'detalle' && detalleData && <DetalleModal key="detalle" />}
            </AnimatePresence>

            {/* Cabecera y KPIs */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Header / Buscador */}
                <div className="xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6 text-[#00c96e]" />
                            Contratos Corporativos
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Gestión de vigencias y obligaciones de recolección.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Buscar por N° o Cliente..."
                                value={buscar} onChange={e => handleBuscar(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <button
                            onClick={abrirNuevo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00c96e] hover:bg-[#00b060] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#00c96e]/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Nuevo Contrato
                        </button>
                    </div>
                </div>

                {/* Micro KPIs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#00c96e]/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Briefcase className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contratos Vigentes</p>
                        <p className="text-4xl font-black text-slate-800 mt-1">{activos}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><CalendarClock className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Próximos a Vencer (30d)</p>
                        <p className="text-4xl font-black text-amber-500 mt-1">{porVencer}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><AlertCircle className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Extintos / Vencidos</p>
                        <p className="text-4xl font-black text-rose-500 mt-1">{vencidos}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Activity className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nivel de Salud</p>
                        <p className="text-4xl font-black text-indigo-500 mt-1">{pctActivos}%</p>
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
                                <th className="px-6 py-4 whitespace-nowrap">Código Contrato</th>
                                <th className="px-6 py-4 whitespace-nowrap">Cliente Vinculado</th>
                                <th className="px-6 py-4 whitespace-nowrap">Clase Residuo</th>
                                <th className="px-6 py-4 whitespace-nowrap w-64">Vigencia & Progreso</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Estado y Acciones</th>
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
                                        <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><Search className="w-6 h-6" /></div>
                                        <p className="font-semibold text-slate-700">No se encontraron contratos</p>
                                        <p className="text-sm mt-1">Prueba con otra búsqueda o filtro.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtrado.map((c: any) => {
                                    const v = c.fecha_fin < today ? true : false
                                    const nextV = c.estado === 'activo' && c.fecha_fin >= today && c.fecha_fin <= in30Days
                                    const pct = getProgresoContrato(c.fecha_inicio, c.fecha_fin)
                                    const isRealVencido = v || c.estado === 'vencido'

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-indigo-600 font-mono text-sm">{c.numero}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800">{c.eco_clientes?.razon_social || 'Cliente no encontrado'}</p>
                                                <p className="text-xs text-slate-400 font-medium">RUC: {c.eco_clientes?.ruc || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {ecoBadge(c.tipo_residuo)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                                                    <span>Inició: {c.fecha_inicio}</span>
                                                    <span className={isRealVencido ? 'text-rose-500 font-bold' : nextV ? 'text-amber-500 font-bold' : ''}>Fin: {c.fecha_fin}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${isRealVencido ? 'bg-rose-500' : nextV ? 'bg-amber-500' : 'bg-[#00c96e]'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 text-right mt-1">{pct}% consumido</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    {c.estado === 'activo' ? (
                                                        isRealVencido ? (
                                                            <span className="inline-flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><X className="w-3 h-3" /> Vencido Automático</span>
                                                        ) : (
                                                            <span className={`inline-flex items-center gap-1 ${nextV ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}><CheckCircle2 className="w-3 h-3" /> Activo Vigente</span>
                                                        )
                                                    ) : c.estado === 'vencido' ? (
                                                        <span className="inline-flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><X className="w-3 h-3" /> Extinto</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Power className="w-3 h-3" /> Suspendido</span>
                                                    )}

                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => abrirDetalle(c)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                                                            title="Ver Detalles"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => abrirEditar(c)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                            title="Editar Contrato"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        {c.estado === 'activo' && !isRealVencido && (
                                                            <button
                                                                onClick={() => setEstado(c.id, 'inactivo')}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                                title="Suspender Contrato"
                                                            >
                                                                <Power className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {c.estado === 'inactivo' && !isRealVencido && (
                                                            <button
                                                                onClick={() => setEstado(c.id, 'activo')}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                title="Reactivar"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
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
