'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    X,
    MapIcon,
    Route,
    MapPin,
    Truck,
    Navigation2,
    CheckCircle2,
    Activity,
    Edit2,
    Power,
    ChevronRight,
    Map
} from 'lucide-react'

// MOCKS: Rutas de Lima Metropolitana si la BD está vacía
const MOCK_LIMA_ROUTES = [
    { id: 'm1', nombre: 'Ruta Industrial Sur L-1', origen: 'Villa El Salvador (Parque Industrial)', destino: 'Relleno Sanitario Portillo Grande', estado: 'activa', vehiculo_id: null, coords: { ox: 30, oy: 80, dx: 45, dy: 90 }, eco_flota: { placa: 'F-892' } },
    { id: 'm2', nombre: 'Ruta Comercial Centro', origen: 'San Isidro (Centro Financiero)', destino: 'Planta de Transferencia Callao', estado: 'activa', vehiculo_id: 'x', coords: { ox: 40, oy: 45, dx: 25, dy: 40 }, eco_flota: { placa: 'C-104' } },
    { id: 'm3', nombre: 'Ruta Hospitalaria Norte', origen: 'Independencia (Clínica Norte)', destino: 'Relleno Sanitario Zapallal', estado: 'activa', vehiculo_id: 'y', coords: { ox: 45, oy: 25, dx: 35, dy: 10 }, eco_flota: { placa: 'M-501' } },
    { id: 'm4', nombre: 'Ruta Residencial Este', origen: 'La Molina (Rinconada)', destino: 'Planta de Valorización Huachipa', estado: 'inactiva', vehiculo_id: null, coords: { ox: 70, oy: 50, dx: 65, dy: 35 }, eco_flota: null },
    { id: 'm5', nombre: 'Ruta Express Puerto', origen: 'Callao (Av. Argentina)', destino: 'Callao (GAM)', estado: 'activa', vehiculo_id: 'z', coords: { ox: 20, oy: 45, dx: 15, dy: 50 }, eco_flota: { placa: 'T-999' } }
]

const routeColors = ['#00c96e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']

export default function TabEcoRutas({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [vehiculos, setVehiculos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [modal, setModal] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [activeRouteId, setActiveRouteId] = useState<string | null>(null)

    const cargar = async () => {
        setLoading(true)
        const [rts, vehi] = await Promise.all([
            ecoQuery('eco_rutas', { select: '*,eco_flota(placa,tipo)', filters: ['order=created_at.desc'] }),
            ecoQuery('eco_flota', { select: 'id,placa,tipo', filters: ['estado=eq.activo'] })
        ])
        let arr = Array.isArray(rts) ? rts : []
        if (arr.length === 0) arr = MOCK_LIMA_ROUTES

        setData(arr); setFiltrado(arr)
        setVehiculos(Array.isArray(vehi) ? vehi : [])
        if (arr.length > 0) setActiveRouteId(arr[0].id)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string) => {
        let res = lista
        if (busq) {
            const b = busq.toLowerCase()
            res = res.filter((c: any) => c.nombre?.toLowerCase().includes(b) || c.origen?.toLowerCase().includes(b) || c.destino?.toLowerCase().includes(b))
        }
        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v) }

    const rActivas = data.filter(c => c.estado === 'activa').length
    const rInactivas = data.filter(c => c.estado === 'inactiva').length
    const vehiAsignados = new Set(data.filter(c => c.vehiculo_id || c.eco_flota).map(c => c.vehiculo_id)).size

    // Mock map rendering with SVG curves
    const renderMockMap = () => {
        const activeRoute = filtrado.find(r => r.id === activeRouteId) || filtrado[0]
        if (!activeRoute) return <div className="h-full flex items-center justify-center text-slate-400">Sin datos geográficos</div>

        return (
            <div className="relative w-full h-[400px] xl:h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                {/* Fake Map Grid Background */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>

                {/* Overlay Text */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">SATÉLITE LIMA METROPOLITANA // LIVE TRACKING</span>
                </div>

                <svg className="absolute inset-0 w-full h-full z-10">
                    <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00c96e" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    {filtrado.map((r, i) => {
                        const ox = r.coords?.ox || 10 + (i * 15); const oy = r.coords?.oy || 20 + (i * 10);
                        const dx = r.coords?.dx || 80 - (i * 10); const dy = r.coords?.dy || 80 - (i * 5);
                        const isAct = r.id === activeRouteId;
                        const color = routeColors[i % routeColors.length];

                        return (
                            <g key={r.id} className="transition-all duration-500">
                                <path
                                    d={`M ${ox}% ${oy}% Q ${(ox + dx) / 2}% ${(oy + dy) / 2 - 20}% ${dx}% ${dy}%`}
                                    fill="none"
                                    stroke={isAct ? 'url(#routeGradient)' : '#334155'}
                                    strokeWidth={isAct ? 4 : 2}
                                    strokeDasharray={isAct ? "8, 6" : "0"}
                                    className={`${isAct ? 'animate-[dash_2s_linear_infinite]' : ''}`}
                                />
                                {/* Origin Node */}
                                <circle cx={`${ox}%`} cy={`${oy}%`} r={isAct ? 8 : 4} fill={isAct ? '#00c96e' : '#475569'} className="transition-all" />
                                {isAct && <circle cx={`${ox}%`} cy={`${oy}%`} r={16} fill="#00c96e" opacity="0.2" className="animate-ping" />}

                                {/* Dest Node */}
                                <circle cx={`${dx}%`} cy={`${dy}%`} r={isAct ? 8 : 4} fill={isAct ? '#3b82f6' : '#475569'} className="transition-all" />
                                {isAct && <circle cx={`${dx}%`} cy={`${dy}%`} r={16} fill="#3b82f6" opacity="0.2" className="animate-ping" />}

                                {/* Mini Truck Icon moving */}
                                {isAct && r.estado === 'activa' && (
                                    <motion.circle
                                        r={4} fill="#fff"
                                        animate={{
                                            offsetDistance: ["0%", "100%"]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        style={{ offsetPath: `path('M ${ox * 8} ${oy * 4} Q ${(ox + dx) * 4} ${(oy + dy) * 2 - 80} ${dx * 8} ${dy * 4}')` }}
                                    />
                                )}
                            </g>
                        )
                    })}
                </svg>

                {/* Details Overlay bottom */}
                <div className="absolute bottom-6 left-6 right-6 z-20 bg-black/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${activeRoute.estado === 'activa' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {activeRoute.estado === 'activa' ? <CheckCircle2 className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                            {activeRoute.estado}
                        </span>
                        <h4 className="text-xl font-bold text-white">{activeRoute.nombre}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-300">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-400" /> {activeRoute.origen}</span>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-400" /> {activeRoute.destino}</span>
                        </div>
                    </div>
                    {activeRoute.eco_flota && (
                        <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 text-center shrink-0">
                            <div className="flex items-center justify-center gap-2 text-indigo-400 mb-1"><Truck className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Unidad en Ruta</span></div>
                            <span className="text-xl font-mono font-bold text-white tracking-widest">{activeRoute.eco_flota.placa}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <style jsx global>{`
                @keyframes dash { to { stroke-dashoffset: -28; } }
            `}</style>

            {/* Cabecera y KPIs */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* Left side Map & Visuals */}
                <div className="w-full xl:w-7/12 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                <MapIcon className="w-6 h-6 text-[#00c96e]" /> Control de Rutas
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Planimetría y trazos logísticos de recolección georreferenciados.</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[400px]">
                        {renderMockMap()}
                    </div>
                </div>

                {/* Right side List & Actions */}
                <div className="w-full xl:w-5/12 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#00c96e]/50 transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rutas Operativas</p>
                            <p className="text-3xl font-black text-[#00c96e] mt-1">{rActivas}</p>
                            <Navigation2 className="w-16 h-16 absolute -right-4 -bottom-4 text-[#00c96e] opacity-5 group-hover:opacity-20 transition-all" />
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Flota Enrutada</p>
                            <p className="text-3xl font-black text-indigo-500 mt-1">{vehiAsignados}</p>
                            <Truck className="w-16 h-16 absolute -right-4 -bottom-4 text-indigo-500 opacity-5 group-hover:opacity-20 transition-all" />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    className="w-full bg-white border border-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-[#00c96e]/20"
                                    placeholder="Clave de ruta..."
                                    value={buscar} onChange={e => handleBuscar(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 max-h-[500px]">
                            {filtrado.map((r, i) => (
                                <button
                                    key={r.id}
                                    onClick={() => setActiveRouteId(r.id)}
                                    className={`w-full text-left p-4 border-b border-slate-100 flex items-start gap-3 transition-colors ${activeRouteId === r.id ? 'bg-[#00c96e]/5' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="w-8 h-8 rounded-full border-4 border-white shadow flex-shrink-0" style={{ backgroundColor: routeColors[i % routeColors.length] }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{r.nombre}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 truncate">
                                            <span>{r.origen.substring(0, 12)}...</span> <ChevronRight className="w-3 h-3" /> <span>{r.destino.substring(0, 12)}...</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        {r.estado === 'activa' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Power className="w-4 h-4 text-rose-500" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
