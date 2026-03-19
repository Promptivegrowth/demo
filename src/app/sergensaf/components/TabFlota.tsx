'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Plus, Search, CheckCircle, AlertTriangle, PenTool, X, ShieldAlert, BadgeInfo
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabFlota({ showToast }: { showToast: Function }) {
    const [flota, setFlota] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')

    // Modal
    const [modalForm, setModalForm] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

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
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Total Vehículos</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{stats.total}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.disponibles > 0 ? 'border-[#238636] bg-[#238636]/5' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#238636] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><CheckCircle className="h-3 w-3" /> Disponibles</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.disponibles > 0 ? 'text-[#238636]' : 'text-[#8b949e]'}`}>{stats.disponibles}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.enRuta > 0 ? 'border-[#1f6feb] bg-[#1f6feb]/5' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#1f6feb] uppercase font-bold tracking-wider mb-2">En Ruta</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.enRuta > 0 ? 'text-[#1f6feb]' : 'text-[#8b949e]'}`}>{stats.enRuta}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.enMantenimiento > 0 ? 'border-[#da3633] bg-[#da3633]/5' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#da3633] uppercase font-bold tracking-wider mb-2">En Mantenimiento</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.enMantenimiento > 0 ? 'text-[#da3633]' : 'text-[#8b949e]'}`}>{stats.enMantenimiento}</p>
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
            <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#e6edf3]">
                        <thead className="bg-[#21262d] text-[#8b949e] uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-medium">Placa / Vehículo</th>
                                <th className="px-4 py-3 font-medium">Capacidad</th>
                                <th className="px-4 py-3 font-medium">Chofer Asignado</th>
                                <th className="px-4 py-3 font-medium text-center">SOAT</th>
                                <th className="px-4 py-3 font-medium text-center">Rev. Técnica</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                                <th className="px-4 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
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
                                        <tr key={f.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <span className="bg-[#30363d] text-[#e6edf3] px-2 py-0.5 rounded text-sm font-bold tracking-widest">{f.placa}</span>
                                                <div className="text-xs text-[#8b949e] mt-1">{f.marca} {f.modelo} ({f.anio})</div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-[#e6edf3]">{f.capacidad_m3} <span className="text-[#8b949e] text-xs font-normal">m³</span></td>
                                            <td className="px-4 py-3">{f.chofer_asignado || <span className="text-[#8b949e] italic">Sin asig.</span>}</td>

                                            {/* SOAT DATE */}
                                            <td className="px-4 py-3 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${soatVencido ? 'text-[#da3633] border-[#da3633]/30 bg-[#da3633]/10' :
                                                        soatWarn ? 'text-[#f0a500] border-[#f0a500]/30 bg-[#f0a500]/10' :
                                                            'text-[#8b949e] border-transparent'
                                                    }`}>
                                                    {soatVencido ? <ShieldAlert className="h-3 w-3" /> : soatWarn ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3 text-[#238636]" />}
                                                    {new Date(f.vencimiento_soat).toLocaleDateString('es-PE')}
                                                </div>
                                            </td>

                                            {/* REV DATE */}
                                            <td className="px-4 py-3 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${revVencida ? 'text-[#da3633] border-[#da3633]/30 bg-[#da3633]/10' :
                                                        revWarn ? 'text-[#f0a500] border-[#f0a500]/30 bg-[#f0a500]/10' :
                                                            'text-[#8b949e] border-transparent'
                                                    }`}>
                                                    {revVencida ? <ShieldAlert className="h-3 w-3" /> : revWarn ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3 text-[#238636]" />}
                                                    {new Date(f.vencimiento_rev_tecnica).toLocaleDateString('es-PE')}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${f.estado === 'disponible' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                        f.estado === 'en_ruta' ? 'bg-[#1f6feb]/10 text-[#1f6feb] border-[#1f6feb]/30' :
                                                            'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30'
                                                    }`}>
                                                    {f.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleOpenForm(f)} className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d] hover:bg-[#30363d] rounded" title="Editar Vehículo"><PenTool className="h-4 w-4" /></button>
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

        </div>
    )
}
