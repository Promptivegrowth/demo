'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Plus, Search, HardHat,
    Calendar, ShieldCheck, AlertCircle,
    FileText, TrendingUp, DollarSign,
    CheckCircle2, XCircle, Clock, MoreVertical,
    Briefcase, Download, Trash2, Edit3, UserPlus
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'
import { toast } from 'sonner'

export function TabPersonal() {
    const [personal, setPersonal] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeSubTab, setActiveSubTab] = useState<'nomina' | 'asistencia' | 'planilla'>('nomina')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const { data } = await conQuery.getPersonal()
            if (data) setPersonal(data)
            setLoading(false)
        }
        load()
    }, [])

    const filtered = personal.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dni?.includes(searchTerm)
    )

    const PersonCard = ({ p }: { p: any }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                    <Users className="w-7 h-7" />
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${p.estado === 'activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {p.estado}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600">
                        <ShieldCheck className="w-3 h-3" /> SCTR Ok
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">{p.cargo}</p>
                <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{p.nombre}</h4>
                <p className="text-xs text-slate-400 font-medium">DNI: {p.dni}</p>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                    <span>Asignado: {p.proyecto || 'Sede Central'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-bold text-slate-900">S/ {p.sueldo_base?.toLocaleString()} / mes</span>
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Ver Perfil</button>
                <button className="p-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 rounded-xl transition-all">
                    <Edit3 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter italic mb-1">Capital Humano</h3>
                    <p className="text-slate-400 text-sm font-medium">Gestión de personal, asistencia y nóminas de obra.</p>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/5 relative z-10 shrink-0">
                    {[
                        { id: 'nomina', label: 'Plantel', icon: Users },
                        { id: 'asistencia', label: 'Asistencia', icon: Calendar },
                        { id: 'planilla', label: 'Planillas', icon: FileText }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveSubTab(t.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === t.id ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeSubTab === 'nomina' ? (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o DNI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                            <UserPlus className="w-4 h-4" /> Alta de Personal
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-[32px]" />)
                        ) : filtered.map((p) => <PersonCard key={p.id} p={p} />)}
                    </div>
                </div>
            ) : activeSubTab === 'asistencia' ? (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Registro Diario de Asistencia</h4>
                            <p className="text-sm text-slate-400 font-medium">Hoy: {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none">
                                <option>Todos los proyectos</option>
                                <option>Residencial Los Pinos</option>
                            </select>
                            <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Descargar Reporte</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal de Obra</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entrada</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Control Marcación</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {personal.map((p) => (
                                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">{p.nombre.charAt(0)}</div>
                                                <p className="text-sm font-bold text-slate-800">{p.nombre}</p>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-lg">{p.cargo}</span>
                                        </td>
                                        <td className="py-5 text-center">
                                            <span className="text-sm font-bold text-slate-900">07:58 AM</span>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><CheckCircle2 className="w-5 h-5" /></button>
                                                <button className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"><XCircle className="w-5 h-5" /></button>
                                                <button className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Clock className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase">Presente</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Payroll Summary Header */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
                            <DollarSign className="w-8 h-8 text-blue-500 mb-2" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Monto de Nómina</p>
                            <h4 className="text-xl font-black text-slate-900">S/ 45,820.00</h4>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
                            <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Bonificaciones</p>
                            <h4 className="text-xl font-black text-slate-900">S/ 2,450.00</h4>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
                            <Clock className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Horas Extras</p>
                            <h4 className="text-xl font-black text-slate-900">S/ 1,120.00</h4>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-3xl text-white flex flex-col items-center text-center shadow-xl shadow-slate-900/20">
                            <FileText className="w-8 h-8 text-blue-400 mb-2" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Acción</p>
                            <button className="text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">Cerrar Mes</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Planilla Detallada: Marzo 2025</h4>
                            <button className="px-6 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                <Download className="w-4 h-4" /> Exportar Boletas
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 italic">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Básico</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Bonos</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Descuentos</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Neto a Pagar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {personal.slice(0, 5).map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-5 font-bold text-slate-800 text-sm">{p.nombre}</td>
                                            <td className="py-5 text-right font-medium text-slate-500 text-sm">S/ {p.sueldo_base?.toLocaleString()}</td>
                                            <td className="py-5 text-right font-medium text-emerald-500 text-sm">+ S/ 250.00</td>
                                            <td className="py-5 text-right font-medium text-rose-500 text-sm">- S/ 0.00</td>
                                            <td className="py-5 text-right font-black text-slate-900 text-sm italic">S/ {(p.sueldo_base + 250).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
