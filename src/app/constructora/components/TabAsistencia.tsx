'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, CheckCircle2, XCircle, Clock, AlertCircle,
    Save, Loader2, Search, Filter, ChevronLeft, ChevronRight, UserCheck
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function TabAsistencia() {
    const [personal, setPersonal] = useState<any[]>([])
    const [asistencias, setAsistencias] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [filterProy, setFilterProy] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => { load() }, [date])

    async function load() {
        setLoading(true)
        const [{ data: p }, { data: a }, { data: proy }] = await Promise.all([
            supabase.from('con_personal').select('*, con_proyectos(nombre)').eq('estado', 'activo'),
            supabase.from('con_asistencia').select('*').eq('fecha', date),
            supabase.from('con_proyectos').select('id, nombre').order('nombre')
        ])
        if (p) setPersonal(p)
        if (a) setAsistencias(a)
        if (proy) setProyectos(proy)
        setLoading(false)
    }

    const filtered = personal.filter(p => filterProy ? p.proyecto_id === filterProy : true)

    async function handleMarcar(pid: string, estado: string) {
        setSaving(true)
        const existing = asistencias.find(a => a.personal_id === pid)
        if (existing) {
            await supabase.from('con_asistencia').update({ estado }).eq('id', existing.id)
        } else {
            await supabase.from('con_asistencia').insert([{ personal_id: pid, fecha: date, estado, hora_ingreso: '08:00' }])
        }
        await load()
        setSaving(false)
        toast.success('Asistencia actualizada')
    }

    async function handleHoraExtra(aid: string, horas: number) {
        await supabase.from('con_asistencia').update({ horas_extras: horas }).eq('id', aid)
        load()
    }

    const stats = {
        total: filtered.length,
        asistieron: asistencias.filter(a => a.estado === 'asistio').length,
        faltaron: asistencias.filter(a => a.estado === 'falto').length,
        tardanza: asistencias.filter(a => a.estado === 'tardanza').length,
    }

    return (
        <div className="space-y-6">
            {/* Calendar & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-2xl text-white">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="text-lg font-black text-slate-900 outline-none cursor-pointer" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Control de Asistencia Diaria</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <select value={filterProy} onChange={e => setFilterProy(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold outline-none">
                        <option value="">Todos los Proyectos</option>
                        {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'En Lista', val: stats.total, color: 'text-slate-900' },
                    { label: 'Asistencia', val: stats.asistieron, color: 'text-emerald-500' },
                    { label: 'Faltas', val: stats.faltaron, color: 'text-rose-500' },
                    { label: 'Tardanzas', val: stats.tardanza, color: 'text-amber-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>{['Trabajador', 'Rol / Proyecto', 'Marcación', 'H. Extras', ''].map(h => (
                                <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? [1, 2, 3, 4].map(i => <tr key={i}><td colSpan={5} className="px-6 py-4 h-16 animate-pulse bg-slate-50/50" /></tr>) :
                                filtered.map(p => {
                                    const asis = asistencias.find(a => a.personal_id === p.id)
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black">{p.nombres[0]}{p.apellidos[0]}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{p.nombres} {p.apellidos}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">{p.dni}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-medium text-slate-600 capitalize">{p.rol}</p>
                                                <p className="text-[10px] text-slate-400">{p.con_proyectos?.nombre || 'General'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {[
                                                        { id: 'asistio', icon: CheckCircle2, label: 'A', color: 'hover:bg-emerald-100 hover:text-emerald-600', active: 'bg-emerald-500 text-white' },
                                                        { id: 'falto', icon: XCircle, label: 'F', color: 'hover:bg-rose-100 hover:text-rose-600', active: 'bg-rose-500 text-white' },
                                                        { id: 'tardanza', icon: Clock, label: 'T', color: 'hover:bg-amber-100 hover:text-amber-600', active: 'bg-amber-500 text-white' },
                                                        { id: 'permiso', icon: AlertCircle, label: 'P', color: 'hover:bg-blue-100 hover:text-blue-600', active: 'bg-blue-500 text-white' },
                                                    ].map(opt => (
                                                        <button key={opt.id} onClick={() => handleMarcar(p.id, opt.id)}
                                                            className={`p-2 rounded-xl border border-slate-100 transition-all flex flex-col items-center gap-0.5 ${asis?.estado === opt.id ? opt.active : `bg-white text-slate-400 ${opt.color}`}`}>
                                                            <opt.icon className="w-4 h-4" />
                                                            <span className="text-[8px] font-black">{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <input type="number" min="0" max="8" value={asis?.horas_extras || 0}
                                                        onChange={e => handleHoraExtra(asis?.id, parseInt(e.target.value))}
                                                        disabled={!asis}
                                                        className="w-12 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-center outline-none disabled:opacity-30" />
                                                    <span className="text-[10px] font-bold text-slate-400">HRS</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {asis && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asis.hora_ingreso}</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
