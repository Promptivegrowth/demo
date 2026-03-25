'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, TrendingDown, Users,
    MapPin, PieChart, Calendar, Download,
    Filter, ArrowUpRight, ArrowDownRight,
    Sprout, Droplets, Sun, Wind, AlertTriangle
} from 'lucide-react'

export function TabAgriAnalytics() {
    const [timeRange, setTimeRange] = useState('Mensual')

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Metrics Overiew */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ingresos Totales', val: 'S/ 285,400', p: '+12.5%', up: true, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Cuentas por Cobrar', val: 'S/ 142,800', p: '-3.2%', up: false, icon: PieChart, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Tasa de Recuperación', val: '88.4%', p: '+4.1%', up: true, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Productividad Campo', val: '94 / 100', p: '+0.5%', up: true, icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((m, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${m.bg} rounded-2xl flex items-center justify-center`}>
                                <m.icon className={`w-6 h-6 ${m.color}`} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${m.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {m.p}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">{m.val}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart Simulation */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">Desempeño de Ventas vs Cobranzas</h4>
                            <p className="text-sm text-slate-400 font-medium">Análisis comparativo de flujo de caja agrícola</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            {['Semanal', 'Mensual', 'Anual'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setTimeRange(r)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeRange === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] flex items-end justify-between gap-4 px-4 border-b border-slate-100 pb-2">
                        {[
                            { h: '60%', d: '40%', label: 'Ene' },
                            { h: '85%', d: '70%', label: 'Feb' },
                            { h: '55%', d: '30%', label: 'Mar' },
                            { h: '95%', d: '85%', label: 'Abr' },
                            { h: '75%', d: '60%', label: 'May' },
                            { h: '90%', d: '80%', label: 'Jun' },
                        ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full flex justify-center gap-1.5 h-[280px] items-end">
                                    <motion.div
                                        initial={{ height: 0 }} animate={{ height: bar.h }}
                                        transition={{ delay: i * 0.1, duration: 1 }}
                                        className="w-4 bg-gradient-to-t from-[#166534] to-[#16a34a] rounded-t-lg group-hover:scale-x-110 transition-transform shadow-lg shadow-green-900/20"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }} animate={{ height: bar.d }}
                                        transition={{ delay: i * 0.1 + 0.2, duration: 1 }}
                                        className="w-4 bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-lg group-hover:scale-x-110 transition-transform"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">{bar.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-8 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#166534] rounded-sm" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ventas Facturadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-400 rounded-sm" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cobranza Real</span>
                        </div>
                    </div>
                </div>

                {/* Weather & Soil Intelligence */}
                <div className="bg-gradient-to-br from-[#052c16] to-[#01140a] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform">
                        <Sun className="w-48 h-48" />
                    </div>

                    <div className="flex items-start justify-between mb-10 relative z-10">
                        <div>
                            <h4 className="text-2xl font-black tracking-tight">Clima & Suelos</h4>
                            <p className="text-green-400 font-bold uppercase text-[10px] tracking-widest">Sector Lambayeque - Costa</p>
                        </div>
                        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                            <Sun className="w-6 h-6 text-amber-400" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <p className="text-5xl font-black tracking-tighter">28°C</p>
                            <p className="text-xs font-bold text-green-300 mt-1 uppercase">Cielo Despejado</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end text-green-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-black">+2° que Ayer</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Droplets className="w-5 h-5 text-blue-400" />
                                <span className="text-xs font-bold">Humedad Suelo</span>
                            </div>
                            <span className="text-sm font-black text-green-400">42%</span>
                        </div>
                        <div className="p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Wind className="w-5 h-5 text-slate-400" />
                                <span className="text-xs font-bold">Vientos E/O</span>
                            </div>
                            <span className="text-sm font-black text-green-400">18 km/h</span>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-[#166534] rounded-3xl border border-green-500/20 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Recomendación IA</span>
                        </div>
                        <p className="text-xs font-medium text-green-100/90 leading-relaxed italic">Condiciones óptimas para fertilización foliar de arroz hoy después de las 4:00 PM.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Farmers Table */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col">
                    <h4 className="text-lg font-black text-slate-800 tracking-tight mb-8">Ranking de Agricultores por Compra</h4>
                    <div className="space-y-6">
                        {[
                            { name: 'Jorge Mendívil', total: 15400, credit: 8000, trend: 'up' },
                            { name: 'Ricardo Serna', total: 12200, credit: 1500, trend: 'up' },
                            { name: 'Pedro Alva', total: 9800, credit: 4000, trend: 'down' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center font-bold text-[#166534]">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{f.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Deuda Actual: S/ {f.credit.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800 tracking-tight text-lg">S/ {f.total.toLocaleString()}</p>
                                    <div className={`flex items-center gap-1 justify-end ${f.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                        {f.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Histórico</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Export & Actions */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                        <Download className="w-10 h-10 text-slate-300" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Exportar Inteligencia Agrícola</h4>
                        <p className="text-sm text-slate-400 font-medium px-10">Genera reportes PDF detallados para presentación a gerencia o entidades bancarias.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
                            PDF Ejecutivo
                        </button>
                        <button className="px-8 py-3 bg-green-500 text-green-950 rounded-2xl font-bold text-sm shadow-xl shadow-green-500/10 hover:scale-105 transition-all">
                            Excel Consolidado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
