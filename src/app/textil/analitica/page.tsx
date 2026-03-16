'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, TrendingDown, Target,
    AlertCircle, Download, Calendar, Filter,
    Activity, ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react'
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { cn } from '@/lib/utils'

const KPI_DATA = [
    { label: 'Eficiencia Global', value: '78.4%', trend: 'up', change: '+2.1%', icon: Activity, color: 'text-brand-purple' },
    { label: 'OEE (Planta)', value: '82.0%', trend: 'up', change: '+1.5%', icon: Target, color: 'text-brand-cyan' },
    { label: 'Merma de Tela', value: '4.2%', trend: 'down', change: '-0.3%', icon: AlertCircle, color: 'text-brand-amber' },
    { label: 'OTD (On-Time)', value: '87.5%', trend: 'up', change: '+4.0%', icon: TrendingUp, color: 'text-emerald-500' },
]

const OTD_CHART_DATA = [
    { name: 'Ene', otd: 82, target: 90 },
    { name: 'Feb', otd: 85, target: 90 },
    { name: 'Mar', otd: 88, target: 90 },
    { name: 'Abr', otd: 84, target: 90 },
    { name: 'May', otd: 87, target: 90 },
    { name: 'Jun', otd: 91, target: 90 },
]

const PROD_VS_GOAL_DATA = [
    { name: 'Línea A', real: 4200, goal: 4500 },
    { name: 'Línea B', real: 3800, goal: 3500 },
    { name: 'Línea C', real: 2900, goal: 3500 },
    { name: 'Línea D', real: 1500, goal: 1200 },
]

const DEFECT_PIE_DATA = [
    { name: 'Costura', value: 45, color: '#7c3aed' },
    { name: 'Tela', value: 25, color: '#1AA3D9' },
    { name: 'Medidas', value: 20, color: '#f59e0b' },
    { name: 'Otros', value: 10, color: '#94a3b8' },
]

export default function AnaliticaTextil() {
    const [timeRange, setTimeRange] = useState('Mensual')

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-2 p-1 bg-muted/40 rounded-xl border border-border w-fit">
                    {['Semanal', 'Mensual', 'Trimestral', 'Anual'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                timeRange === range ? "bg-white text-brand-purple shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold hover:bg-muted/50 transition-all">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        Filtros Avanzados
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Download className="h-4 w-4" />
                        Exportar Informe
                    </button>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_DATA.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-card rounded-2xl border border-border shadow-sm group hover:border-brand-purple/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-2xl bg-muted/50 group-hover:bg-muted transition-colors", kpi.color)}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div className={cn("flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full",
                                kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            )}>
                                {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {kpi.change}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black mb-1">{kpi.value}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* OTD Timeline */}
                <div className="p-8 bg-card rounded-3xl border border-border shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Cumplimiento de Entrega (OTD)</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Histórico de puntualidad vs meta corporativa.</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={OTD_CHART_DATA}>
                                <defs>
                                    <linearGradient id="colorOtd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="otd" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorOtd)" />
                                <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Production vs Goal */}
                <div className="p-8 bg-card rounded-3xl border border-border shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <BarChart3 className="h-4 w-4 text-brand-purple" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Producción Real vs Meta por Línea</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Comparativa de unidades cerradas por célula de trabajo.</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={PROD_VS_GOAL_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0' }}
                                />
                                <Bar dataKey="real" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="goal" fill="#94a3b8" opacity={0.3} radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pareto Defectos */}
                <div className="p-8 bg-card rounded-3xl border border-border shadow-sm flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <AlertCircle className="h-4 w-4 text-brand-amber" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Distribución de Rechazos</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Análisis de Pareto por categoría de defecto.</p>
                        </div>
                        <div className="space-y-4">
                            {DEFECT_PIE_DATA.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase group-hover:text-foreground transition-colors">{entry.name}</span>
                                    </div>
                                    <span className="text-xs font-black">{entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-56 w-56 shrink-0 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={DEFECT_PIE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {DEFECT_PIE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-brand-purple">122</span>
                            <span className="text-[9px] font-black text-muted-foreground uppercase">Incidencias</span>
                        </div>
                    </div>
                </div>

                {/* Efficiency Insights */}
                <div className="p-8 bg-brand-purple rounded-3xl border border-white/10 shadow-xl shadow-brand-purple/20 flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                                <Info className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Insights de Producción</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                                <p className="text-[11px] font-medium text-white/80 leading-relaxed italic">
                                    "La **Línea B** ha superado su meta de eficiencia en un **8.5%**, compensando el retraso técnico detectado en la **Línea C** durante la semana 12."
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                                <p className="text-[11px] font-medium text-white/80 leading-relaxed italic">
                                    "Se observa una reducción del **32%** en el merma de tela comparado con el trimestre anterior gracias a la nueva optimización de tizado."
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-4 bg-white text-brand-purple rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Generar Recomendación Predictiva
                    </button>
                </div>
            </div>
        </div>
    )
}
