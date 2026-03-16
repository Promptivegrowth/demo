'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, TrendingDown,
    Calendar, Download, Filter, FileText,
    PieChart, Target, DollarSign, Wallet,
    ChevronDown, ArrowUpRight, ArrowDownRight,
    Printer, Share2, Info
} from 'lucide-react'
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const REVENUE_DATA = [
    { day: 'Lun', sales: 4500, expenses: 3100 },
    { day: 'Mar', sales: 5200, expenses: 3800 },
    { day: 'Mie', sales: 4800, expenses: 3500 },
    { day: 'Jue', sales: 6100, expenses: 4200 },
    { day: 'Vie', sales: 7500, expenses: 5100 },
    { day: 'Sab', sales: 9200, expenses: 6500 },
    { day: 'Dom', sales: 3100, expenses: 2200 },
]

const PRODUCTS_DATA = [
    { name: 'Aceite Motul', value: 85 },
    { name: 'Filtros K&N', value: 62 },
    { name: 'Pastillas Honda', value: 48 },
    { name: 'Llantas Pirelli', value: 35 },
    { name: 'Cascos Arai', value: 12 },
]

const PAYMENT_METHODS = [
    { name: 'Efectivo', value: 35, color: '#3841F2' },
    { name: 'Tarjeta', value: 45, color: '#020659' },
    { name: 'Yape/Plin', value: 15, color: '#6366f1' },
    { name: 'Transferencia', value: 5, color: '#94a3b8' },
]

export default function ReportesVentas() {
    const [dateRange, setDateRange] = useState('Esta Semana')

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3841F2] rounded-2xl text-white shadow-lg">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Panel de Analítica</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <span>Sánchez Repuestos</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>Dashboard en vivo</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-border rounded-xl p-1 shadow-sm">
                        {['7 Días', '30 Días', 'Anual'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    dateRange === range ? 'bg-[#3841F2] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-all">
                        <Download className="h-5 w-5 text-slate-600" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
                        <Printer className="h-4 w-4" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ingresos Totales', value: 'S/ 40,400.00', trend: '+12.5%', isUp: true, icon: DollarSign },
                    { label: 'Ticket Promedio', value: 'S/ 185.20', trend: '+4.2%', isUp: true, icon: Target },
                    { label: 'Transacciones', value: '218', trend: '-2.1%', isUp: false, icon: FileText },
                    { label: 'Meta Mensual', value: '82%', trend: 'Consolidado', isUp: true, icon: TrendingUp },
                ].map((kpi, i) => (
                    <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm group hover:border-[#3841F2] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#3841F2]/10 transition-colors">
                                <kpi.icon className="h-5 w-5 text-[#3841F2]" />
                            </div>
                            <Badge className={cn(
                                "text-[9px] font-black uppercase border-none",
                                kpi.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            )}>
                                {kpi.isUp ? <ArrowUpRight className="h-3 w-3 mr-1 inline" /> : <ArrowDownRight className="h-3 w-3 mr-1 inline" />}
                                {kpi.trend}
                            </Badge>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-2xl font-black italic text-slate-900 leading-tight">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Evolution Chart */}
                <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Evolución de Ingresos</h3>
                            <p className="text-xs font-bold text-muted-foreground">Comparativa de ventas vs egresos operativos diario.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#3841F2]" />
                                <span className="text-[10px] font-black uppercase text-slate-500">Ventas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-black uppercase text-slate-500">Gastos</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3841F2" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3841F2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="day" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800 }} fontSize={11} tickFormatter={(val) => `S/ ${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 900 }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#3841F2" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Breakdown */}
                <div className="space-y-6">
                    {/* Payment Methods Donut */}
                    <div className="bg-[#020659] rounded-3xl p-8 text-white space-y-8 shadow-xl">
                        <div className="flex items-center gap-3">
                            <PieChart className="h-5 w-5 text-blue-300" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-100">Mix de Pagos</h3>
                        </div>
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={PAYMENT_METHODS}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {PAYMENT_METHODS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-xs font-black text-blue-300 uppercase">Top</p>
                                <p className="text-xl font-black">Tarjetas</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {PAYMENT_METHODS.map((method) => (
                                <div key={method.name} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: method.color }} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">{method.name}</p>
                                        <p className="text-xs font-black">{method.value}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Best Selling Products List */}
                    <div className="bg-card rounded-3xl p-8 border border-border shadow-md space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Top 5 Mas Vendidos</h3>
                            <button className="text-[10px] font-black text-[#3841F2] uppercase hover:underline">Ver Todos</button>
                        </div>
                        <div className="space-y-4">
                            {PRODUCTS_DATA.map((p, i) => (
                                <div key={p.name} className="group relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{p.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground">{p.value} uds.</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p.value}%` }}
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                i === 0 ? 'bg-[#3841F2]' : 'bg-[#020659]/20'
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Insight / Prediction */}
            <div className="p-8 bg-gradient-to-r from-[#020659] to-[#3841F2] rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest">IA Predicción de Ventas</h3>
                    </div>
                    <p className="text-xl font-medium leading-relaxed italic max-w-2xl">
                        "En base a los datos históricos, se espera un incremento del <span className="text-white font-black underline decoration-white/40">18% en ventas</span> de lubricantes y filtros para la próxima quincena debido a cierre de mes."
                    </p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white text-[#020659] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.2)]">
                    Ver Plan de Acción
                </button>
            </div>
        </div>
    )
}
