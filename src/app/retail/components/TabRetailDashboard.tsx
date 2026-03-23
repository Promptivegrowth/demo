'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, ShoppingBag, AlertCircle,
    ArrowUpRight, ArrowDownRight, Package,
    Clock, CheckCircle2, MoreHorizontal
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import { retQuery } from '@/lib/retQuery'

export function TabRetailDashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        ordersCount: 0,
        avgTicket: 0,
        lowStockCount: 0
    })
    const [chartData, setChartData] = useState<any[]>([])
    const [recentVentas, setRecentVentas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    async function loadDashboardData() {
        try {
            const [ventas, productos] = await Promise.all([
                retQuery.getVentas(),
                retQuery.getProductos()
            ])

            // Calcular Estadísticas
            const total = ventas.reduce((acc, v) => acc + (v.total || 0), 0)
            const lowStock = productos.filter(p => (p.stock_actual <= p.stock_minimo)).length

            setStats({
                totalSales: total,
                ordersCount: ventas.length,
                avgTicket: ventas.length > 0 ? total / ventas.length : 0,
                lowStockCount: lowStock
            })

            // Procesar datos para el gráfico (últimos 7 días)
            const days: any = {}
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - i)
                return d.toISOString().split('T')[0]
            }).reverse()

            last7Days.forEach(d => days[d] = 0)
            ventas.forEach(v => {
                const d = new Date(v.fecha).toISOString().split('T')[0]
                if (days[d] !== undefined) days[d] += v.total
            })

            setChartData(Object.keys(days).map(d => ({
                name: d.split('-').slice(1).reverse().join('/'),
                valor: days[d]
            })))

            setRecentVentas(ventas.slice(0, 5))
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Ventas Totales', value: `S/ ${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: 'emerald', trend: '+12%' },
                    { label: 'Transacciones', value: stats.ordersCount, icon: ShoppingBag, color: 'blue', trend: '+5%' },
                    { label: 'Ticket Promedio', value: `S/ ${stats.avgTicket.toFixed(2)}`, icon: ArrowUpRight, color: 'purple', trend: '+2%' },
                    { label: 'Alertas Stock', value: stats.lowStockCount, icon: AlertCircle, color: 'amber', trend: stats.lowStockCount > 0 ? 'Revisar' : 'Óptimo' },
                ].map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.label}
                        className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`} />
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl bg-${item.color}-50`}>
                                <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-${item.color === 'amber' && stats.lowStockCount > 0 ? 'red' : item.color}-50 text-${item.color === 'amber' && stats.lowStockCount > 0 ? 'red' : item.color}-600`}>
                                {item.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{item.value}</h4>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Rendimiento Semanal</h3>
                            <p className="text-sm text-slate-500">Ingresos brutos por ventas diarias</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Venta (S/)
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="valor" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right Column: Alerts & Status */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-400" /> Estado del Turno
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Caja Actual</p>
                                    <p className="text-2xl font-black">S/ 450.00</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Operativo</p>
                                    <p className="text-xs text-slate-300">Iniciado: 08:30 AM</p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all">
                                Cerrar Caja / Turno
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm"
                    >
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Ventas Recientes</h3>
                        <div className="space-y-4">
                            {recentVentas.map((venta, i) => (
                                <div key={venta.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 transition-colors">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{venta.numero}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(venta.fecha).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">S/ {venta.total.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
