'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Search, Plus, MapPin,
    Phone, Mail, Building,
    ExternalLink, MoreVertical, Star,
    CheckCircle2, AlertCircle
} from 'lucide-react'
import { conQuery } from '@/lib/conQuery'

export function TabClientes() {
    const [clientes, setClientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function load() {
            const { data } = await conQuery.getClientes()
            if (data) setClientes(data)
            setLoading(false)
        }
        load()
    }, [])

    const filtered = clientes.filter(c =>
        c.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ruc?.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por Razón Social o RUC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg">
                    <Plus className="w-4 h-4" /> Nuevo Cliente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />)
                ) : filtered.map((cli) => (
                    <motion.div
                        key={cli.id}
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Building className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cli.estado === 'activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {cli.estado}
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">{cli.tipo === 'persona_natural' ? 'Persona Natural' : 'Empresa Jurídica'}</p>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{cli.razon_social}</h4>
                            <p className="text-xs text-slate-400 font-medium">RUC: {cli.ruc || 'N/A'}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                <span className="truncate">{cli.distrito || 'Dirección'}, {cli.departamento || 'Lima'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-300" />
                                <span>{cli.telefono || 'Sin teléfono'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                            </div>
                            <button className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-all">
                                Detalles <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
