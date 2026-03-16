'use client'

import { motion } from 'framer-motion'
import {
    Factory, DraftingCompass, CalendarDays, ClipboardCheck,
    DollarSign, Layers, BarChartHorizontal, ArrowRight,
    TrendingUp, Shirt, ShoppingBag, Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const kpis = [
    { label: 'Órdenes Activas', value: '24', change: '+3 vs semana anterior', icon: Factory, color: 'text-brand-purple' },
    { label: 'Prendas en Producción', value: '4,850', change: '↑ 12.4%', icon: Shirt, color: 'text-brand-cyan' },
    { label: 'OTD (On Time Delivery)', value: '87%', change: 'Objetivo 90%', icon: Clock, color: 'text-brand-amber' },
    { label: 'Costo Promedio / Prenda', value: 'S/ 18.40', change: '↓ 2.1%', icon: DollarSign, color: 'text-emerald-500' },
]

const modules = [
    {
        title: 'Gestión Core de Producción',
        items: [
            {
                name: 'Órdenes de Producción',
                desc: 'Control total del flujo de manufactura y estados.',
                href: '/textil/ordenes',
                icon: Factory,
                accent: 'border-l-brand-purple',
                badges: ['Kanban', 'Estados', 'Avance']
            },
            {
                name: 'Ficha Técnica (Tech Pack)',
                desc: 'Especificaciones, medidas e insumos.',
                href: '/textil/fichas',
                icon: DraftingCompass,
                accent: 'border-l-brand-purple',
                badges: ['Medidas', 'Insumos', 'Avíos']
            },
            {
                name: 'Planeación de Planta',
                desc: 'Capacidad de líneas y cronogramas.',
                href: '/textil/planeacion',
                icon: CalendarDays,
                accent: 'border-l-brand-purple',
                badges: ['Líneas', 'Ocupación', 'Carga']
            },
            {
                name: 'Control de Calidad',
                desc: 'Inspecciones y reporte de defectos.',
                href: '/textil/calidad',
                icon: ClipboardCheck,
                accent: 'border-l-brand-purple',
                badges: ['Fállas', 'Checklist', 'Auditoría']
            },
        ]
    },
    {
        title: 'Integración PROMPTIVE',
        items: [
            {
                name: 'Costos de Producción',
                desc: 'Desglose detallado y variaciones.',
                href: '/textil/costos',
                icon: DollarSign,
                accent: 'border-l-brand-amber',
                badges: ['Materiales', 'M.O.', 'Overhead']
            },
            {
                name: 'Trazabilidad de Lotes',
                desc: 'Historia del producto desde tela.',
                href: '/textil/trazabilidad',
                icon: Layers,
                accent: 'border-l-brand-amber',
                badges: ['Timeline', 'Stock', 'Eventos']
            },
        ]
    },
    {
        title: 'Inteligencia & Análisis',
        items: [
            {
                name: 'Analítica Textil',
                desc: 'Dashboards predictivos y de eficiencia.',
                href: '/textil/analitica',
                icon: BarChartHorizontal,
                accent: 'border-l-brand-cyan',
                badges: ['OEE', 'Rechazos', 'Ranking']
            },
        ]
    }
]

const processFlow = [
    { label: 'Pedido CRM', status: 'completed', icon: ShoppingBag },
    { label: 'Orden Prod.', status: 'completed', icon: Factory },
    { label: 'Materiales', status: 'active', icon: Layers },
    { label: 'Programación', status: 'pending', icon: CalendarDays },
    { label: 'Producción', status: 'pending', icon: Shirt },
    { label: 'QC', status: 'pending', icon: ClipboardCheck },
    { label: 'Facturación', status: 'pending', icon: DollarSign },
]

export default function TextilHub() {
    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-64 rounded-3xl overflow-hidden border border-border/50 group"
            >
                <img
                    src="/textil/factory_hub.png"
                    alt="Textile Factory"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-xl">
                    <Badge className="w-fit mb-4 bg-brand-purple/20 text-brand-purple border-brand-purple/30 backdrop-blur-md">
                        Módulo Vertical
                    </Badge>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Hub de Operaciones <span className="promptive-gradient-text">Textiles</span>
                    </h1>
                    <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium">
                        Control 360° de tu cadena de manufactura. Desde la ficha técnica hasta el despacho final,
                        con inteligencia de datos y trazabilidad en tiempo real.
                    </p>
                </div>
                <div className="absolute bottom-4 right-8 flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">12 operarios activos</span>
                </div>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors ${kpi.color}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${kpi.change.includes('+') || kpi.change.includes('↑')
                                ? 'bg-emerald-50 text-emerald-600'
                                : kpi.change.includes('↓')
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                {kpi.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight mb-1">{kpi.value}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {modules.map((group, groupIdx) => (
                    <div key={group.title} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">{group.title}</h2>
                            <div className="h-px flex-1 bg-border/40" />
                        </div>
                        <div className="space-y-4">
                            {group.items.map((item, i) => (
                                <Link key={item.name} href={item.href}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (groupIdx * 4 + i) * 0.05 }}
                                        className={`p-4 bg-card rounded-xl border border-border border-l-4 ${item.accent} shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-muted/30 rounded-lg group-hover:bg-muted/60 transition-colors">
                                                <item.icon className="h-5 w-5 text-foreground/70" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className="font-bold text-sm group-hover:text-brand-purple transition-colors">{item.name}</h3>
                                                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{item.desc}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.badges.map(badge => (
                                                        <span key={badge} className="text-[9px] font-bold px-1.5 py-0.5 bg-muted/80 text-muted-foreground rounded-md uppercase tracking-tight">
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Process Flow */}
            <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="h-4 w-4 text-brand-purple" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Flujo del Proceso Manufactura</h3>
                </div>
                <div className="flex items-center justify-between px-4 overflow-x-auto gap-8 no-scrollbar pb-2">
                    {processFlow.map((step, i) => (
                        <div key={step.label} className="flex items-center gap-8 group">
                            <div className="flex flex-col items-center gap-3 min-w-[100px]">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${step.status === 'completed' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                    step.status === 'active' ? 'bg-brand-purple text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' :
                                        'bg-muted text-muted-foreground/40 border border-border/60'
                                    }`}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-tighter text-center whitespace-nowrap ${step.status === 'pending' ? 'text-muted-foreground/40' : 'text-foreground'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < processFlow.length - 1 && (
                                <div className={`flex items-center gap-1 ${step.status === 'completed' ? 'text-emerald-500/30' : 'text-border'}`}>
                                    <div className={`w-12 h-[2px] rounded-full ${step.status === 'completed' ? 'bg-emerald-500/50' : 'bg-border/50'
                                        }`} />
                                    <ArrowRight className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
