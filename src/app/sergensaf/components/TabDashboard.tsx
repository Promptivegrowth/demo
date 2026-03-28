'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Activity, CheckCircle, Package, Car, ShoppingCart, Truck, AlertTriangle, FileText, Anchor, Navigation, DollarSign, Zap
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

export default function TabDashboard({ showToast, setActiveTab }: { showToast: Function, setActiveTab: Function }) {
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
        utilidad: 0,
        eficiencia: 0,
        vehiculosDisponibles: 0,
        vehiculosTotal: 0
    })

    const [ultimasOrdenes, setUltimasOrdenes] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])

    const [chartMode, setChartMode] = useState<'ventas' | 'm3'>('ventas')

    // Chart References
    const barChartRef = useRef<HTMLCanvasElement>(null)
    const doughnutChartRef = useRef<HTMLCanvasElement>(null)
    const lineChartRef = useRef<HTMLCanvasElement>(null)
    const chartInstances = useRef<{ bar: any, doughnut: any, line: any }>({ bar: null, doughnut: null, line: null })

    // Fetch all dashboard data
    const fetchData = async () => {
        try {
            const now = new Date()

            const { data: prods } = await supabase.from('saf_productos').select('*')
            const { data: ordenes } = await supabase.from('saf_ordenes').select('*, saf_clientes(razon_social)')
            const { data: cobros } = await supabase.from('saf_cuentas_por_cobrar').select('*')
            const { data: flota } = await supabase.from('saf_flota').select('*')
            const { data: produccion } = await supabase.from('saf_produccion').select('*')

            const currentMonth = now.getMonth()
            const ordenesMes = (ordenes || []).filter(o => new Date(o.fecha).getMonth() === currentMonth && o.estado !== 'anulado')
            const m3Mes = (produccion || []).filter(p => new Date(p.fecha).getMonth() === currentMonth).reduce((sum, p) => sum + Number(p.cantidad_producida), 0)

            const totalVentas = ordenesMes.reduce((sum, o) => sum + Number(o.total), 0)
            const totalPorCobrar = (cobros || []).filter(c => c.estado !== 'pagado').reduce((sum, c) => sum + Number(c.saldo), 0)

            setKpis({
                ventasMes: totalVentas,
                ordenesMes: ordenesMes.length,
                m3Mes: m3Mes || 0,
                stockTotal: (prods || []).reduce((sum, p) => sum + Number(p.stock_actual), 0),
                porCobrar: totalPorCobrar,
                utilidad: totalVentas * 0.35, // Margen estimado
                eficiencia: m3Mes > 0 ? Math.min(Math.round((m3Mes / 500) * 100), 100) : 0,
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

            if (newAlerts.length === 0) {
                newAlerts.push({ id: 'welcome', tipo: 'info', prop: 'ℹ️', texto: 'Sistema Operativo: Sin incidencias críticas', ref: 'Panel de Control' })
                newAlerts.push({ id: 'demo1', tipo: 'info', prop: '💡', texto: 'Consejo: Revise el stock de cemento semanalmente', ref: 'Tip de Gestión' })
            }

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
                const color = chartMode === 'ventas' ? 'rgba(240, 165, 0, 0.8)' : 'rgba(31, 111, 235, 0.8)'
                const borderColor = chartMode === 'ventas' ? '#f0a500' : '#1f6feb'

                // @ts-ignore
                chartInstances.current.bar = new window.Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar'],
                        datasets: [{
                            label: chartMode === 'ventas' ? 'Ventas (S/.)' : 'Despacho (m³)',
                            data: chartMode === 'ventas' ? [35000, 42000, kpis.ventasMes || 15000] : [280, 410, kpis.m3Mes || 120],
                            backgroundColor: color,
                            borderColor: borderColor,
                            borderWidth: 1,
                            borderRadius: 12,
                            barPercentage: 0.5
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8b949e', font: { family: 'Rajdhani', weight: 'bold' } }, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { color: '#8b949e', font: { family: 'Rajdhani', weight: 'bold' } } }
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
                        labels: ['Arena', 'Piedra', 'Hormigón', 'Afirmado'],
                        datasets: [{
                            data: [40, 25, 20, 15],
                            backgroundColor: ['#f0a500', '#da3633', '#238636', '#1f6feb'],
                            borderWidth: 0,
                            hoverOffset: 15
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: '#8b949e', font: { family: 'Rajdhani', size: 11 }, padding: 15, usePointStyle: true } }
                        },
                        cutout: '80%',
                        layout: { padding: 5 }
                    }
                })
            }

            // Line Chart (Trends)
            if (lineChartRef.current) {
                if (chartInstances.current.line) chartInstances.current.line.destroy()
                const ctx3 = lineChartRef.current.getContext('2d')
                // @ts-ignore
                chartInstances.current.line = new window.Chart(ctx3, {
                    type: 'line',
                    data: {
                        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
                        datasets: [
                            {
                                label: 'Producción',
                                data: [65, 59, 80, 81, 56, 55, 40],
                                borderColor: '#f0a500',
                                backgroundColor: 'rgba(240, 165, 0, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0
                            },
                            {
                                label: 'Despachos',
                                data: [45, 48, 62, 70, 48, 50, 35],
                                borderColor: '#1f6feb',
                                backgroundColor: 'transparent',
                                borderDash: [5, 5],
                                tension: 0.4,
                                pointRadius: 0
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { color: '#8b949e', font: { family: 'Rajdhani', size: 10 } } }
                        }
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

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#f0a500]/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#f0a500]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#f0a500]/10 transition-all border border-white/5"></div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 w-max text-[#f0a500] mb-3 relative z-10 shadow-inner">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] text-[#8b949e] uppercase font-black tracking-widest mb-1">Ventas Mes</p>
                        <h3 className="text-xl font-rajdhani font-black text-white leading-tight">{formatSoles(kpis.ventasMes)}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#1f6feb]/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#1f6feb]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#1f6feb]/10 transition-all border border-white/5"></div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 w-max text-[#1f6feb] mb-3 relative z-10 shadow-inner">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] text-[#8b949e] uppercase font-black tracking-widest mb-1">Órdenes</p>
                        <h3 className="text-2xl font-rajdhani font-black text-white leading-tight">{kpis.ordenesMes}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#f0a500]/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#f0a500]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#f0a500]/10 transition-all border border-white/5"></div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 w-max text-[#f0a500] mb-3 relative z-10 shadow-inner">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] text-[#8b949e] uppercase font-black tracking-widest mb-1">Despacho m³</p>
                        <h3 className="text-2xl font-rajdhani font-black text-white leading-tight">{kpis.m3Mes}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#da3633]/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#da3633]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#da3633]/10 transition-all border border-white/5"></div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 w-max text-[#da3633] mb-3 relative z-10 shadow-inner">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] text-[#da3633] uppercase font-black tracking-widest mb-1">Cuentas x Cobrar</p>
                        <h3 className="text-[17px] font-rajdhani font-black text-[#da3633] leading-tight break-all">{formatSoles(kpis.porCobrar)}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#238636]/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#238636]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#238636]/10 transition-all border border-white/5"></div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 w-max text-[#238636] mb-3 relative z-10 shadow-inner">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] text-[#8b949e] uppercase font-black tracking-widest mb-1">Utilidad Est. (35%)</p>
                        <h3 className="text-xl font-rajdhani font-black text-[#238636] leading-tight">{formatSoles(kpis.utilidad)}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#0B0F19]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#1f6feb]/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#1f6feb]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#1f6feb]/10 transition-all border border-white/5"></div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 w-max text-[#1f6feb] mb-3 relative z-10 shadow-inner">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] text-[#8b949e] uppercase font-black tracking-widest mb-1">Eficiencia Planta</p>
                        <h3 className="text-2xl font-rajdhani font-black text-white leading-tight">{kpis.eficiencia}%</h3>
                    </div>
                </motion.div>
            </div>

            {/* CHARTS LAYER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-6 relative overflow-hidden group hover:border-[#f0a500]/20 transition-all">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex flex-col">
                            <h3 className="font-rajdhani font-bold text-white text-xl flex items-center gap-2">
                                <Activity className="h-5 w-5 text-[#f0a500]" /> Histórico Operativo
                            </h3>
                            <p className="text-[10px] text-[#8b949e] font-medium uppercase tracking-widest mt-1 ml-7">Rendimiento Mensual</p>
                        </div>
                        <select
                            value={chartMode}
                            onChange={(e) => {
                                setChartMode(e.target.value as any)
                                setTimeout(updateCharts, 100)
                            }}
                            className="bg-black/60 border border-white/10 text-[10px] font-black text-[#f0a500] rounded-lg px-3 py-1.5 outline-none focus:border-[#f0a500] transition-colors cursor-pointer appearance-none shadow-xl uppercase tracking-tighter"
                        >
                            <option value="ventas">Ventas (S/.)</option>
                            <option value="m3">Despacho (m³)</option>
                        </select>
                    </div>
                    <div className="h-64 w-full relative z-10">
                        <canvas ref={barChartRef}></canvas>
                    </div>
                </motion.div>

                <div className="flex flex-col gap-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="flex-1 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-5 relative overflow-hidden group">
                        <h3 className="font-rajdhani font-bold text-white text-base flex items-center gap-2 mb-4">
                            <Package className="h-4 w-4 text-[#f0a500]" /> Mix de Stock
                        </h3>
                        <div className="h-40 w-full relative z-10">
                            <canvas ref={doughnutChartRef}></canvas>
                        </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 }} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-5 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-rajdhani font-bold text-white text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#238636]" /> Tendencia 7D
                            </h3>
                            <span className="text-[10px] font-bold text-[#238636]">+18.4%</span>
                        </div>
                        <div className="h-20 w-full relative z-10">
                            <canvas ref={lineChartRef}></canvas>
                        </div>
                    </motion.div>
                </div>
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

                {/* Alertas Operativas Estilo Comando */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#da3633]/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 relative z-10">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <Anchor className="h-4 w-4 text-[#da3633] animate-pulse" /> Command Center: Alerts
                        </h3>
                        <span className="px-2 py-0.5 bg-[#da3633]/20 text-[#da3633] text-[9px] font-bold rounded-md animate-pulse">LIVE</span>
                    </div>

                    <div className="p-4 overflow-y-auto max-h-[340px] space-y-3 relative z-10 custom-scrollbar">
                        {alertas.length === 0 ? (
                            <div className="h-48 flex flex-col items-center justify-center text-[#8b949e]">
                                <div className="h-16 w-16 rounded-full bg-[#238636]/5 flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-[#238636]/30" />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest font-bold">Status: All Systems Go</p>
                            </div>
                        ) : (
                            alertas.map((a, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (a.tipo === 'stock') setActiveTab('Inventario')
                                        else if (a.tipo === 'cobro') setActiveTab('Cobranzas')
                                        else if (a.tipo === 'flota') setActiveTab('Flota')
                                    }}
                                    className="group p-4 rounded-2xl bg-gradient-to-r from-black/40 to-black/20 hover:from-[#f0a500]/10 hover:to-transparent border border-white/5 hover:border-[#f0a500]/30 transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 bg-black/60 rounded-xl flex items-center justify-center text-xl shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5">
                                            {a.prop}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-tight mb-0.5">{a.tipo === 'stock' ? 'Inventory Alert' : 'Finance Alert'}</span>
                                            <span className="text-sm font-bold text-white group-hover:text-[#f0a500] transition-colors">{a.texto}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-black tracking-widest text-[#f0a500] bg-black/60 px-2.5 py-1 rounded-lg border border-[#f0a500]/20 uppercase">
                                            {a.ref}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

            </div >

        </div >
    )
}
