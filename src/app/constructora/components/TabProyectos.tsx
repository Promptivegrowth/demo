'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Filter, MoreVertical, HardHat,
    Calendar, MapPin, User, DollarSign, ChevronRight,
    FileText, TrendingUp, Layers, CheckCircle2, Clock,
    ArrowRight, Download, Upload, Copy, Trash2
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabProyectos() {
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('todos')
    const [searchTerm, setSearchTerm] = useState('')
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [selectedProy, setSelectedProy] = useState<any>(null)
    const [showNewModal, setShowNewModal] = useState(false)

    useEffect(() => {
        loadProyectos()
    }, [])

    async function loadProyectos() {
        setLoading(true)
        const { data, error } = await conQuery.getProyectos()
        if (!error && data) setProyectos(data)
        setLoading(false)
    }

    const filtered = proyectos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filter === 'todos' || p.estado === filter
        return matchesSearch && matchesFilter
    })

    const StatusBadge = ({ status }: { status: string }) => {
        const config: any = {
            en_ejecucion: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'En Ejecución' },
            aprobado: { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Aprobado' },
            en_presupuesto: { bg: 'bg-amber-100', text: 'text-amber-600', label: 'Presupuesto' },
            completado: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Completado' },
        }
        const s = config[status] || { bg: 'bg-slate-100', text: 'text-slate-500', label: status }
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${s.bg} ${s.text}`}>{s.label}</span>
    }

    return (
        <div className="space-y-6">
            {/* Top Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar proyecto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="hidden md:block bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="en_ejecucion">En Ejecución</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all"
                    >
                        {view === 'grid' ? <Layers className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Proyecto
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />)}
                </div>
            ) : filtered.length > 0 ? (
                <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filtered.map((proy) => (
                        <motion.div
                            key={proy.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedProy(proy)}
                            className="bg-white rounded-3xl border border-slate-200 p-6 cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                    <HardHat className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <StatusBadge status={proy.estado} />
                            </div>

                            {/* Info */}
                            <div className="space-y-1 mb-6">
                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{proy.codigo}</p>
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight h-12 line-clamp-2">{proy.nombre}</h4>
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{proy.distrito}, {proy.departamento}</span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-500">Avance Obra</span>
                                    <span className="text-slate-900">{proy.avance_porcentaje}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${proy.avance_porcentaje}%` }}
                                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Presupuesto</span>
                                    <span className="text-sm font-bold text-slate-900">S/ {proy.monto_contrato?.toLocaleString()}</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">JD</div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <HardHat className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium tracking-tight">No se encontraron proyectos</p>
                </div>
            )}

            {/* Modal: Detalle de Proyecto */}
            <AnimatePresence>
                {selectedProy && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProy(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 bg-slate-900 text-white shrink-0">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-blue-500 rounded-full text-[10px] font-black uppercase">{selectedProy.codigo}</span>
                                            <StatusBadge status={selectedProy.estado} />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight">{selectedProy.nombre}</h3>
                                        <p className="text-slate-400 text-sm flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> {selectedProy.ubicacion}, {selectedProy.distrito}
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedProy(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Sub-tabs */}
                            <div className="flex border-b border-slate-200 px-8 bg-slate-50 shrink-0 overflow-x-auto no-scrollbar">
                                {['Información', 'Partidas & Presupuesto', 'Valorizaciones', 'Documentos', 'Personal'].map((tab) => (
                                    <button key={tab} className={`px-4 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${tab === 'Información' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Col: Main Stats */}
                                    <div className="lg:col-span-2 space-y-8">
                                        <section>
                                            <h5 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-500" /> Resumen Económico
                                            </h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Prespuesto Base</p>
                                                    <p className="text-lg font-black text-slate-900">S/ {selectedProy.presupuesto_base?.toLocaleString()}</p>
                                                </div>
                                                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                                                    <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Monto Contrato</p>
                                                    <p className="text-lg font-black text-blue-600">S/ {selectedProy.monto_contrato?.toLocaleString()}</p>
                                                </div>
                                                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                                                    <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Utilidad Bruta Est.</p>
                                                    <p className="text-lg font-black text-emerald-600">S/ {(selectedProy.monto_contrato - selectedProy.presupuesto_base).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h5 className="text-slate-900 font-bold mb-4">Descripción del Proyecto</h5>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                                                "{selectedProy.descripcion || 'Sin descripción detallada disponible.'}"
                                            </p>
                                        </section>

                                        <section>
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-slate-900 font-bold">Partidas Créticas</h5>
                                                <button className="text-blue-500 text-xs font-bold uppercase transition-transform active:scale-95">Ver Todas</button>
                                            </div>
                                            <div className="space-y-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all cursor-pointer">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">{i}</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">Cimentación y Zapatas</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Estructuras — 420.00 m3</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-slate-900">85%</p>
                                                            <p className="text-[10px] text-emerald-500 font-bold uppercase">En Proceso</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Col: Personnel & Timeline */}
                                    <div className="space-y-8">
                                        <section className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl -mr-8 -mt-8 rounded-full" />
                                            <h5 className="font-bold mb-6 flex items-center gap-2 relative z-10 text-slate-300">
                                                <Calendar className="w-4 h-4" /> Timeline de Obra
                                            </h5>
                                            <div className="space-y-6 relative z-10">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        <div className="w-0.5 h-12 bg-slate-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Inicio de Obra</p>
                                                        <p className="text-[11px] text-slate-400 leading-tight">{selectedProy.fecha_inicio}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                        <div className="w-0.5 h-12 bg-slate-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Hito: Estructura</p>
                                                        <p className="text-[11px] text-slate-400 leading-tight">Programado: Mayo 2025</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 opacity-40">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 bg-slate-500 rounded-full" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Entrega Final</p>
                                                        <p className="text-[11px] text-slate-400 leading-tight">{selectedProy.fecha_fin_estimada}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                                            <h5 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-6">Staff Responsable</h5>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">RF</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{selectedProy.ingeniero_residente || 'Por asignar'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Residente de Obra</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer opacity-80">
                                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600 text-xs">CQ</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Carmen Quispe</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Gestión Administrativa</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <div className="flex gap-2">
                                            <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                                <Download className="w-4 h-4" /> Reporte PDF
                                            </button>
                                            <button className="p-4 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition-all">
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Nuevo Proyecto (Mock Excel Import) */}
            <AnimatePresence>
                {showNewModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Nuevo Proyecto</h3>
                                    <p className="text-sm text-slate-500">Configura una nueva obra en el sistema</p>
                                </div>
                                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <div className="space-y-6">
                                <section className="p-8 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-800">Importar Presupuesto (Excel/S10)</p>
                                        <p className="text-xs text-slate-400">Arrastra archivos .xlsx o .csv con las partidas de obra</p>
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Código Proyecto</label>
                                        <input type="text" placeholder="PROY-XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre Corto</label>
                                        <input type="text" placeholder="Ej: Residencial Los Olivos" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Cliente</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                                        <option>Seleccionar cliente...</option>
                                        <option>Inmobiliaria Pinos</option>
                                        <option>Andina SAC</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setShowNewModal(false)} className="flex-1 py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
                                    <button onClick={() => { toast.success('Proyecto creado correctamente'); setShowNewModal(false); }} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">Crear Proyecto</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function X({ className }: any) { return <XIcon className={className || "w-5 h-5"} /> }
import { X as XIcon } from 'lucide-react'
