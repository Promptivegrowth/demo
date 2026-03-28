'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Factory, Plus, Search, Archive, AlertTriangle, CheckCircle, Database, X, Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TabProduccion({ showToast }: { showToast: Function }) {
    const [produccion, setProduccion] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')

    // Modal
    const [modalNuevo, setModalNuevo] = useState(false)
    const [modalDetalle, setModalDetalle] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // Nuevo Registro State
    const [nuevoProdId, setNuevoProdId] = useState('')
    const [turno, setTurno] = useState('mañana')
    const [cantidadProducida, setCantidadProducida] = useState<number>(0)
    const [costoEstimado, setCostoEstimado] = useState<number>(0)
    const [obs, setObs] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [resProd, resProds] = await Promise.all([
                supabase.from('saf_produccion').select('*, saf_productos(nombre, unidad)').order('created_at', { ascending: false }),
                supabase.from('saf_productos').select('*').eq('activo', true).order('nombre')
            ])

            if (resProd.error) throw resProd.error
            setProduccion(resProd.data || [])
            setProductos(resProds.data || [])
        } catch (err: any) {
            showToast('Error cargando producción', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // Derived Values
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    const prodHoy = produccion.filter(p => p.fecha.startsWith(todayStr))
    const totalM3Hoy = prodHoy.reduce((sum, p) => sum + Number(p.cantidad_producida), 0)
    const costoHoy = prodHoy.reduce((sum, p) => sum + Number(p.costo_lote_estimado), 0)

    const stats = {
        registrosHoy: prodHoy.length,
        totalM3: totalM3Hoy,
        costoM3Promedio: totalM3Hoy > 0 ? (costoHoy / totalM3Hoy).toFixed(2) : 0
    }

    const filteredList = produccion.filter(p => {
        const s = busqueda.toLowerCase()
        return (p.saf_productos?.nombre || '').toLowerCase().includes(s) || (p.lote || '').toLowerCase().includes(s)
    })

    // Actions
    const handleRegistrarProduccion = async () => {
        if (!nuevoProdId || cantidadProducida <= 0) return showToast('Seleccione un producto y cantidad válida', 'warning')

        const prodRef = productos.find(x => x.id === nuevoProdId)
        if (!prodRef) return

        const loteNro = `LOTE-${Date.now().toString().slice(-6)}`

        try {
            // 1. Insert Production Log
            const { error: errP } = await supabase.from('saf_produccion').insert({
                producto_id: nuevoProdId, lote: loteNro, fecha: new Date().toISOString(), turno: turno,
                cantidad_producida: cantidadProducida, costo_lote_estimado: costoEstimado, observaciones: obs
            })
            if (errP) throw errP

            // 2. Update Product Stock Sum
            const nuevoStock = Number(prodRef.stock_actual) + Number(cantidadProducida)
            await supabase.from('saf_productos').update({ stock_actual: nuevoStock }).eq('id', nuevoProdId)

            showToast(`Producción registrada. Stock actualizado.`, 'success')
            setModalNuevo(false)
            fetchData()
        } catch (err) { showToast('Error al registrar producción', 'error') }
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Producción en Planta</h2>
                    <p className="text-sm text-[#8b949e]">Registro de lotes procesados e incremento de stock</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => {
                        setNuevoProdId(''); setCantidadProducida(0); setCostoEstimado(0); setObs(''); setTurno('mañana');
                        setModalNuevo(true)
                    }} className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors whitespace-nowrap">
                        <Factory className="h-4 w-4" /> Registrar Lote
                    </button>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Lotes Procesados Hoy</p>
                    <div className="flex items-center gap-3">
                        <Factory className="h-6 w-6 text-[#f0a500]" />
                        <p className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{stats.registrosHoy}</p>
                    </div>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Volumen Producido Hoy</p>
                    <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-[#1f6feb]" />
                        <p className="text-3xl font-rajdhani font-bold text-[#1f6feb]">{stats.totalM3} <span className="text-lg text-[#8b949e]">m³</span></p>
                    </div>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-2">Costo Promedio Estimado (m³)</p>
                    <div className="flex items-center gap-3">
                        <Archive className="h-6 w-6 text-[#238636]" />
                        <p className="text-3xl font-rajdhani font-bold text-[#238636]">S/ {stats.costoM3Promedio}</p>
                    </div>
                </div>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex gap-4 bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text" placeholder="Buscar por Lote o Producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
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
                                <th className="px-4 py-3 font-medium">Lote Producción</th>
                                <th className="px-4 py-3 font-medium">Fecha/Hora</th>
                                <th className="px-4 py-3 font-medium text-center">Turno</th>
                                <th className="px-4 py-3 font-medium">Material</th>
                                <th className="px-4 py-3 font-medium text-right">Volumen (m³)</th>
                                <th className="px-4 py-3 font-medium text-right">Costo Est. S/</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-[#8b949e]">No se registran lotes en este periodo.</td></tr>
                            ) : (
                                filteredList.map(p => (
                                    <tr key={p.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                        <td className="px-4 py-3 font-rajdhani font-bold text-[#f0a500]">{p.lote}</td>
                                        <td className="px-4 py-3 text-[#8b949e]">{new Date(p.fecha).toLocaleString('es-PE')}</td>
                                        <td className="px-4 py-3 text-center capitalize">{p.turno}</td>
                                        <td className="px-4 py-3 font-bold text-[#e6edf3]">{p.saf_productos?.nombre}</td>
                                        <td className="px-4 py-3 text-right font-bold text-[#238636]">+{p.cantidad_producida} {p.saf_productos?.unidad}</td>
                                        <td className="px-4 py-3 text-right">{Number(p.costo_lote_estimado).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => setModalDetalle({ isOpen: true, data: p })} className="bg-[#1f6feb]/10 hover:bg-[#1f6feb]/20 text-[#1f6feb] border border-[#1f6feb]/30 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 w-max mx-auto shadow-[0_0_10px_#1f6feb20_inset] transition-all">
                                                <Activity className="h-3 w-3 animate-pulse" /> Ver Proceso
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL NUEVA PRODUCCION */}
            <AnimatePresence>
                {modalNuevo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-[#f0a500] flex items-center gap-2">
                                    <Factory className="h-5 w-5" /> Registrar Lote
                                </h3>
                                <button onClick={() => setModalNuevo(false)} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Producto Generado *</label>
                                    <select value={nuevoProdId} onChange={(e) => setNuevoProdId(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none">
                                        <option value="">Seleccione agregado...</option>
                                        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Volumen Obtenido (m³) *</label>
                                        <input type="number" step="0.1" value={cantidadProducida} onChange={(e) => setCantidadProducida(Number(e.target.value))} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Turno</label>
                                        <select value={turno} onChange={(e) => setTurno(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none">
                                            <option value="mañana">Mañana</option>
                                            <option value="tarde">Tarde</option>
                                            <option value="noche">Noche</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Costo Estimado Lote (Opcional, S/)</label>
                                    <input type="number" step="0.1" value={costoEstimado} onChange={(e) => setCostoEstimado(Number(e.target.value))} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Observaciones</label>
                                    <textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" placeholder="Calidad, procedencia mineral, etc." />
                                </div>

                                <div className="p-3 bg-[#f0a500]/10 border border-[#f0a500]/30 rounded-lg text-xs text-[#8b949e] flex gap-2 mt-4">
                                    <AlertTriangle className="h-4 w-4 text-[#f0a500] flex-shrink-0" />
                                    <p>Al registrar el lote, el stock del agregado se incrementará automáticamente y estará disponible de inmediato en Inventario y para Ventas.</p>
                                </div>

                            </div>

                            <div className="flex gap-3 p-5 border-t border-[#30363d] bg-[#161b22]">
                                <button onClick={() => setModalNuevo(false)} className="flex-1 px-4 py-3 bg-[#21262d] text-[#e6edf3] font-medium rounded-lg hover:bg-[#30363d] transition-colors">Cancelar</button>
                                <button disabled={!nuevoProdId || cantidadProducida <= 0} onClick={handleRegistrarProduccion} className="flex-1 px-4 py-3 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#30363d] disabled:cursor-not-allowed text-white font-bold rounded-lg border-none transition-colors">
                                    Sumar Stock
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DETALLES PROCESO PRODUCCION */}
            <AnimatePresence>
                {modalDetalle.isOpen && modalDetalle.data && (() => {
                    const elapsedHours = (new Date().getTime() - new Date(modalDetalle.data.fecha).getTime()) / (1000 * 60 * 60)

                    // Mock progress based on created_at difference
                    let progress = 100; let step = 4;
                    if (elapsedHours < 2) { progress = 25; step = 1; }
                    else if (elapsedHours < 5) { progress = 50; step = 2; }
                    else if (elapsedHours < 12) { progress = 75; step = 3; }

                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0b0f19] border border-[#30363d] rounded-3xl shadow-[0_0_80px_rgba(240,165,0,0.15)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="flex justify-between items-center p-6 border-b border-[#30363d] bg-gradient-to-r from-black/80 to-[#161b22] z-10">
                                    <div>
                                        <h3 className="text-2xl font-rajdhani font-black text-white flex items-center gap-3">
                                            <div className="p-2 bg-[#f0a500]/10 rounded-xl border border-[#f0a500]/30"><Factory className="h-6 w-6 text-[#f0a500]" /></div> Seguimiento de Lote
                                        </h3>
                                        <p className="text-sm font-bold text-[#f0a500] mt-1 ml-12">{modalDetalle.data.lote}</p>
                                    </div>
                                    <button onClick={() => setModalDetalle({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white p-2 bg-white/5 rounded-xl border border-white/5"><X className="h-5 w-5" /></button>
                                </div>

                                <div className="p-8 space-y-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light bg-[#0b0f19]">

                                    {/* Info Cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#161b22]/90 backdrop-blur-sm p-4 rounded-2xl border border-[#30363d] shadow-inner">
                                            <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Material</p>
                                            <p className="text-base text-white font-bold mt-1 line-clamp-1">{modalDetalle.data.saf_productos?.nombre}</p>
                                        </div>
                                        <div className="bg-[#161b22]/90 backdrop-blur-sm p-4 rounded-2xl border border-[#30363d] shadow-inner">
                                            <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Volumen Neto</p>
                                            <p className="text-xl text-[#238636] font-rajdhani font-bold mt-1">{modalDetalle.data.cantidad_producida} {modalDetalle.data.saf_productos?.unidad}</p>
                                        </div>
                                        <div className="bg-[#161b22]/90 backdrop-blur-sm p-4 rounded-2xl border border-[#30363d] shadow-inner">
                                            <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Turno</p>
                                            <p className="text-base text-white font-bold mt-1 capitalize">{modalDetalle.data.turno}</p>
                                        </div>
                                    </div>

                                    {/* Progress Visual */}
                                    <div className="space-y-6 bg-black/40 p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-end">
                                            <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-widest">Estado del Proceso</h4>
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-[#f0a500]/10 text-[#f0a500] border border-[#f0a500]/30">{progress}% Completado</span>
                                        </div>

                                        <div className="relative h-4 bg-[#161b22] rounded-full border border-[#30363d] overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e06c00] via-[#f0a500] to-[#ffcc5c] relative overflow-hidden">
                                                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                                            </motion.div>
                                        </div>

                                        <div className="flex justify-between relative mt-4">
                                            {/* Step 1 */}
                                            <div className="flex flex-col items-center w-1/4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 1 ? 'bg-[#f0a500] text-black shadow-[0_0_15px_#f0a500]' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'}`}>
                                                    {step > 1 ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">1</span>}
                                                </div>
                                                <p className={`text-[10px] font-bold uppercase mt-2 text-center ${step >= 1 ? 'text-white' : 'text-[#8b949e]'}`}>Extracción</p>
                                            </div>
                                            {/* Step 2 */}
                                            <div className="flex flex-col items-center w-1/4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 2 ? 'bg-[#f0a500] text-black shadow-[0_0_15px_#f0a500]' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'}`}>
                                                    {step > 2 ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">2</span>}
                                                </div>
                                                <p className={`text-[10px] font-bold uppercase mt-2 text-center ${step >= 2 ? 'text-white' : 'text-[#8b949e]'}`}>Zarandeo</p>
                                            </div>
                                            {/* Step 3 */}
                                            <div className="flex flex-col items-center w-1/4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 3 ? 'bg-[#f0a500] text-black shadow-[0_0_15px_#f0a500]' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'}`}>
                                                    {step > 3 ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">3</span>}
                                                </div>
                                                <p className={`text-[10px] font-bold uppercase mt-2 text-center ${step >= 3 ? 'text-white' : 'text-[#8b949e]'}`}>Lavado</p>
                                            </div>
                                            {/* Step 4 */}
                                            <div className="flex flex-col items-center w-1/4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 4 ? 'bg-[#238636] text-white shadow-[0_0_15px_#238636]' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'}`}>
                                                    {step >= 4 ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">4</span>}
                                                </div>
                                                <p className={`text-[10px] font-bold uppercase mt-2 text-center ${step >= 4 ? 'text-white' : 'text-[#8b949e]'}`}>Almacenaje (Integrado)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                    )
                })()}
            </AnimatePresence>

        </div>
    )
}
