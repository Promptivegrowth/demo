'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Plus, MapPin,
    Phone, Mail, Building, X,
    CheckCircle2, Edit3, Trash2, Save,
    Star, ExternalLink, Globe
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const EMPTY_FORM = {
    razon_social: '', ruc: '', tipo: 'empresa',
    contacto: '', telefono: '', email: '',
    direccion: '', distrito: '', departamento: 'Lima',
    estado: 'activo'
}

export function TabClientes() {
    const [clientes, setClientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ ...EMPTY_FORM })
    const [saving, setSaving] = useState(false)
    const [selectedCliente, setSelectedCliente] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const { data } = await supabase.from('con_clientes').select('*').order('razon_social')
        if (data) setClientes(data)
        setLoading(false)
    }

    const filtered = clientes.filter(c =>
        c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ruc?.includes(searchTerm) ||
        c.distrito?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function openNew() {
        setForm({ ...EMPTY_FORM })
        setEditingId(null)
        setShowModal(true)
    }

    function openEdit(cli: any) {
        setForm({
            razon_social: cli.razon_social || '',
            ruc: cli.ruc || '',
            tipo: cli.tipo || 'empresa',
            contacto: cli.contacto || '',
            telefono: cli.telefono || '',
            email: cli.email || '',
            direccion: cli.direccion || '',
            distrito: cli.distrito || '',
            departamento: cli.departamento || 'Lima',
            estado: cli.estado || 'activo'
        })
        setEditingId(cli.id)
        setShowModal(true)
        setSelectedCliente(null)
    }

    async function handleSave() {
        if (!form.razon_social.trim()) {
            toast.error('La Razón Social es obligatoria')
            return
        }
        setSaving(true)
        let error: any
        if (editingId) {
            const res = await supabase.from('con_clientes').update(form).eq('id', editingId)
            error = res.error
        } else {
            const res = await supabase.from('con_clientes').insert([form])
            error = res.error
        }
        setSaving(false)
        if (error) {
            toast.error('Error al guardar: ' + error.message)
        } else {
            toast.success(editingId ? 'Cliente actualizado' : 'Cliente creado exitosamente')
            setShowModal(false)
            load()
        }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('con_clientes').delete().eq('id', id)
        if (error) {
            toast.error('Error al eliminar: ' + error.message)
        } else {
            toast.success('Cliente eliminado')
            setDeleteId(null)
            setSelectedCliente(null)
            load()
        }
    }

    const Field = ({ label, name, type = 'text', options }: any) => (
        <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
            {options ? (
                <select value={(form as any)[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                    {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : (
                <input type={type} value={(form as any)[name]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar por Razón Social, RUC o Distrito..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">{filtered.length} clientes</span>
                    <button onClick={openNew}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />)
                ) : filtered.length === 0 ? (
                    <div className="col-span-3 text-center py-20 text-slate-400">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="font-bold text-lg">No se encontraron clientes</p>
                        <p className="text-sm mt-1">Crea el primer cliente con el botón "Nuevo Cliente"</p>
                    </div>
                ) : filtered.map((cli) => (
                    <motion.div key={cli.id} layout whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                        onClick={() => setSelectedCliente(cli)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Building className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cli.estado === 'activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {cli.estado}
                            </span>
                        </div>
                        <div className="mb-4">
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">
                                {cli.tipo === 'persona_natural' ? 'Persona Natural' : 'Empresa Jurídica'}
                            </p>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{cli.razon_social}</h4>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">RUC: {cli.ruc || 'N/A'}</p>
                        </div>
                        <div className="space-y-2 mb-4">
                            {cli.distrito && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                    <span className="truncate">{cli.distrito}, {cli.departamento}</span>
                                </div>
                            )}
                            {cli.telefono && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Phone className="w-3 h-3 text-slate-300 shrink-0" />
                                    <span>{cli.telefono}</span>
                                </div>
                            )}
                            {cli.email && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                                    <span className="truncate">{cli.email}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <button onClick={e => { e.stopPropagation(); openEdit(cli) }}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">
                                <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-all">
                                Detalles <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal: Crear / Editar */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Completa los datos del cliente o empresa</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Field label="Razón Social / Nombre Completo *" name="razon_social" />
                                    </div>
                                    <Field label="RUC / DNI" name="ruc" />
                                    <Field label="Tipo" name="tipo" options={[
                                        { value: 'empresa', label: 'Empresa Jurídica' },
                                        { value: 'persona_natural', label: 'Persona Natural' }
                                    ]} />
                                    <Field label="Contacto (nombre)" name="contacto" />
                                    <Field label="Teléfono" name="telefono" />
                                    <div className="col-span-2">
                                        <Field label="Correo Electrónico" name="email" type="email" />
                                    </div>
                                    <div className="col-span-2">
                                        <Field label="Dirección" name="direccion" />
                                    </div>
                                    <Field label="Distrito" name="distrito" />
                                    <Field label="Departamento" name="departamento" options={[
                                        'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Callao', 'Ica', 'Loreto'
                                    ].map(d => ({ value: d, label: d }))} />
                                    <Field label="Estado" name="estado" options={[
                                        { value: 'activo', label: 'Activo' },
                                        { value: 'inactivo', label: 'Inactivo' }
                                    ]} />
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                    Cancelar
                                </button>
                                <button disabled={saving} onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95">
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Cliente')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Detalle */}
            <AnimatePresence>
                {selectedCliente && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedCliente(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="bg-slate-900 p-8 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                            {selectedCliente.tipo === 'persona_natural' ? 'Persona Natural' : 'Empresa Jurídica'}
                                        </p>
                                        <h3 className="text-2xl font-black leading-tight">{selectedCliente.razon_social}</h3>
                                        <p className="text-slate-400 text-sm mt-1">RUC: {selectedCliente.ruc || 'N/A'}</p>
                                    </div>
                                    <button onClick={() => setSelectedCliente(null)} className="p-2 hover:bg-white/10 rounded-xl">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                {[
                                    { icon: Users, label: 'Contacto', val: selectedCliente.contacto },
                                    { icon: Phone, label: 'Teléfono', val: selectedCliente.telefono },
                                    { icon: Mail, label: 'Email', val: selectedCliente.email },
                                    { icon: MapPin, label: 'Dirección', val: selectedCliente.direccion },
                                    { icon: Globe, label: 'Ubicación', val: [selectedCliente.distrito, selectedCliente.departamento].filter(Boolean).join(', ') },
                                ].filter(item => item.val).map(item => (
                                    <div key={item.label} className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <item.icon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-medium text-slate-800">{item.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => openEdit(selectedCliente)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
                                    <Edit3 className="w-4 h-4" /> Editar
                                </button>
                                {deleteId === selectedCliente.id ? (
                                    <button onClick={() => handleDelete(selectedCliente.id)}
                                        className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all">
                                        Confirmar
                                    </button>
                                ) : (
                                    <button onClick={() => setDeleteId(selectedCliente.id)}
                                        className="flex items-center gap-2 px-5 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
