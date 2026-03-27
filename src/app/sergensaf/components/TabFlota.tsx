'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Plus, Search, CheckCircle, AlertTriangle, PenTool, X, ShieldAlert, BadgeInfo, Wrench, Trash2, User, Star, Calendar
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabFlota({ showToast }: { showToast: Function }) {
    const [activeSubTab, setActiveSubTab] = useState('unidades')
    const [flota, setFlota] = useState<any[]>([])
    const [viajes, setViajes] = useState<any[]>([])
    const [mantenimientos, setMantenimientos] = useState<any[]>([])
    const [conductores, setConductores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [fRes, vRes, mRes, cRes] = await Promise.all([
                supabase.from('saf_flota').select('*').order('placa'),
                supabase.from('saf_viajes').select('*, saf_conductores(nombres, apellidos), saf_flota(placa)').order('created_at', { ascending: false }),
                supabase.from('saf_mantenimientos').select('*, saf_flota(placa)').order('fecha', { ascending: false }),
                supabase.from('saf_conductores').select('*').order('apellidos')
            ])

            if (fRes.error) throw fRes.error
            setFlota(fRes.data || [])
            setViajes(vRes.data || [])
            setMantenimientos(mRes.data || [])
            setConductores(cRes.data || [])
        } catch (err: any) {
            showToast('Error cargando datos de flota', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* SUB-NAVBAR */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-0">
                <div className="flex gap-8">
                    {[
                        { id: 'unidades', label: 'Unidades', icon: Truck },
                        { id: 'viajes', label: 'Viajes / Despachos', icon: Calendar },
                        { id: 'gps', label: 'Live GPS', icon: PenTool }, // Usando PenTool como placeholder de GPS icon si no hay uno mejor en el set inicial
                        { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-all relative ${activeSubTab === tab.id ? 'text-[#f0a500]' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {activeSubTab === tab.id && (
                                <motion.div layoutId="activeSubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0a500]" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="pb-4">
                    <button onClick={() => fetchData()} className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors">
                        Sincronizar Datos
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeSubTab === 'unidades' && <SectionUnidades units={flota} drivers={conductores} showToast={showToast} refresh={fetchData} loading={loading} />}
                    {activeSubTab === 'viajes' && <SectionViajes viajes={viajes} showToast={showToast} refresh={fetchData} loading={loading} />}
                    {activeSubTab === 'gps' && <SectionGPS units={flota} viajes={viajes} />}
                    {activeSubTab === 'mantenimiento' && <SectionMantenimiento maints={mantenimientos} units={flota} showToast={showToast} refresh={fetchData} loading={loading} />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// --- SUB-COMPONENTES (SECCIONES) ---

function SectionUnidades({ units, drivers, showToast, refresh, loading }: any) {
    const [busqueda, setBusqueda] = useState('')
    const filtered = units.filter((u: any) => u.placa.toLowerCase().includes(busqueda.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text" placeholder="Buscar por placa..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f0a500]"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors">
                    <Plus className="h-4 w-4" /> Registrar Unidad
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#f0a500] border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.map((u: any) => (
                    <div key={u.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#f0a500]/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-2xl font-rajdhani font-bold text-white tracking-widest">{u.placa}</span>
                                <p className="text-xs text-[#8b949e]">{u.marca} {u.modelo} ({u.año})</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.estado === 'disponible' ? 'bg-[#238636]/20 text-[#238636]' : u.estado === 'en_ruta' ? 'bg-[#1f6feb]/20 text-[#1f6feb]' : 'bg-[#da3633]/20 text-[#da3633]'}`}>
                                {u.estado.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-[#8b949e]">Kilometraje:</span>
                                <span className="text-white font-medium">{u.km_actual?.toLocaleString()} km</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-[#8b949e]">Capacidad:</span>
                                <span className="text-white font-medium">{u.capacidad_m3} m³</span>
                            </div>
                            <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden mt-4">
                                <div className="bg-[#f0a500] h-full" style={{ width: '65%' }}></div>
                            </div>
                            <p className="text-[10px] text-[#8b949e] mt-1 text-right">Próx. Mantenimiento: 2,400 km</p>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button className="flex-1 py-1.5 bg-[#30363d] hover:bg-[#484f58] text-white text-xs font-bold rounded-lg transition-colors">Detalles</button>
                            <button className="px-2.5 py-1.5 bg-[#f0a500]/10 text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0d1117] rounded-lg transition-all"><PenTool className="h-4 w-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SectionViajes({ viajes, showToast, refresh, loading }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-rajdhani font-bold text-white">Últimos Despachos y Viajes</h3>
                <button className="px-4 py-2 bg-[#1f6feb] hover:bg-[#1158c7] text-white font-bold rounded-lg text-sm transition-colors">Planificar Viaje</button>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-[#30363d]">
                        <tr>
                            <th className="px-6 py-4">ID / Fecha</th>
                            <th className="px-6 py-4">Unidad</th>
                            <th className="px-6 py-4">Conductor</th>
                            <th className="px-6 py-4">Destino / Cliente</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-[#8b949e]">Cargando historial...</td></tr>
                        ) : viajes.map((v: any) => (
                            <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-white font-bold">#{v.id?.split('-')[0]}</p>
                                    <p className="text-[10px] text-[#8b949e]">{new Date(v.created_at).toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4 text-[#f0a500] font-bold">{v.saf_flota?.placa}</td>
                                <td className="px-6 py-4 text-white">{v.saf_conductores?.nombres} {v.saf_conductores?.apellidos?.charAt(0)}.</td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-medium">{v.destino || 'Sin destino'}</p>
                                    <p className="text-[10px] text-[#8b949e] italic">{v.cliente || 'S/N'}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.estado === 'completado' ? 'bg-[#238636]/20 text-[#238636]' : v.estado === 'en_curso' ? 'bg-[#f0a500]/20 text-[#f0a500] animate-pulse' : 'bg-[#8b949e]/20 text-[#8b949e]'}`}>
                                        {v.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[#1f6feb] hover:underline font-bold text-xs">Ver Hoja</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SectionGPS({ units, viajes }: any) {
    const activeViaje = viajes.find((v: any) => v.estado === 'en_curso')

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Lista Unidades */}
            <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#30363d]">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Unidades Activas</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {units.map((u: any) => (
                        <div key={u.id} className={`p-3 rounded-lg border transition-all cursor-pointer ${u.estado === 'en_ruta' ? 'bg-[#1f6feb]/10 border-[#1f6feb]/40 shadow-[0_0_10px_rgba(31,111,235,0.2)]' : 'bg-[#0d1117] border-[#30363d]'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white">{u.placa}</span>
                                {u.estado === 'en_ruta' && <div className="w-2 h-2 bg-[#238636] rounded-full animate-ping" />}
                            </div>
                            <p className="text-[10px] text-[#8b949e] mt-1">{u.estado.replace('_', ' ')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mapa Placeholder */}
            <div className="lg:col-span-3 bg-[#0d1117] border border-[#30363d] rounded-xl relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-12.06,-77.03&zoom=12&size=1200x600&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:all|element:geometry|color:0x242f3e&style=feature:administrative|element:labels.text.fill|color:0x746855&style=feature:landscape|element:geometry|color:0x242f3e&style=feature:poi|element:geometry|color:0x2f3948&style=feature:road|element:geometry|color:0x38414e&style=feature:water|element:geometry|color:0x17263c&key=PLACEHOLDER')] bg-cover opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent"></div>

                {/* Mock Live Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ x: [200, 300, 250], y: [200, 150, 180] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute p-2 bg-[#f0a500] text-[#0d1117] rounded-full shadow-[0_0_20px_rgba(240,165,0,0.5)] border-2 border-white"
                    >
                        <Truck className="h-4 w-4" />
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 text-[#f0a500] text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">V3K-857 (65 km/h)</div>
                    </motion.div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#161b22]/90 backdrop-blur-md border border-[#30363d] rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">En Seguimiento</p>
                        <h5 className="text-white font-bold">{activeViaje ? `Unidad ${activeViaje.saf_flota?.placa} - ${activeViaje.destino}` : 'Sin seguimiento activo'}</h5>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-right">
                            <p className="text-[10px] text-[#8b949e]">Velocidad Promedio</p>
                            <p className="text-sm font-bold text-white">42 km/h</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-[#8b949e]">Próx. Arribo</p>
                            <p className="text-sm font-bold text-[#f0a500]">~15 min</p>
                        </div>
                    </div>
                </div>

                {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
                    <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-orange-500/30 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Requiere Google Maps API Key
                    </div>
                )}
            </div>
        </div>
    )
}

function SectionMantenimiento({ maints, units, showToast, refresh, loading }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-rajdhani font-bold text-white">Programa de Mantenimientos</h3>
                    <p className="text-xs text-[#8b949e]">Control preventivo y correctivo de la flota</p>
                </div>
                <button className="px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Programar Mantenimiento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maints.map((m: any) => (
                    <div key={m.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex gap-4 hover:border-[#f0a500]/50 transition-all">
                        <div className={`mt-1 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${m.estado === 'en_proceso' ? 'bg-[#f0a500]/10 border-[#f0a500]/30 text-[#f0a500]' : 'bg-[#30363d]/10 border-[#30363d] text-[#8b949e]'}`}>
                            <Wrench className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <h4 className="text-white font-bold">{m.tipo} - {m.saf_flota?.placa}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.estado === 'completado' ? 'bg-[#238636]/20 text-[#238636]' : 'bg-[#f0a500]/20 text-[#f0a500]'}`}>{m.estado}</span>
                            </div>
                            <p className="text-xs text-[#8b949e] line-clamp-2 mb-3">{m.descripcion}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
                                <span className="text-xs text-[#8b949e] flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(m.fecha).toLocaleDateString()}</span>
                                <span className="text-sm font-rajdhani font-bold text-white">S/ {m.costo_soles?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

