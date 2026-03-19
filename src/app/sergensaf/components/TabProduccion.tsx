'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Factory, Plus, Search, Archive, AlertTriangle, CheckCircle, Database, X
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabProduccion({ showToast }: { showToast: Function }) {
    const [produccion, setProduccion] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')

    // Modal
    const [modalNuevo, setModalNuevo] = useState(false)

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
                                            <span className="bg-[#238636]/10 text-[#238636] border border-[#238636]/30 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center justify-center gap-1 w-max mx-auto">
                                                <CheckCircle className="h-3 w-3" /> Integrado
                                            </span>
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

        </div>
    )
}
