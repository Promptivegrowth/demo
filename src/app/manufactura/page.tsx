'use client'

import { motion } from 'framer-motion'
import {
    Factory, Boxes, FileBarChart, Smartphone,
    Truck, Calculator, Server, ArrowRight,
    TrendingUp, Users, ShoppingCart, CheckCircle2,
    Database, Cloud, RefreshCw, Zap, Cpu
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const kpis = [
    { label: 'Producción del Día', value: '48,200', unit: 'UDS', change: '+5% vs meta', icon: Factory, color: 'text-[#0f4c81]' },
    { label: 'Pedidos en Campo', value: '23', unit: 'S/ 18,450', change: 'En tiempo real', icon: Smartphone, color: 'text-[#e8820c]' },
    { label: 'Clientes Activos', value: '187', unit: 'PUNTOS', change: '8 visitas hoy', icon: Users, color: 'text-teal-500' },
    { label: 'Facturación Hoy', value: '31', unit: 'DOCS', change: 'Sincronizado', icon: FileBarChart, color: 'text-blue-500' },
]

const moduleGroups = [
    {
        title: 'Núcleo Industrial (Local)',
        items: [
            {
                name: 'Producción & Manufactura',
                desc: 'Control de líneas, OEE y paradas.',
                href: '/manufactura/produccion',
                icon: Factory,
                accent: 'border-l-[#0f4c81]',
                badges: ['OEE', 'Turnos', 'Calidad'],
                type: 'local'
            },
            {
                name: 'Inventario & Almacenes',
                desc: 'Materia prima, WIP y PT.',
                href: '/manufactura/inventario',
                icon: Boxes,
                accent: 'border-l-[#0f4c81]',
                badges: ['Lotes', 'Stock', 'Múltiples'],
                type: 'local'
            },
            {
                name: 'Contabilidad',
                desc: 'Cartera, P&L y gastos.',
                href: '/manufactura/contabilidad',
                icon: Calculator,
                accent: 'border-l-[#0f4c81]',
                badges: ['A/R', 'A/P', 'Sunat'],
                type: 'local'
            },
        ]
    },
    {
        title: 'Fuerza de Campo (Nube)',
        items: [
            {
                name: 'CRM de Campo',
                desc: 'App móvil para vendedores en ruta.',
                href: '/manufactura/crm',
                icon: Smartphone,
                accent: 'border-l-[#e8820c]',
                badges: ['Pedidos', 'Cobros', 'Mapa'],
                type: 'cloud'
            },
            {
                name: 'Ventas & Facturación',
                desc: 'Pedidos de campo y mostrador.',
                href: '/manufactura/ventas',
                icon: FileBarChart,
                accent: 'border-l-[#e8820c]',
                badges: ['E-Factura', 'Precios', 'POS'],
                type: 'cloud'
            },
            {
                name: 'Logística & Distribución',
                desc: 'Rutas de despacho y guías.',
                href: '/manufactura/logistica',
                icon: Truck,
                accent: 'border-l-[#e8820c]',
                badges: ['Rutas', 'Guías', 'Flota'],
                type: 'cloud'
            },
        ]
    },
    {
        title: 'Sistema & Analítica',
        items: [
            {
                name: 'Adm. del Servidor',
                desc: 'Estado del servidor local y sync.',
                href: '/manufactura/servidor',
                icon: Server,
                accent: 'border-l-teal-500',
                badges: ['Hardware', 'DB', 'Sync'],
                type: 'system'
            },
        ]
    }
]

export default function ManufacturaHub() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header with Status Badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sistema ERP Híbrido</h1>
                    <p className="text-slate-500 font-medium italic">Manufactura de Productos Descartables — Arquitectura Local + Nube</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        SERVIDOR LOCAL ACTIVO
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5 py-1 px-3">
                        <Cloud className="h-3 w-3" />
                        NUBE SINCRONIZADA
                    </Badge>
                </div>
            </div>

            {/* Hybrid Architecture Hero */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gradient-to-br from-[#0f4c81] to-[#1a3a5a] rounded-3xl p-8 overflow-hidden shadow-2xl border border-[#0f4c81]/20"
            >
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e8820c]/10 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative grid grid-cols-1 lg:grid-cols-11 items-center gap-8">
                    {/* Local Block */}
                    <div className="lg:col-span-4 bg-[#0f4c81] border border-white/20 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Server className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg">Tu Servidor Local</h3>
                                <p className="text-white/60 text-xs uppercase font-bold tracking-widest">Infraestructura Core</p>
                            </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                            {['Base de datos PostgreSQL', 'Producción & OEE', 'Inventario & Almacenes', 'Contabilidad & Costos', 'Facturación Electrónica'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-white/80 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-black">
                            FUNCIONA SIN INTERNET
                        </Badge>
                    </div>

                    {/* Sync Column */}
                    <div className="lg:col-span-3 flex flex-col items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className="h-1 w-1 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#e8820c]/50 to-transparent rotate-90 lg:rotate-0" />
                                <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                                    <RefreshCw className="h-8 w-8 text-[#e8820c] animate-spin-slow" />
                                </div>
                            </div>
                            <p className="mt-8 text-white/50 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                                Sincronización en tiempo real
                            </p>
                        </div>
                    </div>

                    {/* Cloud Block */}
                    <div className="lg:col-span-4 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#e8820c]/10 rounded-xl text-[#e8820c]">
                                <Cloud className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 font-black text-lg">Módulos en Nube</h3>
                                <p className="text-[#e8820c] text-xs uppercase font-bold tracking-widest">Fuerza de Ventas</p>
                            </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                            {['CRM & App Móvil', 'Vendedores en Ruta', 'Pedidos en Tiempo Real', 'Cobros & Recibos', 'Panel Gerencial Remoto'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <Zap className="h-4 w-4 text-[#e8820c]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Badge className="bg-[#e8820c]/10 text-[#e8820c] border-[#e8820c]/20 font-black">
                            ACCESO REMOTO 24/7
                        </Badge>
                    </div>
                </div>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors ${kpi.color}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter">
                                {kpi.change}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-3xl font-black tracking-tight text-slate-800 italic">{kpi.value}</h3>
                            <span className="text-xs font-bold text-muted-foreground uppercase">{kpi.unit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {moduleGroups.map((group, groupIdx) => (
                    <div key={group.title} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <h2 className={cn(
                                "text-xs font-black uppercase tracking-widest",
                                groupIdx === 0 ? "text-[#0f4c81]" : groupIdx === 1 ? "text-[#e8820c]" : "text-teal-600"
                            )}>{group.title}</h2>
                            <div className="h-[2px] flex-1 bg-border/40" />
                        </div>
                        <div className="space-y-4">
                            {group.items.map((item, i) => (
                                <Link key={item.name} href={item.href}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (groupIdx * 4 + i) * 0.05 }}
                                        className={cn(
                                            "p-4 bg-white rounded-xl border border-border border-l-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer",
                                            item.accent
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-border">
                                                <item.icon className="h-5 w-5 text-slate-500 group-hover:text-[#0f4c81] transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className="font-black text-sm text-slate-800 group-hover:text-[#0f4c81] transition-colors italic uppercase">{item.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        {item.type === 'local' ? (
                                                            <Cpu className="h-3 w-3 text-[#0f4c81]/40" />
                                                        ) : item.type === 'cloud' ? (
                                                            <Cloud className="h-3 w-3 text-[#e8820c]/40" />
                                                        ) : (
                                                            <Database className="h-3 w-3 text-teal-600/40" />
                                                        )}
                                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-[#0f4c81]" />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium line-clamp-1 mb-3">{item.desc}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.badges.map(badge => (
                                                        <span key={badge} className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-tighter">
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
        </div>
    )
}
