'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Users, AlertTriangle, Target,
    Sprout, Calendar, ArrowUpRight, ArrowDownRight,
    ShoppingCart, Landmark, UserPlus, Droplets,
    Tractor, History as HistoryIcon
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'

interface TabAgriHubProps {
    onTabChange: (tab: string) => void
}

export function TabAgriHub({ onTabChange }: TabAgriHubProps) {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [recentSales, setRecentSales] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const [hStats, rSales] = await Promise.all([
                    agriService.getHubStats(),
                    agriService.getVentasRecientes()
                ])
                setStats(hStats)
                setRecentSales(rSales)
            } catch (error) {
                console.error('Error loading hub data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl" />)}
                </div>
                <div className="h-96 bg-slate-200 rounded-3xl" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Welcome & Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Control Agrícola</h2>
                    <p className="text-slate-500 font-medium">Resumen operativo para la campaña 2026-I</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => onTabChange('pos')}
                        className="flex items-center gap-2 px-6 py-3 bg-[#166534] text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-all text-sm"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Nueva Venta
                    </button>
                    <button
                        onClick={() => onTabChange('agentes')}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-[#166534] border-2 border-green-100 rounded-2xl font-bold hover:bg-green-50 transition-all text-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Asignar Agente
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16 text-green-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
                            <Landmark className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ventas Totales</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">S/ {stats?.totalVentas?.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            12%
                        </span>
                    </div>
                </motion.div>

                {/* Farmers Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agricultores</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stats?.numAgricultores}</h3>
                        <span className="text-xs font-bold text-blue-500 font-medium">Cartera Activa</span>
                    </div>
                </motion.div>

                {/* Alerts Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-16 h-16 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                            <Sprout className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Crítico</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stats?.alertasStock}</h3>
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                            Alertas Hoy
                        </span>
                    </div>
                </motion.div>

                {/* Goals Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Target className="w-16 h-16 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                            <Target className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meta Mensual</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stats?.metaAlcanzada}%</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">S/ 250,000</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats?.metaAlcanzada}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Field Monitoring / Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Tractor className="w-64 h-64" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">Ventas por Agente de Campo</h4>
                                <p className="text-sm text-slate-400 font-medium">Monitoreo en tiempo real de visitas y cierres</p>
                            </div>
                            <button className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all">
                                <Calendar className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { name: 'Juan Quispe', zone: 'Lambayeque', sales: 45000, visits: 12, rating: 95 },
                                { name: 'Ana Torres', zone: 'Piura', sales: 32000, visits: 8, rating: 88 },
                                { name: 'Carlos Ruíz', zone: 'La Libertad', sales: 28500, visits: 15, rating: 72 },
                            ].map((agente, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-bold text-[#166534] border border-slate-100 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            {agente.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{agente.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{agente.zone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-800 tracking-tight">S/ {agente.sales.toLocaleString()}</p>
                                        <div className="flex items-center gap-2 justify-end">
                                            <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${agente.rating}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{agente.visits} Visitas</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-bold text-slate-400 transition-all border border-dashed border-slate-200">
                            Ver todos los reportes de campo
                        </button>
                    </div>
                </div>

                {/* Recent Transactions & Alerts */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight mb-6">Últimas Ventas</h4>
                        <div className="space-y-6">
                            {recentSales.map((venta, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-green-50 group-hover:border-green-200 transition-colors shrink-0">
                                        <HistoryIcon className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">S/ {venta.total.toLocaleString()}</p>
                                        <p className="text-[10px] font-medium text-slate-400 truncate">{venta.agri_agricultores?.nombre}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">
                                            {venta.metodo_pago}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentSales.length === 0 && <p className="text-xs text-slate-400 text-center py-4 italic">No hay ventas registradas hoy</p>}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#166534] to-[#072c14] rounded-[3rem] p-8 text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
                        {/* Abstract visual */}
                        <Droplets className="absolute -top-4 -right-4 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />

                        <h4 className="text-lg font-bold mb-2">Salud de Cultivos</h4>
                        <p className="text-xs text-green-200/80 mb-6 font-medium leading-relaxed">Lambayeque reporta alta humedad. Sugerir fungicidas preventivos a agricultores de arroz.</p>

                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#166534] bg-green-100 flex items-center justify-center text-[10px] font-bold text-[#166534]">
                                        JM
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-green-300">+12 afectados</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
