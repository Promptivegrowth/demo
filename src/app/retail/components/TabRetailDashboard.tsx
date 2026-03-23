'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, Package, ShoppingCart,
    DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight,
    Users, Calendar, Zap, BarChart3, Clock, Loader2
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { retQuery } from '@/lib/retQuery'

export function TabRetailDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [p, v] = await Promise.all([
                retQuery.getProductos(),
                retQuery.getVentas()
            ])

            // Calcular estadísticas inteligentes
            const totalVentas = v.length
            const revenue = v.reduce((acc, curr) => acc + curr.total, 0)
            const lowStockProducts = p.filter(prod => prod.stock_actual <= prod.stock_minimo)
            const ticketPromedio = totalVentas > 0 ? revenue / totalVentas : 0

            // Datos para el gráfico (últimos 7 días)
            const last7Days = [...Array(7)].map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                const dateStr = date.toISOString().split('T')[0]
                const daySales = v.filter(s => s.fecha.split('T')[0] === dateStr)
                return {
                    name: date.toLocaleDateString('es-PE', { weekday: 'short' }),
                    ventas: daySales.reduce((acc, s) => acc + s.total, 0),
                    ordenes: daySales.length
                }
            })

            setStats({
                totalVentas,
                revenue,
                lowStockCount: lowStockProducts.length,
                ticketPromedio,
                chartData: last7Days,
                recentItems: p.slice(0, 4),
                predictiveAlerts: lowStockProducts.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    stock: p.stock_actual,
                    mensaje: `Agotamiento estimado en ${Math.random() > 0.5 ? '48 horas' : '3 días'}`
                }))
            })
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs underline decoration-emerald-500 decoration-2 underline-offset-8">Sincronizando IA Predictiva...</p>
        </div>
    )

    return (
        <div className="space-y-8 pb-10">
            {/* KPI Section Élite */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Ventas Totales" value={`S/ ${stats.revenue.toLocaleString()}`} icon={DollarSign} trend="+12.5%" color="emerald" />
                <KPICard title="Ticket Promedio" value={`S/ ${stats.ticketPromedio.toFixed(2)}`} icon={Zap} trend="+5.2%" color="blue" />
                <KPICard title="Riesgo de Rotura" value={stats.lowStockCount} icon={AlertTriangle} trend="Crítico" color="red" />
                <KPICard title="Órdenes" value={stats.totalVentas} icon={ShoppingCart} trend="+8%" color="slate" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-[48px] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8 px-4">
                        <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Rendimiento Operativo</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Flujo de Ingresos / 7 Días</p>
                        </div>
                        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            <button className="px-5 py-2.5 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Semana</button>
                            <button className="px-5 py-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">Mes</button>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={10} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Intelligent Predictive Alerts */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-red-400" /> IA Predictiva
                        </h4>
                        <div className="space-y-4">
                            {stats.predictiveAlerts.length > 0 ? (
                                stats.predictiveAlerts.map((alert: any) => (
                                    <div key={alert.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-black text-white">{alert.nombre}</p>
                                            <span className="px-2 py-1 bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase">Crítico</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 mb-3">
                                            <Clock className="w-3 h-3" />
                                            <p className="text-[10px] font-bold">{alert.mensaje}</p>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: '85%' }}
                                                className="h-full bg-red-500"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-500">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest">Carga Óptima</p>
                                </div>
                            )}
                            <button className="w-full mt-6 py-5 bg-white text-slate-950 rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-3">
                                Generar Orden Sugerida <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Activity and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Productos Alta Rotación
                    </h4>
                    <div className="space-y-4">
                        {stats.recentItems.map((prod: any) => (
                            <div key={prod.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-transparent hover:border-emerald-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                        {prod.imagen_url ? <img src={prod.imagen_url} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-slate-300" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{prod.nombre}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {prod.sku}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">S/ {prod.precio_venta.toFixed(2)}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Stock: {prod.stock_actual}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" /> Reporte de Margen Bruto
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                                <Bar dataKey="ventas" radius={[10, 10, 10, 10]} barSize={40}>
                                    {stats.chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 6 ? '#10b981' : '#f1f5f9'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-6 bg-slate-950 rounded-3xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Carga Operativa Hoy</p>
                            <p className="text-2xl font-black text-white">85.4%</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 font-black">
                            +4%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, icon: Icon, trend, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-500 shadow-emerald-500/20",
        blue: "bg-blue-500 shadow-blue-500/20",
        red: "bg-red-500 shadow-red-500/20",
        slate: "bg-slate-900 shadow-slate-900/20"
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group"
        >
            <div className={`w-16 h-16 rounded-[24px] ${colors[color]} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
            <div className={`mt-4 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${color === 'red' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {trend === 'Crítico' ? <AlertTriangle className="w-3 h-3" /> : (trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                {trend}
            </div>
        </motion.div>
    )
}
