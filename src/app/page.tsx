'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign, TrendingUp, TrendingDown, Users, Package, ClipboardList,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, ChevronRight,
  FileText, Calendar
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { motion } from 'framer-motion'

interface DashboardData {
  totalIncome: number
  totalExpense: number
  clientCount: number
  inventoryAlerts: number
  activeWorkflows: number
  lowStockItems: { name: string; stock: number; min_stock: number }[]
  chartData: { date: string; ingresos: number; egresos: number }[]
  dealsByStage: { name: string; value: number; color: string }[]
  recentTransactions: { id: string; description: string; amount: number; type: string; created_at: string }[]
  upcomingEvents: { id: string; title: string; event_date: string; color: string }[]
  recentDocs: { id: string; name: string; file_type: string; status: string }[]
}

const BRAND_COLORS = ['#B234BD', '#1AA3D9', '#F6AD27', '#E44078', '#8b5cf6']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0, totalExpense: 0, clientCount: 0, inventoryAlerts: 0,
    activeWorkflows: 0, lowStockItems: [], chartData: [], dealsByStage: [],
    recentTransactions: [], upcomingEvents: [], recentDocs: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      const [transactions, clients, inventory, workflows, deals, events, docs] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: true }),
        supabase.from('clients').select('id'),
        supabase.from('inventory').select('name, stock, min_stock'),
        supabase.from('workflows').select('current_state'),
        supabase.from('deals').select('stage, value'),
        supabase.from('events').select('id, title, event_date, color').order('event_date').limit(4),
        supabase.from('documents').select('id, name, file_type, status').order('created_at', { ascending: false }).limit(4),
      ])

      const txns = transactions.data || []
      const income = txns.filter(t => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0)
      const expense = txns.filter(t => t.type === 'egreso').reduce((s, t) => s + Number(t.amount), 0)
      const inventoryItems = inventory.data || []
      const lowStock = inventoryItems.filter(i => i.stock <= i.min_stock)
      const activeWf = (workflows.data || []).filter(w => w.current_state !== 'finalizado').length

      const monthMap: Record<string, { ingresos: number; egresos: number }> = {}
      txns.forEach(t => {
        const d = new Date(t.created_at)
        const key = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
        if (!monthMap[key]) monthMap[key] = { ingresos: 0, egresos: 0 }
        if (t.type === 'ingreso') monthMap[key].ingresos += Number(t.amount)
        else monthMap[key].egresos += Number(t.amount)
      })

      const stageMap: Record<string, number> = {}
        ; (deals.data || []).forEach(d => { stageMap[d.stage] = (stageMap[d.stage] || 0) + 1 })
      const stageLabels: Record<string, string> = { lead: 'Lead', qualified: 'Calificado', proposal: 'Propuesta', won: 'Ganado', lost: 'Perdido' }

      setData({
        totalIncome: income, totalExpense: expense,
        clientCount: (clients.data || []).length,
        inventoryAlerts: lowStock.length,
        activeWorkflows: activeWf,
        lowStockItems: lowStock.slice(0, 5),
        chartData: Object.entries(monthMap).map(([date, vals]) => ({ date, ...vals })),
        dealsByStage: Object.entries(stageMap).map(([stage, value], i) => ({
          name: stageLabels[stage] || stage, value, color: BRAND_COLORS[i % BRAND_COLORS.length],
        })),
        recentTransactions: [...txns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
        upcomingEvents: events.data || [],
        recentDocs: docs.data || [],
      })
      setLoading(false)
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  const balance = data.totalIncome - data.totalExpense
  const stats = [
    { label: 'Balance Neto', value: formatCurrency(balance), icon: DollarSign, trend: '+12.5%', trendUp: true, gradient: 'from-[#B234BD] to-[#8b5cf6]', glow: 'glow-purple' },
    { label: 'Ingresos', value: formatCurrency(data.totalIncome), icon: TrendingUp, trend: '+8.2%', trendUp: true, gradient: 'from-[#1AA3D9] to-[#0ea5e9]', glow: 'glow-cyan' },
    { label: 'Egresos', value: formatCurrency(data.totalExpense), icon: TrendingDown, trend: '-3.1%', trendUp: false, gradient: 'from-[#E44078] to-[#f43f5e]', glow: 'glow-pink' },
    { label: 'Clientes', value: data.clientCount.toString(), icon: Users, trend: '+5', trendUp: true, gradient: 'from-[#F6AD27] to-[#f59e0b]', glow: 'glow-amber' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen ejecutivo de PROMPTIVE</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`p-5 border-0 hover:shadow-lg transition-all ${stat.glow}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trendUp ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-rose-500" />}
                <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
                <span className="text-xs text-muted-foreground">vs mes anterior</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 border-0">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-brand-purple" />
            <h3 className="text-sm font-semibold">Flujo de Caja (6 meses)</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1AA3D9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1AA3D9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E44078" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E44078" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `S/${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [formatCurrency(Number(value) ?? 0), '']} />
              <Area type="monotone" dataKey="ingresos" stroke="#1AA3D9" fill="url(#colorIngresos)" strokeWidth={2} name="Ingresos" />
              <Area type="monotone" dataKey="egresos" stroke="#E44078" fill="url(#colorEgresos)" strokeWidth={2} name="Egresos" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 border-0">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-sm font-semibold">Pipeline de Ventas</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.dealsByStage} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {data.dealsByStage.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {data.dealsByStage.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <Card className="p-5 border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Transacciones Recientes</h3>
            <Link href="/finance" className="text-xs text-brand-purple hover:underline flex items-center gap-0.5">Ver todo<ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.type === 'ingreso' ? 'bg-brand-cyan/10' : 'bg-brand-pink/10'}`}>
                    {tx.type === 'ingreso' ? <ArrowUpRight className="h-4 w-4 text-brand-cyan" /> : <ArrowDownRight className="h-4 w-4 text-brand-pink" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(tx.created_at)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'ingreso' ? 'text-brand-cyan' : 'text-brand-pink'}`}>
                  {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts - CLICKABLE */}
        <Card className="p-5 border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Alertas del Sistema</h3>
            <Badge variant="secondary" className="text-[10px] bg-brand-pink/10 text-brand-pink">{data.inventoryAlerts + data.activeWorkflows} alertas</Badge>
          </div>
          <div className="space-y-2.5">
            <Link href="/inventory" className="flex items-center gap-3 p-3 rounded-xl bg-brand-amber/5 border border-brand-amber/20 hover:border-brand-amber/40 transition-all group">
              <AlertTriangle className="h-5 w-5 text-brand-amber shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-amber">{data.inventoryAlerts} productos con stock bajo</p>
                <div className="mt-1 space-y-0.5">
                  {data.lowStockItems.slice(0, 2).map(item => (
                    <p key={item.name} className="text-[11px] text-muted-foreground">• {item.name}: {item.stock}/{item.min_stock} uds</p>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-amber opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/operations" className="flex items-center gap-3 p-3 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 hover:border-brand-cyan/40 transition-all group">
              <ClipboardList className="h-5 w-5 text-brand-cyan shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-cyan">{data.activeWorkflows} workflows activos</p>
                <p className="text-[11px] text-muted-foreground">Procesos pendientes de revisión</p>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/crm" className="flex items-center gap-3 p-3 rounded-xl bg-brand-purple/5 border border-brand-purple/20 hover:border-brand-purple/40 transition-all group">
              <Users className="h-5 w-5 text-brand-purple shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-purple">{data.clientCount} clientes registrados</p>
                <p className="text-[11px] text-muted-foreground">Crecimiento estable del portafolio</p>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </Card>

        {/* Quick Access */}
        <Card className="p-5 border-0">
          <h3 className="text-sm font-semibold mb-4">Actividad Reciente</h3>
          {data.upcomingEvents.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="h-3.5 w-3.5 text-brand-cyan" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próximos Eventos</span>
              </div>
              <div className="space-y-1.5">
                {data.upcomingEvents.map(event => (
                  <Link key={event.id} href="/calendar" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: event.color }} />
                    <span className="text-sm truncate flex-1">{event.title}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(event.event_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {data.recentDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5 text-brand-amber" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documentos Recientes</span>
              </div>
              <div className="space-y-1.5">
                {data.recentDocs.map(doc => (
                  <Link key={doc.id} href="/documents" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="text-[10px] uppercase font-mono bg-muted px-1.5 py-0.5 rounded">{doc.file_type}</span>
                    <span className="text-sm truncate flex-1">{doc.name}</span>
                    <Badge variant="secondary" className="text-[9px]">{doc.status}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
