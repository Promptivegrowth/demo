'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    MapIcon,
    Route,
    MapPin,
    Truck,
    Navigation2,
    CheckCircle2,
    Calendar,
    Activity,
    Edit2,
    Trash2,
    ChevronRight
} from 'lucide-react'

// Array de colores predefinidos para las rutas en el mapa mock
const routeColors = ['#00c96e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']

export default function TabEcoRutas({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [vehiculos, setVehiculos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')

    const [modal, setModal] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)

    const cargar = async () => {
        setLoading(true)
        const [rts, vehi] = await Promise.all([
            ecoQuery('eco_rutas', { select: '*,eco_flota(placa,tipo)', filters: ['order=created_at.desc'] }),
            ecoQuery('eco_flota', { select: 'id,placa,tipo', filters: ['estado=eq.activo'] })
        ])
        const arr = Array.isArray(rts) ? rts : []
        setData(arr); setFiltrado(arr)
        setVehiculos(Array.isArray(vehi) ? vehi : [])
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string) => {
        let res = lista
        if (busq) {
            const b = busq.toLowerCase()
            res = res.filter((c: any) => c.nombre?.toLowerCase().includes(b) || c.origen?.toLowerCase().includes(b) || c.destino?.toLowerCase().includes(b))
        }
        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v) }

    const abrirNuevo = () => {
        setFormData({ estado: 'activa', puntos_recoleccion: { points: [] } })
        setModal('nuevo')
    }
    const abrirEditar = (item: any) => { setFormData({ ...item }); setModal('editar') }

    const guardar = async () => {
        if (!formData.nombre || !formData.origen || !formData.destino) {
            showToast('Complete nombre, origen y destino', 'error'); return
        }

        setSaving(true)
        try {
            if (modal === 'nuevo') {
                const r = await ecoQuery('eco_rutas', { insert: { nombre: formData.nombre, descripcion: formData.descripcion, origen: formData.origen, destino: formData.destino, vehiculo_id: formData.vehiculo_id, puntos_recoleccion: formData.puntos_recoleccion || { points: [] }, estado: 'activa' } })
                if (Array.isArray(r) && r.length > 0) {
                    showToast('Ruta logística creada', 'success')
                    setModal(null); cargar()
                } else showToast('Error al crear ruta', 'error')
            } else {
                const r = await ecoQuery('eco_rutas', { update: { nombre: formData.nombre, descripcion: formData.descripcion, origen: formData.origen, destino: formData.destino, vehiculo_id: formData.vehiculo_id, puntos_recoleccion: formData.puntos_recoleccion, estado: formData.estado }, id: formData.id })
                if (Array.isArray(r) || !r.error) {
                    showToast('Ruta actualizada', 'success')
                    setModal(null); cargar()
                } else showToast('Error al actualizar', 'error')
            }
        } finally { setSaving(false) }
    }

    const setEstado = async (id: string, nuevoEstado: string) => {
        if (!confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return
        await ecoQuery('eco_rutas', { update: { estado: nuevoEstado }, id })
        showToast(`Ruta en estado ${nuevoEstado}`, 'success'); cargar()
    }

    // KPI Data
    const rActivas = data.filter(c => c.estado === 'activa').length
    const rInactivas = data.filter(c => c.estado === 'inactiva').length
    const vehiAsignados = new Set(data.filter(c => c.vehiculo_id).map(c => c.vehiculo_id)).size

    const FormModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {modal === 'nuevo' ? <Navigation2 className="w-5 h-5 text-[#00c96e]" /> : <Edit2 className="w-5 h-5 text-indigo-500" />}
                        {modal === 'nuevo' ? 'Diseñar Nueva Ruta' : 'Modificar Ruta Geográfica'}
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Nombre de la Ruta <span className="text-rose-500">*</span></label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e]"
                                placeholder="Ej: Ruta Norte Industrial 01"
                                value={formData.nombre || ''} onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Punto de Origen <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e]"
                                    placeholder="Base Principal..."
                                    value={formData.origen || ''} onChange={e => setFormData({ ...formData, origen: e.target.value })}
                                />
                                <MapPin className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Destino / Disposición Final <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e]"
                                    placeholder="Relleno Sanitario..."
                                    value={formData.destino || ''} onChange={e => setFormData({ ...formData, destino: e.target.value })}
                                />
                                <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <div className="h-px bg-slate-100 my-2" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Vehículo Predeterminado</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] cursor-pointer"
                                value={formData.vehiculo_id || ''} onChange={e => setFormData({ ...formData, vehiculo_id: e.target.value })}
                            >
                                <option value="">Sin Asignar (Dinámico)</option>
                                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} ({v.tipo})</option>)}
                            </select>
                        </div>

                        {modal === 'editar' && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Estado de Operatividad</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] cursor-pointer"
                                    value={formData.estado || 'activa'} onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    <option value="activa">Ruta Activa</option>
                                    <option value="inactiva">Ruta Suspendida / Inactiva</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Puntos Intermedios de Recolección (JSON/String)</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] h-20 resize-none font-mono text-xs"
                                placeholder='Ej: Cliente A, Cliente B, Planta de Transferencia... o [{"lat": -12, "lng": -77}]'
                                value={typeof formData.puntos_recoleccion === 'object' ? JSON.stringify(formData.puntos_recoleccion) : formData.puntos_recoleccion || ''}
                                onChange={e => {
                                    try {
                                        const parsed = JSON.parse(e.target.value)
                                        setFormData({ ...formData, puntos_recoleccion: parsed })
                                    } catch {
                                        setFormData({ ...formData, puntos_recoleccion: e.target.value })
                                    }
                                }}
                            />
                            <p className="text-[10px] text-slate-400">Puede procesar coordenadas JSON para la app de conductores.</p>
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
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> {modal === 'nuevo' ? 'Guardar Ruta Geográfica' : 'Actualizar Ruta'}</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AnimatePresence>
                {(modal === 'nuevo' || modal === 'editar') && <FormModal key="form" />}
            </AnimatePresence>

            {/* Cabecera y KPIs */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                <div className="xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <MapIcon className="w-6 h-6 text-[#00c96e]" />
                            Control Geomático y Rutas
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Planimetría y trazos logísticos de recolección en calle.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Buscar ruta, origen o destino..."
                                value={buscar} onChange={e => handleBuscar(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <button
                            onClick={abrirNuevo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00c96e] hover:bg-[#00b060] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#00c96e]/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Nueva Ruta
                        </button>
                    </div>
                </div>

                <div className="xl:col-span-1 flex flex-col gap-6">
                    {/* Micro KPIs Verticales */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex-1">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Navigation2 className="w-24 h-24" /></div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rutas Operativas (HOY)</p>
                        <p className="text-5xl font-black text-emerald-500 mt-2">{rActivas}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors flex-1">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Truck className="w-24 h-24" /></div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Flota Enrutada</p>
                        <p className="text-5xl font-black text-indigo-500 mt-2">{vehiAsignados}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-500/30 transition-colors flex-1">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Activity className="w-24 h-24" /></div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rutas Suspendidas</p>
                        <p className="text-5xl font-black text-rose-500 mt-2">{rInactivas}</p>
                    </div>
                </div>

                <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Route className="w-5 h-5 text-indigo-500" />
                            Directorio de Trazabilidad
                        </h3>
                        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">{filtrado.length} trazos encontrados</span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                                    <th className="px-6 py-4 whitespace-nowrap w-24">Color</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Plan de Ruta</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Georeferencia (Origen → Destino)</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Asignación</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5} className="p-6"><div className="h-14 bg-slate-50 rounded-xl animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : filtrado.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><MapIcon className="w-6 h-6" /></div>
                                            <p className="font-semibold text-slate-700">Sin Cobertura</p>
                                            <p className="text-sm mt-1">No hay rutas registradas en el mapa logístico.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtrado.map((c: any, index: number) => {
                                        const cColor = routeColors[index % routeColors.length]
                                        return (
                                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-5 text-center">
                                                    <div className="w-8 h-8 rounded-full border-4 border-white shadow-sm mx-auto" style={{ backgroundColor: cColor }}></div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-slate-800 text-sm">{c.nombre}</p>
                                                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.estado === 'activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {c.estado === 'activa' ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />} {c.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-sm font-semibold text-slate-700">{c.origen}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-5 border-l-2 border-slate-200 pl-3 py-1">
                                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-rose-500" />
                                                        <span className="text-sm font-semibold text-slate-700">{c.destino}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {c.vehiculo_id ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                                                                <Truck className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad Fija</p>
                                                                <p className="text-sm font-bold font-mono tracking-widest text-slate-800">{c.eco_flota?.placa}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                                            <Truck className="w-4 h-4" /> <span>Ruta Flotante (Sin placa)</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => abrirEditar(c)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                            title="Editar Ruta"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        {c.estado === 'activa' ? (
                                                            <button
                                                                onClick={() => setEstado(c.id, 'inactiva')}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                                title="Suspender Ruta"
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setEstado(c.id, 'activa')}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                title="Activar Ruta"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
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
            </div>
        </motion.div>
    )
}
