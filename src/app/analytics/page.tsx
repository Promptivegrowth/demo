'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Users, Package, AlertTriangle, Target, Zap, Brain, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, RadialBarChart, RadialBar, Cell,
} from 'recharts'

interface AnalyticsData {
    revenue: number; expenses: number; clients: number; products: number
    monthlyTrend: { month: string; ingresos: number; egresos: number }[]
    topProducts: { name: string; sold: number; revenue: number }[]
    clientRetention: { month: string; nuevos: number; recurrentes: number }[]
    healthScore: number
    alerts: { title: string; severity: 'info' | 'warning' | 'critical'; detail: string }[]
    predictions: { label: string; current: number; predicted: number; change: number }[]
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [txns, clients, inventory, deals, projects] = await Promise.all([
                supabase.from('transactions').select('*').order('created_at'),
                supabase.from('clients').select('*'),
                supabase.from('inventory').select('*'),
                supabase.from('deals').select('*'),
                supabase.from('projects').select('*'),
            ])

            const t = txns.data || []
            const c = clients.data || []
            const inv = inventory.data || []
            const d = deals.data || []

            const revenue = t.filter(x => x.type === 'ingreso').reduce((s, x) => s + Number(x.amount), 0)
            const expenses = t.filter(x => x.type === 'egreso').reduce((s, x) => s + Number(x.amount), 0)

            // Monthly trend
            const monthMap: Record<string, { ingresos: number; egresos: number }> = {}
            t.forEach(tx => {
                const date = new Date(tx.created_at)
                const key = date.toLocaleDateString('es-PE', { month: 'short' })
                if (!monthMap[key]) monthMap[key] = { ingresos: 0, egresos: 0 }
                if (tx.type === 'ingreso') monthMap[key].ingresos += Number(tx.amount)
                else monthMap[key].egresos += Number(tx.amount)
            })

            // Top products by stock * price (simulated sales)
            const topProducts = inv
                .map(i => ({ name: i.name, sold: Math.floor(Math.random() * 50) + 5, revenue: i.stock * Number(i.price) }))
                .sort((a, b) => b.revenue - a.revenue).slice(0, 5)

            // Client retention (simulated)
            const retentionMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
            const clientRetention = retentionMonths.map((m, i) => ({
                month: m, nuevos: Math.floor(Math.random() * 8) + 2, recurrentes: Math.max(0, c.length - Math.floor(Math.random() * 5) - i)
            }))

            // Health Score (0-100)
            const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
            const clientGrowth = c.length > 3 ? 80 : c.length * 20
            const inventoryHealth = inv.filter(i => i.stock > i.min_stock).length / Math.max(inv.length, 1) * 100
            const dealConversion = d.length > 0 ? (d.filter(x => x.stage === 'won').length / d.length) * 100 : 50
            const healthScore = Math.round((profitMargin * 0.3 + clientGrowth * 0.25 + inventoryHealth * 0.25 + dealConversion * 0.2))

            // Predictions (simple linear extrapolation)
            const monthValues = Object.values(monthMap)
            const lastIncome = monthValues.length > 0 ? monthValues[monthValues.length - 1].ingresos : 0
            const prevIncome = monthValues.length > 1 ? monthValues[monthValues.length - 2].ingresos : lastIncome
            const incomeGrowth = prevIncome > 0 ? ((lastIncome - prevIncome) / prevIncome) * 100 : 5

            const predictions = [
                { label: 'Ingresos Próx. Mes', current: lastIncome, predicted: Math.round(lastIncome * (1 + incomeGrowth / 100)), change: incomeGrowth },
                { label: 'Clientes Estimados', current: c.length, predicted: Math.round(c.length * 1.15), change: 15 },
                { label: 'Margen Proyectado', current: Math.round(profitMargin), predicted: Math.round(profitMargin * 1.05), change: 5 },
            ]

            // Smart Alerts
            const alerts: AnalyticsData['alerts'] = []
            const lowStock = inv.filter(i => i.stock <= i.min_stock)
            if (lowStock.length > 0) alerts.push({ title: `${lowStock.length} productos con stock crítico`, severity: 'critical', detail: lowStock.map(i => i.name).join(', ') })
            if (profitMargin < 20) alerts.push({ title: 'Margen de ganancia por debajo del 20%', severity: 'warning', detail: `Margen actual: ${profitMargin.toFixed(1)}%` })
            const inactiveClients = c.filter(cl => cl.status === 'lead').length
            if (inactiveClients > 0) alerts.push({ title: `${inactiveClients} leads sin convertir`, severity: 'info', detail: 'Considera una campaña de seguimiento' })
            if (d.filter(x => x.stage === 'lost').length > 2) alerts.push({ title: 'Alto ratio de deals perdidos', severity: 'warning', detail: 'Revisa la estrategia de ventas' })

            setData({
                revenue, expenses, clients: c.length, products: inv.length,
                monthlyTrend: Object.entries(monthMap).map(([month, vals]) => ({ month, ...vals })),
                topProducts, clientRetention, healthScore, alerts, predictions,
            })
            setLoading(false)
        }
        load()
    }, [])

    if (loading || !data) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    const healthColor = data.healthScore >= 75 ? '#22c55e' : data.healthScore >= 50 ? '#F6AD27' : '#E44078'
    const radialData = [{ name: 'Salud', value: data.healthScore, fill: healthColor }]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analítica Predictiva</h1>
                <p className="text-sm text-muted-foreground mt-1">Inteligencia de negocio con predicciones y alertas automatizadas</p>
            </div>

            {/* Top Row: Health Score + Predictions + Smart Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Health Score */}
                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Brain className="h-4 w-4 text-brand-purple" />Salud Empresarial</h3>
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width={120} height={120}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(var(--muted))' }}>
                                    <Cell fill={healthColor} />
                                </RadialBar>
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div>
                            <p className="text-4xl font-bold" style={{ color: healthColor }}>{data.healthScore}</p>
                            <p className="text-xs text-muted-foreground">de 100 puntos</p>
                            <p className="text-xs mt-1" style={{ color: healthColor }}>
                                {data.healthScore >= 75 ? '✅ Excelente' : data.healthScore >= 50 ? '⚠️ Aceptable' : '🔴 Requiere atención'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Predictions */}
                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-brand-cyan" />Predicciones (próx. 30 días)</h3>
                    <div className="space-y-3">
                        {data.predictions.map(pred => (
                            <div key={pred.label} className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">{pred.label}</p>
                                    <p className="text-sm font-semibold">
                                        {pred.label.includes('Margen') ? `${pred.predicted}%` :
                                            pred.label.includes('Clientes') ? pred.predicted :
                                                formatCurrency(pred.predicted)}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium ${pred.change >= 0 ? 'text-emerald-500' : 'text-brand-pink'}`}>
                                    {pred.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {pred.change >= 0 ? '+' : ''}{pred.change.toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Smart Alerts */}
                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-brand-amber" />Alertas Inteligentes</h3>
                    <div className="space-y-2">
                        {data.alerts.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">✅ Sin alertas. Todo en orden.</p>
                        ) : data.alerts.map((alert, i) => (
                            <div key={i} className={`p-3 rounded-lg border text-xs ${alert.severity === 'critical' ? 'bg-brand-pink/5 border-brand-pink/20' :
                                    alert.severity === 'warning' ? 'bg-brand-amber/5 border-brand-amber/20' :
                                        'bg-brand-cyan/5 border-brand-cyan/20'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${alert.severity === 'critical' ? 'text-brand-pink' :
                                            alert.severity === 'warning' ? 'text-brand-amber' : 'text-brand-cyan'
                                        }`} />
                                    <p className="font-medium">{alert.title}</p>
                                </div>
                                <p className="text-muted-foreground mt-1 ml-5">{alert.detail}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Revenue Projection */}
            <Card className="p-5 border-0">
                <h3 className="text-sm font-semibold mb-4">Tendencia de Ingresos con Proyección</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={[...data.monthlyTrend, ...(data.monthlyTrend.length > 0 ? [
                        { month: 'Proyec.', ingresos: data.predictions[0]?.predicted || 0, egresos: Math.round((data.expenses / Math.max(data.monthlyTrend.length, 1))) }
                    ] : [])]}>
                        <defs>
                            <linearGradient id="anaI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1AA3D9" stopOpacity={0.3} /><stop offset="95%" stopColor="#1AA3D9" stopOpacity={0} /></linearGradient>
                            <linearGradient id="anaE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E44078" stopOpacity={0.2} /><stop offset="95%" stopColor="#E44078" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `S/${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v) => formatCurrency(Number(v))} />
                        <Area type="monotone" dataKey="ingresos" stroke="#1AA3D9" fill="url(#anaI)" strokeWidth={2} strokeDasharray="0" name="Ingresos" />
                        <Area type="monotone" dataKey="egresos" stroke="#E44078" fill="url(#anaE)" strokeWidth={2} name="Egresos" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Bottom Row: Top Products + Client Retention */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Products */}
                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-emerald-500" />Top 5 Productos por Valor</h3>
                    <div className="space-y-3">
                        {data.topProducts.map((product, i) => (
                            <div key={product.name} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium truncate max-w-[180px]">{product.name}</span>
                                        <span className="text-xs font-bold text-brand-cyan">{formatCurrency(product.revenue)}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-[#1AA3D9] to-[#B234BD]" style={{ width: `${(product.revenue / Math.max(data.topProducts[0]?.revenue, 1)) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Client Retention */}
                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-brand-purple" />Retención de Clientes</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.clientRetention}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="recurrentes" name="Recurrentes" fill="#B234BD" radius={[4, 4, 0, 0]} stackId="a" />
                            <Bar dataKey="nuevos" name="Nuevos" fill="#1AA3D9" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    )
}
