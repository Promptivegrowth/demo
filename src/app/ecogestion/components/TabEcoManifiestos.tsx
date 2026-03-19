'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    X,
    FileCheck,
    CheckCircle2,
    CalendarClock,
    Truck,
    AlertCircle,
    Activity,
    FileText,
    ArrowRight,
    UserCircle,
    Building2,
    Lock
} from 'lucide-react'

const ecoEstadoBadge = (estado: string) => {
    const map: any = {
        generado: ['bg-blue-50 text-blue-600 border-blue-200', 'Generado', FileText],
        en_transito: ['bg-amber-50 text-amber-600 border-amber-200', 'En Tránsito', Truck],
        entregado: ['bg-indigo-50 text-indigo-600 border-indigo-200', 'En Planta', Building2],
        cerrado: ['bg-emerald-100 text-emerald-700 border-emerald-300', 'Cerrado', Lock],
    }
    const [style, txt, Icon] = map[estado] || ['bg-slate-50 text-slate-600 border-slate-200', estado, Activity]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
            <Icon className="w-3 h-3" /> {txt}
        </span>
    )
}

export default function TabEcoManifiestos({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [pillActivo, setPillActivo] = useState('Pendientes Cierre')

    const cargar = async () => {
        setLoading(true)
        const mans = await ecoQuery('eco_manifiestos', {
            select: '*,eco_ordenes(numero,eco_clientes(razon_social)),eco_operarios(nombres),eco_flota(placa)',
            filters: ['order=created_at.desc']
        })
        const arr = Array.isArray(mans) ? mans : []
        setData(arr)
        filtrar(arr, buscar, pillActivo)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string, pill: string) => {
        let res = lista
        if (busq) {
            const b = busq.toLowerCase()
            res = res.filter((c: any) => c.numero?.toLowerCase().includes(b) || c.eco_ordenes?.numero?.toLowerCase().includes(b) || c.eco_ordenes?.eco_clientes?.razon_social?.toLowerCase().includes(b))
        }

        if (pill === 'Pendientes Cierre') res = res.filter((c: any) => c.estado !== 'cerrado')
        else if (pill === 'Cerrados') res = res.filter((c: any) => c.estado === 'cerrado')
        else if (pill === 'En Tránsito') res = res.filter((c: any) => c.estado === 'en_transito')
        else if (pill === 'Observados (>30d)') {
            res = res.filter((m: any) => m.estado !== 'cerrado' && Math.floor((Date.now() - new Date(m.fecha_generacion).getTime()) / 86400000) > 30)
        }

        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v, pillActivo) }
    const handlePill = (p: string) => { setPillActivo(p); filtrar(data, buscar, p) }

    const setEstadoDirecto = async (id: string, st: string) => {
        if (!confirm(`¿Actualizar manifiesto a ${st}?`)) return
        await ecoQuery('eco_manifiestos', { update: { estado: st }, id })
        showToast(`Manifiesto actualizado a ${st}`, 'success'); cargar()
    }

    const pills = ['Todos', 'Pendientes Cierre', 'Cerrados', 'En Tránsito', 'Observados (>30d)']

    // KPI Data
    const total = data.length
    const pendientes = data.filter(c => c.estado !== 'cerrado').length
    const enTransito = data.filter(c => c.estado === 'en_transito').length
    const observados = data.filter((m: any) => m.estado !== 'cerrado' && Math.floor((Date.now() - new Date(m.fecha_generacion).getTime()) / 86400000) > 30).length
    const pctCierre = total ? Math.round(((total - pendientes) / total) * 100) : 0

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Cabecera y KPIs */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                <div className="xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <FileCheck className="w-6 h-6 text-[#00c96e]" />
                            Manifiestos MRyS
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Control del ciclo de vida documentario obligatorio por MINAM.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00c96e]/20 focus:border-[#00c96e] transition-all"
                                placeholder="Buscar por N° de Manifiesto u Orden (OS)..."
                                value={buscar} onChange={e => handleBuscar(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                    </div>
                </div>

                {/* Micro KPIs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-slate-400/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><FileText className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Firmas Pendientes</p>
                        <p className="text-4xl font-black text-slate-800 mt-1">{pendientes}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#00c96e]/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><CheckCircle2 className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasa de Cierre Anual</p>
                        <p className="text-4xl font-black text-[#00c96e] mt-1">{pctCierre}%</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><Truck className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Guías En Tránsito</p>
                        <p className="text-4xl font-black text-blue-500 mt-1">{enTransito}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500"><AlertCircle className="w-24 h-24" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fuera de Plazo MTC</p>
                        <p className="text-4xl font-black text-rose-500 mt-1">{observados}</p>
                    </div>
                </div>
            </div>

            {/* Listado Principal */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
                    {pills.map(p => {
                        const isA = pillActivo === p
                        return (
                            <button
                                key={p} onClick={() => handlePill(p)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isA ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    })}
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                                <th className="px-6 py-4 whitespace-nowrap">Documento MRyS</th>
                                <th className="px-6 py-4 whitespace-nowrap">OS y Procedencia</th>
                                <th className="px-6 py-4 whitespace-nowrap">Agente Operativo</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Trazabilidad (Dias)</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Estatus Legal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="p-6"><div className="h-12 bg-slate-50 rounded-xl animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filtrado.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3"><FileCheck className="w-6 h-6" /></div>
                                        <p className="font-semibold text-slate-700">Sin Manifiestos Visibles</p>
                                        <p className="text-sm mt-1">Acorde al filtro seleccionado, no existen documentos.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtrado.map((c: any) => {
                                    const days = Math.floor((Date.now() - new Date(c.fecha_generacion).getTime()) / 86400000)
                                    const isLate = c.estado !== 'cerrado' && days > 30

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800 font-mono tracking-wide">{c.numero}</p>
                                                <p className="text-xs text-slate-400 mt-1">EM: {c.fecha_generacion}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-indigo-600 font-mono text-sm mb-1">{c.eco_ordenes?.numero || 'S/OS'}</p>
                                                <p className="text-xs text-slate-600 font-semibold truncate max-w-[200px]" title={c.eco_ordenes?.eco_clientes?.razon_social}>
                                                    {c.eco_ordenes?.eco_clientes?.razon_social || 'Cliente Desconocido'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">{c.eco_flota?.placa || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs text-slate-500 font-medium">{c.eco_operarios?.nombres?.split(' ')[0] || 'Por Asignar'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {c.estado === 'cerrado' ? (
                                                    <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-1 rounded"><CheckCircle2 className="w-4 h-4 inline mr-1 -mt-0.5" /> OK</span>
                                                ) : (
                                                    <span className={`text-xl font-black ${isLate ? 'text-rose-500' : 'text-slate-700'}`}>
                                                        {days} <span className="text-xs font-bold text-slate-400">d</span>
                                                    </span>
                                                )}
                                                {isLate && (
                                                    <p className="text-[10px] font-bold text-rose-500 uppercase mt-1 animate-pulse tracking-wider">Multa MINAM</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    {ecoEstadoBadge(c.estado)}

                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {c.estado !== 'cerrado' && (
                                                            <>
                                                                <button
                                                                    onClick={() => setEstadoDirecto(c.id, 'en_transito')}
                                                                    className="px-2 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded text-[10px] font-bold uppercase transition-colors"
                                                                >
                                                                    Tránsito
                                                                </button>
                                                                <button
                                                                    onClick={() => setEstadoDirecto(c.id, 'cerrado')}
                                                                    className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded flex items-center gap-1 text-[10px] font-bold uppercase transition-colors"
                                                                >
                                                                    <Lock className="w-3 h-3" /> Cerrar Ciclo
                                                                </button>
                                                            </>
                                                        )}
                                                        {c.estado === 'cerrado' && (
                                                            <button
                                                                onClick={() => setEstadoDirecto(c.id, 'generado')}
                                                                className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded flex items-center gap-1 text-[10px] font-bold uppercase transition-colors"
                                                                title="Reabrir Expediente y Corregir"
                                                            >
                                                                Reaperturar
                                                            </button>
                                                        )}
                                                    </div>
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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </motion.div>
    )
}
