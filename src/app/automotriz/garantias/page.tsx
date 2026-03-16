'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShieldCheck, Search, Filter, Plus,
    Clock, CheckCircle2, AlertCircle,
    MessageSquare, FileText, User,
    Tag, MoreHorizontal, History,
    Wrench, ChevronRight, Share2,
    ShieldAlert, BadgeCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const WARRANTIES = [
    {
        id: 'GAR-102',
        product: 'Batería Yuasa 12N5-3B',
        client: 'Roberto Gómez Silva',
        purchaseDate: '2024-03-15',
        expiryDate: '2025-03-15',
        status: 'Activa',
        type: 'Fabricante',
        coverage: 'Estructural y Eléctrica'
    },
    {
        id: 'GAR-105',
        product: 'Amortiguador Trasero YSS',
        client: 'Corporación MotoExpress SAC',
        purchaseDate: '2024-05-10',
        expiryDate: '2024-11-10',
        status: 'Reclamo en Proceso',
        type: 'Sánchez Extendida',
        coverage: 'Completa'
    },
    {
        id: 'GAR-098',
        product: 'Casco Arai RX-7V',
        client: 'Mecánica Los Olivos EIRL',
        purchaseDate: '2023-06-12',
        expiryDate: '2024-06-12',
        status: 'Expirada',
        type: 'Especial',
        coverage: 'Defectos de Fábrica'
    }
]

const CLAIMS = [
    { id: 'REC-550', warranty: 'GAR-105', date: '2024-06-12', reason: 'Fuga de aceite en retén', severity: 'Media', stage: 'Inspección Técnica' },
    { id: 'REC-548', warranty: 'GAR-102', date: '2024-06-08', reason: 'Falla de carga', severity: 'Alta', stage: 'Cambio Aprobado' },
]

export default function GarantiasAutomotriz() {
    const [activeView, setActiveView] = useState<'lista' | 'reclamos'>('lista')

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Stats Overlay */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-[#3841F2] rounded-3xl flex items-center justify-center text-white shadow-xl">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tight underline decoration-[#3841F2]/20">Centro de Garantías</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Group Sanchez — Protección Total</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-border rounded-2xl p-1 shadow-sm">
                        <button
                            onClick={() => setActiveView('lista')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeView === 'lista' ? 'bg-[#3841F2] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                            )}
                        >
                            Garantías Activas
                        </button>
                        <button
                            onClick={() => setActiveView('reclamos')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeView === 'reclamos' ? 'bg-[#3841F2] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                            )}
                        >
                            Reclamos y Tickets
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest italic">
                        <Plus className="h-4 w-4" /> Validar Nueva
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Garantías Vigentes', val: '1,245', icon: BadgeCheck, color: 'text-[#3841F2]' },
                    { label: 'Reclamos Abiertos', val: '12', icon: ShieldAlert, color: 'text-amber-500' },
                    { label: 'T. Respuesta Prom.', val: '4.2h', icon: Clock, color: 'text-emerald-500' },
                    { label: 'Indice de Falla', val: '0.8%', icon: AlertCircle, color: 'text-red-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black italic">{stat.val}</p>
                        </div>
                        <stat.icon className={cn("h-8 w-8 opacity-20", stat.color)} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Content */}
                <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#020659] italic">
                                {activeView === 'lista' ? 'Maestro de Certificados' : 'Gestión de Reclamos'}
                            </h3>
                            <p className="text-[11px] font-bold text-muted-foreground">Listado actualizado en tiempo real con la central de marcas.</p>
                        </div>
                        <div className="relative group md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#3841F2]" />
                            <input
                                type="text"
                                placeholder="Buscar por certificado o DNI..."
                                className="h-10 pl-10 pr-4 bg-white border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-[#3841F2] w-full"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-border">
                                {activeView === 'lista' ? (
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Certificado</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Producto / Cliente</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Expiración</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">N° Ticket</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Motivo</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Severidad</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Etapa Actual</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeView === 'lista' ? (
                                    WARRANTIES.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-[#3841F2]/10 flex items-center justify-center text-[#3841F2]">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-[11px] font-black italic">{w.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[12px] font-black text-slate-900 leading-tight italic">{w.product}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">{w.client}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <Badge className={cn(
                                                    "text-[8px] font-black uppercase tracking-tighter px-2",
                                                    w.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' :
                                                        w.status === 'Reclamo en Proceso' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                )}>
                                                    {w.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-[11px] text-slate-600 italic">
                                                {w.expiryDate}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg group-hover:text-[#3841F2] transition-all">
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    CLAIMS.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="text-[11px] font-black text-slate-900 border-b-2 border-amber-500/20 italic">{c.id}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[12px] font-black text-slate-800 leading-tight italic">{c.reason}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Ref: {c.warranty}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase",
                                                    c.severity === 'Alta' ? 'text-red-500' : 'text-amber-500'
                                                )}>{c.severity}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Badge variant="outline" className="border-[#3841F2] text-[#3841F2] text-[9px] font-black uppercase italic">
                                                    {c.stage}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg group-hover:text-[#3841F2] transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tracking Detail Panel */}
                <div className="space-y-6">
                    <div className="bg-[#020659] rounded-[2.5rem] p-8 text-white space-y-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-400 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                            <Wrench className="h-24 w-24" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-blue-200">Timeline de Inspección</h3>
                            <p className="text-2xl font-black italic">Caso REC-550</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {[
                                { stage: 'Recepción de Producto', date: '12 Jun, 09:00 AM', ok: true },
                                { stage: 'Limpieza e Inspección Visual', date: '12 Jun, 02:30 PM', ok: true },
                                { stage: 'Pruebas de Banco / Laboratorio', date: 'En Proceso', ok: false, current: true },
                                { stage: 'Dictamen Final', date: 'Estimado: 14 Jun', ok: false },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {i !== 3 && <div className="absolute left-[11px] top-6 bottom-[-1.5rem] w-0.5 bg-white/10" />}
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10",
                                        step.ok ? 'bg-emerald-500' : step.current ? 'bg-[#3841F2] animate-pulse shadow-[0_0_15px_rgba(56,65,242,0.8)]' : 'bg-white/10'
                                    )}>
                                        {step.ok ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-white/40" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={cn("text-[11px] font-black uppercase italic tracking-tighter", step.current && 'text-[#3841F2]')}>{step.stage}</p>
                                        <p className="text-[9px] font-bold text-blue-300/60 uppercase">{step.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Notificar al Cliente
                        </button>
                    </div>

                    <div className="bg-[#3841F2]/10 border border-[#3841F2]/20 rounded-3xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-[#3841F2]">
                            <History className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Resumen Histórico</h3>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 italic leading-relaxed">
                            "Corporación MotoExpress tiene un ratio de reclamos del 1.2% versus un 0.8% del mercado. Recomendamos revisión de protocolos de instalación en taller."
                        </p>
                        <button className="w-full py-3 bg-white border border-[#3841F2]/30 text-[#3841F2] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3841F2] hover:text-white transition-all shadow-sm">
                            Ver Análisis Técnico IA
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Integration Footer */}
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-3xl flex flex-wrap items-center justify-center gap-8 opacity-60 italic">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pólizas Firmadas Digitalmente ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Interacción con Marcas Directas ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronización de Costos POS ✓</span>
                </div>
            </div>
        </div>
    )
}
