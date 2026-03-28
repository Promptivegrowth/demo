'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Plus, CheckCircle2, Clock, Search, FileText, AlertTriangle, Play, X, Navigation
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminInsert } from '../actions/db_actions'

export default function TabDespachos({ showToast }: { showToast: Function }) {
    const [despachos, setDespachos] = useState<any[]>([])
    const [ordenesPendientes, setOrdenesPendientes] = useState<any[]>([])
    const [flotaDisponible, setFlotaDisponible] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')

    // Modals
    const [modalNuevo, setModalNuevo] = useState(false)
    const [modalDetalle, setModalDetalle] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })
    const [modalGuia, setModalGuia] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // New Dispatch State
    const [nuevaOrdenId, setNuevaOrdenId] = useState('')
    const [nuevaFlotaId, setNuevaFlotaId] = useState('')
    const [conductor, setConductor] = useState('')
    const [volumen, setVolumen] = useState<number>(0)
    const [guia, setGuia] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [resDesp, resOrd, resFlota] = await Promise.all([
                supabase.from('saf_despachos').select('*, saf_ordenes(numero, saf_clientes(razon_social)), saf_flota(placa, capacidad_m3)').order('created_at', { ascending: false }),
                supabase.from('saf_ordenes').select('*, saf_clientes(razon_social)').in('estado', ['en_proceso', 'pendiente']).order('created_at', { ascending: false }),
                supabase.from('saf_flota').select('*').eq('estado', 'disponible')
            ])

            if (resDesp.error) throw resDesp.error
            setDespachos(resDesp.data || [])
            setOrdenesPendientes(resOrd.data || [])
            setFlotaDisponible(resFlota.data || [])
        } catch (err: any) {
            showToast('Error cargando despachos', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // Derived Values
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    const despachosHoy = despachos.filter(d => d.fecha_despacho.startsWith(todayStr))
    const enRutaHoy = despachosHoy.filter(d => d.estado === 'en_ruta').length
    const entregadosHoy = despachosHoy.filter(d => d.estado === 'entregado').length
    const volumenHoy = despachosHoy.reduce((sum, d) => sum + Number(d.volumen_m3), 0)

    const stats = {
        totalHoy: despachosHoy.length,
        enRuta: enRutaHoy,
        entregados: entregadosHoy,
        volumenHoy
    }

    const filteredList = despachos.filter(d => {
        const s = busqueda.toLowerCase()
        const matchBusqueda = (d.numero_guia || '').toLowerCase().includes(s) || (d.saf_ordenes?.saf_clientes?.razon_social || '').toLowerCase().includes(s)
        let matchEstado = filtroEstado === 'Todos' || d.estado === filtroEstado.toLowerCase().replace(' ', '_')
        return matchBusqueda && matchEstado
    })

    // Actions
    const handleMarcarEntregado = async (d: any) => {
        if (!confirm(`¿Marcar despacho ${d.numero_guia} como entregado?`)) return
        try {
            // 1. Marcar despacho
            await supabase.from('saf_despachos').update({ estado: 'entregado' }).eq('id', d.id)

            // 2. Liberar Vehiculo
            await supabase.from('saf_flota').update({ estado: 'disponible' }).eq('id', d.vehiculo_id)

            // 3. Revisar si la Orden ya se completo (simplificacion: marcamos la orden como despachado)
            await supabase.from('saf_ordenes').update({ estado: 'despachado' }).eq('id', d.orden_id)

            // 4. Descontar Stock 
            // Idealmente aqui leeríamos saf_orden_items y descontaríamos. 
            // Por brevedad del demo asumiremos que producción generó el stock, y aquí lo descontamos.
            const { data: items } = await supabase.from('saf_orden_items').select('*').eq('orden_id', d.orden_id)
            if (items) {
                for (const item of items) {
                    const { data: prod } = await supabase.from('saf_productos').select('stock_actual').eq('id', item.producto_id).single()
                    if (prod) {
                        const nuevoStock = Math.max(0, Number(prod.stock_actual) - Number(item.cantidad))
                        await supabase.from('saf_productos').update({ stock_actual: nuevoStock }).eq('id', item.producto_id)
                    }
                }
            }

            showToast(`Despacho marcado como entregado`, 'success')
            fetchData()
        } catch (err) { showToast('Error al actualizar despacho', 'error') }
    }


    const handleCreateDespacho = async () => {
        if (!nuevaOrdenId || !nuevaFlotaId || !conductor || !volumen || !guia) return showToast('Complete todos los campos obligatorios', 'warning')

        try {
            // Registrar Despacho usando adminInsert para bypass RLS y asegurar consistencia
            const payload = {
                orden_id: nuevaOrdenId,
                vehiculo_id: nuevaFlotaId,
                numero_guia: guia,
                fecha_despacho: new Date().toISOString(),
                conductor,
                volumen_m3: volumen,
                estado: 'en_ruta'
            }

            const res = await adminInsert('saf_despachos', payload)
            if (!res.success) throw new Error(res.error)

            // Marcar Vehiculo 'en_ruta'
            await supabase.from('saf_flota').update({ estado: 'en_ruta' }).eq('id', nuevaFlotaId)

            // Marcar orden 'en_proceso' si no lo estaba
            await supabase.from('saf_ordenes').update({ estado: 'en_proceso' }).eq('id', nuevaOrdenId)

            showToast(`Despacho ${guia} originado correctamente`, 'success')
            setModalNuevo(false)
            fetchData()
        } catch (err: any) {
            console.error(err)
            showToast(`Error al crear despacho: ${err.message}`, 'error')
        }
    }

    // Effect para auto-seleccionar conductor por defecto
    useEffect(() => {
        if (nuevaFlotaId) {
            const v = flotaDisponible.find(f => f.id === nuevaFlotaId)
            if (v) {
                setConductor(v.chofer_asignado || '')
                setVolumen(Number(v.capacidad_m3))
            }
        }
    }, [nuevaFlotaId])

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Despachos Lógisticos</h2>
                    <p className="text-sm text-[#8b949e]">Control de guías de remisión y envíos en ruta</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 overflow-x-auto no-scrollbar">
                        {['Todos', 'Pendiente', 'En Ruta', 'Entregado'].map(est => (
                            <button
                                key={est} onClick={() => setFiltroEstado(est)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtroEstado === est ? 'bg-[#f0a500] text-[#0d1117]' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                            >
                                {est}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => {
                        setNuevaOrdenId(''); setNuevaFlotaId(''); setConductor(''); setVolumen(0); setGuia(`GR-${Date.now().toString().slice(-6)}`);
                        setModalNuevo(true)
                    }} className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors whitespace-nowrap">
                        <Truck className="h-4 w-4" /> Nuevo Despacho
                    </button>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Despachos Hoy</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{stats.totalHoy}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Volumen Transportado Hoy</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#238636]">{stats.volumenHoy} <span className="text-lg text-[#8b949e]">m³</span></p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.enRuta > 0 ? 'border-[#1f6feb] bg-[#1f6feb]/5' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#1f6feb] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><Play className="h-3 w-3 fill-current" /> Vehículos en Ruta</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.enRuta > 0 ? 'text-[#1f6feb]' : 'text-[#e6edf3]'}`}>{stats.enRuta}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Entregas Completadas</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#238636]">{stats.entregados}</p>
                </div>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex gap-4 bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text" placeholder="Buscar por Guía o Cliente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
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
                                <th className="px-4 py-3 font-medium">Guía Remisión</th>
                                <th className="px-4 py-3 font-medium">Fecha/Hora Disp.</th>
                                <th className="px-4 py-3 font-medium">Orden Asoc.</th>
                                <th className="px-4 py-3 font-medium">Cliente</th>
                                <th className="px-4 py-3 font-medium text-center">Vehículo</th>
                                <th className="px-4 py-3 font-medium text-center">Conductor</th>
                                <th className="px-4 py-3 font-medium text-center">Volumen</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                                <th className="px-4 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                            {loading ? (
                                <tr><td colSpan={9} className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan={9} className="p-8 text-center text-[#8b949e]">No se encontraron despachos.</td></tr>
                            ) : (
                                filteredList.map(d => (
                                    <tr key={d.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                        <td className="px-4 py-3 font-rajdhani font-bold text-[#f0a500]">{d.numero_guia}</td>
                                        <td className="px-4 py-3 text-[#8b949e]">{new Date(d.fecha_despacho).toLocaleString('es-PE')}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{d.saf_ordenes?.numero}</td>
                                        <td className="px-4 py-3">{d.saf_ordenes?.saf_clientes?.razon_social}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="bg-[#30363d] text-[#e6edf3] px-2 py-0.5 rounded text-xs">{d.saf_flota?.placa}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">{d.conductor}</td>
                                        <td className="px-4 py-3 text-center font-bold text-[#e6edf3]">{d.volumen_m3} <span className="text-[#8b949e] font-normal text-xs">m³</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${d.estado === 'entregado' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                d.estado === 'en_ruta' ? 'bg-[#1f6feb]/10 text-[#1f6feb] border-[#1f6feb]/30 animate-pulse' :
                                                    'bg-[#f0a500]/10 text-[#f0a500] border-[#f0a500]/30'
                                                }`}>
                                                {d.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setModalGuia({ isOpen: true, data: d })}
                                                    className="p-1.5 text-[#f0a500] hover:text-[#0d1117] bg-[#f0a500]/10 hover:bg-[#f0a500] border border-[#f0a500]/30 rounded transition-all"
                                                    title="Ver Guía"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                {d.estado !== 'entregado' && (
                                                    <button onClick={() => handleMarcarEntregado(d)} className="p-2 text-[#8b949e] hover:text-[#238636] bg-black/20 hover:bg-[#238636]/10 border border-transparent hover:border-[#238636]/30 rounded-lg transition-all" title="Marcar como Entregado"><CheckCircle2 className="h-4 w-4" /></button>
                                                )}
                                                <button onClick={() => setModalDetalle({ isOpen: true, data: d })} className="p-2 text-[#8b949e] hover:text-[#1f6feb] bg-black/20 hover:bg-[#1f6feb]/10 border border-transparent hover:border-[#1f6feb]/30 rounded-lg transition-all" title="Live Tracking">
                                                    <Navigation className="h-4 w-4" />
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

            {/* MODAL NUEVO DESPACHO */}
            <AnimatePresence>
                {modalNuevo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-[#f0a500] flex items-center gap-2">
                                    <Truck className="h-5 w-5" /> Originar Despacho
                                </h3>
                                <button onClick={() => setModalNuevo(false)} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Orden de Venta *</label>
                                    <select value={nuevaOrdenId} onChange={(e) => setNuevaOrdenId(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none">
                                        <option value="">Seleccione orden pendiente/en proceso...</option>
                                        {ordenesPendientes.map(op => <option key={op.id} value={op.id}>{op.numero} - {op.saf_clientes?.razon_social} (S/ {op.total})</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Vehículo *</label>
                                        <select value={nuevaFlotaId} onChange={(e) => setNuevaFlotaId(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none">
                                            <option value="">Seleccione vehículo...</option>
                                            {flotaDisponible.map(f => <option key={f.id} value={f.id}>{f.placa} ({f.capacidad_m3}m³)</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Volumen Carga (m³) *</label>
                                        <input type="number" step="0.1" value={volumen} onChange={(e) => setVolumen(Number(e.target.value))} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Conductor *</label>
                                        <input type="text" value={conductor} onChange={(e) => setConductor(e.target.value)} placeholder="Nombre del chofer" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">N° Guía Remisión *</label>
                                        <input type="text" value={guia} onChange={(e) => setGuia(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#f0a500] font-bold outline-none" />
                                    </div>
                                </div>

                                <div className="p-3 bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-lg text-xs text-[#8b949e] flex gap-2 mt-4">
                                    <AlertTriangle className="h-4 w-4 text-[#1f6feb] flex-shrink-0" />
                                    <p>Al generar el despacho, el vehículo pasará a estado "En Ruta". El stock se descontará cuando el despacho se marque como "Entregado" para asegurar la consistencia del inventario real en planta.</p>
                                </div>

                            </div>

                            <div className="flex gap-3 p-5 border-t border-[#30363d] bg-[#161b22]">
                                <button onClick={() => setModalNuevo(false)} className="flex-1 px-4 py-3 bg-[#21262d] text-[#e6edf3] font-medium rounded-lg hover:bg-[#30363d] transition-colors">Cancelar</button>
                                <button onClick={handleCreateDespacho} className="flex-1 px-4 py-3 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg border-none transition-colors">
                                    Emitir Guía y Despachar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DETALLES & LIVE TRACKING */}
            <AnimatePresence>
                {modalDetalle.isOpen && modalDetalle.data && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0b0f19] border border-[#30363d] rounded-2xl shadow-[0_0_50px_rgba(31,111,235,0.1)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-black/40 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-white flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-[#1f6feb]" /> GPS Tracking / Despacho <span className="text-[#f0a500] ml-2">{modalDetalle.data.numero_guia}</span>
                                </h3>
                                <button onClick={() => setModalDetalle({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white p-2 bg-black/20 rounded-lg"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                                {/* SIDE PANEL */}
                                <div className="w-full md:w-1/3 bg-[#161b22] border-r border-[#30363d] p-6 space-y-6 overflow-y-auto">

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#8b949e] tracking-widest uppercase font-bold">Cliente Destino</p>
                                        <p className="font-medium text-white text-lg leading-tight">{modalDetalle.data.saf_ordenes?.saf_clientes?.razon_social || 'No Registrado'}</p>
                                        <p className="text-xs text-[#8b949e] flex items-center gap-1 mt-1"><FileText className="w-3 h-3" /> Orden: {modalDetalle.data.saf_ordenes?.numero}</p>
                                    </div>

                                    <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-3">
                                        <div className="flex justify-between items-center border-b border-[#30363d] pb-2">
                                            <span className="text-xs text-[#8b949e] font-bold uppercase tracking-wider">Volumen</span>
                                            <span className="text-sm text-[#f0a500] font-black">{modalDetalle.data.volumen_m3} m³</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-[#30363d] pb-2">
                                            <span className="text-xs text-[#8b949e] font-bold uppercase tracking-wider">Unidad</span>
                                            <span className="text-sm text-white font-medium">{modalDetalle.data.saf_flota?.placa}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#8b949e] font-bold uppercase tracking-wider">Conductor</span>
                                            <span className="text-sm text-white font-medium">{modalDetalle.data.conductor}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <p className="text-xs text-[#8b949e] tracking-widest uppercase font-bold">Línea de Vida</p>

                                        <div className="relative pl-6 space-y-6 border-l border-[#30363d] ml-3">
                                            <div className="relative">
                                                <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-[#f0a500] shadow-[0_0_10px_#f0a500]"></div>
                                                <p className="text-xs text-[#8b949e]">{new Date(new Date(modalDetalle.data.fecha_despacho).getTime() - 3600000).toLocaleTimeString('es-PE')}</p>
                                                <p className="text-sm font-bold text-white uppercase mt-0.5">Carga en Planta</p>
                                            </div>
                                            <div className={`relative ${modalDetalle.data.estado !== 'preparando' ? 'opacity-100' : 'opacity-30'}`}>
                                                <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full ${modalDetalle.data.estado !== 'preparando' ? 'bg-[#1f6feb] shadow-[0_0_10px_#1f6feb]' : 'bg-[#30363d]'}`}></div>
                                                <p className="text-xs text-[#8b949e]">{new Date(modalDetalle.data.fecha_despacho).toLocaleTimeString('es-PE')}</p>
                                                <p className="text-sm font-bold text-white uppercase mt-0.5">En Ruta (Despachado)</p>
                                            </div>
                                            <div className={`relative ${modalDetalle.data.estado === 'entregado' ? 'opacity-100' : 'opacity-30'}`}>
                                                <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full ${modalDetalle.data.estado === 'entregado' ? 'bg-[#238636] shadow-[0_0_10px_#238636]' : 'bg-[#30363d]'}`}></div>
                                                <p className="text-xs text-[#8b949e]">--:--</p>
                                                <p className="text-sm font-bold text-[#238636] uppercase mt-0.5">Entregado</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* MAP PANEL */}
                                <div className="hidden md:flex flex-1 relative bg-[#010409] items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://maps.gstatic.com/tactile/omni/satellite_1.png')] bg-cover opacity-20 filter grayscale blur-[1px]"></div>

                                    {/* Grid Overlay for Technical Feel */}
                                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#1f6feb1a 1px, transparent 1px), linear-gradient(90deg, #1f6feb1a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                                    {/* Scanning Radar Effect */}
                                    <div className="absolute inset-0 rounded-full border border-[#1f6feb]/20 shadow-[0_0_50px_#1f6feb10_inset] animate-ping" style={{ animationDuration: '4s' }}></div>

                                    {/* Route SVG */}
                                    <svg className="absolute w-[80%] h-[80%] z-10" viewBox="0 0 400 300" preserveAspectRatio="none">
                                        <path d="M 50,250 Q 150,250 200,150 T 350,50" fill="none" stroke="#30363d" strokeWidth="4" strokeDasharray="8 8" />
                                        <path d="M 50,250 Q 150,250 200,150 T 350,50" fill="none" stroke={modalDetalle.data.estado === 'entregado' ? '#238636' : '#1f6feb'} strokeWidth="4" strokeDasharray="400" strokeDashoffset={modalDetalle.data.estado === 'preparando' ? '400' : (modalDetalle.data.estado === 'en_ruta' ? '200' : '0')} className="transition-all duration-[3s] ease-in-out" />

                                        {/* Origin (Planta) */}
                                        <circle cx="50" cy="250" r="8" fill="#f0a500" className="animate-pulse" />
                                        <text x="50" y="275" fill="#e6edf3" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-rajdhani drop-shadow">PLANTA</text>

                                        {/* Destination (Cliente) */}
                                        <circle cx="350" cy="50" r="8" fill={modalDetalle.data.estado === 'entregado' ? '#238636' : '#30363d'} />
                                        <text x="350" y="30" fill="#e6edf3" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-rajdhani drop-shadow">PUNTO ENTREGA</text>

                                        {/* Truck Token - Animated based on status */}
                                        {modalDetalle.data.estado === 'en_ruta' && (
                                            <g transform="translate(190, 140)">
                                                <circle cx="10" cy="10" r="20" fill="#1f6feb" opacity="0.2" className="animate-ping" />
                                                <circle cx="10" cy="10" r="10" fill="#1f6feb" />
                                                <text x="10" y="30" fill="#1f6feb" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-rajdhani">EN RUTA</text>
                                            </g>
                                        )}
                                    </svg>

                                    {/* Status Overlay Float */}
                                    <div className="absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Estado de Conexión</span>
                                            <span className="text-xs text-white">GPS Satelital Activo</span>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse"></span>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL GUIA DE REMISION (MOCK) */}
            <AnimatePresence>
                {modalGuia.isOpen && modalGuia.data && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white text-black w-full max-w-3xl rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                            {/* Toolbar */}
                            <div className="bg-[#f0a500] p-4 flex justify-between items-center text-[#0d1117] print:hidden">
                                <h4 className="font-rajdhani font-black uppercase flex items-center gap-2 italic"><FileText className="w-5 h-5" /> Vista Previa: Guía de Remisión Electrónica</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => window.print()} className="px-3 py-1 bg-black/10 hover:bg-black/20 rounded font-bold text-xs uppercase">Imprimir / PDF</button>
                                    <button onClick={() => setModalGuia({ isOpen: false, data: null })} className="p-1 hover:bg-black/10 rounded"><X className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Guía Content */}
                            <div className="flex-1 overflow-y-auto p-12 space-y-8 font-sans">
                                <div className="flex justify-between items-start border-b-2 border-black pb-6">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-black tracking-tighter text-[#0d1117]">SERGENSAF S.A.C.</h1>
                                        <p className="text-[10px] w-64 leading-tight font-medium">Servicios Generales de Saneamiento y Fletes. Abastecimiento de Materiales y Agregados para Construcción.</p>
                                        <p className="text-[10px] italic">Av. Minerales 123, Callao, Lima - Perú</p>
                                    </div>
                                    <div className="border-2 border-black p-4 text-center min-w-[250px]">
                                        <p className="font-bold text-sm tracking-widest">R.U.C. 20601234567</p>
                                        <div className="bg-[#f0a500] text-black font-black py-1 my-2 text-lg">GUÍA DE REMISIÓN</div>
                                        <p className="font-bold text-xl">{modalGuia.data.numero_guia}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 text-[11px]">
                                    <div className="space-y-2">
                                        <p className="font-black uppercase border-b border-black pb-1">Punto de Partida</p>
                                        <p>Planta Chancadora SERGENSAF - Cantera Chilca</p>
                                        <p className="font-black uppercase border-b border-black pb-1 mt-4">Remitente (Cliente)</p>
                                        <p className="font-bold text-sm">{modalGuia.data.saf_ordenes?.saf_clientes?.razon_social || 'CONSTRUCTORA XYZ S.A.'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-black uppercase border-b border-black pb-1">Punto de Llegada</p>
                                        <p className="font-bold">{modalGuia.data.saf_ordenes?.saf_clientes?.direccion || 'Av. Los Próceres 456, Surco'}</p>
                                        <p className="font-black uppercase border-b border-black pb-1 mt-4">Transporte</p>
                                        <p><span className="font-bold">Unidad:</span> {modalGuia.data.saf_flota?.placa}</p>
                                        <p><span className="font-bold">Conductor:</span> {modalGuia.data.conductor}</p>
                                    </div>
                                </div>

                                <table className="w-full border-collapse text-[10px]">
                                    <thead>
                                        <tr className="bg-black text-white">
                                            <th className="border border-black p-2 text-left">COD</th>
                                            <th className="border border-black p-2 text-left">DESCRIPCIÓN DEL MATERIAL</th>
                                            <th className="border border-black p-2 text-center">CANTIDAD</th>
                                            <th className="border border-black p-2 text-center">UM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-3 align-top">001</td>
                                            <td className="border border-black p-3">
                                                <p className="font-bold">Agregado de Construcción (Seleccionado)</p>
                                                <p className="italic text-[9px] text-gray-600 mt-1">Material apto para bases y sub-bases viales. Control de calidad aprobado.</p>
                                            </td>
                                            <td className="border border-black p-3 text-center font-bold text-base">{modalGuia.data.volumen_m3}</td>
                                            <td className="border border-black p-3 text-center">M3</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="pt-20 flex justify-between gap-12">
                                    <div className="flex-1 border-t border-black text-center pt-2">
                                        <p className="text-[9px] uppercase font-bold">Firma Remitente</p>
                                    </div>
                                    <div className="flex-1 border-t border-black text-center pt-2">
                                        <p className="text-[9px] uppercase font-bold">Firma Transportista</p>
                                    </div>
                                    <div className="flex-1 border-t border-black text-center pt-2">
                                        <p className="text-[9px] uppercase font-bold">Sello y Firma Cliente</p>
                                    </div>
                                </div>

                                <div className="text-[8px] text-gray-500 pt-10 text-center uppercase tracking-widest">
                                    Representación impresa de Guía de Remisión Electrónica generada por Sistema ERP SERGENSAF v4.0
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
