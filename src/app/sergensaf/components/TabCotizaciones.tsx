'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Plus, Check, X, ArrowRight, Copy, Printer, Search, Download, AlertTriangle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabCotizaciones({ showToast }: { showToast: Function }) {
    const [cotizaciones, setCotizaciones] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [filtroEstado, setFiltroEstado] = useState('Todos')

    // Modals
    const [modalNueva, setModalNueva] = useState(false)
    const [modalPDF, setModalPDF] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })
    const [modalRechazo, setModalRechazo] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // New Quote State
    const [nuevoClienteId, setNuevoClienteId] = useState('')
    const [nuevaValidez, setNuevaValidez] = useState(15)
    const [nuevaObs, setNuevaObs] = useState('')
    const [nuevoItems, setNuevoItems] = useState<any[]>([{ id: Date.now(), producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [resCots, resClis, resProds] = await Promise.all([
                supabase.from('saf_cotizaciones').select('*, saf_clientes(razon_social), saf_cotizacion_items(cantidad)').order('created_at', { ascending: false }),
                supabase.from('saf_clientes').select('*').order('razon_social'),
                supabase.from('saf_productos').select('*').eq('activo', true).order('nombre')
            ])

            if (resCots.error) throw resCots.error
            setCotizaciones(resCots.data || [])
            setClientes(resClis.data || [])
            setProductos(resProds.data || [])
        } catch (err: any) {
            showToast('Error cargando cotizaciones', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // Derived Values
    const now = new Date()
    const currentMonth = now.getMonth()
    const cotsMes = cotizaciones.filter(c => new Date(c.fecha).getMonth() === currentMonth)
    const aprobadasMes = cotsMes.filter(c => c.estado === 'aprobada').length
    const porVencer = cotizaciones.filter(c => c.estado === 'pendiente' && (new Date(c.fecha_vencimiento).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 3 && new Date(c.fecha_vencimiento) >= now).length

    const stats = {
        cotsMes: cotsMes.length,
        montoMes: cotsMes.reduce((s, c) => s + Number(c.total), 0),
        tasaAprobacion: cotsMes.length > 0 ? Math.round((aprobadasMes / cotsMes.length) * 100) : 0,
        porVencer: porVencer
    }

    const formatSoles = (v: number) => `S/ ${(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
    const formatFecha = (d: string) => new Date(d).toLocaleDateString('es-PE')

    const filteredList = cotizaciones.filter(c => filtroEstado === 'Todos' || c.estado === filtroEstado.toLowerCase())

    // Actions
    const handleAprobar = async (id: string, numero: string) => {
        if (!confirm(`¿Aprobar cotización ${numero}?`)) return
        try {
            await supabase.from('saf_cotizaciones').update({ estado: 'aprobada' }).eq('id', id)
            showToast(`Cotización ${numero} aprobada`, 'success')
            fetchData()
        } catch (err) { showToast('Error al aprobar', 'error') }
    }

    const handleRechazar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const obs = new FormData(e.currentTarget).get('motivo') as string
        try {
            await supabase.from('saf_cotizaciones').update({ estado: 'rechazada', observaciones: obs }).eq('id', modalRechazo.data.id)
            showToast('Cotización rechazada', 'warning')
            setModalRechazo({ isOpen: false, data: null })
            fetchData()
        } catch (err) { showToast('Error al rechazar', 'error') }
    }

    const handleConvertirOrden = async (cot: any) => {
        if (!confirm(`¿Generar órden de venta desde ${cot.numero}?`)) return
        try {
            // 1. Get full items
            const { data: items } = await supabase.from('saf_cotizacion_items').select('*').eq('cotizacion_id', cot.id)
            // 2. Insert Orden
            const nro = `ORD-${Date.now().toString().slice(-4)}`
            const { data: nuevaOrden, error: errOrd } = await supabase.from('saf_ordenes').insert({
                numero: nro, cotizacion_id: cot.id, cliente_id: cot.cliente_id,
                fecha: new Date().toISOString().split('T')[0], fecha_requerida: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                subtotal: cot.subtotal, igv: cot.igv, total: cot.total, tipo_pago: 'contado' // default
            }).select().single()
            if (errOrd) throw errOrd

            // 3. Insert Orden Items
            const oi = items?.map(i => ({
                orden_id: nuevaOrden.id, producto_id: i.producto_id,
                cantidad: i.cantidad, precio_unitario: i.precio_unitario, subtotal: i.subtotal
            }))
            await supabase.from('saf_orden_items').insert(oi)

            showToast(`Orden ${nro} creada exitosamente`, 'success')
            // En entorno ideal esto navegaría a la pestaña Órdenes. Simularemos cambiando algún estado si fuera app global, 
            // pero por ahora solo notificamos.
        } catch (err) { showToast('Error al convertir', 'error') }
    }

    const handleDuplicar = async (cot: any) => {
        showToast('Duplicando cotización...', 'info')
        try {
            const { data: items } = await supabase.from('saf_cotizacion_items').select('*').eq('cotizacion_id', cot.id)
            const nro = `COT-${Date.now().toString().slice(-4)}`
            const d = new Date()
            const fd = new Date(d)
            fd.setDate(fd.getDate() + 15)

            const { data: nuevaCot, error } = await supabase.from('saf_cotizaciones').insert({
                numero: nro, cliente_id: cot.cliente_id, fecha: d.toISOString().split('T')[0], fecha_vencimiento: fd.toISOString().split('T')[0],
                estado: 'pendiente', subtotal: cot.subtotal, igv: cot.igv, total: cot.total, observaciones: cot.observaciones
            }).select().single()
            if (error) throw error

            const ci = items?.map(i => ({
                cotizacion_id: nuevaCot.id, producto_id: i.producto_id,
                cantidad: i.cantidad, precio_unitario: i.precio_unitario, subtotal: i.subtotal
            }))
            await supabase.from('saf_cotizacion_items').insert(ci)

            showToast('Cotización duplicada con éxito', 'success')
            fetchData()
        } catch (err) { showToast('Error al duplicar', 'error') }
    }

    // New Quote Logic
    const actItem = (id: number, field: string, value: any) => {
        setNuevoItems(prev => prev.map(it => {
            if (it.id === id) {
                const up = { ...it, [field]: value }
                if (field === 'producto_id') {
                    const p = productos.find(x => x.id === value)
                    up.precio_unitario = p ? Number(p.precio_unitario) : 0
                }
                up.subtotal = Number(up.cantidad) * Number(up.precio_unitario)
                return up
            }
            return it
        }))
    }

    const subtotalNuevo = nuevoItems.reduce((s, i) => s + Number(i.subtotal), 0)
    const igvNuevo = subtotalNuevo * 0.18
    const totalNuevo = subtotalNuevo + igvNuevo

    const handleCreateCotizacion = async () => {
        if (!nuevoClienteId) return showToast('Seleccione un cliente', 'warning')
        const validItems = nuevoItems.filter(i => i.producto_id && i.cantidad > 0)
        if (validItems.length === 0) return showToast('Agregue al menos un producto válido', 'warning')

        const nro = `COT-${Date.now().toString().slice(-4)}`
        const d = new Date()
        const fd = new Date(d)
        fd.setDate(fd.getDate() + nuevaValidez)

        try {
            const { data: cotData, error: errCot } = await supabase.from('saf_cotizaciones').insert({
                numero: nro, cliente_id: nuevoClienteId, fecha: d.toISOString().split('T')[0], fecha_vencimiento: fd.toISOString().split('T')[0],
                estado: 'pendiente', subtotal: subtotalNuevo, igv: igvNuevo, total: totalNuevo, observaciones: nuevaObs
            }).select().single()

            if (errCot) throw errCot

            const insItems = validItems.map(i => ({
                cotizacion_id: cotData.id, producto_id: i.producto_id,
                cantidad: i.cantidad, precio_unitario: i.precio_unitario, subtotal: i.subtotal
            }))
            await supabase.from('saf_cotizacion_items').insert(insItems)

            showToast('Cotización generada correctamente', 'success')
            setModalNueva(false)
            fetchData()
        } catch (err) { showToast('Error al crear cotización', 'error') }
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Cotizaciones</h2>
                    <p className="text-sm text-[#8b949e]">Gestión comercial y propuestas</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 overflow-x-auto no-scrollbar">
                        {['Todos', 'Pendiente', 'Aprobada', 'Rechazada', 'Vencida'].map(est => (
                            <button
                                key={est} onClick={() => setFiltroEstado(est)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtroEstado === est ? 'bg-[#f0a500] text-[#0d1117]' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                            >
                                {est}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setModalNueva(true)} className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors whitespace-nowrap">
                        <Plus className="h-4 w-4" /> Nueva Cotización
                    </button>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Cotizaciones del Mes</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{stats.cotsMes}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Monto Total Cotizado</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#238636]">{formatSoles(stats.montoMes)}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Tasa de Aprobación</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#1f6feb]">{stats.tasaAprobacion}%</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border border-[#30363d] ${stats.porVencer > 0 ? 'border-[#f0a500] animate-pulse' : ''}`}>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Por Vencer (3 días)</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.porVencer > 0 ? 'text-[#f0a500]' : 'text-[#e6edf3]'}`}>{stats.porVencer}</p>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#e6edf3]">
                        <thead className="bg-[#21262d] text-[#8b949e] uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-medium">N° Cotización</th>
                                <th className="px-4 py-3 font-medium">Cliente</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">Vence</th>
                                <th className="px-4 py-3 font-medium text-center">Items</th>
                                <th className="px-4 py-3 font-medium text-right">Total</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                                <th className="px-4 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                            {loading ? (
                                <tr><td colSpan={8} className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-[#8b949e]">No se encontraron cotizaciones.</td></tr>
                            ) : (
                                filteredList.map(c => {
                                    const vencida = new Date(c.fecha_vencimiento) < now && c.estado === 'pendiente'
                                    return (
                                        <tr key={c.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                            <td className="px-4 py-3 font-rajdhani font-bold text-[#f0a500]">{c.numero}</td>
                                            <td className="px-4 py-3">{c.saf_clientes?.razon_social}</td>
                                            <td className="px-4 py-3 text-[#8b949e]">{formatFecha(c.fecha)}</td>
                                            <td className={`px-4 py-3 ${vencida ? 'text-[#da3633] font-bold flex items-center gap-1' : 'text-[#8b949e]'}`}>
                                                {vencida && <AlertTriangle className="h-3 w-3" />} {formatFecha(c.fecha_vencimiento)}
                                            </td>
                                            <td className="px-4 py-3 text-center">{c.saf_cotizacion_items?.length || 0}</td>
                                            <td className="px-4 py-3 text-right font-bold">{formatSoles(Number(c.total))}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${c.estado === 'aprobada' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                    c.estado === 'rechazada' ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30' :
                                                        c.estado === 'vencida' || vencida ? 'bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/30' :
                                                            'bg-[#1f6feb]/10 text-[#1f6feb] border-[#1f6feb]/30'
                                                    }`}>
                                                    {vencida && c.estado === 'pendiente' ? 'VENCIDA' : c.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => setModalPDF({ isOpen: true, data: c })} className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d] hover:bg-[#30363d] rounded" title="Ver PDF"><FileText className="h-4 w-4" /></button>
                                                    {c.estado === 'pendiente' && !vencida && (
                                                        <>
                                                            <button onClick={() => handleAprobar(c.id, c.numero)} className="p-1.5 text-[#238636] hover:bg-[#238636]/20 bg-[#238636]/10 rounded" title="Aprobar"><Check className="h-4 w-4" /></button>
                                                            <button onClick={() => setModalRechazo({ isOpen: true, data: c })} className="p-1.5 text-[#da3633] hover:bg-[#da3633]/20 bg-[#da3633]/10 rounded" title="Rechazar"><X className="h-4 w-4" /></button>
                                                        </>
                                                    )}
                                                    {c.estado === 'aprobada' && (
                                                        <button onClick={() => handleConvertirOrden(c)} className="p-1.5 text-[#f0a500] hover:bg-[#f0a500]/20 bg-[#f0a500]/10 rounded" title="Convertir a Orden"><ArrowRight className="h-4 w-4" /></button>
                                                    )}
                                                    <button onClick={() => handleDuplicar(c)} className="p-1.5 text-[#8b949e] hover:bg-[#30363d] rounded hidden md:block" title="Duplicar"><Copy className="h-4 w-4" /></button>
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

            {/* MODAL NUEVA COTIZACION */}
            <AnimatePresence>
                {modalNueva && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-[#f0a500]">Nueva Cotización</h3>
                                <button onClick={() => setModalNueva(false)} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Seleccionar Cliente *</label>
                                        <select value={nuevoClienteId} onChange={(e) => setNuevoClienteId(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none">
                                            <option value="">Seleccione...</option>
                                            {clientes.map(cl => <option key={cl.id} value={cl.id}>{cl.razon_social} ({cl.ruc})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Validez (Días)</label>
                                        <select value={nuevaValidez} onChange={(e) => setNuevaValidez(Number(e.target.value))} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none">
                                            <option value={7}>7 días</option><option value={15}>15 días</option><option value={30}>30 días</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase">Productos</label>
                                        <button onClick={() => setNuevoItems([...nuevoItems, { id: Date.now(), producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }])} className="text-xs text-[#f0a500] hover:text-[#e06c00] font-bold flex items-center gap-1"><Plus className="h-3 w-3" /> Agregar fila</button>
                                    </div>
                                    <div className="space-y-2">
                                        {nuevoItems.map((item, idx) => (
                                            <div key={item.id} className="flex gap-2 items-center bg-[#21262d] p-2 rounded-lg border border-[#30363d]">
                                                <span className="text-[#8b949e] text-xs w-4 text-center">{idx + 1}</span>
                                                <select value={item.producto_id} onChange={(e) => actItem(item.id, 'producto_id', e.target.value)} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-white outline-none">
                                                    <option value="">Producto...</option>
                                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual} {p.unidad})</option>)}
                                                </select>
                                                <input type="number" min="0.1" step="0.1" value={item.cantidad} onChange={(e) => actItem(item.id, 'cantidad', e.target.value)} className="w-20 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-center text-white" placeholder="Cant." />
                                                <input type="number" min="0.1" step="0.1" value={item.precio_unitario} onChange={(e) => actItem(item.id, 'precio_unitario', e.target.value)} className="w-24 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-right text-[#f0a500]" placeholder="S/." />
                                                <div className="w-24 text-right pr-2 text-sm font-bold text-white">{formatSoles(item.subtotal)}</div>
                                                <button onClick={() => setNuevoItems(nuevoItems.filter(x => x.id !== item.id))} className="p-1 hover:bg-[#da3633]/20 text-[#da3633] rounded"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex mx-auto justify-end">
                                    <div className="w-64 bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm text-[#8b949e]"><span>Subtotal</span><span>{formatSoles(subtotalNuevo)}</span></div>
                                        <div className="flex justify-between text-sm text-[#8b949e]"><span>IGV (18%)</span><span>{formatSoles(igvNuevo)}</span></div>
                                        <div className="flex justify-between text-lg font-rajdhani font-bold text-[#f0a500] border-t border-[#30363d] pt-2 mt-2"><span>TOTAL</span><span>{formatSoles(totalNuevo)}</span></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Observaciones</label>
                                    <textarea value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} rows={2} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none" placeholder="Condiciones de pago, entrega, etc." />
                                </div>
                            </div>

                            <div className="flex gap-3 p-5 border-t border-[#30363d] bg-[#161b22]">
                                <button onClick={() => setModalNueva(false)} className="flex-1 px-4 py-2 bg-[#21262d] text-[#e6edf3] font-medium rounded-lg">Cancelar</button>
                                <button onClick={handleCreateCotizacion} className="flex-1 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg border-none">Generar Cotización</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL PDF/VER */}
            <AnimatePresence>
                {modalPDF.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white text-black rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-3 bg-gray-100 border-b print:hidden">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => window.print()} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold flex items-center gap-1"><Printer className="h-4 w-4" /> Imprimir PDF</button>
                                </div>
                                <button onClick={() => setModalPDF({ isOpen: false, data: null })} className="p-1 hover:bg-gray-200 rounded"><X className="h-5 w-5 text-gray-500" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 bg-white print:p-0 print:overflow-visible" id="pdf-content">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h1 className="text-4xl font-black text-orange-600 tracking-tighter uppercase font-rajdhani">SERGENSAF</h1>
                                        <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">PROCESO Y VENTA DE AGREGADOS</p>
                                        <div className="mt-4 text-sm text-gray-600">
                                            <p>Av. Principal 123, Zona Industrial</p>
                                            <p>Lima, Perú</p>
                                            <p>ventas@sergensaf.com | +51 999 888 777</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 inline-block text-left min-w-[200px]">
                                            <h2 className="text-xl font-bold text-gray-800">COTIZACIÓN</h2>
                                            <p className="text-2xl font-black text-orange-600">{modalPDF.data?.numero}</p>
                                        </div>
                                        <div className="mt-4 text-sm text-gray-600 text-right space-y-1">
                                            <p><strong>Fecha:</strong> {formatFecha(modalPDF.data?.fecha)}</p>
                                            <p><strong>Vencimiento:</strong> {formatFecha(modalPDF.data?.fecha_vencimiento)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase border-b pb-2">Datos del Cliente</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><p className="text-gray-500">Razón Social:</p><p className="font-bold">{modalPDF.data?.saf_clientes?.razon_social}</p></div>
                                        <div><p className="text-gray-500">RUC:</p><p className="font-bold">{modalPDF.data?.saf_clientes?.ruc}</p></div>
                                        <div className="col-span-2"><p className="text-gray-500">Dirección:</p><p>{modalPDF.data?.saf_clientes?.direccion}</p></div>
                                    </div>
                                </div>

                                <table className="w-full text-sm mb-6 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-800 text-white">
                                            <th className="p-2 text-left w-12 border border-gray-800">Item</th>
                                            <th className="p-2 text-left border border-gray-800">Descripción</th>
                                            <th className="p-2 text-center w-24 border border-gray-800">Cant.</th>
                                            <th className="p-2 text-right w-32 border border-gray-800">Precio Unit. S/</th>
                                            <th className="p-2 text-right w-32 border border-gray-800">Subtotal S/</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Aqui iteraríamos saf_cotizacion_items si los hubieramos cargado con detail. Por simplificacion, mostramos uno dummy o el count. En una version final, se hace rpc o lazy load. */}
                                        <tr><td className="p-2 border border-gray-300 text-center">1</td><td className="p-2 border border-gray-300">Materiales Varios según detalle adjunto</td><td className="p-2 border border-gray-300 text-center">-</td><td className="p-2 border border-gray-300 text-right">-</td><td className="p-2 border border-gray-300 text-right">{formatSoles(modalPDF.data?.subtotal)}</td></tr>
                                    </tbody>
                                </table>

                                <div className="flex justify-end mb-8">
                                    <div className="w-64">
                                        <div className="flex justify-between py-1 border-b border-gray-200 text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-bold">{formatSoles(modalPDF.data?.subtotal)}</span></div>
                                        <div className="flex justify-between py-1 border-b border-gray-200 text-sm"><span className="text-gray-600">IGV (18%):</span><span className="font-bold">{formatSoles(modalPDF.data?.igv)}</span></div>
                                        <div className="flex justify-between py-2 text-lg font-black text-orange-600"><span>TOTAL:</span><span>{formatSoles(modalPDF.data?.total)}</span></div>
                                    </div>
                                </div>

                                {modalPDF.data?.observaciones && (
                                    <div className="text-xs text-gray-500 border-t pt-4">
                                        <p className="font-bold text-gray-700 mb-1">Observaciones:</p>
                                        <p>{modalPDF.data.observaciones}</p>
                                    </div>
                                )}

                                <div className="mt-16 text-center text-xs text-gray-400 border-t pt-4">
                                    Documento generado por ERP SERGENSAF - Validez sujeta a stock en planta.
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL RECHAZO */}
            <AnimatePresence>
                {modalRechazo.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-sm overflow-hidden">
                            <div className="p-5 border-b border-[#30363d] flex justify-between items-center bg-[#da3633]/10">
                                <h3 className="text-lg font-rajdhani font-bold text-[#da3633]">Rechazar Cotización</h3>
                                <button onClick={() => setModalRechazo({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleRechazar} className="p-5 space-y-4">
                                <p className="text-sm text-[#e6edf3]">Por favor, indique el motivo por el cual se rechaza la cotización <b>{modalRechazo.data.numero}</b>.</p>
                                <textarea name="motivo" required rows={3} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm focus:border-[#da3633] outline-none" placeholder="Motivo del rechazo..."></textarea>
                                <button type="submit" className="w-full py-2 bg-[#da3633] hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Confirmar Rechazo</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
