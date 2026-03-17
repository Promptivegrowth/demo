'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownRight,
    DollarSign, FileText, CreditCard,
    PieChart, BarChart3, Calendar,
    Download, Filter, Search, MoreVertical,
    CheckCircle2, AlertCircle, Clock,
    Building2, Scale
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function Contabilidad() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Centro Contable & Financiero</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Balances, Estados de Resultados e Impuestos (SUNAT)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-xl text-[10px] font-black uppercase italic tracking-widest gap-2 bg-white">
                        <Download className="h-4 w-4" />
                        Exportar Libros
                    </Button>
                    <Button className="h-11 rounded-xl bg-slate-900 text-white hover:bg-black text-[10px] font-black uppercase italic tracking-widest">
                        Cierre de Mes
                    </Button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Egresos Totales', value: 'S/ 42,850', trend: '+12%', color: 'text-red-500', icon: TrendingUp, bg: 'bg-red-50' },
                    { label: 'Ingresos Totales', value: 'S/ 128,420', trend: '+24%', color: 'text-emerald-500', icon: TrendingDown, bg: 'bg-emerald-50' },
                    { label: 'Utilidad Neta (P&L)', value: 'S/ 85,570', trend: '+18%', color: 'text-blue-600', icon: DollarSign, bg: 'bg-blue-50' },
                    { label: 'IGV por Pagar', value: 'S/ 12,450', trend: '-5%', color: 'text-amber-600', icon: FileText, bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <span className={cn("text-[10px] font-black uppercase italic", stat.color)}>{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black italic tracking-tighter text-slate-800">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* P&L Chart Simulation */}
                <div className="lg:col-span-8 p-8 bg-white rounded-[2.5rem] border border-border shadow-xl flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Estado de Resultados (Mensual)</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Comparativa de ingresos vs egresos operativos</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600" />
                                <span className="text-[9px] font-black uppercase italic text-slate-500">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <div className="h-3 w-3 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black uppercase italic text-slate-500">Egresos</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="w-full flex flex-col items-center justify-end gap-1 h-64">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className="w-full bg-blue-600 rounded-t-lg shadow-lg group-hover:bg-blue-700 transition-colors"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h * 0.6}%` }}
                                        className="w-full bg-slate-200 rounded-t-lg shadow-sm"
                                    />
                                </div>
                                <span className="text-[9px] font-black uppercase italic text-slate-400">Mes {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accounts Receivable/Payable */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                        <h3 className="text-xs font-black uppercase italic tracking-widest text-white/60 mb-8 flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-emerald-400" />
                            Cuentas por Cobrar
                        </h3>
                        <div className="space-y-6">
                            {[
                                { client: 'Distribuidora Norte', amount: 'S/ 12,450', days: 12, status: 'Overdue' },
                                { client: 'Bodegas Unidas', amount: 'S/ 8,200', days: 5, status: 'Recent' },
                                { client: 'Empresa Textil SA', amount: 'S/ 41,000', days: 2, status: 'Normal' },
                            ].map((acc, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:translate-x-1 transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center font-black italic shadow-inner",
                                            acc.status === 'Overdue' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'
                                        )}>
                                            {acc.client[0]}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic leading-none mb-1">{acc.client}</p>
                                            <p className="text-[9px] font-bold text-white/40 uppercase">Hace {acc.days} días</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black italic tracking-tighter">{acc.amount}</p>
                                        <ArrowUpRight className="h-3 w-3 ml-auto text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-10 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase italic tracking-widest">
                            Cobranza Masiva
                        </Button>
                    </div>

                    <div className="p-8 bg-white border border-border shadow-lg rounded-[2.5rem]">
                        <h3 className="text-xs font-black uppercase italic tracking-widest text-slate-800 mb-6 flex items-center gap-3">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Próximos Pagos (SUNAT)
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase italic text-slate-400">IGV Feb 2026</span>
                                    <span className="text-[10px] font-black text-amber-600">PENDIENTE</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-black italic tracking-tighter text-slate-800">S/ 8,420.00</span>
                                    <span className="text-[9px] font-bold text-slate-400">Vence: 22 Marzo</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase italic text-slate-400">Impuesto a la Renta</span>
                                    <span className="text-[10px] font-black text-emerald-600">PROGRAMADO</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-black italic tracking-tighter text-slate-800">S/ 4,150.00</span>
                                    <span className="text-[9px] font-bold text-slate-400">Vence: 25 Marzo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
