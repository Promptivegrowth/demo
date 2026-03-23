'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle, Plus, Search, Filter,
    MapPin, Clock, ShieldAlert, Zap,
    CloudRain, Settings, CheckCircle2,
    ChevronRight, ArrowRight, Camera,
    Paperclip, MoreVertical, Flag,
    TrendingUp, BarChart3, Trophy, X,
    Building2, HardHat, Info, FileText
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export function TabIncidencias() {
    const [incidencias, setIncidencias] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'registro' | 'cierre'>('registro')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const { data } = await conQuery.getIncidencias()
            if (data) setIncidencias(data)
            setLoading(false)
        }
        load()
    }, [])

    const ImpactBadge = ({ impact }: { impact: string }) => {
        const config: any = {
            bajo: { bg: 'bg-slate-100', text: 'text-slate-500', icon: Clock },
            medio: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Info },
            alto: { bg: 'bg-amber-100', text: 'text-amber-600', icon: AlertTriangle },
            critico: { bg: 'bg-rose-100', text: 'text-rose-600', icon: ShieldAlert },
        }
        const s = config[impact?.toLowerCase()] || config.bajo
        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.text}`}>
                <s.icon className="w-3 h-3" /> {impact}
            </span>
        )
    }

    const handleCierre = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b']
        })
        toast.success('¡Proyecto Cerrado Exitosamente!', {
            description: 'Se ha generado el reporte de liquidación final.',
        })
    }

    return (
        <div className="space-y-6">
            {/* Tab Switcher Premium */}
            <div className="flex bg-slate-900/5 p-1 rounded-3xl border border-slate-200/50 w-fit">
                <button
                    onClick={() => setActiveTab('registro')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registro' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    Libro de Incidencias
                </button>
                <button
                    onClick={() => setActiveTab('cierre')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cierre' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    Cierre de Obra
                </button>
            </div>

            {activeTab === 'registro' ? (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 max-w-2xl">
                            <div className="relative group flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar incidencia o proyecto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
                                />
                            </div>
                            <select className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm">
                                <option>Categoría: Todas</option>
                                <option>Seguridad</option>
                                <option>Técnica</option>
                                <option>Logística</option>
                                <option>Clima</option>
                            </select>
                        </div>

                        <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> Reportar Incidencia
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[32px]" />)
                        ) : incidencias.map((inc) => (
                            <motion.div
                                key={inc.id}
                                whileHover={{ y: -5 }}
                                className="bg-white p-7 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${inc.categoria === 'Seguridad' ? 'bg-rose-50 text-rose-500' :
                                            inc.categoria === 'Técnica' ? 'bg-blue-50 text-blue-500' :
                                                inc.categoria === 'Logística' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                        {inc.categoria === 'Seguridad' ? <ShieldAlert className="w-6 h-6" /> :
                                            inc.categoria === 'Técnica' ? <Zap className="w-6 h-6" /> :
                                                inc.categoria === 'Logística' ? <Settings className="w-6 h-6" /> : <CloudRain className="w-6 h-6" />}
                                    </div>
                                    <ImpactBadge impact={inc.impacto} />
                                </div>

                                <div className="mb-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inc.fecha}</span>
                                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md">Proyecto: {inc.con_proyectos?.codigo}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 italic">"{inc.descripcion}"</h4>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-500"><Camera className="w-3.5 h-3.5" /></div>)}
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-400">+1</div>
                                    </div>
                                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                                        Gestionar <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Project Selection & Checklist */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-8 italic flex items-center gap-3">
                                <Building2 className="w-7 h-7 text-blue-500" /> Protocolo de Liquidación Final
                            </h4>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Seleccionar Obra a Cerrar</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20">
                                        <option>Residencial Los Pinos — PROY-001</option>
                                        <option>Torre Empresarial San Isidro — PROY-002</option>
                                    </select>
                                </div>

                                <div className="pt-6 space-y-4">
                                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Validaciones de Sistema (Checklist)</h5>
                                    {[
                                        { label: 'Cierre de Actas de Entrega / Recepción', status: 'ready' },
                                        { label: 'Valorización Final aprobada al 100%', status: 'ready' },
                                        { label: 'Liquidación de personal y SCTR sin deudas', status: 'ready' },
                                        { label: 'Retorno de activos y herramientas a Almacén Central', status: 'pending' },
                                        { label: 'Conciliación bancaria y cierre de Caja Chica', status: 'ready' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status === 'ready' ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 text-slate-300'}`}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <span className={`text-sm font-bold ${item.status === 'ready' ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</span>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'ready' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {item.status === 'ready' ? 'Validado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary & Final Button */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                            <h5 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" /> Reporte de Utilidad Final
                            </h5>

                            <div className="space-y-8 mb-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monto Contractual</p>
                                        <p className="text-3xl font-black italic tracking-tighter">S/ 450,230.00</p>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-800" />
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Costos Totales</p>
                                        <p className="text-xl font-black text-rose-400">S/ 312,145.20</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Margen Bruto</p>
                                        <p className="text-xl font-black text-emerald-400">30.6%</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Utilidad Estimada</p>
                                    <p className="text-4xl font-black text-emerald-400 tracking-tighter">S/ 138,084.80</p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 font-medium italic mb-8">
                                * Al cerrar el proyecto, todas las órdenes de compra y contratos asociados se marcarán como finalizados. No se permitirán más egresos a este centro de costos.
                            </p>

                            <button
                                onClick={handleCierre}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                Cerrar Proyecto Definitivamente <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6 group hover:bg-slate-50 transition-all cursor-pointer">
                            <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-sm font-black text-slate-900 uppercase tracking-wider">Certificado de Finalización</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Descargar formatoria oficial .PDF</p>
                            </div>
                            <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
