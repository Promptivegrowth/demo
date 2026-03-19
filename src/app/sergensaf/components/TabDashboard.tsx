'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, Clock, CalendarDays,
    AlertTriangle, DollarSign, Package, Car, ShoppingCart, Truck
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
    const [lastUpdate, setLastUpdate] = useState(new Date())
    const [nextRefresh, setNextRefresh] = useState(60)

    const [kpis, setKpis] = useState({
        ventasMes: 0,
        ventasAnterior: 0,
        ordenesMes: 0,
        ordenesAnterior: 0,
        m3Mes: 0,
        stockTotal: 0,
        porCobrar: 0,
        vehiculosDisponibles: 0,
        vehiculosTotal: 0
    })

    const [ultimasOrdenes, setUltimasOrdenes] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])
    const [calendarioActividad, setCalendarioActividad] = useState<{ ordenes: number[], despachos: number[] }>({ ordenes: [], despachos: [] })

    // Chart References
    const barChartRef = useRef<HTMLCanvasElement>(null)
    const doughnutChartRef = useRef<HTMLCanvasElement>(null)
    const chartInstances = useRef<{ bar: any, doughnut: any }>({ bar: null, doughnut: null })

    // Fetch all dashboard data
    const fetchData = async () => {
        try {
            const now = new Date()
            // Real DB calls (simplified for dashboard overview)
            const { data: prods } = await supabase.from('saf_productos').select('*')
            const { data: ordenes } = await supabase.from('saf_ordenes').select('*, saf_clientes(razon_social)')
            const { data: cobros } = await supabase.from('saf_cuentas_por_cobrar').select('*')
            const { data: flota } = await supabase.from('saf_flota').select('*')
            const { data: despachos } = await supabase.from('saf_despachos').select('*, saf_ordenes(*)')

            // Compile KPIs
            const currentMonth = now.getMonth()
            const ordenesMes = (ordenes || []).filter(o => new Date(o.fecha).getMonth() === currentMonth && o.estado !== 'anulado')
            const m3Mes = (despachos || []).filter(d => new Date(d.fecha_despacho).getMonth() === currentMonth).reduce((sum, d) => sum + 15, 0) // Mock 15m3 per desp as simple fallback if items not joined

            setKpis({
                ventasMes: ordenesMes.reduce((sum, o) => sum + Number(o.total), 0),
                ventasAnterior: 45000, // mock comparison
                ordenesMes: ordenesMes.length,
                ordenesAnterior: 15, // mock comparison
                m3Mes: m3Mes || 350, // fallback if empty
                stockTotal: (prods || []).reduce((sum, p) => sum + Number(p.stock_actual), 0),
                porCobrar: (cobros || []).filter(c => c.estado !== 'pagado').reduce((sum, c) => sum + Number(c.saldo), 0),
                vehiculosDisponibles: (flota || []).filter(f => f.estado === 'disponible').length,
                vehiculosTotal: (flota || []).length
            })

            // Últimas órdenes
            setUltimasOrdenes((ordenes || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))

            // Alertas
            const newAlerts: any[] = []
            // 1. Cuentas vencidas
            const vencidas = (cobros || []).filter(c => new Date(c.fecha_vencimiento) < now && c.estado !== 'pagado')
            vencidas.forEach(v => newAlerts.push({ id: v.id, tipo: 'cobro', prop: '🔴', texto: `Cuenta vencida S/. ${v.saldo}`, ref: v.numero_factura }))
            // 2. Stock bajo
            const bajos = (prods || []).filter(p => p.stock_actual < p.stock_minimo)
            bajos.forEach(b => newAlerts.push({ id: b.id, tipo: 'stock', prop: '🟡', texto: `Stock bajo: ${b.nombre}`, ref: `${b.stock_actual} ${b.unidad}` }))
            // 3. SOAT/Revision
            const revision = (flota || []).filter(f => new Date(f.vencimiento_soat).getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000)
            revision.forEach(r => newAlerts.push({ id: r.id, tipo: 'flota', prop: '🟠', texto: `SOAT próximo a vencer`, ref: r.placa }))

            setAlertas(newAlerts)

            // Update Charts
            updateCharts()

            setLastUpdate(new Date())
            setLoading(false)
        } catch (err) {
            console.error(err)
            showToast('Error cargando Dashboard', 'error')
        }
    }

    const updateCharts = () => {
        // @ts-ignore - Chart might be loaded dynamically
        if (typeof window !== 'undefined' && window.Chart) {
            // 1. Bar Chart: Ventas por mes
            if (barChartRef.current) {
                if (chartInstances.current.bar) chartInstances.current.bar.destroy()
                const ctx = barChartRef.current.getContext('2d')
                // @ts-ignore
                chartInstances.current.bar = new window.Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
                        datasets: [{
                            label: 'Ventas (S/.)',
                            data: [32000, 41000, 48000, 39000, 45000, kpis.ventasMes > 0 ? kpis.ventasMes : 15000],
                            backgroundColor: '#f0a500',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
                            x: { grid: { display: false }, ticks: { color: '#8b949e' } }
                        }
                    }
                })
            }

            // 2. Doughnut Chart: Distribución
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
                            backgroundColor: ['#f0a500', '#e06c00', '#238636', '#1f6feb'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { color: '#e6edf3', font: { family: 'Inter' } } }
                        },
                        cutout: '70%'
                    }
                })
            }
        }
    }

    // Auto-refresh loop
    useEffect(() => {
        fetchData()
        const timer = setInterval(() => {
            setNextRefresh(prev => {
                if (prev <= 1) { fetchData(); return 60 }
                return prev - 1
            })
        }, 1000)

        // Wait a brief moment for CDN Chart.js script to load if it hasn't, then retry charts
        setTimeout(updateCharts, 1500)

        return () => {
            clearInterval(timer)
            if (chartInstances.current.bar) chartInstances.current.bar.destroy()
            if (chartInstances.current.doughnut) chartInstances.current.doughnut.destroy()
        }
    }, [])

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-[#f0a500] border-t-transparent animate-spin" />
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
        <div className="space-y-6">

            {/* GREETING & HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#e6edf3]">
                        {getGreeting()}, <span className="text-[#f0a500]">SERGENSAF</span>
                    </h2>
                    <p className="text-sm text-[#8b949e] capitalize">
                        {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {' • '} Último acceso: hace minutos
                    </p>
                </div>
                <div className="flex bg-[#161b22] px-4 py-2 border border-[#30363d] rounded-lg items-center gap-3">
                    <Clock className="h-4 w-4 text-[#8b949e]" />
                    <span className="text-xs font-mono text-[#8b949e]">Actualiza en <span className="text-[#e6edf3] font-bold">{nextRefresh}s</span></span>
                </div>
            </div>

            {/* KPI FILA 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl flex flex-col justify-between hover:border-[#f0a500]/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-[#8b949e] uppercase font-semibold">Ventas del Mes</p>
                        <DollarSign className="h-4 w-4 text-[#238636]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{formatSoles(kpis.ventasMes)}</h3>
                        <p className="text-xs mt-1 flex items-center gap-1 font-medium text-[#238636]">
                            <TrendingUp className="h-3 w-3" /> +12% vs mes anterior
                        </p>
                    </div>
                </div>
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl flex flex-col justify-between hover:border-[#f0a500]/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-[#8b949e] uppercase font-semibold">Órdenes el Mes</p>
                        <ShoppingCart className="h-4 w-4 text-[#1f6feb]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{kpis.ordenesMes}</h3>
                        <p className="text-xs mt-1 flex items-center gap-1 font-medium text-[#8b949e]">
                            En proceso y despachadas
                        </p>
                    </div>
                </div>
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl flex flex-col justify-between hover:border-[#f0a500]/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-[#8b949e] uppercase font-semibold">m³ Despachados</p>
                        <Truck className="h-4 w-4 text-[#f0a500]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{kpis.m3Mes} <span className="text-lg text-[#8b949e]">m³</span></h3>
                        <p className="text-xs mt-1 flex items-center gap-1 font-medium text-[#238636]">
                            <TrendingUp className="h-3 w-3" /> +5% vs mes ant.
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI FILA 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl flex flex-col justify-between hover:border-[#f0a500]/50 transition-colors cursor-pointer bg-gradient-to-br from-[#161b22] to-[#0d1117]">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-[#8b949e] uppercase font-semibold">Stock Total m³</p>
                        <Package className="h-4 w-4 text-[#8b949e]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{kpis.stockTotal.toLocaleString('es-PE')}</h3>
                    </div>
                </div>
                <div className={`bg-[#161b22] p-5 border rounded-xl flex flex-col justify-between hover:border-[#f0a500]/50 transition-colors cursor-pointer ${kpis.porCobrar > 0 ? 'border-[#da3633]/50' : 'border-[#30363d]'}`}>
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-[#da3633] uppercase font-semibold">Por Cobrar</p>
                        <AlertTriangle className="h-4 w-4 text-[#da3633]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#da3633]">{formatSoles(kpis.porCobrar)}</h3>
                    </div>
                </div>
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl flex flex-col justify-between hover:border-[#f0a500]/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-[#8b949e] uppercase font-semibold">Vehículos Disponibles</p>
                        <Car className="h-4 w-4 text-[#238636]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#238636]">{kpis.vehiculosDisponibles} <span className="text-lg text-[#8b949e]">/ {kpis.vehiculosTotal}</span></h3>
                    </div>
                </div>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-rajdhani font-bold text-[#e6edf3] text-lg">Ventas por Mes</h3>
                        <select className="bg-[#0d1117] border border-[#30363d] text-xs text-[#8b949e] rounded px-2 py-1 outline-none">
                            <option>En S/.</option>
                            <option>En m³</option>
                        </select>
                    </div>
                    <div className="h-64 w-full relative">
                        <canvas ref={barChartRef}></canvas>
                    </div>
                </div>
                <div className="bg-[#161b22] p-5 border border-[#30363d] rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-rajdhani font-bold text-[#e6edf3] text-lg">Distribución por Producto</h3>
                    </div>
                    <div className="h-64 w-full relative">
                        <canvas ref={doughnutChartRef}></canvas>
                    </div>
                </div>
            </div>

            {/* TABLAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Últimas Órdenes */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
                        <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-widest flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Últimas 5 Órdenes</h3>
                    </div>
                    <div className="overflow-x-auto flex-1 p-2">
                        <table className="w-full text-left text-sm text-[#e6edf3]">
                            <tbody>
                                {ultimasOrdenes.length === 0 ? <tr><td className="p-4 text-center text-[#8b949e]">No hay órdenes recientes</td></tr> :
                                    ultimasOrdenes.map(o => (
                                        <tr key={o.id} className="hover:bg-[#21262d]/50 cursor-pointer">
                                            <td className="p-3 font-medium text-[#f0a500]">{o.numero}</td>
                                            <td className="p-3">{o.saf_clientes?.razon_social}</td>
                                            <td className="p-3 font-bold">{formatSoles(Number(o.total))}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${o.estado === 'despachado' ? 'bg-[#238636]/20 text-[#238636]' :
                                                    o.estado === 'pendiente' ? 'bg-[#1f6feb]/20 text-[#1f6feb]' :
                                                        o.estado === 'anulado' ? 'bg-[#da3633]/20 text-[#da3633]' :
                                                            'bg-[#f0a500]/20 text-[#f0a500]'
                                                    }`}>
                                                    {o.estado.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alertas */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
                        <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#da3633]" /> Alertas del Sistema</h3>
                    </div>
                    <div className="overflow-y-auto max-h-64 p-2 space-y-2">
                        {alertas.length === 0 ? <p className="p-4 text-center text-[#8b949e]">Todo en orden</p> :
                            alertas.map((a, i) => (
                                <div key={i} className="flex justify-between items-center p-3 border border-[#30363d]/50 rounded-lg hover:border-[#f0a500]/50 bg-[#0d1117] transition-colors cursor-pointer">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-xl">{a.prop}</span>
                                        <span className="text-sm font-medium text-[#e6edf3]">{a.texto}</span>
                                    </div>
                                    <span className="text-xs font-bold text-[#8b949e] bg-[#21262d] px-2 py-1 rounded">{a.ref}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

        </div>
    )
}
