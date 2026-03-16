'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign, TrendingUp, TrendingDown, AlertCircle,
    ArrowRight, Info, PieChart, Wallet,
    ChevronDown, ChevronUp, MoreHorizontal, Search, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const COST_SUMMARY = [
    { label: 'Costo Total Mes', value: 'S/ 142,500', target: 'S/ 150,000', status: 'within' },
    { label: 'Desviación Promedio', value: '4.2%', target: 'Max 5%', status: 'warning' },
    { label: 'Margen Bruto Prom.', value: '28.5%', target: 'Min 25%', status: 'good' },
]

const COSTS_DATA = [
    {
        ot: 'OT-001',
        product: 'Polo Pima Jersey',
        qty: 600,
        budgeted: 10800,
        actual: 11040,
        breakdown: { materials: 6000, labor: 3500, overhead: 1540 },
        margin: 32,
        status: 'over'
    },
    {
        ot: 'OT-002',
        product: 'Hoodie Oversized',
        qty: 320,
        budgeted: 12800,
        actual: 12160,
        breakdown: { materials: 7500, labor: 3000, overhead: 1660 },
        margin: 35,
        status: 'under'
    },
    {
        ot: 'OT-003',
        product: 'Pantalón Dril',
        qty: 150,
        budgeted: 4500,
        actual: 4650,
        breakdown: { materials: 2800, labor: 1200, overhead: 650 },
        margin: 28,
        status: 'over'
    },
    {
        ot: 'OT-004',
        product: 'Camiseta Deportiva',
        qty: 1200,
        budgeted: 18000,
        actual: 17280,
        breakdown: { materials: 10000, labor: 5000, overhead: 2280 },
        margin: 30,
        status: 'under'
    },
]

export default function CostosProduccion() {
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedOT, setExpandedOT] = useState<string | null>(null)

    return (
        <div className="space-y-8 pb-10">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COST_SUMMARY.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-foreground">{stat.value}</h3>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Objetivo: {stat.target}</span>
                            <div className={cn("h-2 w-2 rounded-full",
                                stat.status === 'good' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                    stat.status === 'warning' ? 'bg-amber-500' : 'bg-brand-purple'
                            )} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* List & Details */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-brand-purple" />
                        Análisis de Costos por Orden
                    </h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filtrar por OT..."
                            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {COSTS_DATA.filter(c => c.ot.includes(searchTerm)).map((item, i) => {
                        const isExpanded = expandedOT === item.ot
                        const deviation = ((item.actual - item.budgeted) / item.budgeted) * 100
                        const isOver = item.actual > item.budgeted

                        return (
                            <motion.div
                                key={item.ot}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn("bg-card rounded-2xl border transition-all duration-300 overflow-hidden",
                                    isExpanded ? "border-brand-purple/40 shadow-xl" : "border-border hover:border-brand-purple/20"
                                )}
                            >
                                <div
                                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => setExpandedOT(isExpanded ? null : item.ot)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={cn("p-2.5 rounded-xl", isOver ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')}>
                                            {isOver ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-brand-purple">{item.ot}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{item.qty} pcs</span>
                                            </div>
                                            <h3 className="font-bold text-sm text-foreground">{item.product}</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 flex-1">
                                        <div className="text-right md:text-left">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Real</p>
                                            <p className="text-sm font-black">S/ {item.actual.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right md:text-left">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Desviación</p>
                                            <p className={cn("text-sm font-black", isOver ? 'text-red-600' : 'text-emerald-600')}>
                                                {isOver ? '+' : ''}{deviation.toFixed(1)}%
                                            </p>
                                        </div>
                                        <div className="text-right md:text-left">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Margen</p>
                                            <p className="text-sm font-black text-brand-cyan">{item.margin}%</p>
                                        </div>
                                        <div className="hidden md:flex items-center justify-end">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-border bg-muted/10 p-6 flex flex-col md:flex-row gap-8"
                                        >
                                            <div className="flex-1 space-y-4">
                                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Desglose de Costos Reales</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Materiales (Tela + Avíos)', val: item.breakdown.materials, color: 'bg-brand-purple' },
                                                        { label: 'Mano de Obra Directa', val: item.breakdown.labor, color: 'bg-brand-cyan' },
                                                        { label: 'Costo Indirecto (Overhead)', val: item.breakdown.overhead, color: 'bg-brand-amber' },
                                                    ].map((b, i) => (
                                                        <div key={i} className="flex flex-col gap-1.5">
                                                            <div className="flex justify-between text-[11px] font-bold uppercase">
                                                                <span className="text-foreground/70">{b.label}</span>
                                                                <span>S/ {b.val.toLocaleString()}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${(b.val / item.actual) * 100}%` }}
                                                                    className={cn("h-full", b.color)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="w-full md:w-80 space-y-4">
                                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Alertas & Variaciones</h4>
                                                <div className="space-y-2">
                                                    {isOver ? (
                                                        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-3">
                                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                                            <p className="text-[11px] font-medium leading-relaxed">
                                                                **Alerta de Sobrecosto:** El costo de materiales excedió lo pactado debido a una variación del 5% en el precio del Pima Jersey.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex gap-3">
                                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                                            <p className="text-[11px] font-medium leading-relaxed">
                                                                **Eficiencia Detectada:** Mejora del 4.4% en eficiencia de mano de obra en esta orden comparado con el estándar.
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between group cursor-pointer hover:bg-muted/60 transition-all">
                                                        <div className="flex items-center gap-2">
                                                            <Wallet className="h-4 w-4 text-brand-purple" />
                                                            <span className="text-[11px] font-bold uppercase">Ver Facturas</span>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Global Efficiency Footer */}
            <div className="p-6 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-brand-purple text-white flex items-center justify-center">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-brand-purple uppercase tracking-tight">Utilidad Mensual Estimada</h4>
                        <p className="text-xs font-medium text-muted-foreground">Proyección basada en órdenes cerradas actualizadas.</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-foreground">S/ 48,240</span>
                    <p className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full border border-emerald-100 inline-block ml-3">↑ +14% vs MES ANT</p>
                </div>
            </div>
        </div>
    )
}
