'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    Building2,
    Mail,
    Phone,
    MapPin,
    FileText,
    Receipt,
    MoreVertical,
    Eye,
    Edit2,
    Power,
    CheckCircle2,
    MinusCircle
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

export default function TabEcoClientes({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [pillActivo, setPillActivo] = useState('Todos')
    const [modal, setModal] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [detalleData, setDetalleData] = useState<any>(null)

    const cargar = async () => {
        setLoading(true)
        const r = await ecoQuery('eco_clientes', { select: '*', filters: ['order=razon_social.asc'] })
        const arr = Array.isArray(r) ? r : []
        setData(arr); setFiltrado(arr)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string, pill: string) => {
        let res = lista
        if (busq) res = res.filter((c: any) => c.razon_social?.toLowerCase().includes(busq.toLowerCase()) || c.ruc?.includes(busq))
        if (pill !== 'Todos') {
            if (['Municipal', 'Industrial', 'Hospital', 'Construcción', 'Mixto'].includes(pill)) {
                const mp: any = { Municipal: 'municipal', Industrial: 'industrial', Hospital: 'hospital', Construcción: 'construccion', Mixto: 'mixto' }
                res = res.filter((c: any) => c.tipo === mp[pill])
            } else if (pill === 'Activos') res = res.filter((c: any) => c.estado === 'activo')
            else if (pill === 'Inactivos') res = res.filter((c: any) => c.estado === 'inactivo')
        }
        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v, pillActivo) }
    const handlePill = (p: string) => { setPillActivo(p); filtrar(data, buscar, p) }

    const verDetalle = async (id: string) => {
        const cli = data.find((c: any) => c.id === id)
        const [conts, ords] = await Promise.all([
            ecoQuery('eco_contratos', { select: '*', filters: [`cliente_id=eq.${id}`, 'limit=3', 'order=created_at.desc'] }),
            ecoQuery('eco_ordenes', { select: 'numero,fecha_programada,estado,tipo_residuo', filters: [`cliente_id=eq.${id}`, 'limit=5', 'order=created_at.desc'] }),
        ])
        setDetalleData({ cli, contratos: Array.isArray(conts) ? conts : [], ordenes: Array.isArray(ords) ? ords : [] })
        setModal('detalle')
    }

    const abrirEditar = (cli: any) => { setFormData({ ...cli }); setModal('editar') }
    const abrirNuevo = () => { setFormData({ estado: 'activo', tiene_contrato: false }); setModal('nuevo') }

    const guardar = async () => {
        if (!formData.razon_social) { showToast('Razón social requerida', 'error'); return }
        setSaving(true)
        try {
            if (modal === 'nuevo') {
                const r = await ecoQuery('eco_clientes', { insert: { razon_social: formData.razon_social, ruc: formData.ruc, tipo: formData.tipo, contacto: formData.contacto, telefono: formData.telefono, email: formData.email, direccion: formData.direccion, distrito: formData.distrito, tiene_contrato: false, estado: 'activo', saldo_pendiente: 0 } })
                if (Array.isArray(r) && r.length > 0) { showToast('Cliente registrado exitosamente', 'success'); setModal(null); cargar() }
                else showToast('Error al registrar cliente: Verifica RUC único', 'error')
            } else {
                const r = await ecoQuery('eco_clientes', { update: { razon_social: formData.razon_social, ruc: formData.ruc, tipo: formData.tipo, contacto: formData.contacto, telefono: formData.telefono, email: formData.email, direccion: formData.direccion, distrito: formData.distrito }, id: formData.id })
                if (Array.isArray(r) || !r.error) { showToast('Cliente actualizado', 'success'); setModal(null); cargar() }
                else showToast('Error al actualizar: Verifica RUC único', 'error')
            }
        } finally { setSaving(false) }
    }

    const toggleEstado = async (cli: any) => {
        const nuevoEstado = cli.estado === 'activo' ? 'inactivo' : 'activo'
        if (!confirm(`¿${nuevoEstado === 'inactivo' ? 'Desactivar' : 'Activar'} a ${cli.razon_social}?`)) return
        await ecoQuery('eco_clientes', { update: { estado: nuevoEstado }, id: cli.id })
        showToast(`Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`, nuevoEstado === 'activo' ? 'success' : 'warning')
        cargar()
    }

    const pills = ['Todos', 'Municipal', 'Industrial', 'Hospital', 'Construcción', 'Activos', 'Inactivos']

    // KPI Data
    const activos = data.filter(c => c.estado === 'activo').length
    const conContrato = data.filter(c => c.tiene_contrato).length
    const sSaldo = data.reduce((acc, c) => acc + (c.saldo_pendiente > 0 ? 1 : 0), 0)
    const pctConContrato = data.length ? Math.round((conContrato / data.length) * 100) : 0

    const FormModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {modal === 'nuevo' ? <Plus className="w-5 h-5 text-[#00c96e]" /> : <Edit2 className="w-5 h-5 text-indigo-500" />}
                        {modal === 'nuevo' ? 'Registrar Nuevo Cliente' : 'Editar Cliente'}
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Razón Social <span className="text-rose-500">*</span></label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Ej: Municipalidad de Lima"
                                value={formData.razon_social || ''} onChange={e => setFormData({ ...formData, razon_social: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">RUC</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Ej: 20123456789" maxLength={11}
                                value={formData.ruc || ''} onChange={e => setFormData({ ...formData, ruc: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Tipo de Cliente</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 appearance-none outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all cursor-pointer"
                                    value={formData.tipo || ''} onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="" disabled>Seleccione sector comercial...</option>
                                    <option value="municipal">Municipal</option>
                                    <option value="industrial">Industrial</option>
                                    <option value="hospital">Hospitalario / Clínico</option>
                                    <option value="construccion">Construcción</option>
                                    <option value="mixto">Mixto</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                    <MoreVertical className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <div className="h-px bg-slate-100 my-2" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Información de Contacto</h4>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Contacto Principal</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Nombre del representante"
                                value={formData.contacto || ''} onChange={e => setFormData({ ...formData, contacto: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="(01) 123-4567"
                                value={formData.telefono || ''} onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                type="email" placeholder="correo@empresa.com"
                                value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Distrito / Localidad</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Ej: Miraflores"
                                value={formData.distrito || ''} onChange={e => setFormData({ ...formData, distrito: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Dirección Completa</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Av. Principal 123"
                                value={formData.direccion || ''} onChange={e => setFormData({ ...formData, direccion: e.target.value })}
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
                            <><CheckCircle2 className="w-4 h-4" /> {modal === 'nuevo' ? 'Registrar Cliente' : 'Guardar Cambios'}</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )

    const DetalleModal = () => !detalleData ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-800">{detalleData.cli.razon_social}</h3>
                            {ecoBadge(detalleData.cli.tipo)}
                            {detalleData.cli.estado === 'activo' ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Activo</span>
                            ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">Inactivo</span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 font-mono">RUC: {detalleData.cli.ruc || 'No registrado'}</p>
                    </div>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Alerta de Deuda */}
                    {detalleData.cli.saldo_pendiente > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                            <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Receipt className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-800">Saldo Pendiente</h4>
                                <p className="text-lg font-black text-rose-600 mt-1">S/ {Number(detalleData.cli.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Información de Contacto</h4>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400"><Building2 className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Representante</p>
                                    <p className="text-sm font-medium text-slate-800">{detalleData.cli.contacto || 'Sin especificar'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400"><Phone className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Teléfono</p>
                                    <p className="text-sm font-medium text-slate-800">{detalleData.cli.telefono || 'Sin especificar'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400"><Mail className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Correo Electrónico</p>
                                    <p className="text-sm font-medium text-slate-800">{detalleData.cli.email || 'Sin especificar'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Ubicación Primaria</h4>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400"><MapPin className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Distrito / Localidad</p>
                                    <p className="text-sm font-medium text-slate-800">{detalleData.cli.distrito || 'Sin especificar'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 ml-7">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Dirección</p>
                                    <p className="text-sm font-medium text-slate-800 leading-snug">{detalleData.cli.direccion || 'Sin especificar'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contratos */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Contratos Vigentes</h4>
                        </div>
                        {detalleData.contratos.length === 0 ? (
                            <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-6 text-center">
                                <p className="text-sm text-slate-500 font-medium">Este cliente no tiene contratos registrados.</p>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <tr><th className="px-4 py-3">Contrato OS</th><th className="px-4 py-3">Tipo Residuo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Vencimiento</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {detalleData.contratos.map((c: any) => (
                                            <tr key={c.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-semibold text-indigo-600">{c.numero}</td>
                                                <td className="px-4 py-3 text-slate-600 font-medium capitalize">{c.tipo_residuo}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>{c.estado}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{c.fecha_fin}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        onClick={() => setModal(null)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cerrar Resumen
                    </button>
                    <button
                        onClick={() => { setModal(null); abrirEditar(detalleData.cli) }}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" /> Editar Datos
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AnimatePresence>
                {(modal === 'nuevo' || modal === 'editar') && <FormModal key="form" />}
                {modal === 'detalle' && <DetalleModal key="detalle" />}
            </AnimatePresence>

            {/* Cabecera y KPIs */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Header / Buscador */}
                <div className="xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-[#00c96e]" />
                            Directorio de Clientes
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Gestión de generadores de residuos y cuentas corporativas.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Buscar por RUC o empresa..."
                                value={buscar} onChange={e => handleBuscar(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <button
                            onClick={abrirNuevo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00c96e] hover:bg-[#00b060] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#00c96e]/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {/* Micro KPIs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Building2 className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Activos</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{activos}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><FileText className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasa de Contratos</p>
                        <p className="text-3xl font-black text-[#00c96e] mt-1">{pctConContrato}%</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Receipt className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Con Deuda Activa</p>
                        <p className="text-3xl font-black text-amber-500 mt-1">{sSaldo}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><CheckCircle2 className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">En Base de Datos</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{data.length}</p>
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
                                <th className="px-6 py-4 whitespace-nowrap">Razón Social y RUC</th>
                                <th className="px-6 py-4 whitespace-nowrap">Segmento</th>
                                <th className="px-6 py-4 whitespace-nowrap">Ubicación & Contacto</th>
                                <th className="px-6 py-4 whitespace-nowrap">Estado Relación</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Acciones</th>
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
                                        <p className="font-semibold text-slate-700">No se encontraron clientes</p>
                                        <p className="text-sm mt-1">Prueba intentando con otro término de búsqueda.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtrado.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{c.razon_social}</p>
                                            <p className="text-xs font-mono text-slate-400 mt-1">{c.ruc || 'SIN RUC'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {ecoBadge(c.tipo)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-sm font-medium">{c.distrito || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-medium">{c.telefono || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {c.tiene_contrato ? (
                                                    <span className="inline-flex w-fit items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase border border-indigo-100"><FileText className="w-3 h-3" /> Contrato Vigente</span>
                                                ) : (
                                                    <span className="inline-flex w-fit items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded text-[10px] font-bold uppercase"><MinusCircle className="w-3 h-3" /> Sin Contratos</span>
                                                )}

                                                {c.estado === 'activo' ? (
                                                    <span className="inline-flex w-fit items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Activo</span>
                                                ) : (
                                                    <span className="inline-flex w-fit items-center gap-1 text-rose-500 text-[10px] font-bold uppercase"><X className="w-3 h-3" /> Inactivo</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => verDetalle(c.id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => abrirEditar(c)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                    title="Editar Cliente"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleEstado(c)}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${c.estado === 'activo' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                        }`}
                                                    title={c.estado === 'activo' ? 'Desactivar Cliente' : 'Activar Cliente'}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Custom Scrollbar for Component Level */}
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
