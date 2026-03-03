'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Plus, Trash2, FileText, PieChart, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts'

interface Transaction { id: string; type: string; category: string; description: string; amount: number; reference: string; status: string; created_at: string }

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Transaction | null>(null)
    const [ft, setFt] = useState('ingreso'); const [fc, setFc] = useState('ventas'); const [fd, setFd] = useState('')
    const [fa, setFa] = useState(''); const [fr, setFr] = useState('')

    useEffect(() => { fetchTransactions() }, [])

    async function fetchTransactions() {
        const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
        setTransactions(data || [])
        setLoading(false)
    }

    async function handleCreate() {
        if (!fd || !fa) { toast.error('Complete los campos'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('transactions').insert({
            type: ft, category: fc, description: fd, amount: parseFloat(fa), reference: fr || `TXN-${Date.now()}`, status: 'completado', org_id: orgResult.data?.id,
        })
        if (error) toast.error('Error')
        else { toast.success('Transacción registrada'); setCreateOpen(false); fetchTransactions() }
        setSaving(false)
    }

    async function handleDelete() {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase.from('transactions').delete().eq('id', selected.id)
        if (error) toast.error('Error')
        else { toast.success('Eliminada'); setDeleteOpen(false); setSelected(null); fetchTransactions() }
        setSaving(false)
    }

    function exportPDF() {
        const doc = new jsPDF('l')
        doc.setFontSize(18); doc.setTextColor(178, 52, 189); doc.text('PROMPTIVE - Reporte Financiero', 14, 20)
        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28)
        autoTable(doc, {
            startY: 35,
            head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Referencia']],
            body: transactions.map(t => [formatDate(t.created_at), t.type, t.category, t.description, formatCurrency(t.amount), t.reference]),
            headStyles: { fillColor: [178, 52, 189] },
        })
        doc.save('finanzas-promptive.pdf'); toast.success('PDF generado')
    }

    const income = transactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = transactions.filter(t => t.type === 'egreso').reduce((s, t) => s + Number(t.amount), 0)
    const balance = income - expenses
    const margin = income > 0 ? ((balance / income) * 100) : 0

    // Chart data
    const monthMap: Record<string, { ingresos: number; egresos: number }> = {}
    transactions.forEach(t => {
        const m = new Date(t.created_at).toLocaleDateString('es-PE', { month: 'short' })
        if (!monthMap[m]) monthMap[m] = { ingresos: 0, egresos: 0 }
        if (t.type === 'ingreso') monthMap[m].ingresos += Number(t.amount)
        else monthMap[m].egresos += Number(t.amount)
    })
    const chartData = Object.entries(monthMap).map(([name, v]) => ({ name, ...v }))

    // Cashflow projection
    const monthlyIncome = chartData.length > 0 ? chartData.reduce((s, c) => s + c.ingresos, 0) / chartData.length : 0
    const monthlyExpense = chartData.length > 0 ? chartData.reduce((s, c) => s + c.egresos, 0) / chartData.length : 0
    const projectionData = ['Mes 1', 'Mes 2', 'Mes 3'].map((m, i) => ({
        name: m, flujo: Math.round((monthlyIncome - monthlyExpense) * (i + 1) + balance),
    }))

    // Categories
    const catMap: Record<string, number> = {}
    transactions.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount) })

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
                    <p className="text-sm text-muted-foreground mt-1">Control financiero con proyección de flujo de caja y análisis de rentabilidad</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportPDF}><Download className="h-4 w-4 mr-1" />Reporte PDF</Button>
                    <Button size="sm" onClick={() => { setFd(''); setFa(''); setFr(''); setCreateOpen(true) }} className="promptive-btn text-white"><Plus className="h-4 w-4 mr-1" />Transacción</Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1AA3D9] to-[#0ea5e9]"><TrendingUp className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Ingresos</p><p className="text-lg font-bold">{formatCurrency(income)}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E44078] to-[#f43f5e]"><TrendingDown className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Egresos</p><p className="text-lg font-bold">{formatCurrency(expenses)}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${balance >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'}`}><DollarSign className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Balance</p><p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-brand-pink'}`}>{formatCurrency(balance)}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B234BD] to-[#8b5cf6]"><PieChart className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Margen</p><p className={`text-lg font-bold ${margin >= 20 ? 'text-emerald-500' : 'text-brand-amber'}`}>{margin.toFixed(1)}%</p></div>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold mb-4">Ingresos vs Egresos por Mes</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `S/${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v) => formatCurrency(Number(v))} />
                            <Legend />
                            <Bar dataKey="ingresos" name="Ingresos" fill="#1AA3D9" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="egresos" name="Egresos" fill="#E44078" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5 border-0">
                    <h3 className="text-sm font-semibold mb-4">Proyección Flujo de Caja (3 meses)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B234BD" stopOpacity={0.3} /><stop offset="95%" stopColor="#B234BD" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `S/${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v) => formatCurrency(Number(v))} />
                            <Area type="monotone" dataKey="flujo" stroke="#B234BD" fill="url(#finGrad)" strokeWidth={2} strokeDasharray="5 5" name="Proyección" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Category Breakdown */}
            <Card className="p-4 border-0">
                <h3 className="text-sm font-semibold mb-3">Desglose por Categoría</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                        <div key={cat} className="p-3 rounded-lg bg-muted/50">
                            <p className="text-[10px] text-muted-foreground uppercase">{cat}</p>
                            <p className="text-sm font-bold mt-0.5">{formatCurrency(amount)}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Transaction Table */}
            <Card className="border-0 overflow-x-auto">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead>Fecha</TableHead><TableHead>Tipo</TableHead><TableHead className="hidden sm:table-cell">Categoría</TableHead>
                        <TableHead>Descripción</TableHead><TableHead>Monto</TableHead><TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {transactions.slice(0, 20).map(t => (
                            <TableRow key={t.id}>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`text-[10px] ${t.type === 'ingreso' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                        {t.type === 'ingreso' ? <ArrowUpRight className="h-3 w-3 mr-0.5 inline" /> : <ArrowDownRight className="h-3 w-3 mr-0.5 inline" />}{t.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-xs">{t.category}</TableCell>
                                <TableCell className="text-sm truncate max-w-[200px]">{t.description}</TableCell>
                                <TableCell className={`font-semibold text-sm ${t.type === 'ingreso' ? 'text-emerald-500' : 'text-brand-pink'}`}>
                                    {t.type === 'ingreso' ? '+' : '-'}{formatCurrency(t.amount)}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-brand-pink" onClick={() => { setSelected(t); setDeleteOpen(true) }}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva Transacción" onSave={handleCreate} loading={saving}>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                        <select value={ft} onChange={e => setFt(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="ingreso">💰 Ingreso</option><option value="egreso">💸 Egreso</option>
                        </select></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoría</label>
                        <select value={fc} onChange={e => setFc(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="ventas">Ventas</option><option value="servicios">Servicios</option><option value="nomina">Nómina</option>
                            <option value="operaciones">Operaciones</option><option value="impuestos">Impuestos</option><option value="otros">Otros</option>
                        </select></div>
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Descripción</label><Input value={fd} onChange={e => setFd(e.target.value)} placeholder="Venta de servicios..." /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Monto (S/)</label><Input type="number" value={fa} onChange={e => setFa(e.target.value)} placeholder="5000" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Referencia</label><Input value={fr} onChange={e => setFr(e.target.value)} placeholder="FAC-001" /></div>
                </div>
            </CrudDialog>
            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null) }} onConfirm={handleDelete} title="Eliminar" description={`¿Eliminar transacción: "${selected?.description}"?`} loading={saving} />
        </div>
    )
}
