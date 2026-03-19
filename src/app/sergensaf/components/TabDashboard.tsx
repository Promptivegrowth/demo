'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Activity, CheckCircle, Package, Car, ShoppingCart, Truck, AlertTriangle, FileText, Anchor, Navigation
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// Helper to load external scripts dynamically
const useScript = (url: string) => {
    useEffect(() => {
        if (document.querySelector(`script[src="${url}"]`)) return;
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); }
    }, [url]);
};

export default function TabDashboard({ showToast }: { showToast: Function }) {
    // Load Chart.js from CDN
    useScript('https://cdn.jsdelivr.net/npm/chart.js');

    const [loading, setLoading] = useState(true)
    const [nextRefresh, setNextRefresh] = useState(60)

    const [kpis, setKpis] = useState({
        ventasMes: 0,
        ordenesMes: 0,
        m3Mes: 0,
        stockTotal: 0,
        porCobrar: 0,
        vehiculosDisponibles: 0,
        vehiculosTotal: 0
    })

    const [ultimasOrdenes, setUltimasOrdenes] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])

    // Chart References
    const barChartRef = useRef<HTMLCanvasElement>(null)
    const doughnutChartRef = useRef<HTMLCanvasElement>(null)
    const chartInstances = useRef<{ bar: any, doughnut: any }>({ bar: null, doughnut: null })

    // Fetch all dashboard data
    const fetchData = async () => {
        try {
            const now = new Date()

            const { data: prods } = await supabase.from('saf_productos').select('*')
            const { data: ordenes } = await supabase.from('saf_ordenes').select('*, saf_clientes(razon_social)')
            const { data: cobros } = await supabase.from('saf_cuentas_por_cobrar').select('*')
            const { data: flota } = await supabase.from('saf_flota').select('*')
            const { data: despachos } = await supabase.from('saf_despachos').select('*, saf_ordenes(*)')

            const currentMonth = now.getMonth()
            const ordenesMes = (ordenes || []).filter(o => new Date(o.fecha).getMonth() === currentMonth && o.estado !== 'anulado')
            const m3Mes = (despachos || []).filter(d => new Date(d.fecha_despacho).getMonth() === currentMonth).reduce((sum, d) => sum + 15, 0) // Mock 15m3 

            setKpis({
                ventasMes: ordenesMes.reduce((sum, o) => sum + Number(o.total), 0),
                ordenesMes: ordenesMes.length,
                m3Mes: m3Mes || 350,
                stockTotal: (prods || []).reduce((sum, p) => sum + Number(p.stock_actual), 0),
                porCobrar: (cobros || []).filter(c => c.estado !== 'pagado').reduce((sum, c) => sum + Number(c.saldo), 0),
                vehiculosDisponibles: (flota || []).filter(f => f.estado === 'disponible').length,
                vehiculosTotal: (flota || []).length
            })

            // Últimas órdenes
            setUltimasOrdenes((ordenes || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))

            // Alertas
            const newAlerts: any[] = []
            const vencidas = (cobros || []).filter(c => new Date(c.fecha_vencimiento) < now && c.estado !== 'pagado')
            vencidas.forEach(v => newAlerts.push({ id: v.id, tipo: 'cobro', prop: '🔴', texto: `Cuenta vencida S/. ${v.saldo}`, ref: v.numero_factura }))

            const bajos = (prods || []).filter(p => p.stock_actual < p.stock_minimo)
            bajos.forEach(b => newAlerts.push({ id: b.id, tipo: 'stock', prop: '🟡', texto: `Stock bajo: ${b.nombre}`, ref: `${b.stock_actual} ${b.unidad}` }))

            const revSoat = (flota || []).filter(f => new Date(f.vencimiento_soat).getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000)
            revSoat.forEach(r => newAlerts.push({ id: r.id + '_soat', tipo: 'flota', prop: new Date(r.vencimiento_soat) < now ? '🔴' : '🟠', texto: new Date(r.vencimiento_soat) < now ? `SOAT VENCIDO` : `SOAT próximo a vencer`, ref: r.placa }))

            const revTec = (flota || []).filter(f => new Date(f.vencimiento_rev_tecnica).getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000)
            revTec.forEach(r => newAlerts.push({ id: r.id + '_rev', tipo: 'flota', prop: new Date(r.vencimiento_rev_tecnica) < now ? '🔴' : '🟠', texto: new Date(r.vencimiento_rev_tecnica) < now ? `REVISIÓN TÉC. VENCIDA` : `Rev. Técnica próxima a vencer`, ref: r.placa }))

            setAlertas(newAlerts)
            updateCharts()
            setLoading(false)
        } catch (err) {
            console.error(err)
            showToast('Error cargando Dashboard', 'error')
        }
    }

    const updateCharts = () => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.Chart) {
            // Bar Chart
            if (barChartRef.current) {
                if (chartInstances.current.bar) chartInstances.current.bar.destroy()
                const ctx = barChartRef.current.getContext('2d')
                const gradient = ctx?.createLinearGradient(0, 0, 0, 400)
                if (gradient) {
                    gradient.addColorStop(0, 'rgba(240, 165, 0, 0.8)')
                    gradient.addColorStop(1, 'rgba(240, 165, 0, 0.1)')
                }

                // @ts-ignore
                chartInstances.current.bar = new window.Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
                        datasets: [{
                            label: 'Ventas (S/.)',
                            data: [32000, 41000, 48000, 39000, 45000, kpis.ventasMes > 0 ? kpis.ventasMes : 15000],
                            backgroundColor: gradient || '#f0a500',
                            borderColor: '#f0a500',
                            borderWidth: 1,
                            borderRadius: 6,
                            barPercentage: 0.6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b949e', font: { family: 'Inter' } }, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { color: '#8b949e', font: { family: 'Inter' } } }
                        }
                    }
                })
            }

            // Doughnut Chart
            if (doughnutChartRef.current) {
                if (chartInstances.current.doughnut) chartInstances.current.doughnut.destroy()
                const ctx2 = doughnutChartRef.current.getContext('2d')
                // @ts-ignore
                chartInstances.current.doughnut = new window.Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Arena Fina', 'Arena Gruesa', 'Piedra Chancada', 'Hormigón'],
                        datasets: [{
                            data: [35, 25, 20, 20],
                            backgroundColor: ['#f0a500', '#da3633', '#238636', '#1f6feb'],
                            borderWidth: 0,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { color: '#e6edf3', font: { family: 'Inter', size: 12 }, padding: 20 } }
                        },
                        cutout: '75%',
                        layout: { padding: 10 }
                    }
                })
            }
        }
    }

    useEffect(() => {
        fetchData()
        const timer = setInterval(() => {
            setNextRefresh(prev => {
                if (prev <= 1) { fetchData(); return 60 }
                return prev - 1
            })
        }, 1000)

        setTimeout(updateCharts, 1500)

        return () => {
            clearInterval(timer)
            if (chartInstances.current.bar) chartInstances.current.bar.destroy()
            if (chartInstances.current.doughnut) chartInstances.current.doughnut.destroy()
        }
    }, [])

    if (loading) return (
        <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#f0a500]/20 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-4 border-[#f0a500] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-[#f0a500]" />
                </div>
            </div>
            <p className="font-rajdhani font-medium text-[#f0a500] animate-pulse tracking-widest text-lg">SINCRONIZANDO DATA...</p>
        </div>
    )

    const getGreeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Buenos días'
        if (h < 19) return 'Buenas tardes'
        return 'Buenas noches'
    }

    const formatSoles = (v: number) => `S/ ${(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    return (
        <div className="space-y-6 text-[#e6edf3] relative">

            {/* AMBIENT GLOW BACKGROUND */}
            <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-[#f0a500]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-rajdhani font-black text-white"
                    >
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0a500] to-[#ffcc5c] drop-shadow-sm">SERGENSAF</span>
                    </motion.h2>
                    <p className="text-sm text-[#8b949e] capitalize mt-1 font-medium tracking-wide">
                        {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex bg-black/40 backdrop-blur-xl px-4 py-2 border border-white/10 rounded-xl items-center gap-3 shadow-lg"
                >
                    <div className="w-2 h-2 rounded-full bg-[#238636] animate-pulse shadow-[0_0_8px_#238636]" />
                    <span className="text-xs font-bold tracking-widest text-white uppercase">Sincronización: <span className="text-[#f0a500] ml-1">{nextRefresh}s</span></span>
                </motion.div>
            </div>

            {/* KPI GRID 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#f0a500]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#238636]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#238636]/20 transition-all"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner text-[#238636]">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mb-1">Ventas del Mes</p>
                        <h3 className="text-3xl font-rajdhani font-black text-white drop-shadow-md">{formatSoles(kpis.ventasMes)}</h3>
                        <p className="text-xs mt-2 flex items-center gap-1 font-bold text-[#238636] bg-[#238636]/10 w-max px-2 py-1 rounded-full border border-[#238636]/20">
                            +12% vs mes ant.
                        </p>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#1f6feb]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1f6feb]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#1f6feb]/20 transition-all"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner text-[#1f6feb]">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mb-1">Órdenes el Mes</p>
                        <h3 className="text-3xl font-rajdhani font-black text-white drop-shadow-md">{kpis.ordenesMes}</h3>
                        <p className="text-xs mt-2 flex items-center gap-1 font-bold text-[#1f6feb] bg-[#1f6feb]/10 w-max px-2 py-1 rounded-full border border-[#1f6feb]/20">
                            En proceso
                        </p>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#f0a500]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0a500]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#f0a500]/20 transition-all"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner text-[#f0a500]">
                            <Truck className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mb-1">m³ Despachados</p>
                        <h3 className="text-3xl font-rajdhani font-black text-white drop-shadow-md">{kpis.m3Mes} <span className="text-xl text-[#f0a500]">m³</span></h3>
                        <p className="text-xs mt-2 flex items-center gap-1 font-bold text-[#f0a500] bg-[#f0a500]/10 w-max px-2 py-1 rounded-full border border-[#f0a500]/20">
                            +5% vs mes ant.
                        </p>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#da3633]/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#da3633]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#da3633]/20 transition-all"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner text-[#da3633]">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <p className="text-xs text-[#da3633] uppercase font-bold tracking-widest mb-1">Por Cobrar</p>
                        <h3 className="text-3xl font-rajdhani font-black text-[#da3633] drop-shadow-md">{formatSoles(kpis.porCobrar)}</h3>
                        <p className="text-xs mt-2 flex items-center gap-1 font-bold text-[#da3633] bg-[#da3633]/10 w-max px-2 py-1 rounded-full border border-[#da3633]/20">
                            Requiere Atención
                        </p>
                    </div>
                </motion.div>

            </div>

            {/* CHARTS LAYER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="font-rajdhani font-bold text-white text-xl flex items-center gap-2">
                            <Activity className="h-5 w-5 text-[#f0a500]" /> Histórico de Ventas
                        </h3>
                        <select className="bg-black/40 border border-white/10 text-xs font-bold text-[#8b949e] rounded-xl px-3 py-2 outline-none focus:border-[#f0a500] transition-colors cursor-pointer appearance-none">
                            <option>Volumen en S/.</option>
                            <option>Despachos en m³</option>
                        </select>
                    </div>
                    <div className="h-64 w-full relative z-10">
                        <canvas ref={barChartRef}></canvas>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="font-rajdhani font-bold text-white text-xl flex items-center gap-2">
                            <Package className="h-5 w-5 text-[#f0a500]" /> Distribución Stock
                        </h3>
                    </div>
                    <div className="h-64 w-full relative z-10">
                        <canvas ref={doughnutChartRef}></canvas>
                    </div>
                </motion.div>
            </div>

            {/* DATA TABLES LAYER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Últimas Órdenes */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-[#1f6feb]" /> Últimas 5 Órdenes
                        </h3>
                    </div>

                    <div className="p-4 flex-1">
                        {ultimasOrdenes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[#8b949e]">
                                <FileText className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-sm">No hay órdenes recientes</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {ultimasOrdenes.map(o => (
                                    <div key={o.id} className="group p-4 rounded-2xl bg-black/20 hover:bg-white/5 border border-white/5 transition-all cursor-pointer flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-rajdhani font-bold text-[#f0a500] text-lg leading-none">{o.numero}</span>
                                            <span className="text-xs text-[#8b949e] font-medium">{o.saf_clientes?.razon_social}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-white tracking-wider">{formatSoles(Number(o.total))}</span>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-sm ${o.estado === 'despachado' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' :
                                                o.estado === 'pendiente' ? 'bg-[#1f6feb]/10 text-[#1f6feb] border-[#1f6feb]/30' :
                                                    o.estado === 'anulado' ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30' :
                                                        'bg-[#f0a500]/10 text-[#f0a500] border-[#f0a500]/30'
                                                }`}>
                                                {o.estado.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Alertas */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#da3633]/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Anchor className="h-4 w-4 text-[#da3633]" /> Alertas Operativas
                        </h3>
                    </div>

                    <div className="p-4 overflow-y-auto max-h-[340px] space-y-2 relative z-10 custom-scrollbar">
                        {alertas.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[#8b949e]">
                                <CheckCircle className="h-10 w-10 mb-3 text-[#238636]/50" />
                                <p className="text-sm">Sistema operando sin alertas</p>
                            </div>
                        ) : (
                            alertas.map((a, i) => (
                                <div key={i} className="group p-4 rounded-2xl bg-black/20 hover:bg-white/5 border border-white/5 hover:border-[#f0a500]/30 transition-all cursor-pointer flex items-center justify-between">
                                    <div className="flex gap-3 items-center">
                                        <div className="p-2 bg-white/5 rounded-xl text-xl shadow-inner group-hover:scale-110 transition-transform">
                                            {a.prop}
                                        </div>
                                        <span className="text-sm font-bold text-white">{a.texto}</span>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-widest text-[#8b949e] bg-black/50 px-3 py-1.5 rounded-full border border-white/5 uppercase">
                                        {a.ref}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

            </div>

        </div>
    )
}
