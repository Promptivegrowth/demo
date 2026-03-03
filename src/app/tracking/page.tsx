'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MapPin, Calendar, CheckCircle2, Clock, Plus, Edit3, Trash2, Filter, Milestone, Eye } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

interface MapProject { id: string; name: string; progress: number; status: string; lat: number; lng: number;[key: string]: unknown }
const MapComponent: ComponentType<{ projects: MapProject[]; onSelect: (p: MapProject) => void }> =
    dynamic(() => import('@/components/shared/project-map'), { ssr: false }) as ComponentType<{ projects: MapProject[]; onSelect: (p: MapProject) => void }>

interface Project { id: string; name: string; description: string; status: string; progress: number; industry_type: string; start_date: string; end_date: string; lat?: number; lng?: number }

const MILESTONES = [
    { at: 0, label: 'Inicio', icon: '🚀' },
    { at: 25, label: 'Planificación', icon: '📋' },
    { at: 50, label: 'Desarrollo', icon: '⚙️' },
    { at: 75, label: 'Pruebas', icon: '🧪' },
    { at: 100, label: 'Entregado', icon: '✅' },
]

export default function TrackingPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Project | null>(null)
    const [showMap, setShowMap] = useState(true)
    const [filterStatus, setFilterStatus] = useState('todos')
    const [fn, setFn] = useState(''); const [fdesc, setFdesc] = useState(''); const [ftype, setFtype] = useState('tecnología')

    useEffect(() => { fetchProjects() }, [])

    async function fetchProjects() {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        setProjects(data || [])
        setLoading(false)
    }

    async function handleCreate() {
        if (!fn) { toast.error('Nombre requerido'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('projects').insert({
            name: fn, description: fdesc, industry_type: ftype, status: 'activo', progress: 0,
            start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 86400000).toISOString(),
            lat: -12.04 + Math.random() * 0.06, lng: -77.04 + Math.random() * 0.06, org_id: orgResult.data?.id,
        })
        if (error) toast.error('Error')
        else { toast.success('Proyecto creado'); setCreateOpen(false); fetchProjects() }
        setSaving(false)
    }

    async function handleDelete() {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase.from('projects').delete().eq('id', selected.id)
        if (error) toast.error('Error')
        else { toast.success('Eliminado'); setDeleteOpen(false); setSelected(null); fetchProjects() }
        setSaving(false)
    }

    async function updateProgress(id: string, progress: number) {
        const status = progress >= 100 ? 'completado' : 'activo'
        await supabase.from('projects').update({ progress, status }).eq('id', id)
        fetchProjects()
        if (selected?.id === id) setSelected({ ...selected, progress, status })
        toast.success(`Progreso: ${progress}%`)
    }

    function getProgressColor(p: number) {
        if (p >= 80) return '#22c55e'
        if (p >= 50) return '#1AA3D9'
        if (p >= 25) return '#F6AD27'
        return '#B234BD'
    }

    const filtered = projects.filter(p => filterStatus === 'todos' || p.status === filterStatus)
    const projectLocations = filtered.filter(p => p.lat && p.lng).map(p => ({ ...p, lat: p.lat!, lng: p.lng! }))
    const activeCount = projects.filter(p => p.status === 'activo').length
    const completedCount = projects.filter(p => p.status === 'completado').length
    const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Seguimiento de Proyectos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Mapa de ubicación de proyectos activos y seguimiento de hitos en tiempo real</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={showMap ? 'default' : 'outline'} size="sm" onClick={() => setShowMap(!showMap)} className={showMap ? 'promptive-btn text-white' : ''}>
                        <MapPin className="h-4 w-4 mr-1" />{showMap ? 'Ocultar' : 'Ver'} Mapa
                    </Button>
                    <Button size="sm" onClick={() => { setFn(''); setFdesc(''); setCreateOpen(true) }} className="promptive-btn text-white">
                        <Plus className="h-4 w-4 mr-1" />Proyecto
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 border-0"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{projects.length}</p></Card>
                <Card className="p-3 border-0"><p className="text-xs text-muted-foreground">Activos</p><p className="text-lg font-bold text-brand-cyan">{activeCount}</p></Card>
                <Card className="p-3 border-0"><p className="text-xs text-muted-foreground">Completados</p><p className="text-lg font-bold text-emerald-500">{completedCount}</p></Card>
                <Card className="p-3 border-0"><p className="text-xs text-muted-foreground">Promedio Avance</p><p className="text-lg font-bold" style={{ color: getProgressColor(avgProgress) }}>{avgProgress}%</p></Card>
            </div>

            {/* Map with Legend */}
            {showMap && (
                <div className="space-y-2">
                    <Card className="border-0 overflow-hidden" style={{ height: 350 }}>
                        <MapComponent projects={projectLocations} onSelect={(p) => { setSelected(p as unknown as Project); setDetailOpen(true) }} />
                    </Card>
                    <div className="flex flex-wrap gap-4 px-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Leyenda:</span>
                        {[
                            { color: '#B234BD', label: '<25% Inicio' }, { color: '#F6AD27', label: '25-49% Plan.' },
                            { color: '#1AA3D9', label: '50-79% Desarrollo' }, { color: '#22c55e', label: '≥80% Final' },
                        ].map(l => (
                            <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />{l.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2">
                {['todos', 'activo', 'completado'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-brand-purple text-white' : 'bg-muted hover:bg-muted/80'}`}>
                        {s === 'todos' ? 'Todos' : s === 'activo' ? 'Activos' : 'Completados'}
                    </button>
                ))}
            </div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(project => (
                    <Card key={project.id} className="p-4 border-0 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(project); setDetailOpen(true) }}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-sm">{project.name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{project.industry_type}</p>
                            </div>
                            <Badge variant="secondary" className={project.status === 'completado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-brand-cyan/10 text-brand-cyan'}>
                                {project.status}
                            </Badge>
                        </div>

                        {/* Milestone Progress Bar */}
                        <div className="relative mt-2">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${project.progress}%`, background: getProgressColor(project.progress) }} />
                            </div>
                            <div className="flex justify-between mt-1">
                                {MILESTONES.map(m => (
                                    <div key={m.at} className={`text-center ${project.progress >= m.at ? '' : 'opacity-30'}`}>
                                        <span className="text-[10px]">{m.icon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(project.start_date)}</span>
                            <span className="font-bold" style={{ color: getProgressColor(project.progress) }}>{project.progress}%</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full sm:w-[420px] overflow-y-auto">
                    {selected && (
                        <>
                            <SheetHeader><SheetTitle>{selected.name}</SheetTitle></SheetHeader>
                            <div className="mt-6 space-y-5">
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className={selected.status === 'completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-cyan/10 text-brand-cyan'}>{selected.status}</Badge>
                                    <Badge variant="secondary">{selected.industry_type}</Badge>
                                </div>
                                {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}

                                {/* Timeline Milestones */}
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Hitos del Proyecto</h4>
                                    <div className="space-y-3">
                                        {MILESTONES.map((m, i) => {
                                            const reached = selected.progress >= m.at
                                            return (
                                                <div key={m.at} className="flex items-center gap-3">
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0 ${reached ? 'bg-brand-purple/10' : 'bg-muted'}`}>
                                                        {reached ? <CheckCircle2 className="h-4 w-4 text-brand-purple" /> : <span className="text-muted-foreground text-xs">{m.icon}</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-medium ${reached ? '' : 'text-muted-foreground'}`}>{m.label}</p>
                                                        <p className="text-[10px] text-muted-foreground">{m.at}%</p>
                                                    </div>
                                                    {reached && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Progress Slider */}
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Actualizar Progreso</h4>
                                    <input type="range" min={0} max={100} step={5} value={selected.progress}
                                        onChange={e => updateProgress(selected.id, Number(e.target.value))}
                                        className="w-full accent-[#B234BD]" />
                                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>0%</span><span className="font-bold text-sm" style={{ color: getProgressColor(selected.progress) }}>{selected.progress}%</span><span>100%</span></div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Inicio</p><p className="text-sm font-medium mt-1">{formatDate(selected.start_date)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Entrega</p><p className="text-sm font-medium mt-1">{formatDate(selected.end_date)}</p></div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="destructive" className="flex-1" onClick={() => { setDetailOpen(false); setDeleteOpen(true) }}><Trash2 className="h-4 w-4 mr-1" />Eliminar</Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Proyecto" onSave={handleCreate} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label><Input value={fn} onChange={e => setFn(e.target.value)} placeholder="Portal E-commerce" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Descripción</label><Input value={fdesc} onChange={e => setFdesc(e.target.value)} placeholder="Detalles del proyecto" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                    <select value={ftype} onChange={e => setFtype(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="tecnología">Tecnología</option><option value="consultoría">Consultoría</option>
                        <option value="marketing">Marketing</option><option value="diseño">Diseño</option>
                    </select>
                </div>
            </CrudDialog>
            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null) }} onConfirm={handleDelete} title="Eliminar Proyecto" description={`¿Eliminar "${selected?.name}"?`} loading={saving} />
        </div>
    )
}
