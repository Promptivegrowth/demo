'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HardHat, Plus, Search, X, Save, Loader2,
    Trash2, Edit3, Phone, Mail, MapPin, DollarSign, User, Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const ROLES = ['operario', 'oficial', 'peon', 'maestro', 'supervisor', 'ingeniero', 'administrativo', 'vigilante']
const EMPTY_FORM = {
    nombres: '', apellidos: '', dni: '', rol: 'operario',
    telefono: '', email: '', fecha_ingreso: new Date().toISOString().split('T')[0],
    salario_diario: '', banco: '', cuenta: '',
    estado: 'activo', proyecto_id: '', especialidad: ''
}

export function TabPersonal() {
    const [personal, setPersonal] = useState<any[]>([])
    const [proyectos, setProyectos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRol, setFilterRol] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedPerson, setSelectedPerson] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ ...EMPTY_FORM })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: p }, { data: proy }] = await Promise.all([
            supabase.from('con_personal').select('*, con_proyectos(nombre)').order('apellidos'),
            supabase.from('con_proyectos').select('id, nombre').order('nombre')
        ])
        if (p) setPersonal(p)
        if (proy) setProyectos(proy)
        setLoading(false)
    }

    const filtered = personal.filter(p =>
        (`${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.dni?.includes(searchTerm)) &&
        (filterRol ? p.rol === filterRol : true)
    )

    function openNew() {
        setForm({ ...EMPTY_FORM })
        setEditingId(null)
        setShowModal(true)
    }

    function openEdit(p: any) {
        setForm({
            nombres: p.nombres || '', apellidos: p.apellidos || '', dni: p.dni || '',
            rol: p.rol || 'operario', telefono: p.telefono || '', email: p.email || '',
            fecha_ingreso: p.fecha_ingreso || '', salario_diario: p.salario_diario || '',
            banco: p.banco || '', cuenta: p.cuenta || '', estado: p.estado || 'activo',
            proyecto_id: p.proyecto_id || '', especialidad: p.especialidad || ''
        })
        setEditingId(p.id)
        setShowModal(true)
        setSelectedPerson(null)
    }

    async function handleSave() {
        if (!form.nombres || !form.apellidos) { toast.error('Nombres y apellidos son obligatorios'); return }
        setSaving(true)
        const payload = { ...form, salario_diario: parseFloat(String(form.salario_diario)) || 0, proyecto_id: form.proyecto_id || null }
        let error: any
        if (editingId) {
            const res = await supabase.from('con_personal').update(payload).eq('id', editingId)
            error = res.error
        } else {
            const res = await supabase.from('con_personal').insert([payload])
            error = res.error
        }
        setSaving(false)
        if (error) { toast.error(error.message) } else {
            toast.success(editingId ? 'Trabajador actualizado' : 'Trabajador registrado')
            setShowModal(false); load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_personal').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Trabajador eliminado'); setSelectedPerson(null); load()
        }
    }

    const rolColor: Record<string, string> = {
        ingeniero: 'bg-blue-100 text-blue-700',
        supervisor: 'bg-purple-100 text-purple-700',
        maestro: 'bg-amber-100 text-amber-700',
        operario: 'bg-slate-100 text-slate-600',
        oficial: 'bg-orange-100 text-orange-700',
        peon: 'bg-stone-100 text-stone-600',
        administrativo: 'bg-teal-100 text-teal-700',
        vigilante: 'bg-red-100 text-red-700',
    }

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Personal', val: personal.length },
                    { label: 'Activos', val: personal.filter(p => p.estado === 'activo').length },
                    { label: 'Planilla Día', val: `S/ ${personal.filter(p => p.estado === 'activo').reduce((a, p) => a + (parseFloat(p.salario_diario) || 0), 0).toFixed(0)}` },
                    { label: 'Planilla Mes', val: `S/ ${(personal.filter(p => p.estado === 'activo').reduce((a, p) => a + (parseFloat(p.salario_diario) || 0), 0) * 26).toFixed(0)}` },
                ].map(item => (
                    <div key={item.label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-2xl font-black text-slate-900">{item.val}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Buscar por nombre o DNI..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                    </div>
                    <select value={filterRol} onChange={e => setFilterRol(e.target.value)}
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none capitalize shadow-sm">
                        <option value="">Todos los roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Nuevo Trabajador
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? [1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-3xl" />)
                    : filtered.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-slate-400">
                            <HardHat className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-lg">Sin trabajadores registrados</p>
                            <button onClick={openNew} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">Registrar primer trabajador</button>
                        </div>
                    ) : filtered.map(p => (
                        <motion.div key={p.id} layout whileHover={{ y: -4 }}
                            className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                            onClick={() => setSelectedPerson(p)}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-sm shrink-0">
                                    {(p.nombres[0] || '') + (p.apellidos[0] || '')}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{p.nombres} {p.apellidos}</h4>
                                    <p className="text-[10px] text-slate-400">DNI: {p.dni || 'N/A'}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${rolColor[p.rol] || 'bg-slate-100 text-slate-500'}`}>{p.rol}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-500">
                                {p.telefono && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{p.telefono}</div>}
                                {p.con_proyectos?.nombre && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{p.con_proyectos.nombre}</div>}
                                <div className="flex items-center gap-2"><DollarSign className="w-3 h-3 text-emerald-400" />
                                    <span className="font-bold text-slate-700">S/ {(parseFloat(p.salario_diario) || 0).toFixed(2)}/día</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                                <span className={`text-[9px] font-black uppercase ${p.estado === 'activo' ? 'text-emerald-500' : 'text-slate-400'}`}>{p.estado}</span>
                                <button onClick={e => { e.stopPropagation(); openEdit(p) }} className="opacity-0 group-hover:opacity-100 text-xs font-bold text-blue-500 hover:text-blue-700 transition-all flex items-center gap-1">
                                    <Edit3 className="w-3 h-3" /> Editar
                                </button>
                            </div>
                        </motion.div>
                    ))}
            </div>

            {/* Modal Crear/Editar */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center px-8 py-6 border-b">
                                <h3 className="text-xl font-black text-slate-900">{editingId ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Nombres *', name: 'nombres' },
                                        { label: 'Apellidos *', name: 'apellidos' },
                                        { label: 'DNI', name: 'dni' },
                                        { label: 'Rol / Cargo', name: 'rol', options: ROLES.map(r => ({ value: r, label: r })) },
                                        { label: 'Especialidad', name: 'especialidad' },
                                        { label: 'Estado', name: 'estado', options: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }, { value: 'suspendido', label: 'Suspendido' }] },
                                        { label: 'Teléfono', name: 'telefono' },
                                        { label: 'Email', name: 'email', type: 'email' },
                                        { label: 'Fecha Ingreso', name: 'fecha_ingreso', type: 'date' },
                                        { label: 'Salario Diario (S/)', name: 'salario_diario', type: 'number' },
                                        { label: 'Banco', name: 'banco' },
                                        { label: 'Cuenta Bancaria', name: 'cuenta' },
                                    ].map(({ label, name, type, options }: any) => (
                                        <div key={name}>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                                            {options ? (
                                                <select value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white capitalize">
                                                    {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            ) : (
                                                <input type={type || 'text'} value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                                            )}
                                        </div>
                                    ))}
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proyecto Asignado</label>
                                        <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                            <option value="">-- Sin proyecto --</option>
                                            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Registrar Trabajador')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalle */}
            <AnimatePresence>
                {selectedPerson && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedPerson(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="bg-slate-900 text-white p-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl">
                                            {(selectedPerson.nombres[0] || '') + (selectedPerson.apellidos[0] || '')}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">{selectedPerson.nombres} {selectedPerson.apellidos}</h3>
                                            <p className="text-slate-400 text-sm">DNI: {selectedPerson.dni || '—'}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${rolColor[selectedPerson.rol] || 'bg-white/10 text-white'}`}>{selectedPerson.rol}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedPerson(null)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Salario Diario', val: `S/ ${(parseFloat(selectedPerson.salario_diario) || 0).toFixed(2)}` },
                                        { label: 'Salario Mensual', val: `S/ ${((parseFloat(selectedPerson.salario_diario) || 0) * 26).toFixed(2)}` },
                                        { label: 'Ingreso', val: selectedPerson.fecha_ingreso || '—' },
                                        { label: 'Estado', val: selectedPerson.estado },
                                        { label: 'Proyecto', val: selectedPerson.con_proyectos?.nombre || '—' },
                                        { label: 'Especialidad', val: selectedPerson.especialidad || '—' },
                                    ].map(item => (
                                        <div key={item.label} className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                                {selectedPerson.banco && (
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Datos Bancarios</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedPerson.banco}: {selectedPerson.cuenta}</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => openEdit(selectedPerson)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700">
                                    <Edit3 className="w-4 h-4" /> Editar
                                </button>
                                <button onClick={() => handleDelete(selectedPerson.id)} className="px-5 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-bold hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
