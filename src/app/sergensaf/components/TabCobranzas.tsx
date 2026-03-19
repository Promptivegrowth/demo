'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign, Search, CheckCircle, FileText, AlertTriangle, X, Wallet
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabCobranzas({ showToast }: { showToast: Function }) {
    const [cuentas, setCuentas] = useState<any[]>([])
    const [pagosRecientes, setPagosRecientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')

    // Modals
    const [modalPago, setModalPago] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // Nuevo Pago State
    const [montoPago, setMontoPago] = useState<number>(0)
    const [metodoPago, setMetodoPago] = useState('transferencia')
    const [referencia, setReferencia] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const resCuentas = await supabase.from('saf_cuentas_por_cobrar')
                .select('*, saf_clientes(razon_social, ruc), saf_ordenes(numero)')
                .order('fecha_vencimiento', { ascending: true })

            const resPagos = await supabase.from('saf_pagos')
                .select('*, saf_cuentas_por_cobrar(numero_factura)')
                .order('fecha_pago', { ascending: false })
                .limit(5)

            if (resCuentas.error) throw resCuentas.error
            setCuentas(resCuentas.data || [])
            setPagosRecientes(resPagos.data || [])
        } catch (err: any) {
            showToast('Error cargando cuentas', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // Derived Values
    const now = new Date()
    const cxcVencidas = cuentas.filter(c => c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < now)
    const cxcPendientes = cuentas.filter(c => c.estado === 'pendiente' && new Date(c.fecha_vencimiento) >= now)

    const totalVencido = cxcVencidas.reduce((sum, c) => sum + Number(c.saldo), 0)
    const totalPorCobrar = cxcPendientes.reduce((sum, c) => sum + Number(c.saldo), 0)
    const recaudadoHoy = pagosRecientes.filter(p => p.fecha_pago.startsWith(now.toISOString().split('T')[0])).reduce((sum, p) => sum + Number(p.monto), 0)

    const stats = {
        totalVencido,
        totalPorCobrar,
        cxcVencidasCount: cxcVencidas.length,
        recaudadoHoy
    }

    const filteredList = cuentas.filter(c => {
        const s = busqueda.toLowerCase()
        const matchBusqueda = (c.numero_factura || '').toLowerCase().includes(s) || (c.saf_clientes?.razon_social || '').toLowerCase().includes(s)
        let matchEstado = filtroEstado === 'Todos' || c.estado === filtroEstado.toLowerCase().replace(' ', '_')
        if (filtroEstado === 'Vencida') {
            const isVencida = c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < now
            matchEstado = isVencida
        }
        return matchBusqueda && matchEstado
    })

    const formatSoles = (v: number) => `S/ ${(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    // Actions
    const handleRegistrarPago = async () => {
        if (montoPago <= 0 || montoPago > modalPago.data.saldo) return showToast('Monto inválido. No puede superar el saldo actual.', 'warning')
        if (!referencia) return showToast('Ingrese N° de operación', 'warning')

        try {
            const nuevoSaldo = Number(modalPago.data.saldo) - montoPago
            const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'pendiente'

            // 1. Insert Pago
            await supabase.from('saf_pagos').insert({
                cuenta_cobrar_id: modalPago.data.id, monto: montoPago, fecha_pago: new Date().toISOString(),
                metodo_pago: metodoPago, referencia
            })

            // 2. Update CxC
            await supabase.from('saf_cuentas_por_cobrar').update({
                saldo: nuevoSaldo, estado: nuevoEstado
            }).eq('id', modalPago.data.id)

            // 3. Update Client Balance
            const { data: cli } = await supabase.from('saf_clientes').select('saldo_pendiente').eq('id', modalPago.data.cliente_id).single()
            if (cli) {
                const actCredito = Math.max(0, Number(cli.saldo_pendiente) - montoPago)
                await supabase.from('saf_clientes').update({ saldo_pendiente: actCredito }).eq('id', modalPago.data.cliente_id)
            }

            showToast(`Pago de ${formatSoles(montoPago)} registrado con éxito`, 'success')
            setModalPago({ isOpen: false, data: null })
            fetchData()
        } catch (err) { showToast('Error al procesar pago', 'error') }
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Cuentas por Cobrar</h2>
                    <p className="text-sm text-[#8b949e]">Gestión de créditos, facturas y registros de pago</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 overflow-x-auto no-scrollbar">
                        {['Todos', 'Pendiente', 'Vencida', 'Pagado'].map(est => (
                            <button
                                key={est} onClick={() => setFiltroEstado(est)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtroEstado === est ? 'bg-[#f0a500] text-[#0d1117]' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                            >
                                {est}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`bg-[#161b22] p-5 rounded-xl border ${stats.totalVencido > 0 ? 'border-[#da3633]' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#da3633] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Total Vencido</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#da3633]">{formatSoles(stats.totalVencido)}</p>
                    <p className="text-xs text-[#8b949e] mt-2">{stats.cxcVencidasCount} facturas atrasadas</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Por Cobrar Vigente</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#f0a500]">{formatSoles(stats.totalPorCobrar)}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d]">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-2"><Wallet className="h-4 w-4" /> Recaudado Hoy</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#238636]">{formatSoles(stats.recaudadoHoy)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* COLUMNA PAGOS RECIENTES */}
                <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-[#30363d] bg-[#21262d]">
                        <h3 className="font-rajdhani font-bold text-[#e6edf3] uppercase tracking-widest text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#238636]" /> Últs. Pagos Recibidos
                        </h3>
                    </div>
                    <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                        {pagosRecientes.length === 0 ? <p className="text-center text-xs text-[#8b949e] mt-4">Sin pagos registrados</p> :
                            pagosRecientes.map(p => (
                                <div key={p.id} className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[#8b949e]">{p.saf_cuentas_por_cobrar?.numero_factura}</span>
                                        <span className="text-xs font-mono text-[#238636] font-bold">+{formatSoles(Number(p.monto))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-[#8b949e] capitalize">{p.metodo_pago}</span>
                                        <span className="text-[10px] text-[#8b949e]">{new Date(p.fecha_pago).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* COLUMNA TABLA */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {/* FILTER & SEARCH */}
                    <div className="flex gap-4 bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                            <input
                                type="text" placeholder="Buscar por Factura o Razón Social..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#f0a500] transition-colors"
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-[#e6edf3]">
                                <thead className="bg-[#21262d] text-[#8b949e] uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Factura N°</th>
                                        <th className="px-4 py-3 font-medium">Cliente</th>
                                        <th className="px-4 py-3 font-medium">F. Emisión</th>
                                        <th className="px-4 py-3 font-medium">Vencimiento</th>
                                        <th className="px-4 py-3 font-medium text-right">Monto Total</th>
                                        <th className="px-4 py-3 font-medium text-right">Saldo Deuda</th>
                                        <th className="px-4 py-3 font-medium text-center">Estado</th>
                                        <th className="px-4 py-3 font-medium text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#30363d]">
                                    {loading ? (
                                        <tr><td colSpan={8} className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                    ) : filteredList.length === 0 ? (
                                        <tr><td colSpan={8} className="p-8 text-center text-[#8b949e]">No se encontraron cuentas.</td></tr>
                                    ) : (
                                        filteredList.map(c => {
                                            const isVencida = c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < now
                                            return (
                                                <tr key={c.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                                    <td className="px-4 py-3 font-rajdhani font-bold text-[#f0a500]">
                                                        {c.numero_factura}
                                                        <span className="block text-[9px] text-[#8b949e] font-sans font-normal mt-0.5 w-max">Ord: {c.saf_ordenes?.numero}</span>
                                                    </td>
                                                    <td className="px-4 py-3 leading-tight">{c.saf_clientes?.razon_social} <br /><span className="text-xs text-[#8b949e]">RUC {c.saf_clientes?.ruc}</span></td>
                                                    <td className="px-4 py-3 text-[#8b949e]">{new Date(c.fecha_emision).toLocaleDateString('es-PE')}</td>
                                                    <td className={`px-4 py-3 font-bold ${isVencida ? 'text-[#da3633]' : 'text-[#e6edf3]'}`}>{new Date(c.fecha_vencimiento).toLocaleDateString('es-PE')}</td>
                                                    <td className="px-4 py-3 text-right">{formatSoles(Number(c.monto_total))}</td>
                                                    <td className={`px-4 py-3 text-right font-bold ${Number(c.saldo) === 0 ? 'text-[#238636]' : 'text-[#f0a500]'}`}>{formatSoles(Number(c.saldo))}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${c.estado === 'pagado' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                                isVencida ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30 animate-pulse' :
                                                                    'bg-[#f0a500]/10 text-[#f0a500] border-[#f0a500]/30'
                                                            }`}>
                                                            {isVencida && c.estado !== 'pagado' ? 'Vencida' : c.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] bg-[#21262d] hover:bg-[#30363d] rounded" title="Ver Detalle"><FileText className="h-4 w-4" /></button>
                                                            {c.estado === 'pendiente' && (
                                                                <button onClick={() => {
                                                                    setMontoPago(Number(c.saldo))
                                                                    setMetodoPago('transferencia')
                                                                    setReferencia('')
                                                                    setModalPago({ isOpen: true, data: c })
                                                                }} className="px-2 py-1 bg-[#238636]/10 hover:bg-[#238636]/20 text-[#238636] rounded text-xs font-bold border border-[#238636]/30">Abonar</button>
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
            </div>

            {/* MODAL PAGO */}
            <AnimatePresence>
                {modalPago.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
                                <h3 className="text-xl font-rajdhani font-bold text-[#f0a500] flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" /> Registrar Pago
                                </h3>
                                <button onClick={() => setModalPago({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg text-center mb-6">
                                    <p className="text-xs text-[#8b949e] mb-1">FACTURA {modalPago.data?.numero_factura}</p>
                                    <p className="text-sm font-bold text-[#e6edf3]">{modalPago.data?.saf_clientes?.razon_social}</p>
                                    <div className="mt-4 pt-4 border-t border-[#30363d]">
                                        <p className="text-xs text-[#8b949e] uppercase mb-1 tracking-wider">Saldo Pendiente</p>
                                        <p className="text-3xl font-rajdhani font-bold text-[#da3633]">{formatSoles(modalPago.data?.saldo)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Monto a Abonar (S/) *</label>
                                    <input type="number" step="0.01" max={modalPago.data?.saldo} value={montoPago} onChange={(e) => setMontoPago(Number(e.target.value))} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-3 text-lg font-bold text-[#238636] focus:border-[#f0a500] outline-none text-center" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Método</label>
                                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none">
                                            <option value="transferencia">Transferencia</option>
                                            <option value="deposito">Depósito BCP/BBVA</option>
                                            <option value="yape_plin">Yape / Plin</option>
                                            <option value="efectivo">Efectivo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">N° Operación *</label>
                                        <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#f0a500] outline-none" placeholder="Voucher/Ref" />
                                    </div>
                                </div>

                            </div>

                            <div className="flex gap-3 p-5 border-t border-[#30363d] bg-[#161b22]">
                                <button onClick={() => setModalPago({ isOpen: false, data: null })} className="flex-1 px-4 py-3 bg-[#21262d] text-[#e6edf3] font-medium rounded-lg hover:bg-[#30363d] transition-colors">Cancelar</button>
                                <button onClick={handleRegistrarPago} className="flex-1 px-4 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-lg border-none transition-colors">
                                    Confirmar Abono
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
