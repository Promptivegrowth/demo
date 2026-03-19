'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Scale,
    Receipt,
    WalletCards,
    CalendarClock,
    FileWarning,
    Package,
    ArrowRight,
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react'

const ecoBadge = (tipo: string) => {
    const map: any = {
        municipal: ['bg-emerald-100 text-emerald-700 border-emerald-200', 'Municipal'],
        peligroso: ['bg-rose-100 text-rose-700 border-rose-200', 'Peligroso'],
        hospitalario: ['bg-purple-100 text-purple-700 border-purple-200', 'Hospitalario'],
        desmonte: ['bg-amber-100 text-amber-700 border-amber-200', 'Desmonte'],
        industrial: ['bg-blue-100 text-blue-700 border-blue-200', 'Industrial'],
        mixto: ['bg-slate-100 text-slate-700 border-slate-200', 'Mixto'],
        construccion: ['bg-amber-100 text-amber-700 border-amber-200', 'Construcción'],
        hospital: ['bg-purple-100 text-purple-700 border-purple-200', 'Hospital'],
    }
    const [style, txt] = map[tipo] || ['bg-slate-100 text-slate-700 border-slate-200', tipo]
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>{txt}</span>
}

const ecoEstadoBadge = (estado: string) => {
    const map: any = {
        programado: ['bg-blue-50 text-blue-600 border-blue-200', 'Programado'],
        en_ruta: ['bg-amber-50 text-amber-600 border-amber-200', 'En Ruta'],
        recogido: ['bg-emerald-50 text-emerald-600 border-emerald-200', 'Recogido'],
        en_planta: ['bg-teal-50 text-teal-600 border-teal-200', 'En Planta'],
        completado: ['bg-emerald-100 text-emerald-700 border-emerald-300', 'Completado'],
        cancelado: ['bg-rose-50 text-rose-600 border-rose-200', 'Cancelado'],
    }
    const [style, txt] = map[estado] || ['bg-slate-50 text-slate-600 border-slate-200', estado]
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>{txt}</span>
}

const CountUp = ({ end, isCurrency = false, isKg = false }: { end: number, isCurrency?: boolean, isKg?: boolean }) => {
    const formatValue = (val: number) => {
        if (isCurrency) return 'S/ ' + val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        if (isKg) return val.toLocaleString('es-PE') + ' kg'
        return val.toLocaleString('es-PE')
    }
    return <span>{formatValue(end)}</span>
}

export default function TabEcoDashboard({ showToast, ecoQuery, setActiveTab }: any) {
    const [data, setData] = useState<any>({ serviciosMes: 0, kgMes: 0, facturadoMes: 0, porCobrar: 0, ordenesHoy: 0, manifiestos: 0 })
    const [ordenes, setOrdenes] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = async () => {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]
            const mesStart = today.slice(0, 7) + '-01'
            const [ords, cuentas, mans, hoy, ultimas, flotaAlerts, opAlerts] = await Promise.all([
                ecoQuery('eco_ordenes', { select: 'id,estado,kg_reales,fecha_programada,tipo_residuo,created_at', filters: [`fecha_programada=gte.${mesStart}`, 'estado=neq.cancelado'] }),
                ecoQuery('eco_cuentas', { select: 'monto_total,saldo,estado,fecha_emision', filters: [`fecha_emision=gte.${mesStart}`] }),
                ecoQuery('eco_manifiestos', { select: 'id,estado,fecha_generacion', filters: ['estado=neq.cerrado'] }),
                ecoQuery('eco_ordenes', { select: 'id,numero,estado,tipo_residuo,vehiculo_id', filters: [`fecha_programada=eq.${today}`, 'estado=neq.cancelado'] }),
                ecoQuery('eco_ordenes', { select: 'id,numero,estado,tipo_residuo,fecha_programada,eco_clientes(razon_social)', filters: ['limit=5', 'order=created_at.desc'] }),
                ecoQuery('eco_flota', { select: 'placa,venc_soat', filters: [`venc_soat=lt.${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}`] }),
                ecoQuery('eco_operarios', { select: 'nombres,venc_sanidad', filters: [`venc_sanidad=lt.${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}`] }),
            ])

            const ordsArr = Array.isArray(ords) ? ords : []
            const cuentasArr = Array.isArray(cuentas) ? cuentas : []
            const mansArr = Array.isArray(mans) ? mans : []
            const hoyArr = Array.isArray(hoy) ? hoy : []

            const kgTotal = ordsArr.filter((o: any) => o.estado === 'completado').reduce((s: number, o: any) => s + (Number(o.kg_reales) || 0), 0)
            const facturado = cuentasArr.reduce((s: number, c: any) => s + (Number(c.monto_total) || 0), 0)
            const porCobrar = cuentasArr.reduce((s: number, c: any) => s + (c.estado !== 'pagado' ? Number(c.saldo) || 0 : 0), 0)

            setData({ serviciosMes: ordsArr.length, kgMes: kgTotal, facturadoMes: facturado, porCobrar, ordenesHoy: hoyArr.length, manifiestos: mansArr.length })
            setOrdenes(Array.isArray(ultimas) ? ultimas.slice(0, 5) : [])

            const als: any[] = []
                ; (Array.isArray(flotaAlerts) ? flotaAlerts : []).forEach((v: any) => { als.push({ txt: `SOAT próximo/vencido: ${v.placa}`, type: 'error', tab: 'flota' }) })
                ; (Array.isArray(opAlerts) ? opAlerts : []).forEach((o: any) => { als.push({ txt: `Carnet sanidad: ${o.nombres}`, type: 'warning', tab: 'flota' }) })

            mansArr.filter((m: any) => Math.floor((Date.now() - new Date(m.fecha_generacion).getTime()) / 86400000) > 30).forEach((m: any) => {
                als.push({ txt: `Manifiesto sin cerrar >30 días`, type: 'error', tab: 'manifiestos' })
            })
            hoyArr.filter((o: any) => !o.vehiculo_id).forEach(() => { als.push({ txt: 'Orden hoy sin vehículo asignado', type: 'info', tab: 'ordenes' }) })

            setAlertas(als.slice(0, 5))
        } catch (e) {
            showToast('Error cargando dashboard', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { cargar() }, [])

    const h = new Date().getHours()
    const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
    const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const kpis = [
        { label: 'Servicios del Mes', val: data.serviciosMes, icon: TrendingUp, color: 'text-[#00c96e]', bg: 'bg-[#00c96e]/10', sub: '▲ +12% vs mes anterior', onClick: () => setActiveTab('ordenes') },
        { label: 'Kg Recolectados', val: data.kgMes, isKg: true, icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-100', sub: 'Total consolidado este mes', onClick: () => setActiveTab('ordenes') },
        { label: 'Facturado MTD', val: data.facturadoMes, isCurrency: true, icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-100', sub: 'Ingresos generados', onClick: () => setActiveTab('cobranzas') },
        { label: 'Por Cobrar', val: data.porCobrar, isCurrency: true, icon: WalletCards, color: data.porCobrar > 0 ? 'text-amber-600' : 'text-slate-600', bg: data.porCobrar > 0 ? 'bg-amber-100' : 'bg-slate-100', sub: 'Cuentas pendientes', onClick: () => setActiveTab('cobranzas') },
        { label: 'Órdenes Hoy', val: data.ordenesHoy, icon: CalendarClock, color: 'text-blue-600', bg: 'bg-blue-100', sub: 'Programadas para hoy', onClick: () => setActiveTab('ordenes') },
        { label: 'Manifiestos Activos', val: data.manifiestos, icon: FileWarning, color: data.manifiestos > 0 ? 'text-rose-600' : 'text-slate-600', bg: data.manifiestos > 0 ? 'bg-rose-100' : 'bg-slate-100', sub: 'Pendientes de cierre', onClick: () => setActiveTab('manifiestos') },
    ]

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{saludo}, Operador</h2>
                    <p className="text-slate-500 font-medium mt-1 capitalize">{fecha}</p>
                </div>
                <button
                    onClick={() => setActiveTab('ordenes')}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-slate-900/20 active:scale-95"
                >
                    <Package className="w-5 h-5" />
                    <span>Ver Órdenes de Hoy</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {kpis.map((k, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        onClick={k.onClick}
                        className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#00c96e]/30 cursor-pointer overflow-hidden transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <k.icon className="w-24 h-24" />
                        </div>

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${k.bg} ${k.color}`}>
                                <k.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{k.label}</h3>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {loading ? (
                                <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
                            ) : (
                                <div className={`text-4xl font-extrabold tracking-tight ${k.label === 'Servicios del Mes' ? 'text-slate-800' : k.color}`}>
                                    <CountUp end={k.val} isCurrency={k.isCurrency} isKg={k.isKg} />
                                </div>
                            )}
                            <p className="text-sm text-slate-500 font-medium mt-2">{k.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Últimas Órdenes */}
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800">Últimas Órdenes de Servicio</h3>
                        </div>
                        <button onClick={() => setActiveTab('ordenes')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                    <th className="px-5 py-4">N° OS</th>
                                    <th className="px-5 py-4">Cliente</th>
                                    <th className="px-5 py-4">Tipo Residuo</th>
                                    <th className="px-5 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={4} className="p-4"><div className="h-10 bg-slate-50 rounded-lg animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : ordenes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-slate-500 font-medium">
                                            No hay órdenes recientes.
                                        </td>
                                    </tr>
                                ) : (
                                    ordenes.map((o: any) => (
                                        <tr key={o.id} onClick={() => setActiveTab('ordenes')} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                                            <td className="px-5 py-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">#{o.numero}</td>
                                            <td className="px-5 py-4 font-medium text-slate-600 max-w-[200px] truncate">{o.eco_clientes?.razon_social || '—'}</td>
                                            <td className="px-5 py-4">{ecoBadge(o.tipo_residuo)}</td>
                                            <td className="px-5 py-4">{ecoEstadoBadge(o.estado)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alertas Operativas */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <h3 className="text-lg font-bold text-slate-800">Alertas Operativas</h3>
                    </div>

                    <div className="p-5 flex-1 overflow-auto">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : alertas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-emerald-600 font-bold text-lg">Todo en orden</h4>
                                    <p className="text-slate-500 text-sm mt-1">No hay alertas críticas que requieran atención.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alertas.map((a, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${a.type === 'error' ? 'bg-rose-50 border-rose-100' :
                                                a.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                                                    'bg-blue-50 border-blue-100'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 ${a.type === 'error' ? 'text-rose-600' :
                                                    a.type === 'warning' ? 'text-amber-600' :
                                                        'text-blue-600'
                                                }`}>
                                                {a.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                                    a.type === 'warning' ? <Clock className="w-5 h-5" /> :
                                                        <Activity className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold mb-1 ${a.type === 'error' ? 'text-rose-900' :
                                                        a.type === 'warning' ? 'text-amber-900' :
                                                            'text-blue-900'
                                                    }`}>
                                                    {a.txt}
                                                </p>
                                                <button
                                                    onClick={() => setActiveTab(a.tab)}
                                                    className={`text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1 ${a.type === 'error' ? 'text-rose-600' :
                                                            a.type === 'warning' ? 'text-amber-600' :
                                                                'text-blue-600'
                                                        }`}
                                                >
                                                    Resolver <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    )
}
