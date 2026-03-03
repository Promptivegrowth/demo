'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ScrollText, Download, Filter, Plus, Edit3, Trash2, LogIn, LogOut, Eye, ArrowUpDown, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AuditEntry { id: string; user_name: string; action: string; module: string; details: Record<string, unknown>; created_at: string }

const ACTION_ICONS: Record<string, { icon: string; color: string; label: string }> = {
    crear: { icon: '➕', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Creación' },
    editar: { icon: '✏️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Edición' },
    eliminar: { icon: '🗑️', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Eliminación' },
    login: { icon: '🔑', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Inicio Sesión' },
    logout: { icon: '🚪', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'Cierre Sesión' },
    exportar: { icon: '📥', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Exportación' },
}

const MODULE_COLORS: Record<string, string> = {
    crm: '#1AA3D9', inventario: '#22c55e', finanzas: '#F6AD27', operaciones: '#B234BD',
    rrhh: '#E44078', documentos: '#6366f1', calendario: '#06b6d4', admin: '#8b5cf6',
}

export default function AuditPage() {
    const [entries, setEntries] = useState<AuditEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterModule, setFilterModule] = useState('todos')
    const [filterAction, setFilterAction] = useState('todos')

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
            setEntries(data || [])
            setLoading(false)
        }
        load()
    }, [])

    const filtered = entries.filter(e => {
        const matchSearch = e.user_name.toLowerCase().includes(search.toLowerCase()) || e.module.toLowerCase().includes(search.toLowerCase())
        const matchModule = filterModule === 'todos' || e.module === filterModule
        const matchAction = filterAction === 'todos' || e.action === filterAction
        return matchSearch && matchModule && matchAction
    })

    // Stats
    const modules = [...new Set(entries.map(e => e.module))]
    const actions = [...new Set(entries.map(e => e.action))]
    const byModule = modules.map(m => ({ name: m, value: entries.filter(e => e.module === m).length, color: MODULE_COLORS[m] || '#6366f1' }))
    const byDay = (() => {
        const map: Record<string, number> = {}
        entries.forEach(e => {
            const day = new Date(e.created_at).toLocaleDateString('es-PE', { weekday: 'short' })
            map[day] = (map[day] || 0) + 1
        })
        return Object.entries(map).map(([day, count]) => ({ day, count })).slice(0, 7)
    })()

    function exportCSV() {
        const headers = 'Usuario,Acción,Módulo,Fecha,Detalles\n'
        const rows = filtered.map(e =>
            `"${e.user_name}","${e.action}","${e.module}","${new Date(e.created_at).toLocaleString('es-PE')}","${JSON.stringify(e.details).replace(/"/g, '""')}"`
        ).join('\n')
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'auditoria-promptive.csv'; a.click()
        toast.success('CSV exportado')
    }

    function formatTimestamp(ts: string) {
        const d = new Date(ts)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        if (diff < 60000) return 'Hace un momento'
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Auditoría del Sistema</h1>
                    <p className="text-sm text-muted-foreground mt-1">Registro de todas las acciones para cumplimiento normativo y trazabilidad. Cada acción de creación, edición o eliminación queda registrada automáticamente.</p>
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />Exportar CSV</Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B234BD] to-[#8b5cf6]"><ScrollText className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Total Registros</p><p className="text-xl font-bold">{entries.length}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1AA3D9] to-[#0ea5e9]"><Eye className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Módulos Activos</p><p className="text-xl font-bold">{modules.length}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0 col-span-1 sm:col-span-2 lg:col-span-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Actividad por Día</h4>
                    <ResponsiveContainer width="100%" height={60}>
                        <BarChart data={byDay}>
                            <Bar dataKey="count" fill="#B234BD" radius={[3, 3, 0, 0]} />
                            <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por usuario o módulo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="todos">Todos los módulos</option>
                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="todos">Todas las acciones</option>
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            {/* Audit Log */}
            <Card className="border-0 divide-y divide-border overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No hay registros que coincidan con los filtros</p>
                    </div>
                ) : filtered.map(entry => {
                    const ac = ACTION_ICONS[entry.action] || { icon: '📋', color: 'bg-muted', label: entry.action }
                    return (
                        <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                            <span className="text-lg mt-0.5">{ac.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium">{entry.user_name}</span>
                                    <Badge variant="secondary" className={`text-[10px] ${ac.color}`}>{ac.label}</Badge>
                                    <Badge variant="secondary" className="text-[10px]" style={{ borderColor: MODULE_COLORS[entry.module] + '40', color: MODULE_COLORS[entry.module] }}>{entry.module}</Badge>
                                </div>
                                {entry.details && Object.keys(entry.details).length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                    </p>
                                )}
                            </div>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatTimestamp(entry.created_at)}</span>
                        </div>
                    )
                })}
            </Card>
        </div>
    )
}
