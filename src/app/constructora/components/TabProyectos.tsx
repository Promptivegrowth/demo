'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2, Plus, Search, Grid, List, X,
    Calendar, DollarSign, TrendingUp, Save,
    Edit3, Trash2, Eye, MapPin, Users, Clock,
    CheckCircle2, AlertCircle, Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const TIPOS = ['vivienda', 'edificio', 'obra_civil', 'remodelacion', 'acabados', 'infraestructura']
const ESTADOS = ['planificacion', 'en_ejecucion', 'suspendido', 'concluido', 'liquidado']

const EMPTY_FORM = {
    codigo: '', nombre: '', tipo: 'vivienda', descripcion: '',
    fecha_inicio: '', fecha_fin_estimada: '', presupuesto_base: '',
    monto_contrato: '', avance_fisico: 0, estado: 'planificacion',
    distrito: '', departamento: 'Lima', cliente_id: ''
}

const colorEstado: Record<string, string> = {
    planificacion: 'bg-slate-100 text-slate-500',
    en_ejecucion: 'bg-blue-100 text-blue-600',
    suspendido: 'bg-amber-100 text-amber-600',
    concluido: 'bg-emerald-100 text-emerald-600',
    liquidado: 'bg-purple-100 text-purple-600',
}

export function TabProyectos() {
    const [proyectos, setProyectos] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filterEstado, setFilterEstado] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<any>({ ...EMPTY_FORM })
    const [saving, setSaving] = useState(false)
    const [selectedProy, setSelectedProy] = useState<any>(null)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const [{ data: p }, { data: c }] = await Promise.all([
            supabase.from('con_proyectos').select('*, con_clientes(razon_social)').order('created_at', { ascending: false }),
            supabase.from('con_clientes').select('id, razon_social').order('razon_social')
        ])
        if (p) setProyectos(p)
        if (c) setClientes(c)
        setLoading(false)
    }

    const filtered = proyectos.filter(p =>
        (p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterEstado ? p.estado === filterEstado : true)
    )

    function openNew() {
        setForm({ ...EMPTY_FORM })
        setEditingId(null)
        setShowModal(true)
    }

    function openEdit(p: any) {
        setForm({
            codigo: p.codigo || '', nombre: p.nombre || '', tipo: p.tipo || 'vivienda',
            descripcion: p.descripcion || '', fecha_inicio: p.fecha_inicio || '',
            fecha_fin_estimada: p.fecha_fin_estimada || '',
            presupuesto_base: p.presupuesto_base || '', monto_contrato: p.monto_contrato || '',
            avance_fisico: p.avance_fisico || 0, estado: p.estado || 'planificacion',
            distrito: p.distrito || '', departamento: p.departamento || 'Lima',
            cliente_id: p.cliente_id || ''
        })
        setEditingId(p.id)
        setShowModal(true)
        setSelectedProy(null)
    }

    async function handleSave() {
        if (!form.nombre.trim()) { toast.error('El nombre del proyecto es obligatorio'); return }
        setSaving(true)
        const payload = {
            ...form,
            presupuesto_base: parseFloat(form.presupuesto_base) || null,
            monto_contrato: parseFloat(form.monto_contrato) || null,
            avance_fisico: parseFloat(form.avance_fisico) || 0,
            cliente_id: form.cliente_id || null
        }
        let error: any
        if (editingId) {
            const res = await supabase.from('con_proyectos').update(payload).eq('id', editingId)
            error = res.error
        } else {
            const res = await supabase.from('con_proyectos').insert([payload])
            error = res.error
        }
        setSaving(false)
        if (error) { toast.error('Error: ' + error.message) } else {
            toast.success(editingId ? 'Proyecto actualizado' : 'Proyecto creado')
            setShowModal(false); load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_proyectos').delete().eq('id', id)
        if (error) { toast.error(error.message) } else {
            toast.success('Proyecto eliminado')
            setSelectedProy(null); load()
        }
    }

    const F = ({ label, name, type = 'text', options }: any) => (
        <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
            {options ? (
                <select value={form[name]} onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white capitalize">
                    <option value="">-- Seleccionar --</option>
                    {options.map((o: any) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea value={form[name]} onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))} rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            ) : (
                <input type={type} value={form[name]} onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Buscar proyecto..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                    </div>
                    <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none capitalize shadow-sm">
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}><Grid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}><List className="w-4 h-4" /></button>
                    <button onClick={openNew}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> Nuevo Proyecto
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {[1, 2, 3].map(i => <div key={i} className="h-52 bg-slate-200 animate-pulse rounded-3xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg">Sin proyectos registrados</p>
                    <button onClick={openNew} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">Crear primer proyecto</button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(p => (
                        <motion.div key={p.id} layout whileHover={{ y: -4 }}
                            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                            onClick={() => setSelectedProy(p)}>
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{p.codigo || 'SIN CÓDIGO'}</p>
                                    <h4 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-2">{p.nombre}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">{p.con_clientes?.razon_social || 'Sin cliente'}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0 ml-2 ${colorEstado[p.estado] || 'bg-slate-100 text-slate-500'}`}>{p.estado?.replace('_', ' ')}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-5">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                                    <span>Avance físico</span><span>{p.avance_fisico || 0}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                                        style={{ width: `${p.avance_fisico || 0}%` }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-emerald-400" />
                                    <span className="font-bold text-slate-800">S/ {(p.monto_contrato || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-blue-400" />
                                    <span>{p.distrito || p.departamento || 'Lima'}</span>
                                </div>
                                {p.fecha_inicio && (
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Calendar className="w-3 h-3 text-slate-300" />
                                        <span>Inicio: {new Date(p.fecha_inicio).toLocaleDateString('es-PE')}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {['Código', 'Proyecto', 'Cliente', 'Presupuesto', 'Avance', 'Estado', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => setSelectedProy(p)}>
                                    <td className="px-6 py-4 text-xs font-black text-blue-500">{p.codigo || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.nombre}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{p.con_clientes?.razon_social || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">S/ {(p.monto_contrato || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.avance_fisico || 0}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{p.avance_fisico || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${colorEstado[p.estado] || ''}`}>{p.estado?.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={e => { e.stopPropagation(); openEdit(p) }}
                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-blue-100 rounded-lg text-blue-500 transition-all">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear/Editar */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Completa la información del proyecto de construcción</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <F label="Código (ej: PROY-0001)" name="codigo" />
                                    <F label="Estado" name="estado" options={ESTADOS.map(e => ({ value: e, label: e.replace('_', ' ') }))} />
                                    <div className="col-span-2"><F label="Nombre del Proyecto *" name="nombre" /></div>
                                    <div className="col-span-2"><F label="Descripción" name="descripcion" type="textarea" /></div>
                                    <F label="Tipo de Obra" name="tipo" options={TIPOS.map(t => ({ value: t, label: t.replace('_', ' ') }))} />
                                    <F label="Cliente" name="cliente_id" options={clientes.map(c => ({ value: c.id, label: c.razon_social }))} />
                                    <F label="Fecha de Inicio" name="fecha_inicio" type="date" />
                                    <F label="Fecha Fin Estimada" name="fecha_fin_estimada" type="date" />
                                    <F label="Presupuesto Base (S/)" name="presupuesto_base" type="number" />
                                    <F label="Monto de Contrato (S/)" name="monto_contrato" type="number" />
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Avance Físico: {form.avance_fisico}%</label>
                                        <input type="range" min={0} max={100} value={form.avance_fisico}
                                            onChange={e => setForm((f: any) => ({ ...f, avance_fisico: Number(e.target.value) }))}
                                            className="w-full accent-blue-600" />
                                    </div>
                                    <F label="Distrito" name="distrito" />
                                    <F label="Departamento" name="departamento" options={['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Callao', 'Ica'].map(d => ({ value: d, label: d }))} />
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Proyecto')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detalle */}
            <AnimatePresence>
                {selectedProy && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedProy(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="bg-slate-900 text-white p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">{selectedProy.codigo} · {selectedProy.tipo?.replace('_', ' ')}</p>
                                        <h3 className="text-xl font-black">{selectedProy.nombre}</h3>
                                        <p className="text-slate-400 text-sm mt-1">{selectedProy.con_clientes?.razon_social || 'Sin cliente'}</p>
                                    </div>
                                    <button onClick={() => setSelectedProy(null)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="mt-6">
                                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                                        <span>Avance Físico</span><span className="font-black text-white">{selectedProy.avance_fisico || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full">
                                        <div className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full" style={{ width: `${selectedProy.avance_fisico || 0}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Presupuesto', val: `S/ ${(selectedProy.presupuesto_base || 0).toLocaleString()}` },
                                        { label: 'Monto Contrato', val: `S/ ${(selectedProy.monto_contrato || 0).toLocaleString()}` },
                                        { label: 'Inicio', val: selectedProy.fecha_inicio ? new Date(selectedProy.fecha_inicio).toLocaleDateString('es-PE') : '—' },
                                        { label: 'Fin Estimado', val: selectedProy.fecha_fin_estimada ? new Date(selectedProy.fecha_fin_estimada).toLocaleDateString('es-PE') : '—' },
                                        { label: 'Ubicación', val: [selectedProy.distrito, selectedProy.departamento].filter(Boolean).join(', ') || '—' },
                                        { label: 'Estado', val: selectedProy.estado?.replace('_', ' ') || '—' },
                                    ].map(item => (
                                        <div key={item.label} className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                                {selectedProy.descripcion && (
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                        <p className="text-sm text-slate-700">{selectedProy.descripcion}</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => openEdit(selectedProy)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
                                    <Edit3 className="w-4 h-4" /> Editar Proyecto
                                </button>
                                <button onClick={() => handleDelete(selectedProy.id)}
                                    className="flex items-center gap-2 px-5 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all">
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
