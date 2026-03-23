'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, DollarSign, HardHat,
    FileCheck, AlertCircle, ArrowUpRight, ArrowDownRight,
    ChevronRight, Calendar, Users, Building
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts'
import { conQuery } from '@/lib/conQuery'

// Mock data for charts if DB is empty or for trend visualization
const chartData = [
    { month: 'Ene', ingresos: 45000, gastos: 32000 },
    { month: 'Feb', ingresos: 52000, gastos: 38000 },
    { month: 'Mar', ingresos: 48000, gastos: 41000 },
    { month: 'Abr', ingresos: 61000, gastos: 45000 },
    { month: 'May', ingresos: 55000, gastos: 42000 },
    { month: 'Jun', ingresos: 67000, gastos: 48000 },
]

export function TabDashboard() {
    const [stats, setStats] = useState({
        proyectosActivos: 0,
        presupuestoTotal: 0,
        facturacionBruta: 0,
        margenPromedio: 0,
        proyectos: [] as any[],
        cotizaciones: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const [proyRes, cotRes] = await Promise.all([
                    conQuery.getProyectos(),
                    conQuery.getCotizaciones()
                ])

                if (proyRes.data) {
                    const activos = proyRes.data.filter(p => ['aprobado', 'en_ejecucion'].includes(p.estado)).length
                    const presupuesto = proyRes.data.reduce((acc, p) => acc + (p.presupuesto_base || 0), 0)
                    const facturacion = proyRes.data.reduce((acc, p) => acc + (p.monto_contrato || 0), 0)

                    setStats(prev => ({
                        ...prev,
                        proyectosActivos: activos,
                        presupuestoTotal: presupuesto,
                        facturacionBruta: facturacion,
                        margenPromedio: facturacion > 0 ? ((facturacion - presupuesto) / facturacion) * 100 : 0,
                        proyectos: proyRes.data.slice(0, 3)
                    }))
                }

                if (cotRes.data) {
                    setStats(prev => ({
                        ...prev,
                        cotizaciones: cotRes.data.slice(0, 5)
                    }))
                }
            } catch (error) {
                console.error('Error loading dashboard:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [])

    const StatCard = ({ title, value, icon: Icon, trend, color, suffix = '' }: any) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {typeof value === 'number' && title.includes('Total') || title.includes('Facturación') ? `S/ ${value.toLocaleString()}` : value}{suffix}
                </h3>
            </div>
        </motion.div>
    )

    if (loading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-slate-100 rounded-3xl" />
                    <div className="h-80 bg-slate-100 rounded-3xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Proyectos Activos"
                    value={stats.proyectosActivos}
                    icon={HardHat}
                    trend={12}
                    color="bg-blue-500 text-blue-500"
                />
                <StatCard
                    title="Presupuesto Total"
                    value={stats.presupuestoTotal}
                    icon={Building}
                    trend={8}
                    color="bg-slate-800 text-slate-800"
                />
                <StatCard
                    title="Facturación Bruta"
                    value={stats.facturacionBruta}
                    icon={DollarSign}
                    trend={15}
                    color="bg-emerald-500 text-emerald-500"
                />
                <StatCard
                    title="Margen Estimado"
                    value={stats.margenPromedio.toFixed(1)}
                    suffix="%"
                    icon={TrendingUp}
                    trend={3}
                    color="bg-amber-500 text-amber-500"
                />
            </div>

            {/* Charts & Project Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Flujo de Caja vs Gastos</h4>
                            <p className="text-xs text-slate-400">Análisis semestral operativo</p>
                        </div>
                        <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                            <option>Últimos 6 meses</option>
                            <option>Este año</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => `S/ ${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                                <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Project Tracking */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">Seguimiento Real</h4>
                        <button className="text-blue-500 hover:underline text-xs font-bold uppercase tracking-wider">Ver todos</button>
                    </div>
                    <div className="space-y-4 flex-1">
                        {stats.proyectos.map((proy: any) => (
                            <div key={proy.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-blue-200 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] text-blue-500 font-bold uppercase mb-0.5">{proy.codigo}</p>
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{proy.nombre}</p>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${proy.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {proy.estado.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${proy.avance_porcentaje}%` }}
                                            className="h-full bg-blue-500 rounded-full"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">{proy.avance_porcentaje}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-slate-100 mt-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Ingeniero Jefe</span>
                            <span className="font-bold text-slate-800">Ing. Roberto Flores</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Quotes & Team Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Quotes Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">Últimas Cotizaciones</h4>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-lg"><Calendar className="w-4 h-4 text-slate-400" /></button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg"><FileCheck className="w-4 h-4 text-slate-400" /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Número</th>
                                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Proyecto / Cliente</th>
                                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Monto</th>
                                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.cotizaciones.length > 0 ? stats.cotizaciones.map((cot: any) => (
                                    <tr key={cot.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-4 text-sm font-bold text-slate-900 group-hover:text-blue-500">{cot.numero}</td>
                                        <td className="py-4">
                                            <p className="text-sm font-medium text-slate-800">{cot.con_proyectos?.nombre || 'General'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{cot.con_clientes?.razon_social}</p>
                                        </td>
                                        <td className="py-4 text-sm font-bold text-slate-900">S/ {cot.total?.toLocaleString()}</td>
                                        <td className="py-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cot.estado === 'aprobada' ? 'bg-emerald-100 text-emerald-600' :
                                                    cot.estado === 'enviada' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {cot.estado}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No hay cotizaciones pendientes</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Operational Alertas */}
                <div className="bg-slate-900 p-6 rounded-3xl text-white flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 blur-2xl -ml-12 -mb-12 rounded-full" />

                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <h4 className="font-bold tracking-tight">Alertas & Pendientes</h4>
                        </div>

                        <div className="space-y-5">
                            <div className="flex gap-4">
                                <div className="w-1 bg-amber-500 rounded-full h-12 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                <div>
                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Vencimiento SCTR</p>
                                    <p className="text-sm text-slate-300 leading-tight">3 operarios tienen el SCTR por vencer en 48h.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1 bg-red-500 rounded-full h-12 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                <div>
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Presupuesto Exc.</p>
                                    <p className="text-sm text-slate-300 leading-tight">PROY-0002 superó el 90% del presupuesto de materiales.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 opacity-60">
                                <div className="w-1 bg-emerald-500 rounded-full h-12 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Logística OK</p>
                                    <p className="text-sm text-slate-300 leading-tight">OC-0024 recibida con éxito en Obra Los Pinos.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="relative z-10 mt-6 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                        Revisar Log Operativo <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
