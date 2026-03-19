'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    Truck,
    Users,
    Activity,
    CheckCircle2,
    Wrench,
    AlertCircle,
    BadgeCheck,
    CreditCard,
    Cpu,
    ShieldCheck,
    Clock
} from 'lucide-react'

const ecoBadge = (estado: string) => {
    const map: any = {
        activo: ['bg-emerald-50 text-emerald-600 border-emerald-200', 'Operativo', CheckCircle2],
        mantenimiento: ['bg-amber-50 text-amber-600 border-amber-200', 'Mantenimiento', Wrench],
        inactivo: ['bg-rose-50 text-rose-600 border-rose-200', 'Inactivo/Baja', AlertCircle],
    }
    const [style, txt, Icon] = map[estado] || ['bg-slate-50 text-slate-600 border-slate-200', estado, Activity]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
            <Icon className="w-3 h-3" /> {txt}
        </span>
    )
}

export default function TabEcoFlotaPersonal({ showToast, ecoQuery }: any) {
    const [seccionActiva, setSeccionActiva] = useState<'flota' | 'personal'>('flota')
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')

    // Data states
    const [flota, setFlota] = useState<any[]>([])
    const [personal, setPersonal] = useState<any[]>([])

    // Formulario modal
    const [modal, setModal] = useState<'flota' | 'personal' | null>(null)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)

    const cargar = async () => {
        setLoading(true)
        const [resFlota, resPersonal] = await Promise.all([
            ecoQuery('eco_flota', { filters: ['order=placa.asc'] }),
            ecoQuery('eco_operarios', { filters: ['order=nombres.asc'] })
        ])
        setFlota(Array.isArray(resFlota) ? resFlota : [])
        setPersonal(Array.isArray(resPersonal) ? resPersonal : [])
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    // Filtrados
    const flotaFiltrada = flota.filter(f => f.placa?.toLowerCase().includes(buscar.toLowerCase()) || f.marca?.toLowerCase().includes(buscar.toLowerCase()))
    const personalFiltrado = personal.filter(p => p.nombres?.toLowerCase().includes(buscar.toLowerCase()) || p.dni?.includes(buscar))

    // Acciones y Guardado
    const abrirNuevo = () => {
        if (seccionActiva === 'flota') {
            setFormData({ estado: 'activo', tipo: 'furgon' })
            setModal('flota')
        } else {
            setFormData({ estado: 'activo', cargo: 'conductor' })
            setModal('personal')
        }
    }

    const guardar = async () => {
        setSaving(true)
        try {
            if (modal === 'flota') {
                if (!formData.placa || !formData.capacidad_kg) { showToast('Completar placa y capacidad', 'error'); return }
                const r = await ecoQuery('eco_flota', { insert: { placa: formData.placa, marca: formData.marca, modelo: formData.modelo, capacidad_kg: formData.capacidad_kg, tipo: formData.tipo, estado: 'activo' } })
                if (Array.isArray(r) && r.length > 0) { showToast('Vehículo registrado', 'success'); setModal(null); cargar() }
                else showToast('Error al registrar flota', 'error')
            } else if (modal === 'personal') {
                if (!formData.nombres || !formData.dni) { showToast('Completar nombres y DNI', 'error'); return }
                const r = await ecoQuery('eco_operarios', { insert: { nombres: formData.nombres, dni: formData.dni, cargo: formData.cargo, licencia_conducir: formData.licencia_conducir, estado: 'activo' } })
                if (Array.isArray(r) && r.length > 0) { showToast('Operario registrado', 'success'); setModal(null); cargar() }
                else showToast('Error al registrar personal', 'error')
            }
        } finally { setSaving(false) }
    }

    const cambiarEstadoFlota = async (id: string, nuevoEstado: string) => {
        if (!confirm(`¿Actualizar estado de unidad a ${nuevoEstado}?`)) return
        await ecoQuery('eco_flota', { update: { estado: nuevoEstado }, id })
        showToast('Estado actualizado', 'success'); cargar()
    }

    const cambiarEstadoPersonal = async (id: string, nuevoEstado: string) => {
        if (!confirm(`¿Actualizar estado de operario a ${nuevoEstado}?`)) return
        await ecoQuery('eco_operarios', { update: { estado: nuevoEstado }, id })
        showToast('Estado actualizado', 'success'); cargar()
    }

    // KPIs Flota
    const flotaActiva = flota.filter(f => f.estado === 'activo').length
    const flotaMant = flota.filter(f => f.estado === 'mantenimiento').length
    const capTotal = flota.filter(f => f.estado === 'activo').reduce((acc, f) => acc + Number(f.capacidad_kg || 0), 0)

    // KPIs Personal
    const persActivo = personal.filter(p => p.estado === 'activo').length
    const conductores = personal.filter(p => p.cargo === 'conductor' && p.estado === 'activo').length

    const FormModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {modal === 'flota' ? <Truck className="w-5 h-5 text-indigo-500" /> : <Users className="w-5 h-5 text-indigo-500" />}
                        {modal === 'flota' ? 'Alta de Nueva Unidad Logística' : 'Alta de Nuevo Agente Operativo'}
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                    {modal === 'flota' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Placa de Rodaje <span className="text-rose-500">*</span></label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xl font-bold font-mono tracking-widest uppercase rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="AAA-111" maxLength={7}
                                    value={formData.placa || ''} onChange={e => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Marca Comercial</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="Ej: Hino, Volvo, Isuzu"
                                    value={formData.marca || ''} onChange={e => setFormData({ ...formData, marca: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Modelo / Año</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="Ej: Dutro 2024"
                                    value={formData.modelo || ''} onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Clase de Vehículo <span className="text-rose-500">*</span></label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                    value={formData.tipo || 'furgon'} onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="furgon">Furgón Cerrado (Sólidos)</option>
                                    <option value="compactador">Camión Compactador</option>
                                    <option value="cisterna">Cisterna (Líquidos)</option>
                                    <option value="baranda">Camión Baranda</option>
                                    <option value="camioneta">Camioneta Rescate/Apoyo</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Capacidad Total de Carga (kg) <span className="text-rose-500">*</span></label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold font-mono rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="Ej: 5000"
                                    value={formData.capacidad_kg || ''} onChange={e => setFormData({ ...formData, capacidad_kg: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {modal === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Nombres y Apellidos <span className="text-rose-500">*</span></label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                                    placeholder="Ej: Juan Perez Garcia"
                                    value={formData.nombres || ''} onChange={e => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">DNI / CE <span className="text-rose-500">*</span></label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-mono tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="Documento de Identidad"
                                    value={formData.dni || ''} onChange={e => setFormData({ ...formData, dni: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Cargo Desempeñado <span className="text-rose-500">*</span></label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                    value={formData.cargo || 'conductor'} onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                                >
                                    <option value="conductor">Chofer Conductor AIII</option>
                                    <option value="ayudante">Ayudante / Estibador</option>
                                    <option value="supervisor">Supervisor de Ruta</option>
                                </select>
                            </div>
                            {formData.cargo === 'conductor' && (
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">N° Licencia de Conducir y Categoría <span className="text-rose-500">*</span></label>
                                    <div className="flex relative">
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-mono tracking-widest pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase"
                                            placeholder="Q-12345678 - A-IIIc"
                                            value={formData.licencia_conducir || ''} onChange={e => setFormData({ ...formData, licencia_conducir: e.target.value.toUpperCase() })}
                                        />
                                        <CreditCard className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
                                    </div>
                                    <p className="text-[10px] text-amber-600 font-bold mt-1">Sugerido para conductores. Las categorías MTC son fiscalizables.</p>
                                </div>
                            )}
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
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registrando...</>
                        ) : (
                            <><BadgeCheck className="w-4 h-4" /> {modal === 'flota' ? 'Enlazar Unidad al Ecosistema' : 'Enlazar Agente al Ecosistema'}</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AnimatePresence>
                {modal && <FormModal />}
            </AnimatePresence>

            {/* Cabecera y Switcher de Secciones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-[#00c96e]" />
                        Recursos Operacionales
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Gestión de activos físicos e intangibles para transporte de residuos.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto overflow-hidden">
                    <button
                        onClick={() => setSeccionActiva('flota')}
                        className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${seccionActiva === 'flota' ? 'bg-white text-indigo-600 shadow border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Truck className="w-4 h-4" /> Flota Motorizada
                    </button>
                    <button
                        onClick={() => setSeccionActiva('personal')}
                        className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${seccionActiva === 'personal' ? 'bg-white text-emerald-600 shadow border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="w-4 h-4" /> Talento Humano
                    </button>
                </div>
            </div>

            {/* KPIs Dinámicos según la sección */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {seccionActiva === 'flota' ? (
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#00c96e]/30 transition-colors">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><CheckCircle2 className="w-24 h-24" /></div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unidades Operativas (Activas)</p>
                            <p className="text-4xl font-black text-[#00c96e] mt-2">{flotaActiva} <span className="text-lg font-medium text-slate-400">veh</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Wrench className="w-24 h-24" /></div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">En Mantenimiento Programado</p>
                            <p className="text-4xl font-black text-amber-500 mt-2">{flotaMant} <span className="text-lg font-medium text-slate-400">veh</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Activity className="w-24 h-24" /></div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Capacidad Bruta de Carga Operativa</p>
                            <p className="text-4xl font-black text-indigo-500 mt-2 font-mono">{new Intl.NumberFormat('es-PE').format(capTotal)} <span className="text-lg font-medium text-slate-400 font-sans">kg</span></p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#00c96e]/30 transition-colors">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Users className="w-24 h-24" /></div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Planilla Operativa Total</p>
                            <p className="text-4xl font-black text-[#00c96e] mt-2">{persActivo} <span className="text-lg font-medium text-slate-400">agentes</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><ShieldCheck className="w-24 h-24" /></div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conductores Certificados</p>
                            <p className="text-4xl font-black text-indigo-500 mt-2">{conductores} <span className="text-lg font-medium text-slate-400">asignables</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-500/30 transition-colors bg-slate-50/50">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Clock className="w-24 h-24" /></div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Eficiencia en Ruta (Mensual)</p>
                            <p className="text-4xl font-black text-slate-700 mt-2">98.5% <span className="text-lg font-medium text-emerald-500 cursor-help" title="Mock data">↑</span></p>
                        </div>
                    </>
                )}
            </div>

            {/* Búsqueda y Tabla */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">

                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <input
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                            placeholder={seccionActiva === 'flota' ? "Buscar por placa o marca..." : "Buscar por nombre o DNI..."}
                            value={buscar} onChange={e => setBuscar(e.target.value)}
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>

                    <button
                        onClick={abrirNuevo}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00c96e] hover:bg-[#00b060] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#00c96e]/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> {seccionActiva === 'flota' ? 'Enlazar Vehículo' : 'Enlazar Operario'}
                    </button>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                                {seccionActiva === 'flota' ? (
                                    <>
                                        <th className="px-6 py-4 whitespace-nowrap">Indentificación de Rodaje</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Especificaciones Técnicas</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Clasificación y Carga Max</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-right">Estatus Físico</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 whitespace-nowrap">Datos del Agente Operativo</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Documento Nacional</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Rango y Certificación</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-right">Estatus Contractual</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="p-6"><div className="h-12 bg-slate-50 rounded-xl animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : seccionActiva === 'flota' ? (
                                flotaFiltrada.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><Truck className="w-6 h-6" /></div>
                                            <p className="font-semibold text-slate-700">Flota No Encontrada</p>
                                        </td>
                                    </tr>
                                ) : (
                                    flotaFiltrada.map(f => (
                                        <tr key={f.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                        <Truck className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-lg font-mono tracking-widest">{f.placa}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 mb-0.5">{f.marca || 'GENÉRICO'}</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-widest">{f.modelo || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {f.tipo}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-slate-600">CAP MAX: {new Intl.NumberFormat('es-PE').format(f.capacidad_kg)} KG</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    {ecoBadge(f.estado)}

                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {f.estado !== 'activo' && <button onClick={() => cambiarEstadoFlota(f.id, 'activo')} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100">Activar</button>}
                                                        {f.estado !== 'mantenimiento' && <button onClick={() => cambiarEstadoFlota(f.id, 'mantenimiento')} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-amber-50 text-amber-600 hover:bg-amber-100">Mant.</button>}
                                                        {f.estado !== 'inactivo' && <button onClick={() => cambiarEstadoFlota(f.id, 'inactivo')} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-rose-50 text-rose-600 hover:bg-rose-100">Baja</button>}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                /* RENDERIZADO PERSONAL */
                                personalFiltrado.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><Users className="w-6 h-6" /></div>
                                            <p className="font-semibold text-slate-700">Agente Operativo No Encontrado</p>
                                        </td>
                                    </tr>
                                ) : (
                                    personalFiltrado.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold uppercase">
                                                        {p.nombres.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-800 tracking-tight">{p.nombres}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm text-slate-600 tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{p.dni}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                                        {p.cargo === 'conductor' ? <Truck className="w-3.5 h-3.5" /> : p.cargo === 'ayudante' ? <Users className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                        {p.cargo}
                                                    </span>
                                                    {p.licencia_conducir && (
                                                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 tracking-widest">{p.licencia_conducir}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    {ecoBadge(p.estado)}

                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {p.estado === 'inactivo' ? (
                                                            <button onClick={() => cambiarEstadoPersonal(p.id, 'activo')} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100">Activar</button>
                                                        ) : (
                                                            <button onClick={() => cambiarEstadoPersonal(p.id, 'inactivo')} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-rose-50 text-rose-600 hover:bg-rose-100">Desvincular</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </motion.div>
    )
}
