'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Plus, Search, CheckCircle, AlertTriangle, PenTool, X, ShieldAlert, BadgeInfo, Wrench, Trash2
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabFlota({ showToast }: { showToast: Function }) {
    const [flota, setFlota] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')

    // Modal
    const [modalForm, setModalForm] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })
    const [modalDetalle, setModalDetalle] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // Form State
    const [formData, setFormData] = useState({
        placa: '', marca: '', modelo: '', anio: new Date().getFullYear(),
        capacidad_m3: 0, chofer_asignado: '', vencimiento_soat: '', vencimiento_rev_tecnica: '', estado: 'disponible'
    })

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('saf_flota').select('*').order('placa')
            if (error) throw error
            setFlota(data || [])
        } catch (err: any) {
            showToast('Error cargando flota', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // Derived Values
    const now = new Date()
    const stats = {
        total: flota.length,
        disponibles: flota.filter(f => f.estado === 'disponible').length,
        enRuta: flota.filter(f => f.estado === 'en_ruta').length,
        enMantenimiento: flota.filter(f => f.estado === 'mantenimiento').length,
    }

    const isWarning = (dateStr: string) => {
        if (!dateStr) return false
        const days = (new Date(dateStr).getTime() - now.getTime()) / (1000 * 3600 * 24)
        return days <= 30 // Warn if expires within 30 days
    }

    const isExpired = (dateStr: string) => {
        if (!dateStr) return false
        return new Date(dateStr) < now
    }

    const filteredList = flota.filter(f => {
        const s = busqueda.toLowerCase()
        const matchBusqueda = (f.placa || '').toLowerCase().includes(s) || (f.chofer_asignado || '').toLowerCase().includes(s)
        let matchEstado = filtroEstado === 'Todos' || f.estado === filtroEstado.toLowerCase().replace(' ', '_')
        return matchBusqueda && matchEstado
    })

    const handleOpenForm = (vehiculo: any = null) => {
        if (vehiculo) {
            setFormData({
                placa: vehiculo.placa, marca: vehiculo.marca, modelo: vehiculo.modelo, anio: vehiculo.anio,
                capacidad_m3: vehiculo.capacidad_m3, chofer_asignado: vehiculo.chofer_asignado,
                vencimiento_soat: vehiculo.vencimiento_soat?.split('T')[0] || '',
                vencimiento_rev_tecnica: vehiculo.vencimiento_rev_tecnica?.split('T')[0] || '',
                estado: vehiculo.estado
            })
        } else {
            setFormData({
                placa: '', marca: '', modelo: '', anio: new Date().getFullYear(),
                capacidad_m3: 0, chofer_asignado: '', vencimiento_soat: '', vencimiento_rev_tecnica: '', estado: 'disponible'
            })
        }
        setModalForm({ isOpen: true, data: vehiculo })
    }

    const handleSave = async () => {
        if (!formData.placa || !formData.capacidad_m3) return showToast('Placa y capacidad son obligatorios', 'warning')

        try {
            if (modalForm.data) {
                await supabase.from('saf_flota').update({ ...formData }).eq('id', modalForm.data.id)
                showToast('Vehículo actualizado', 'success')
            } else {
                await supabase.from('saf_flota').insert({ ...formData })
                showToast('Vehículo registrado', 'success')
            }
            setModalForm({ isOpen: false, data: null })
            fetchData()
        } catch (err) {
            showToast('Error al guardar vehículo', 'error')
        }
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Gestión de Flota</h2>
                    <p className="text-sm text-[#8b949e]">Control de vehículos, conductores y documentación</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 overflow-x-auto no-scrollbar">
                        {['Todos', 'Disponible', 'En Ruta', 'Mantenimiento'].map(est => (
                            <button
                                key={est} onClick={() => setFiltroEstado(est)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtroEstado === est ? 'bg-[#f0a500] text-[#0d1117]' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                            >
                                {est}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors whitespace-nowrap">
                        <Plus className="h-4 w-4" /> Nuevo Vehículo
                    </button>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0a500]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#f0a500]/10"></div>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2 font-semibold">Total Vehículos</p>
                    <p className="text-4xl font-rajdhani font-bold text-white drop-shadow-md">{stats.total}</p>
                </div>
                <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#238636]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#238636]/10"></div>
                    <p className="text-xs text-[#238636] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Disponibles</p>
                    <p className={`text-4xl font-rajdhani font-bold drop-shadow-md ${stats.disponibles > 0 ? 'text-white' : 'text-[#8b949e]'}`}>{stats.disponibles}</p>
                </div>
                <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1f6feb]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#1f6feb]/10"></div>
                    <p className="text-xs text-[#1f6feb] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><Truck className="h-4 w-4" /> En Ruta</p>
                    <p className={`text-4xl font-rajdhani font-bold drop-shadow-md ${stats.enRuta > 0 ? 'text-white' : 'text-[#8b949e]'}`}>{stats.enRuta}</p>
                </div>
                <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#da3633]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#da3633]/10"></div>
                    <p className="text-xs text-[#da3633] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><Wrench className="h-4 w-4" /> En Mantenimiento</p>
                    <p className={`text-4xl font-rajdhani font-bold drop-shadow-md ${stats.enMantenimiento > 0 ? 'text-white' : 'text-[#8b949e]'}`}>{stats.enMantenimiento}</p>
                </div>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex gap-4 bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text" placeholder="Buscar placa, chofer..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#f0a500] transition-colors"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-[#0B0F19]/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#e6edf3]">
                        <thead className="bg-black/40 text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Placa / Vehículo</th>
                                <th className="px-6 py-4 font-semibold">Capacidad</th>
                                <th className="px-6 py-4 font-semibold">Chofer Asignado</th>
                                <th className="px-6 py-4 font-semibold text-center">SOAT</th>
                                <th className="px-6 py-4 font-semibold text-center">Rev. Técnica</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-[#8b949e]">No se encontró flota registrada.</td></tr>
                            ) : (
                                filteredList.map(f => {
                                    const soatVencido = isExpired(f.vencimiento_soat)
                                    const revVencida = isExpired(f.vencimiento_rev_tecnica)
                                    const soatWarn = isWarning(f.vencimiento_soat) && !soatVencido
                                    const revWarn = isWarning(f.vencimiento_rev_tecnica) && !revVencida

                                    return (
                                        <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="bg-[#30363d] text-white px-2.5 py-1 rounded text-sm font-bold tracking-widest border border-white/10 shadow-sm">{f.placa}</span>
                                                <div className="text-xs text-[#8b949e] mt-2">{f.marca} {f.modelo} ({f.anio})</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#e6edf3]">{f.capacidad_m3} <span className="text-[#8b949e] text-xs font-normal">m³</span></td>
                                            <td className="px-6 py-4">{f.chofer_asignado || <span className="text-[#8b949e] italic">Sin asig.</span>}</td>

                                            {/* SOAT DATE */}
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm ${soatVencido ? 'text-[#da3633] border-[#da3633]/30 bg-[#da3633]/10' :
                                                    soatWarn ? 'text-[#f0a500] border-[#f0a500]/30 bg-[#f0a500]/10' :
                                                        'text-[#8b949e] border-white/5 bg-black/20'
                                                    }`}>
                                                    {soatVencido ? <ShieldAlert className="h-3 w-3" /> : soatWarn ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3 text-[#238636]" />}
                                                    {soatVencido ? 'VENCIDO' : new Date(f.vencimiento_soat).toLocaleDateString('es-PE')}
                                                </div>
                                            </td>

                                            {/* REV DATE */}
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm ${revVencida ? 'text-[#da3633] border-[#da3633]/30 bg-[#da3633]/10' :
                                                    revWarn ? 'text-[#f0a500] border-[#f0a500]/30 bg-[#f0a500]/10' :
                                                        'text-[#8b949e] border-white/5 bg-black/20'
                                                    }`}>
                                                    {revVencida ? <ShieldAlert className="h-3 w-3" /> : revWarn ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3 text-[#238636]" />}
                                                    {revVencida ? 'VENCIDO' : new Date(f.vencimiento_rev_tecnica).toLocaleDateString('es-PE')}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border shadow-sm ${f.estado === 'disponible' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                    f.estado === 'en_ruta' ? 'bg-[#1f6feb]/10 text-[#1f6feb] border-[#1f6feb]/30' :
                                                        'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30'
                                                    }`}>
                                                    {f.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => {
                                                        const conf = confirm(`¿Enviar vehículo ${f.placa} a MANTENIMIENTO?`)
                                                        if (conf) {
                                                            supabase.from('saf_flota').update({ estado: 'mantenimiento' }).eq('id', f.id).then(() => { showToast('Vehículo en Mantenimiento', 'warning'); fetchData() })
                                                        }
                                                    }} className="p-2 text-[#8b949e] hover:text-[#f0a500] bg-black/20 hover:bg-[#f0a500]/10 border border-transparent hover:border-[#f0a500]/30 rounded-lg transition-all" title="Mandar a Mantenimiento"><Wrench className="h-4 w-4" /></button>

                                                    <button onClick={() => setModalDetalle({ isOpen: true, data: f })} className="p-2 text-[#8b949e] hover:text-[#1f6feb] bg-black/20 hover:bg-[#1f6feb]/10 border border-transparent hover:border-[#1f6feb]/30 rounded-lg transition-all" title="Ver Detalles"><BadgeInfo className="h-4 w-4" /></button>

                                                    <button onClick={() => handleOpenForm(f)} className="p-2 text-[#8b949e] hover:text-white bg-black/20 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-lg transition-all" title="Editar Vehículo"><PenTool className="h-4 w-4" /></button>
                                                    <button onClick={() => {
                                                        const conf = confirm(`¿Eliminar vehículo ${f.placa}?`)
                                                        if (conf) {
                                                            supabase.from('saf_flota').delete().eq('id', f.id).then(() => { showToast('Vehículo eliminado', 'success'); fetchData() })
                                                        }
                                                    }} className="p-2 text-[#8b949e] hover:text-[#da3633] bg-black/20 hover:bg-[#da3633]/10 border border-transparent hover:border-[#da3633]/30 rounded-lg transition-all" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
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

            {/* MODAL FORM */}
            <AnimatePresence>
                {modalForm.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-[#f0a500] flex items-center gap-2">
                                    <Truck className="h-5 w-5" /> {modalForm.data ? 'Editar Vehículo' : 'Registrar Vehículo'}
                                </h3>
                                <button onClick={() => setModalForm({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Placa *</label>
                                        <input type="text" value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })} placeholder="Ej: ABC-123" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] font-bold tracking-widest focus:border-[#f0a500] outline-none uppercase" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Capacidad Carga (m³) *</label>
                                        <input type="number" step="0.1" value={formData.capacidad_m3} onChange={(e) => setFormData({ ...formData, capacidad_m3: Number(e.target.value) })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Marca</label>
                                        <input type="text" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Modelo</label>
                                        <input type="text" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Año</label>
                                        <input type="number" value={formData.anio} onChange={(e) => setFormData({ ...formData, anio: Number(e.target.value) })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Chofer Asignado Frecuente</label>
                                    <input type="text" value={formData.chofer_asignado} onChange={(e) => setFormData({ ...formData, chofer_asignado: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#30363d]">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Vencimiento SOAT</label>
                                        <input type="date" value={formData.vencimiento_soat} onChange={(e) => setFormData({ ...formData, vencimiento_soat: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Venc. Rev. Técnica</label>
                                        <input type="date" value={formData.vencimiento_rev_tecnica} onChange={(e) => setFormData({ ...formData, vencimiento_rev_tecnica: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none [color-scheme:dark]" />
                                    </div>
                                </div>

                                {modalForm.data && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Estado del Vehículo</label>
                                        <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none">
                                            <option value="disponible">Disponible</option>
                                            <option value="en_ruta">En Ruta</option>
                                            <option value="mantenimiento">En Mantenimiento</option>
                                        </select>
                                    </div>
                                )}

                            </div>

                            <div className="flex gap-3 p-5 border-t border-[#30363d] bg-[#161b22]">
                                <button onClick={() => setModalForm({ isOpen: false, data: null })} className="flex-1 px-4 py-3 bg-[#21262d] text-[#e6edf3] font-medium rounded-lg hover:bg-[#30363d] transition-colors">Cancelar</button>
                                <button onClick={handleSave} className="flex-1 px-4 py-3 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg border-none transition-colors">
                                    {modalForm.data ? 'Guardar Cambios' : 'Registrar Vehículo'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DETALLE VEHICULO */}
            <AnimatePresence>
                {modalDetalle.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#0d1117]">
                                <h3 className="text-xl font-rajdhani font-bold text-[#1f6feb] flex items-center gap-2">
                                    <BadgeInfo className="h-5 w-5" /> Vehículo {modalDetalle.data.placa}
                                </h3>
                                <button onClick={() => setModalDetalle({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="p-6 space-y-5 bg-[#161b22]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#30363d]">
                                        <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Chofer Principal</p>
                                        <p className="text-base text-white font-medium mt-1">{modalDetalle.data.chofer_asignado || 'No Asignado'}</p>
                                    </div>
                                    <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#30363d]">
                                        <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Vehículo</p>
                                        <p className="text-base text-white font-medium mt-1 uppercase">{modalDetalle.data.marca} {modalDetalle.data.modelo} ({modalDetalle.data.anio})</p>
                                    </div>
                                    <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#30363d]">
                                        <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Capacidad</p>
                                        <p className="text-base text-[#f0a500] font-bold font-rajdhani mt-1">{modalDetalle.data.capacidad_m3} m³</p>
                                    </div>
                                    <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#30363d]">
                                        <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Estado</p>
                                        <p className="text-base text-white font-medium mt-1 capitalize">{modalDetalle.data.estado.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="bg-[#21262d] p-4 rounded-xl border border-[#30363d] space-y-4">
                                    <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-widest border-b border-[#30363d] pb-2">Estado de Documentación</h4>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#e6edf3]">Vencimiento SOAT</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${isExpired(modalDetalle.data.vencimiento_soat) ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30' : isWarning(modalDetalle.data.vencimiento_soat) ? 'bg-[#f0a500]/10 text-[#f0a500] border-[#f0a500]/30' : 'bg-[#238636]/10 text-[#238636] border-[#238636]/30'}`}>
                                            {isExpired(modalDetalle.data.vencimiento_soat) ? 'VENCIDO' : new Date(modalDetalle.data.vencimiento_soat).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#e6edf3]">Revisión Técnica</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${isExpired(modalDetalle.data.vencimiento_rev_tecnica) ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30' : isWarning(modalDetalle.data.vencimiento_rev_tecnica) ? 'bg-[#f0a500]/10 text-[#f0a500] border-[#f0a500]/30' : 'bg-[#238636]/10 text-[#238636] border-[#238636]/30'}`}>
                                            {isExpired(modalDetalle.data.vencimiento_rev_tecnica) ? 'VENCIDO' : new Date(modalDetalle.data.vencimiento_rev_tecnica).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
                                <button onClick={() => setModalDetalle({ isOpen: false, data: null })} className="px-6 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-bold rounded-lg transition-colors border border-[#30363d]">Cerrar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
