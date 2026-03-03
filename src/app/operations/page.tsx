'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Plus, ArrowRight, Clock, Trash2, AlertTriangle, User, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface Workflow { id: string; name: string; description: string; current_state: string; priority: string; assigned_to: string; created_at: string }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pendiente: { label: 'Pendiente', color: '#F6AD27', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' },
    en_revision: { label: 'En Revisión', color: '#1AA3D9', bg: 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800/30' },
    finalizado: { label: 'Finalizado', color: '#22c55e', bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    critica: { label: 'Crítica', color: '#E44078', icon: '🔴' },
    alta: { label: 'Alta', color: '#F6AD27', icon: '🟡' },
    media: { label: 'Media', color: '#1AA3D9', icon: '🔵' },
    baja: { label: 'Baja', color: '#6b7280', icon: '⚪' },
}

export default function OperationsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selected, setSelected] = useState<Workflow | null>(null)
    const [filterPriority, setFilterPriority] = useState('todos')

    const [fn, setFn] = useState(''); const [fd, setFd] = useState(''); const [fpri, setFpri] = useState('media'); const [fassign, setFassign] = useState('')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        const [wf, emp] = await Promise.all([
            supabase.from('workflows').select('*').order('created_at', { ascending: false }),
            supabase.from('employees').select('id, full_name').eq('status', 'activo'),
        ])
        setWorkflows(wf.data || [])
        setEmployees(emp.data || [])
        setLoading(false)
    }

    async function handleCreate() {
        if (!fn) { toast.error('Nombre requerido'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('workflows').insert({
            name: fn, description: fd, current_state: 'pendiente', priority: fpri, assigned_to: fassign, org_id: orgResult.data?.id,
        })
        if (error) toast.error('Error')
        else { toast.success('Workflow creado'); setCreateOpen(false); setFn(''); setFd(''); fetchData() }
        setSaving(false)
    }

    async function advanceStatus(wf: Workflow) {
        const next = wf.current_state === 'pendiente' ? 'en_revision' : wf.current_state === 'en_revision' ? 'finalizado' : null
        if (!next) return
        const { error } = await supabase.from('workflows').update({ current_state: next }).eq('id', wf.id)
        if (error) toast.error('Error')
        else { toast.success(`Avanzado a: ${STATUS_CONFIG[next].label}`); fetchData() }
    }

    async function handleDelete() {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase.from('workflows').delete().eq('id', selected.id)
        if (error) toast.error('Error')
        else { toast.success('Eliminado'); setDeleteOpen(false); setSelected(null); fetchData() }
        setSaving(false)
    }

    function getSLAHours(createdAt: string) {
        const diff = Date.now() - new Date(createdAt).getTime()
        const hours = Math.floor(diff / 3600000)
        if (hours < 24) return `${hours}h`
        return `${Math.floor(hours / 24)}d ${hours % 24}h`
    }

    const filtered = workflows.filter(w => filterPriority === 'todos' || w.priority === filterPriority)
    const statuses = ['pendiente', 'en_revision', 'finalizado']

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Operaciones & Workflows</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de flujos de trabajo con prioridades, asignación y seguimiento SLA</p>
                </div>
                <Button size="sm" onClick={() => { setFn(''); setFd(''); setFpri('media'); setFassign(''); setCreateOpen(true) }} className="promptive-btn text-white">
                    <Plus className="h-4 w-4 mr-1" />Workflow
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statuses.map(col => (
                    <Card key={col} className="p-3 border-0">
                        <p className="text-xs text-muted-foreground">{STATUS_CONFIG[col].label}</p>
                        <p className="text-lg font-bold" style={{ color: STATUS_CONFIG[col].color }}>{workflows.filter(w => w.current_state === col).length}</p>
                    </Card>
                ))}
                <Card className="p-3 border-0">
                    <p className="text-xs text-muted-foreground">Críticas</p>
                    <p className="text-lg font-bold text-brand-pink">{workflows.filter(w => w.priority === 'critica' && w.current_state !== 'finalizado').length}</p>
                </Card>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-wrap gap-2">
                {['todos', 'critica', 'alta', 'media', 'baja'].map(p => (
                    <button key={p} onClick={() => setFilterPriority(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterPriority === p ? 'bg-brand-purple text-white' : 'bg-muted hover:bg-muted/80'}`}>
                        {p === 'todos' ? 'Todas' : PRIORITY_CONFIG[p]?.icon + ' ' + PRIORITY_CONFIG[p]?.label}
                    </button>
                ))}
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statuses.map(col => {
                    const colItems = filtered.filter(w => w.current_state === col)
                    const cfg = STATUS_CONFIG[col]
                    return (
                        <div key={col}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ background: cfg.color }} />
                                <h3 className="text-sm font-semibold">{cfg.label}</h3>
                                <Badge variant="secondary" className="text-[10px] h-5">{colItems.length}</Badge>
                            </div>
                            <div className="space-y-2 min-h-[100px]">
                                {colItems.map(wf => {
                                    const pri = PRIORITY_CONFIG[wf.priority] || PRIORITY_CONFIG.media
                                    return (
                                        <Card key={wf.id} className={`p-3 border cursor-pointer hover:shadow-md transition-shadow ${cfg.bg} ${wf.priority === 'critica' ? 'ring-1 ring-brand-pink/30' : ''}`}
                                            onClick={() => { setSelected(wf); setDetailOpen(true) }}>
                                            <div className="flex items-start justify-between mb-1.5">
                                                <p className="text-sm font-medium leading-tight">{wf.name}</p>
                                                <span className="text-xs">{pri.icon}</span>
                                            </div>
                                            {wf.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{wf.description}</p>}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{getSLAHours(wf.created_at)}</span>
                                                    {wf.assigned_to && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><User className="h-2.5 w-2.5" />{employees.find(e => e.id === wf.assigned_to)?.full_name?.split(' ')[0] || '—'}</span>}
                                                </div>
                                                {col !== 'finalizado' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); advanceStatus(wf) }}
                                                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                                        style={{ color: STATUS_CONFIG[col === 'pendiente' ? 'en_revision' : 'finalizado'].color }}>
                                                        <ArrowRight className="h-3 w-3" />Avanzar
                                                    </button>
                                                )}
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full sm:w-[380px]">
                    {selected && (() => {
                        const pri = PRIORITY_CONFIG[selected.priority] || PRIORITY_CONFIG.media
                        const cfg = STATUS_CONFIG[selected.current_state]
                        return (<>
                            <SheetHeader><SheetTitle>{selected.name}</SheetTitle></SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className="flex gap-2">
                                    <Badge style={{ background: cfg.color + '20', color: cfg.color, borderColor: cfg.color + '30' }}>{cfg.label}</Badge>
                                    <Badge style={{ background: pri.color + '20', color: pri.color }}>{pri.icon} {pri.label}</Badge>
                                </div>
                                {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Tiempo SLA</p><p className="text-sm font-bold mt-0.5">{getSLAHours(selected.created_at)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Asignado</p><p className="text-sm font-bold mt-0.5">{employees.find(e => e.id === selected.assigned_to)?.full_name || 'Sin asignar'}</p></div>
                                </div>
                                <div className="flex gap-2">
                                    {selected.current_state !== 'finalizado' && (
                                        <Button className="flex-1 promptive-btn text-white" onClick={() => { advanceStatus(selected); setDetailOpen(false) }}>
                                            <ArrowRight className="h-4 w-4 mr-1" />Avanzar
                                        </Button>
                                    )}
                                    <Button variant="destructive" className="flex-1" onClick={() => { setDetailOpen(false); setDeleteOpen(true) }}>
                                        <Trash2 className="h-4 w-4 mr-1" />Eliminar
                                    </Button>
                                </div>
                            </div>
                        </>)
                    })()}
                </SheetContent>
            </Sheet>

            {/* Create Dialog */}
            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Workflow" onSave={handleCreate} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label><Input value={fn} onChange={e => setFn(e.target.value)} placeholder="Auditoría mensual" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Descripción</label><Input value={fd} onChange={e => setFd(e.target.value)} placeholder="Detalles..." /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Prioridad</label>
                        <select value={fpri} onChange={e => setFpri(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                        </select>
                    </div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Asignar a</label>
                        <select value={fassign} onChange={e => setFassign(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="">Sin asignar</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                        </select>
                    </div>
                </div>
            </CrudDialog>
            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null) }} onConfirm={handleDelete} title="Eliminar Workflow" description={`¿Eliminar "${selected?.name}"?`} loading={saving} />
        </div>
    )
}
