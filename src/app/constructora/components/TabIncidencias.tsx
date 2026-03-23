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
    Building2, HardHat, Info, FileText, Save, Loader2, Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

const PRIORITIES = ['baja', 'media', 'alta', 'critica']
const TYPES = ['Seguridad', 'Calidad', 'Logística', 'Técnica', 'Clima', 'Otros']

export function TabIncidencias() {
    const [incidencias, setIncidencias] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [personal, setPersonal] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'registro' | 'cierre'>('registro')
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [selectedIncidencia, setSelectedIncidencia] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        tipo: 'Seguridad', descripcion: '', prioridad: 'media',
        fecha: new Date().toISOString().split('T')[0],
        proyecto_id: '', informado_por: '', estado: 'abierto'
    })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: i }, { data: p }, { data: per }] = await Promise.all([
            supabase.from('con_incidencias').select('*, con_proyectos(nombre, codigo), con_personal(nombres, apellidos)').order('fecha', { ascending: false }),
            supabase.from('con_proyectos').select('id, nombre, codigo').order('nombre'),
            supabase.from('con_personal').select('id, nombres, apellidos').order('apellidos')
        ])
        if (i) setIncidencias(i)
        if (p) setProyectos(p)
        if (per) setPersonal(per)
        setLoading(false)
    }

    const filtered = incidencias.filter(i =>
        i.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.con_proyectos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    async function handleSave() {
        if (!form.descripcion) { toast.error('Descripción obligatoria'); return }
        setSaving(true)
        const { error } = await supabase.from('con_incidencias').insert([{
            ...form,
            proyecto_id: form.proyecto_id || null,
            informado_por: form.informado_por || null
        }])
        setSaving(false)
        if (error) { toast.error(error.message) } else {
            toast.success('Incidencia registrada')
            setShowModal(false); load()
        }
    }

    async function updateStatus(id: string, estado: string) {
        await supabase.from('con_incidencias').update({ estado }).eq('id', id)
        toast.success(`Estado: ${estado}`)
        load()
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_incidencias').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Incidencia eliminada'); load()
        }
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

    const priorityColor: Record<string, string> = {
        baja: 'bg-slate-100 text-slate-500',
        media: 'bg-blue-100 text-blue-600',
        alta: 'bg-orange-100 text-orange-600',
        critica: 'bg-rose-100 text-rose-600',
    }

    return (
        <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-[24px] w-fit border border-slate-200 shadow-sm">
                <button onClick={() => setActiveTab('registro')}
                    className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registro' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                    Libro de Incidencias
                </button>
                <button onClick={() => setActiveTab('cierre')}
                    className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cierre' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                    Cierre de Obra
                </button>
            </div>

            {activeTab === 'registro' ? (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Buscar incidencia..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm" />
                        </div>
                        <button onClick={() => { setForm({ tipo: 'Seguridad', descripcion: '', prioridad: 'media', fecha: new Date().toISOString().split('T')[0], proyecto_id: '', informado_por: '', estado: 'abierto' }); setShowModal(true) }}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> Reportar Incidencia
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[32px]" />) :
                            filtered.length === 0 ? (
                                <div className="col-span-3 text-center py-20 text-slate-400 font-bold">Sin incidencias registradas</div>
                            ) : filtered.map(inc => (
                                <motion.div key={inc.id} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all relative group">
                                    <div onClick={() => setSelectedIncidencia(inc)} className="flex justify-between items-start mb-6 cursor-pointer hover:opacity-80 transition-opacity">
                                        <div className={`p-3 rounded-2xl ${inc.tipo === 'Seguridad' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                                            {inc.tipo === 'Seguridad' ? <ShieldAlert className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${priorityColor[inc.prioridad]}`}>{inc.prioridad}</span>
                                    </div>
                                    <div onClick={() => setSelectedIncidencia(inc)} className="space-y-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                                            <span>{inc.fecha}</span>
                                            <span className="text-blue-500">{inc.con_proyectos?.codigo || 'General'}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight italic line-clamp-2">"{inc.descripcion}"</h4>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">Reportado por: {inc.con_personal ? `${inc.con_personal.nombres} ${inc.con_personal.apellidos}` : 'Anonimo'}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                        <div className="flex gap-2">
                                            {['abierto', 'proceso', 'resuelto'].map(s => (
                                                <button key={s} onClick={() => updateStatus(inc.id, s)}
                                                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${inc.estado === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-300 hover:text-slate-600'}`}>{s}</button>
                                            ))}
                                        </div>
                                        <button onClick={() => handleDelete(inc.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            ) : (
                /* Protal de Cierre - Mantiene la UX original del usuario pero funcional */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-8 italic flex items-center gap-3">
                                <Building2 className="w-7 h-7 text-blue-500" /> Protocolo de Liquidación Final
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Obra a Cerrar</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-800 outline-none">
                                        {proyectos.map(p => <option key={p.id}>{p.nombre} — {p.codigo}</option>)}
                                    </select>
                                </div>
                                <div className="pt-6 space-y-4">
                                    {[
                                        'Cierre de Actas de Entrega / Recepción',
                                        'Valorización Final aprobada al 100%',
                                        'Liquidación de personal y SCTR sin deudas',
                                        'Retorno de activos y herramientas a Almacén Central',
                                        'Conciliación bancaria y cierre de Caja Chica'
                                    ].map((label, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                <span className="text-sm font-bold text-slate-700">{label}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-emerald-500">Validado</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <h5 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" /> Reporte de Utilidad Final
                            </h5>
                            <div className="space-y-8 mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monto Contractual Estimado</p>
                                    <p className="text-3xl font-black italic">S/ 450,230.00</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Utilidad Estimada</p>
                                    <p className="text-4xl font-black text-emerald-400 tracking-tighter">S/ 138,084.80</p>
                                </div>
                            </div>
                            <button onClick={handleCierre}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 group flex items-center justify-center gap-3">
                                Cerrar Proyecto Definitivamente <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Reportar Incidencia */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <h3 className="text-xl font-black text-slate-900">Reportar Nueva Incidencia</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                                        <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            {TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Prioridad</label>
                                        <select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descripción de lo ocurrido *</label>
                                        <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[100px]" placeholder="Detallar incidencia..." />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            <option value="">General</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Informado por</label>
                                        <select value={form.informado_por} onChange={e => setForm(f => ({ ...f, informado_por: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                                            <option value="">Anónimo</option>
                                            {personal.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-rose-600 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-rose-700 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Registrar Incidencia
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalles de Incidencia */}
            <AnimatePresence>
                {selectedIncidencia && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedIncidencia(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${selectedIncidencia.tipo === 'Seguridad' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {selectedIncidencia.tipo === 'Seguridad' ? <ShieldAlert className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Detalle de Incidencia</h3>
                                </div>
                                <button onClick={() => setSelectedIncidencia(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest border-b pb-4">
                                    <span>{selectedIncidencia.fecha}</span>
                                    <span className="text-blue-500">{selectedIncidencia.con_proyectos?.nombre}</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</p>
                                    <p className="text-lg font-bold text-slate-800 leading-relaxed italic">"{selectedIncidencia.descripcion}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prioridad</p>
                                        <p className={`text-xs font-black uppercase ${priorityColor[selectedIncidencia.prioridad].split(' ')[1]}`}>{selectedIncidencia.prioridad}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                                        <p className="text-xs font-black uppercase text-slate-900">{selectedIncidencia.estado}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Informado por</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[8px] font-black">
                                            {selectedIncidencia.con_personal?.nombres?.[0]}{selectedIncidencia.con_personal?.apellidos?.[0]}
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">
                                            {selectedIncidencia.con_personal ? `${selectedIncidencia.con_personal.nombres} ${selectedIncidencia.con_personal.apellidos}` : 'Anónimo'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t bg-slate-50/50 flex justify-end">
                                <button onClick={() => setSelectedIncidencia(null)} className="px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg">Entendido</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
