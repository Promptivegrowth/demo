'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ClipboardCheck, AlertTriangle, CheckCircle2,
    XCircle, Info, BarChart3, Search, Filter,
    ChevronRight, ArrowUpRight, TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const QUALITY_STATS = [
    { label: 'Tasa de Defectos', value: '3.2%', change: '-0.8%', icon: AlertTriangle, color: 'text-brand-amber', trend: 'down' },
    { label: 'Inspecciones Hoy', value: '142', change: '+12', icon: ClipboardCheck, color: 'text-brand-purple', trend: 'up' },
    { label: 'Prendas Aprobadas', value: '3,420', change: '↑ 96.8%', icon: CheckCircle2, color: 'text-emerald-500', trend: 'up' },
    { label: 'Rechazos Críticos', value: '12', change: '-4', icon: XCircle, color: 'text-red-500', trend: 'down' },
]

const DEFECT_TYPES = [
    { label: 'Defectos de Costura', value: 45, color: 'bg-brand-purple' },
    { label: 'Defectos de Tela (Agujeros/Manchas)', value: 25, color: 'bg-brand-cyan' },
    { label: 'Desviación de Medidas', value: 20, color: 'bg-brand-amber' },
    { label: 'Otros (Avíos/Limpieza)', value: 10, color: 'bg-slate-400' },
]

const INSPECTIONS_DATA = [
    { ot: 'OT-001', product: 'Polo Pima Jersey', samples: 50, defects: 1, rate: 2, status: 'approved', auditor: 'Maria C.' },
    { ot: 'OT-003', product: 'Pantalón Dril', samples: 32, defects: 4, rate: 12.5, status: 'rejected', auditor: 'José S.' },
    { ot: 'OT-004', product: 'Hoodie Oversized', samples: 80, defects: 2, rate: 2.5, status: 'approved', auditor: 'Maria C.' },
    { ot: 'OT-002', product: 'Vestido Verano', samples: 20, defects: 0, rate: 0, status: 'approved', auditor: 'Roberto V.' },
]

export default function ControlCalidad() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="space-y-8 pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUALITY_STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-card rounded-2xl border border-border shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-xl bg-muted/50", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full",
                                stat.trend === 'down' && stat.label.includes('Defectos') ? 'bg-emerald-50 text-emerald-600' :
                                    stat.trend === 'up' && stat.label.includes('Defectos') ? 'bg-red-50 text-red-600' :
                                        stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            )}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black mb-0.5 leading-tight">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tabla de Defectos (Pareto) */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="h-4 w-4 text-brand-purple" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Distribución de Defectos</h3>
                    </div>
                    <div className="space-y-6 flex-1">
                        {DEFECT_TYPES.map((type, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-foreground/80">{type.label}</span>
                                    <span>{type.value}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${type.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                        className={cn("h-full rounded-full", type.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50 text-[11px] font-medium text-muted-foreground italic">
                        "La mayoría de defectos de costura se concentran en la **Línea A** (recubierta)."
                    </div>
                </div>

                {/* Tabla de Inspecciones Recientes */}
                <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Inspecciones por Lote (AQL 2.5)</h3>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Filtrar por OT..."
                                className="pl-8 pr-4 py-1.5 bg-muted/40 border-none rounded-lg text-xs focus:ring-1 focus:ring-brand-purple/20 outline-none w-48"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-3 text-[10px] font-black text-muted-foreground uppercase opacity-60">OT / Producto</th>
                                    <th className="pb-3 text-[10px] font-black text-muted-foreground uppercase opacity-60 text-center">Muestra</th>
                                    <th className="pb-3 text-[10px] font-black text-muted-foreground uppercase opacity-60 text-center">Defectos</th>
                                    <th className="pb-3 text-[10px] font-black text-muted-foreground uppercase opacity-60 text-center">% Rate</th>
                                    <th className="pb-3 text-[10px] font-black text-muted-foreground uppercase opacity-60 text-center">Estado</th>
                                    <th className="pb-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {INSPECTIONS_DATA.map((row, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-brand-purple">{row.ot}</span>
                                                <span className="text-[11px] font-bold text-foreground/70">{row.product}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center text-xs font-bold">{row.samples} pcs</td>
                                        <td className="py-4 text-center text-xs font-black text-red-500">{row.defects}</td>
                                        <td className="py-4 text-center">
                                            <span className={cn("text-[11px] font-black px-1.5 py-0.5 rounded", row.rate > 5 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50')}>
                                                {row.rate}%
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex justify-center">
                                                {row.status === 'approved' ? (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-100/50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 className="h-3 w-3" /> Aprobado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-600 bg-red-100/50 border border-red-100 px-2 py-1 rounded-full">
                                                        <XCircle className="h-3 w-3" /> Rechazado
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all">
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Checklist Visual Area (Placeholder) */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Info className="h-4 w-4 text-brand-cyan" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Guía de Auditoría Visual (Estándar Promptive)</h3>
                    </div>
                    <button className="text-[10px] font-black text-brand-purple uppercase hover:underline">Ver Manual de Calidad</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Simetría & Medidas', desc: 'Verificar tolerancia de +/- 1cm en puntos críticos según Tech Pack.' },
                        { title: 'Tensión de Puntada', desc: 'Asegurar que no haya saltos de ramillete ni hilos sueltos en costuras internas.' },
                        { title: 'Acabado & Limpieza', desc: 'Cero manchas de aceite y remoción total de hilos excedentes.' },
                    ].map((step, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 group hover:border-brand-purple/30 transition-all">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-5 w-5 rounded-full bg-brand-purple text-[10px] font-black text-white flex items-center justify-center">{i + 1}</span>
                                <h4 className="text-[11px] font-black uppercase tracking-tight text-foreground">{step.title}</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
