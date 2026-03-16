'use client'

import { motion } from 'framer-motion'
import {
    Monitor, Package, Settings, Users,
    DollarSign, ClipboardList, BarChart3, ArrowRight,
    TrendingUp, ShieldCheck, Clock, AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const modules = [
    {
        title: 'POS — Punto de Venta',
        description: 'Interfaz premium para ventas rápidas con escaneo de códigos.',
        icon: Monitor,
        href: '/automotriz/pos',
        color: 'bg-blue-600',
        badge: 'Estrella',
        stats: 'Sesión activa'
    },
    {
        title: 'Inventario',
        description: 'Control de repuestos, lubricantes y accesorios en tiempo real.',
        icon: Package,
        href: '/automotriz/inventario',
        color: 'bg-indigo-600',
        stats: '1,240 items'
    },
    {
        title: 'Clientes',
        description: 'CRM automotriz, historial de compras y gestión de créditos.',
        icon: Users,
        href: '/automotriz/clientes',
        color: 'bg-sky-600',
        stats: '842 clientes'
    },
    {
        title: 'Caja y Turnos',
        description: 'Control de flujo de caja, aperturas y cierres de turno.',
        icon: DollarSign,
        href: '/automotriz/caja',
        color: 'bg-emerald-600',
        stats: 'Caja 01 abierta'
    },
    {
        title: 'Compras',
        description: 'Órdenes de compra y recepción de mercadería de proveedores.',
        icon: ClipboardList,
        href: '/automotriz/compras',
        color: 'bg-violet-600',
        stats: '3 pendientes'
    },
    {
        title: 'Análisis de Ventas',
        description: 'Dashboard de rentabilidad y KPIs de ventas por hora.',
        icon: BarChart3,
        href: '/automotriz/reportes',
        color: 'bg-[#3841F2]',
        stats: '+14% hoy'
    }
]

export default function HubAutomotriz() {
    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-[#020659] p-8 md:p-12 text-white border border-white/10 shadow-2xl">
                <div className="relative z-10 max-w-2xl space-y-4">
                    <Badge variant="secondary" className="bg-[#3841F2] text-white border-none px-3 py-1 font-bold">
                        PANEL DE CONTROL
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Optimiza tu <span className="text-[#3841F2]">Taller y Local</span> de Repuestos
                    </h2>
                    <p className="text-blue-100/80 text-lg leading-relaxed">
                        Control total desde el Punto de Venta hasta la gestión de garantías y cotizaciones.
                        Todo integrado con el ecosistema PROMPTIVE.
                    </p>
                    <div className="pt-4 flex flex-wrap gap-4">
                        <Link href="/automotriz/pos" className="px-6 py-3 bg-[#3841F2] hover:bg-[#3841F2]/90 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#3841F2]/20">
                            Abrir Punto de Venta
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#3841F2]/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#3841F2]/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Ventas del Día', value: 'S/ 4,280', change: '+12%', icon: TrendingUp, color: 'text-[#3841F2]' },
                    { label: 'Garantías Activas', value: '18', change: 'Estable', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Stock Crítico', value: '5 Items', change: '-2', icon: AlertCircle, color: 'text-red-500' },
                    { label: 'Turno Actual', value: '8.5 hrs', change: 'En curso', icon: Clock, color: 'text-amber-500' }
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:border-[#3841F2]/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-xl bg-muted/50 transition-colors group-hover:bg-white", kpi.color)}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.change}</span>
                        </div>
                        <h3 className="text-2xl font-black">{kpi.value}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((item, i) => (
                    <Link key={item.title} href={item.href}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-card p-6 rounded-3xl border border-border shadow-sm group hover:border-[#3841F2] hover:shadow-xl hover:shadow-[#3841F2]/10 transition-all cursor-pointer h-full flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-3 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110", item.color)}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                {item.badge && (
                                    <Badge className="bg-[#3841F2] hover:bg-[#3841F2] font-black uppercase tracking-tighter text-[9px]">
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-xl font-black mb-2 transition-colors group-hover:text-[#3841F2]">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                                {item.description}
                            </p>
                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">{item.stats}</span>
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-[#3841F2] group-hover:text-white transition-all">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Integration Banner */}
            <div className="p-4 rounded-2xl bg-[#3841F2]/5 border border-[#3841F2]/10 flex flex-wrap items-center justify-center gap-4 text-center">
                <span className="text-xs font-black text-[#3841F2] uppercase tracking-widest">Conectado con PROMPTIVE:</span>
                <div className="flex flex-wrap justify-center gap-2">
                    {['Inventario', 'Clientes', 'Caja', 'Reportes', 'Finanzas'].map(chip => (
                        <span key={chip} className="px-2 py-0.5 bg-white border border-[#3841F2]/20 rounded text-[9px] font-black text-[#3841F2] uppercase">
                            {chip} ✓
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
