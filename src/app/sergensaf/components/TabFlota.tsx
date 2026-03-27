'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Plus, Search, CheckCircle, AlertTriangle, PenTool, X, ShieldAlert, BadgeInfo, Wrench, Trash2, User, Star, Calendar, MapPin, Navigation
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import dynamic from 'next/dynamic'

// Cargar Leaflet dinámicamente para evitar errores de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })


export default function TabFlota({ showToast }: { showToast: Function }) {
    const [activeSubTab, setActiveSubTab] = useState('unidades')
    const [flota, setFlota] = useState<any[]>([])
    const [viajes, setViajes] = useState<any[]>([])
    const [mantenimientos, setMantenimientos] = useState<any[]>([])
    const [conductores, setConductores] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [busqueda, setBusqueda] = useState('')

    // Estados para Modales
    const [modalUnidad, setModalUnidad] = useState<{ show: boolean, data?: any }>({ show: false })
    const [modalViaje, setModalViaje] = useState<{ show: boolean, data?: any }>({ show: false })
    const [modalMaint, setModalMaint] = useState<{ show: boolean, data?: any }>({ show: false })
    const [selectedUnitGps, setSelectedUnitGps] = useState<any>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const [fRes, vRes, mRes, cRes, lRes] = await Promise.all([
                supabase.from('saf_flota').select('*').order('placa'),
                supabase.from('saf_viajes').select('*, saf_conductores(nombres, apellidos), saf_flota:vehiculo_id(placa)').order('created_at', { ascending: false }),
                supabase.from('saf_mantenimientos').select('*, saf_flota:vehiculo_id(placa)').order('fecha', { ascending: false }),
                supabase.from('saf_conductores').select('*').order('apellidos'),
                supabase.from('saf_gps_ubicaciones').select('*').order('timestamp', { ascending: true })
            ])
            setFlota(fRes.data || [])
            setViajes(vRes.data || [])
            setMantenimientos(mRes.data || [])
            setConductores(cRes.data || [])
            setLocations(lRes.data || [])
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
                    {activeSubTab === 'unidades' && <SectionUnidades units={flota} drivers={conductores} showToast={showToast} refresh={fetchData} loading={loading} setModal={setModalUnidad} />}
                    {activeSubTab === 'viajes' && <SectionViajes viajes={viajes} showToast={showToast} refresh={fetchData} loading={loading} setModal={setModalViaje} />}
                    {activeSubTab === 'gps' && <SectionGPS units={flota} viajes={viajes} locations={locations} selectedUnit={selectedUnitGps} setSelectedUnit={setSelectedUnitGps} />}
                    {activeSubTab === 'mantenimiento' && <SectionMantenimiento maints={mantenimientos} units={flota} showToast={showToast} refresh={fetchData} loading={loading} setModal={setModalMaint} />}

                </motion.div>
            </AnimatePresence>

            {/* MODALES */}
            <ModalUnidad isOpen={modalUnidad.show} onClose={() => setModalUnidad({ show: false })} data={modalUnidad.data} showToast={showToast} refresh={fetchData} />
            <ModalViaje isOpen={modalViaje.show} onClose={() => setModalViaje({ show: false })} data={modalViaje.data} units={flota} drivers={conductores} showToast={showToast} refresh={fetchData} />
            <ModalMantenimiento isOpen={modalMaint.show} onClose={() => setModalMaint({ show: false })} data={modalMaint.data} units={flota} showToast={showToast} refresh={fetchData} />
        </div>
    )
}

// --- SUB-COMPONENTES (SECCIONES) ---

function SectionUnidades({ units, drivers, showToast, refresh, loading, setModal }: any) {
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
                <button
                    onClick={() => setModal({ show: true })}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors"
                >
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
                            <button
                                onClick={() => setModal({ show: true, data: u })}
                                className="flex-1 py-1.5 bg-[#30363d] hover:bg-[#484f58] text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                Detalles
                            </button>
                            <button
                                onClick={() => setModal({ show: true, data: u })}
                                className="px-2.5 py-1.5 bg-[#f0a500]/10 text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0d1117] rounded-lg transition-all"
                            >
                                <PenTool className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SectionViajes({ viajes, showToast, refresh, loading, setModal }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-rajdhani font-bold text-white">Últimos Despachos y Viajes</h3>
                <button
                    onClick={() => setModal({ show: true })}
                    className="px-4 py-2 bg-[#1f6feb] hover:bg-[#1158c7] text-white font-bold rounded-lg text-sm transition-colors"
                >
                    Planificar Viaje
                </button>
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
                                    <button
                                        onClick={() => setModal({ show: true, data: v })}
                                        className="text-[#1f6feb] hover:underline font-bold text-xs"
                                    >
                                        Ver Hoja
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SectionGPS({ units, viajes, locations, selectedUnit, setSelectedUnit }: any) {
    const activeViaje = selectedUnit ? viajes.find((v: any) => v.vehiculo_id === selectedUnit.id && v.estado === 'en_curso') : null
    const unitLocations = selectedUnit ? locations.filter((l: any) => l.viaje_id === activeViaje?.id) : []
    const lastPos = unitLocations.length > 0 ? unitLocations[unitLocations.length - 1] : null
    const polyline = unitLocations.map((l: any) => [l.latitud, l.longitud])

    // Leaflet fix icon issues
    const [L, setL] = useState<any>(null)
    useEffect(() => {
        import('leaflet').then(leaflet => {
            setL(leaflet)
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            })
        })
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Link to Leaflet CSS */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

            <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-[#30363d] bg-black/20">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-[#f0a500]" /> Unidades Activas
                    </h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {units.map((u: any) => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUnit(u)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group ${selectedUnit?.id === u.id ? 'bg-[#f0a500]/10 border-[#f0a500] shadow-[0_0_15px_rgba(240,165,0,0.1)]' : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className={`font-bold ${selectedUnit?.id === u.id ? 'text-[#f0a500]' : 'text-white'}`}>{u.placa}</span>
                                {u.estado === 'en_ruta' && <div className="w-2 h-2 bg-[#238636] rounded-full animate-pulse" />}
                            </div>
                            <div className="flex justify-between mt-1 items-center">
                                <p className="text-[10px] text-[#8b949e] uppercase font-semibold">{u.tipo || 'Unidad'}</p>
                                <span className="text-[10px] text-[#238636] font-bold">{u.estado === 'en_ruta' ? 'ONLINE' : ''}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-3 bg-[#0d1117] border border-[#30363d] rounded-2xl relative overflow-hidden group shadow-2xl">
                {typeof window !== 'undefined' && L && MapContainer && (
                    <MapContainer
                        center={lastPos ? [lastPos.latitud, lastPos.longitud] : [-12.046374, -77.042793]}
                        zoom={13}
                        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        {lastPos && (
                            <Marker position={[lastPos.latitud, lastPos.longitud]}>
                                <Popup>
                                    <div className="text-black font-rajdhani">
                                        <p className="font-bold text-sm">{selectedUnit?.placa}</p>
                                        <p className="text-xs">Velocidad: {lastPos.velocidad_kmh?.toFixed(0)} km/h</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                        {polyline.length > 0 && <Polyline positions={polyline} color="#f0a500" weight={4} opacity={0.6} />}
                    </MapContainer>
                )}

                {!selectedUnit && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center p-8 text-center text-[#e6edf3]">
                        <div>
                            <MapPin className="h-12 w-12 text-[#f0a500] mx-auto mb-4 opacity-50" />
                            <h5 className="text-xl font-rajdhani font-bold text-white mb-2">Monitor GPS SERGENSAF</h5>
                            <p className="text-sm text-[#8b949e] max-w-xs">Selecciona una unidad de la lista para visualizar su ubicación en tiempo real y recorrido histórico.</p>
                        </div>
                    </div>
                )}

                {selectedUnit && (
                    <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d]/50 rounded-2xl flex items-center justify-between z-10 shadow-3xl text-[#e6edf3]">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-[#f0a500]/20 flex items-center justify-center border border-[#f0a500]/30 mr-2">
                                <Truck className="h-5 w-5 text-[#f0a500]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Unidad Seguida</p>
                                <h5 className="text-white font-bold">{selectedUnit.placa} - {selectedUnit.marca}</h5>
                                <p className="text-[10px] text-[#238636] font-bold">{activeViaje?.destino || 'Sin ruta activa'}</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-right border-r border-[#30363d] pr-6">
                                <p className="text-[10px] text-[#8b949e] uppercase font-bold">Velocidad</p>
                                <p className="text-lg font-rajdhani font-bold text-white">{lastPos?.velocidad_kmh?.toFixed(0) || 0} <span className="text-xs font-normal">km/h</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#f0a500] uppercase font-bold">Último Reporte</p>
                                <p className="text-sm font-bold text-white">{lastPos ? new Date(lastPos.timestamp).toLocaleTimeString() : '--:--'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function SectionMantenimiento({ maints, units, showToast, refresh, loading, setModal }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-rajdhani font-bold text-white">Programa de Mantenimientos</h3>
                    <p className="text-xs text-[#8b949e]">Control preventivo y correctivo de la flota</p>
                </div>
                <button
                    onClick={() => setModal({ show: true })}
                    className="px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
                >
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

// --- COMPONENTES DE MODAL (LOGICA FUNCIONAL) ---

function ModalWrapper({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-[#30363d]">
                    <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-6 text-[#e6edf3]">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

function ModalUnidad({ isOpen, onClose, data, showToast, refresh }: any) {
    const [formData, setFormData] = useState<any>({ placa: '', marca: '', modelo: '', año: 2024, capacidad_m3: 15, estado: 'disponible' })

    useEffect(() => {
        if (data) setFormData(data)
        else setFormData({ placa: '', marca: '', modelo: '', año: 2024, capacidad_m3: 15, estado: 'disponible' })
    }, [data, isOpen])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('saf_flota').upsert(formData)
            if (error) throw error
            showToast(data ? 'Unidad actualizada' : 'Unidad registrada', 'success')
            refresh()
            onClose()
        } catch (err: any) {
            showToast(err.message, 'error')
        }
    }

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={data ? 'Editar Unidad' : 'Registrar Nueva Unidad'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">Placa</label>
                        <input required value={formData.placa || ''} onChange={e => setFormData({ ...formData, placa: e.target.value.toUpperCase() })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:border-[#f0a500] outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">Estado</label>
                        <select value={formData.estado || 'disponible'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:border-[#f0a500] outline-none">
                            <option value="disponible">Disponible</option>
                            <option value="en_ruta">En Ruta</option>
                            <option value="mantenimiento">Mantenimiento</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">Marca</label>
                        <input value={formData.marca || ''} onChange={e => setFormData({ ...formData, marca: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:border-[#f0a500] outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">Modelo</label>
                        <input value={formData.modelo || ''} onChange={e => setFormData({ ...formData, modelo: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:border-[#f0a500] outline-none" />
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#30363d] text-white font-bold rounded-xl shadow-lg">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-[#f0a500] text-[#0d1117] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">Guardar Cambios</button>
                </div>
            </form>
        </ModalWrapper>
    )
}

function ModalViaje({ isOpen, onClose, data, units, drivers, showToast, refresh }: any) {
    const [formData, setFormData] = useState<any>({ vehiculo_id: '', conductor_id: '', destino: '', cliente: '', estado: 'en_curso' })

    useEffect(() => {
        if (data) setFormData(data)
        else setFormData({ vehiculo_id: '', conductor_id: '', destino: '', cliente: '', estado: 'en_curso' })
    }, [data, isOpen])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('saf_viajes').upsert(formData)
            if (error) throw error
            showToast('Operación exitosa', 'success')
            refresh()
            onClose()
        } catch (err: any) {
            showToast('Error al procesar viaje', 'error')
        }
    }

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Planificación de Viaje">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] text-[#8b949e] uppercase font-bold">Unidad (Placa)</label>
                    <select required value={formData.vehiculo_id || ''} onChange={e => setFormData({ ...formData, vehiculo_id: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm">
                        <option value="">Seleccionar Unidad</option>
                        {units.map((u: any) => <option key={u.id} value={u.id}>{u.placa} ({u.estado})</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-[#8b949e] uppercase font-bold">Conductor</label>
                    <select required value={formData.conductor_id || ''} onChange={e => setFormData({ ...formData, conductor_id: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white">
                        <option value="">Seleccionar Conductor</option>
                        {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Destino" value={formData.destino || ''} onChange={e => setFormData({ ...formData, destino: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white placeholder:text-[#8b949e]/50" />
                    <input placeholder="Cliente" value={formData.cliente || ''} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white placeholder:text-[#8b949e]/50" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#1f6feb] text-white font-bold rounded-xl mt-4 shadow-lg hover:brightness-110 transition-all">Confirmar Despacho</button>
            </form>
        </ModalWrapper>
    )
}

function ModalMantenimiento({ isOpen, onClose, data, units, showToast, refresh }: any) {
    const [formData, setFormData] = useState<any>({ vehiculo_id: '', tipo: 'Preventivo', descripcion: '', costo_soles: 0, estado: 'en_proceso' })

    useEffect(() => {
        if (data) setFormData(data)
        else setFormData({ vehiculo_id: '', tipo: 'Preventivo', descripcion: '', costo_soles: 0, estado: 'en_proceso' })
    }, [data, isOpen])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('saf_mantenimientos').upsert(formData)
            if (error) throw error
            showToast('Mantenimiento registrado', 'success')
            refresh()
            onClose()
        } catch (err: any) {
            showToast('Error', 'error')
        }
    }


    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Gestión de Mantenimiento">
            <form onSubmit={handleSubmit} className="space-y-4">
                <select required value={formData.vehiculo_id || ''} onChange={e => setFormData({ ...formData, vehiculo_id: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm">
                    <option value="">Seleccionar Unidad</option>
                    {units.map((u: any) => <option key={u.id} value={u.id}>{u.placa}</option>)}
                </select>

                <input placeholder="Tipo (ej. Aceite, Llantas)" value={formData.tipo || ''} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white placeholder:text-[#8b949e]/50" />
                <textarea placeholder="Descripción del trabajo..." value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white h-24 placeholder:text-[#8b949e]/50" />
                <div className="flex gap-4">
                    <input type="number" placeholder="Costo S/" value={formData.costo_soles || 0} onChange={e => setFormData({ ...formData, costo_soles: parseFloat(e.target.value) })} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white placeholder:text-[#8b949e]/50" />
                    <select value={formData.estado || 'en_proceso'} onChange={e => setFormData({ ...formData, estado: e.target.value })} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white">
                        <option value="en_proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>
                <button type="submit" className="w-full py-3 bg-[#f0a500] text-[#0d1117] font-bold rounded-xl mt-4 shadow-lg hover:brightness-110 transition-all">Guardar Registro</button>
            </form>
        </ModalWrapper>
    )
}

