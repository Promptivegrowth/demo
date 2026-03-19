'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, Plus, Check, X, Printer, Search, Play, FileText, AlertTriangle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabOrdenes({ showToast }: { showToast: Function }) {
    const [ordenes, setOrdenes] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')

    // Modals
    const [modalNueva, setModalNueva] = useState(false)
    const [modalDetalle, setModalDetalle] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })
    const [modalAnular, setModalAnular] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // New Order State
    const [nuevoClienteId, setNuevoClienteId] = useState('')
    const [nuevoClienteObj, setNuevoClienteObj] = useState<any>(null)
    const [tipoPago, setTipoPago] = useState('contado')
    const [fechaRequerida, setFechaRequerida] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })
    const [direccion, setDireccion] = useState('')
    const [nuevaObs, setNuevaObs] = useState('')
    const [nuevoItems, setNuevoItems] = useState<any[]>([{ id: Date.now(), producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0, errorStock: false }])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [resOrd, resClis, resProds] = await Promise.all([
                supabase.from('saf_ordenes').select('*, saf_clientes(razon_social), saf_orden_items(cantidad, saf_productos(nombre))').order('created_at', { ascending: false }),
                supabase.from('saf_clientes').select('*').order('razon_social'),
                supabase.from('saf_productos').select('*').eq('activo', true).order('nombre')
            ])

            if (resOrd.error) throw resOrd.error
            setOrdenes(resOrd.data || [])
            setClientes(resClis.data || [])
            setProductos(resProds.data || [])
        } catch (err: any) {
            showToast('Error cargando órdenes', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // Derived Values
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentMonth = now.getMonth()

    const ordsMes = ordenes.filter(o => new Date(o.fecha).getMonth() === currentMonth)
    const facturadoMes = ordsMes.filter(o => o.estado !== 'anulado').reduce((s, o) => s + Number(o.total), 0)
    const pendientes = ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso').length
    const anuladasMes = ordsMes.filter(o => o.estado === 'anulado').length

    const stats = {
        ordsHoy: ordenes.filter(o => o.fecha === todayStr).length,
        facturadoMes,
        pendientes,
        anuladasMes
    }

    const formatSoles = (v: number) => `S/ ${(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
    const formatFecha = (d: string) => new Date(d).toLocaleDateString('es-PE', { timeZone: 'UTC' })

    const filteredList = ordenes.filter(o => {
        const s = busqueda.toLowerCase()
        const matchBusqueda = o.numero.toLowerCase().includes(s) || (o.saf_clientes?.razon_social || '').toLowerCase().includes(s)
        let matchEstado = filtroEstado === 'Todos' || o.estado === filtroEstado.toLowerCase().replace(' ', '_')
        if (filtroEstado === 'En Proceso') matchEstado = o.estado === 'en_proceso'
        return matchBusqueda && matchEstado
    })

    // Actions
    const handleProcesar = async (o: any) => {
        if (!confirm(`¿Mandar orden ${o.numero} a cola de Despacho?`)) return
        try {
            await supabase.from('saf_ordenes').update({ estado: 'en_proceso' }).eq('id', o.id)
            showToast(`Orden ${o.numero} enviada a despachos`, 'success')
            fetchData()
        } catch (err) { showToast('Error al procesar', 'error') }
    }

    const handleAnular = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const obs = new FormData(e.currentTarget).get('motivo') as string
        try {
            await supabase.from('saf_ordenes').update({ estado: 'anulado', motivo_anulacion: obs }).eq('id', modalAnular.data.id)
            // Si era a crédito, anular cuenta por cobrar
            if (modalAnular.data.tipo_pago === 'credito') {
                const { data: cxc } = await supabase.from('saf_cuentas_por_cobrar').select('id, saldo').eq('orden_id', modalAnular.data.id).single()
                if (cxc) {
                    await supabase.from('saf_cuentas_por_cobrar').update({ estado: 'anulado', saldo: 0 }).eq('id', cxc.id)
                    // Restituir saldo al cliente
                    const { data: cli } = await supabase.from('saf_clientes').select('saldo_pendiente').eq('id', modalAnular.data.cliente_id).single()
                    if (cli) {
                        await supabase.from('saf_clientes').update({ saldo_pendiente: Number(cli.saldo_pendiente) - Number(cxc.saldo) }).eq('id', modalAnular.data.cliente_id)
                    }
                }
            }
            showToast('Orden anulada', 'warning')
            setModalAnular({ isOpen: false, data: null })
            fetchData()
        } catch (err) { showToast('Error al anular', 'error') }
    }

    // New Order Logic
    const actItem = (id: number, field: string, value: any) => {
        setNuevoItems(prev => prev.map(it => {
            if (it.id === id) {
                const up = { ...it, [field]: value }
                const p = productos.find(x => x.id === (field === 'producto_id' ? value : up.producto_id))

                if (field === 'producto_id' && p) {
                    up.precio_unitario = Number(p.precio_unitario)
                }

                up.subtotal = Number(up.cantidad) * Number(up.precio_unitario)

                // Validacion de stock real-time
                if (p && Number(up.cantidad) > Number(p.stock_actual)) {
                    up.errorStock = `Disponible: ${p.stock_actual}`
                } else {
                    up.errorStock = false
                }
                return up
            }
            return it
        }))
    }

    const handleClienteChange = (id: string) => {
        setNuevoClienteId(id)
        const c = clientes.find(x => x.id === id)
        setNuevoClienteObj(c || null)
        setDireccion(c?.direccion || '')
        if (c && !c.credito_habilitado && tipoPago === 'credito') setTipoPago('contado')
    }

    const subtotalNuevo = nuevoItems.reduce((s, i) => s + Number(i.subtotal), 0)
    const igvNuevo = subtotalNuevo * 0.18
    const totalNuevo = subtotalNuevo + igvNuevo
    const hasStockErrors = nuevoItems.some(i => i.errorStock !== false)
    const isCreditDisabled = tipoPago === 'credito' && nuevoClienteObj && !nuevoClienteObj.credito_habilitado

    const handleCreateOrden = async () => {
        if (!nuevoClienteId) return showToast('Seleccione un cliente', 'warning')
        if (isCreditDisabled) return showToast('El cliente no tiene crédito habilitado', 'error')
        if (hasStockErrors) return showToast('Corrija los errores de stock', 'error')

        const validItems = nuevoItems.filter(i => i.producto_id && i.cantidad > 0)
        if (validItems.length === 0) return showToast('Agregue al menos un producto válido', 'warning')

        const nro = `ORD-${Date.now().toString().slice(-4)}`

        try {
            // Insert Orden
            const { data: ordData, error: errOrd } = await supabase.from('saf_ordenes').insert({
                numero: nro, cliente_id: nuevoClienteId, fecha: todayStr, fecha_requerida: fechaRequerida,
                estado: 'pendiente', subtotal: subtotalNuevo, igv: igvNuevo, total: totalNuevo,
                tipo_pago: tipoPago, observaciones: nuevaObs || direccion
            }).select().single()

            if (errOrd) throw errOrd

            // Insert Items
            const insItems = validItems.map(i => ({
                orden_id: ordData.id, producto_id: i.producto_id,
                cantidad: i.cantidad, precio_unitario: i.precio_unitario, subtotal: i.subtotal
            }))
            await supabase.from('saf_orden_items').insert(insItems)

            // Manejo de Crédito
            if (tipoPago === 'credito') {
                const dRec = new Date(fechaRequerida)
                dRec.setDate(dRec.getDate() + 30) // 30 dias de credito por defecto
                await supabase.from('saf_cuentas_por_cobrar').insert({
                    orden_id: ordData.id, cliente_id: nuevoClienteId, numero_factura: `F${Date.now().toString().slice(-8)}`,
                    fecha_emision: todayStr, fecha_vencimiento: dRec.toISOString().split('T')[0],
                    monto_total: totalNuevo, saldo: totalNuevo, estado: 'pendiente'
                })
                await supabase.from('saf_clientes').update({ saldo_pendiente: Number(nuevoClienteObj.saldo_pendiente) + totalNuevo }).eq('id', nuevoClienteId)
            }

            showToast(`Orden ${nro} generada correctamente`, 'success')
            setModalNueva(false)
            fetchData()
        } catch (err) { showToast('Error al crear orden', 'error') }
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Órdenes de Venta</h2>
                    <p className="text-sm text-[#8b949e]">Gestión de pedidos e inicio de despachos</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 overflow-x-auto no-scrollbar">
                        {['Todos', 'Pendiente', 'En Proceso', 'Despachado', 'Anulado'].map(est => (
                            <button
                                key={est} onClick={() => setFiltroEstado(est)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtroEstado === est ? 'bg-[#f0a500] text-[#0d1117]' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                            >
                                {est}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => {
                        setNuevoClienteId(''); setNuevoClienteObj(null); setTipoPago('contado');
                        setNuevoItems([{ id: Date.now(), producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0, errorStock: false }]);
                        setModalNueva(true)
                    }} className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors whitespace-nowrap">
                        <Plus className="h-4 w-4" /> Nueva Orden
                    </button>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Órdenes Hoy</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{stats.ordsHoy}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Facturado el Mes</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#238636]">{formatSoles(stats.facturadoMes)}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.pendientes > 0 ? 'border-[#f0a500]' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Pendientes Despacho</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.pendientes > 0 ? 'text-[#f0a500]' : 'text-[#e6edf3]'}`}>{stats.pendientes}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.anuladasMes > 0 ? 'border-[#da3633]' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Anuladas el Mes</p>
                    <p className={`text-3xl font-rajdhani font-bold ${stats.anuladasMes > 0 ? 'text-[#da3633]' : 'text-[#e6edf3]'}`}>{stats.anuladasMes}</p>
                </div>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex gap-4 bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text" placeholder="Buscar por cliente o N° orden..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
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
                                <th className="px-4 py-3 font-medium">N° Orden</th>
                                <th className="px-4 py-3 font-medium">Origen</th>
                                <th className="px-4 py-3 font-medium">Cliente</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">F. Requerida</th>
                                <th className="px-4 py-3 font-medium text-center">Items</th>
                                <th className="px-4 py-3 font-medium text-right">Total</th>
                                <th className="px-4 py-3 font-medium text-center">T. Pago</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                                <th className="px-4 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                            {loading ? (
                                <tr><td colSpan={10} className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan={10} className="p-8 text-center text-[#8b949e]">No se encontraron órdenes.</td></tr>
                            ) : (
                                filteredList.map(o => {
                                    const reqVencida = new Date(o.fecha_requerida) < now && (o.estado === 'pendiente' || o.estado === 'en_proceso')
                                    return (
                                        <tr key={o.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                            <td className="px-4 py-3 font-rajdhani font-bold text-[#f0a500]">
                                                {o.numero}
                                                {o.cotizacion_id && <span className="ml-2 text-[8px] bg-[#1f6feb]/20 text-[#1f6feb] border border-[#1f6feb]/30 px-1 py-0.5 rounded uppercase">COT</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${o.cotizacion_id ? 'bg-[#1f6feb]/10 text-[#1f6feb]' : 'bg-[#30363d] text-[#8b949e]'}`}>
                                                    {o.cotizacion_id ? 'Cotización' : 'Manual'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{o.saf_clientes?.razon_social}</td>
                                            <td className="px-4 py-3 text-[#8b949e]">{formatFecha(o.fecha)}</td>
                                            <td className={`px-4 py-3 ${reqVencida ? 'text-[#da3633] font-bold flex items-center gap-1' : 'text-[#8b949e]'}`}>
                                                {reqVencida && <AlertTriangle className="h-3 w-3" />} {formatFecha(o.fecha_requerida)}
                                            </td>
                                            <td className="px-4 py-3 text-center">{o.saf_orden_items?.length || 0}</td>
                                            <td className="px-4 py-3 text-right font-bold">{formatSoles(Number(o.total))}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${o.tipo_pago === 'contado' ? 'bg-[#238636]/10 text-[#238636]' : 'bg-[#1f6feb]/10 text-[#1f6feb]'}`}>
                                                    {o.tipo_pago}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${o.estado === 'despachado' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                        o.estado === 'anulado' ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30' :
                                                            o.estado === 'en_proceso' ? 'bg-[#f0a500]/10 text-[#f0a500] border-[#f0a500]/30' :
                                                                'bg-[#1f6feb]/10 text-[#1f6feb] border-[#1f6feb]/30'
                                                    }`}>
                                                    {o.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setModalDetalle({ isOpen: true, data: o })} className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d] hover:bg-[#30363d] rounded" title="Ver Detalle"><FileText className="h-4 w-4" /></button>
                                                    {o.estado === 'pendiente' && (
                                                        <button onClick={() => handleProcesar(o)} className="p-1.5 text-[#f0a500] hover:bg-[#f0a500]/20 bg-[#f0a500]/10 rounded" title="Procesar a Despacho"><Play className="h-4 w-4 fill-current" /></button>
                                                    )}
                                                    {(o.estado === 'pendiente' || o.estado === 'en_proceso') && (
                                                        <button onClick={() => setModalAnular({ isOpen: true, data: o })} className="p-1.5 text-[#da3633] hover:bg-[#da3633]/20 bg-[#da3633]/10 rounded" title="Anular"><X className="h-4 w-4" /></button>
                                                    )}
                                                    <button onClick={() => window.print()} className="p-1.5 text-[#8b949e] hover:bg-[#30363d] rounded hidden md:block" title="Imprimir"><Printer className="h-4 w-4" /></button>
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

            {/* MODAL NUEVA ORDEN */}
            <AnimatePresence>
                {modalNueva && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-[#f0a500]">Nueva Orden de Venta</h3>
                                <button onClick={() => setModalNueva(false)} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* SET CLIENTE & FECHA */}
                                <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Seleccionar Cliente *</label>
                                            <select value={nuevoClienteId} onChange={(e) => handleClienteChange(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none">
                                                <option value="">Buscar cliente...</option>
                                                {clientes.map(cl => <option key={cl.id} value={cl.id}>{cl.razon_social} ({cl.ruc})</option>)}
                                            </select>
                                        </div>
                                        {nuevoClienteObj && (
                                            <div className="p-3 bg-[#21262d] rounded border border-[#30363d] text-sm">
                                                <p className="font-bold text-[#e6edf3]">{nuevoClienteObj.razon_social}</p>
                                                <p className="text-[#8b949e] text-xs mt-1">Deuda actual: <span className={nuevoClienteObj.saldo_pendiente > 0 ? 'text-[#da3633] font-bold' : 'text-[#238636]'}>{formatSoles(nuevoClienteObj.saldo_pendiente)}</span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">F. Requerida *</label>
                                                <input type="date" min={todayStr} value={fechaRequerida} onChange={(e) => setFechaRequerida(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Tipo de Pago *</label>
                                                <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none">
                                                    <option value="contado">Al Contado</option>
                                                    <option value="credito">Crédito 30 días</option>
                                                </select>
                                            </div>
                                        </div>
                                        {isCreditDisabled && (
                                            <div className="p-2 bg-[#9e6a03]/20 border border-[#9e6a03]/40 rounded text-[#f0a500] text-xs flex items-center gap-2 font-bold animate-pulse">
                                                <AlertTriangle className="h-4 w-4" /> Este cliente NO tiene crédito habilitado. Contacte al administrador.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ITEMS */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase">Detalle de Agregados</label>
                                        <button onClick={() => setNuevoItems([...nuevoItems, { id: Date.now(), producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0, errorStock: false }])} className="text-xs text-[#f0a500] hover:text-[#e06c00] font-bold flex items-center gap-1"><Plus className="h-3 w-3" /> Agregar fila</button>
                                    </div>
                                    <div className="space-y-2">
                                        {nuevoItems.map((item, idx) => (
                                            <div key={item.id} className="flex gap-2 items-center bg-[#21262d] p-2 rounded-lg border border-[#30363d] relative">
                                                <span className="text-[#8b949e] text-xs w-4 text-center">{idx + 1}</span>
                                                <select value={item.producto_id} onChange={(e) => actItem(item.id, 'producto_id', e.target.value)} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-white outline-none">
                                                    <option value="">Producto...</option>
                                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.stock_actual} disp)</option>)}
                                                </select>
                                                <div className="relative">
                                                    <input type="number" min="0.1" step="0.1" value={item.cantidad} onChange={(e) => actItem(item.id, 'cantidad', e.target.value)} className={`w-24 bg-[#0d1117] border rounded px-2 py-1.5 text-xs text-center text-white ${item.errorStock ? 'border-[#da3633]' : 'border-[#30363d]'}`} placeholder="m³" />
                                                    {item.errorStock && <span className="absolute -bottom-5 left-0 text-[9px] text-[#da3633] font-bold whitespace-nowrap">{item.errorStock}</span>}
                                                </div>
                                                <input type="number" min="0.1" step="0.1" value={item.precio_unitario} onChange={(e) => actItem(item.id, 'precio_unitario', e.target.value)} className="w-24 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-right text-[#f0a500]" placeholder="S/." />
                                                <div className="w-24 text-right pr-2 text-sm font-bold text-white">{formatSoles(item.subtotal)}</div>
                                                <button onClick={() => setNuevoItems(nuevoItems.filter(x => x.id !== item.id))} className="p-1 hover:bg-[#da3633]/20 text-[#da3633] rounded"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* TOTALS & INFO */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Dirección de Entrega</label>
                                            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-2">Observaciones</label>
                                            <textarea value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} rows={2} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end items-end h-full">
                                        <div className="w-full lg:w-3/4 bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between text-sm text-[#8b949e]"><span>Subtotal</span><span>{formatSoles(subtotalNuevo)}</span></div>
                                            <div className="flex justify-between text-sm text-[#8b949e]"><span>IGV (18%)</span><span>{formatSoles(igvNuevo)}</span></div>
                                            <div className="flex justify-between text-xl font-rajdhani font-bold text-[#f0a500] border-t border-[#30363d] pt-2 mt-2"><span>TOTAL</span><span>{formatSoles(totalNuevo)}</span></div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="flex gap-3 p-5 border-t border-[#30363d] bg-[#161b22] mt-auto">
                                <button onClick={() => setModalNueva(false)} className="flex-1 px-4 py-3 bg-[#21262d] text-[#e6edf3] font-medium rounded-lg">Cancelar</button>
                                <button disabled={isCreditDisabled || hasStockErrors} onClick={handleCreateOrden} className="flex-1 px-4 py-3 bg-[#f0a500] hover:bg-[#e06c00] disabled:bg-[#30363d] disabled:text-[#8b949e] disabled:cursor-not-allowed text-[#0d1117] font-bold rounded-lg border-none transition-colors">
                                    Registrar Orden
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL ANULAR */}
            <AnimatePresence>
                {modalAnular.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#da3633]/50 rounded-2xl w-full max-w-sm overflow-hidden">
                            <div className="p-5 border-b border-[#30363d] flex justify-between items-center bg-[#da3633]/10">
                                <h3 className="text-lg font-rajdhani font-bold text-[#da3633]">Anular Orden</h3>
                                <button onClick={() => setModalAnular({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleAnular} className="p-5 space-y-4">
                                <p className="text-sm text-[#e6edf3]">Por favor, justifique la anulación de la orden <b>{modalAnular.data.numero}</b>.</p>
                                <textarea name="motivo" required rows={3} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm focus:border-[#da3633] outline-none" placeholder="Motivo del cliente, error, etc..."></textarea>
                                <div className="p-3 bg-black rounded border border-[#30363d] text-xs text-[#8b949e]">
                                    Nota: El stock no fue descontado aún (se descuenta al despachar). Si es crédito, se anulará la cuenta por cobrar.
                                </div>
                                <button type="submit" className="w-full py-3 bg-[#da3633] hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Confirmar Anulación</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DETALLE MODAL PLACEHOLDER */}
            <AnimatePresence>
                {modalDetalle.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl overflow-hidden p-6 text-center">
                            <h3 className="text-2xl font-rajdhani text-[#f0a500] font-bold mb-4">Detalle en Modal</h3>
                            <p className="text-white mb-6">Orden: {modalDetalle.data.numero} - Visor de detalle resumido o completo.</p>
                            <button onClick={() => setModalDetalle({ isOpen: false, data: null })} className="px-6 py-2 bg-[#21262d] text-white rounded-lg">Cerrar</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
