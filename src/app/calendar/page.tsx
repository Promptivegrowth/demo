'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, Trash2, Zap, X } from 'lucide-react'
import { toast } from 'sonner'

interface CalEvent { id: string; title: string; description: string; event_date: string; event_time: string; event_type: string; related_module: string; color: string; is_auto?: boolean }

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
    reunion: { emoji: '📅', label: 'Reunión', color: '#1AA3D9' },
    tarea: { emoji: '✅', label: 'Tarea', color: '#F6AD27' },
    entrega: { emoji: '📦', label: 'Entrega', color: '#E44078' },
    recordatorio: { emoji: '🔔', label: 'Recordatorio', color: '#B234BD' },
    auto: { emoji: '⚡', label: 'Automático', color: '#8b5cf6' },
    otro: { emoji: '📋', label: 'Otro', color: '#6b7280' },
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1 }

export default function CalendarPage() {
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth())
    const [events, setEvents] = useState<CalEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)
    const [saving, setSaving] = useState(false)
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

    const [ft, setFt] = useState(''); const [fd, setFd] = useState(''); const [fTime, setFTime] = useState('09:00')
    const [fType, setFType] = useState('tarea'); const [fModule, setFModule] = useState('')

    useEffect(() => { fetchEvents() }, [])

    async function fetchEvents() {
        const { data: dbEvents } = await supabase.from('calendar_events').select('*').order('event_date')

        // Auto-generate events from other modules
        const autoEvents: CalEvent[] = []

        // From projects (deadlines)
        const { data: projects } = await supabase.from('projects').select('name, end_date, status').eq('status', 'activo')
        projects?.forEach(p => {
            if (p.end_date) autoEvents.push({
                id: `auto-proj-${p.name}`, title: `📦 Entrega: ${p.name}`, description: 'Fecha límite del proyecto',
                event_date: p.end_date, event_time: '17:00', event_type: 'auto', related_module: 'tracking', color: '#E44078', is_auto: true,
            })
        })

        // From deals (expected close dates)
        const { data: deals } = await supabase.from('deals').select('title, expected_close, stage').neq('stage', 'won').neq('stage', 'lost')
        deals?.forEach(d => {
            if (d.expected_close) autoEvents.push({
                id: `auto-deal-${d.title}`, title: `🤝 Cierre: ${d.title}`, description: `Etapa: ${d.stage}`,
                event_date: d.expected_close, event_time: '10:00', event_type: 'auto', related_module: 'crm', color: '#1AA3D9', is_auto: true,
            })
        })

        setEvents([...(dbEvents || []), ...autoEvents])
        setLoading(false)
    }

    function getEventsForDay(day: number) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return events.filter(e => e.event_date?.startsWith(dateStr))
    }

    function handleDayClick(day: number) {
        setSelectedDay(day)
        const dayEvents = getEventsForDay(day)
        if (dayEvents.length === 0) {
            setFt(''); setFd(''); setFTime('09:00'); setFType('tarea'); setFModule('')
            setCreateOpen(true)
        }
    }

    async function handleCreate() {
        if (!ft) { toast.error('Ingrese un título'); return }
        setSaving(true)
        const dateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : ''
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const color = TYPE_CONFIG[fType]?.color || '#6b7280'
        const { error } = await supabase.from('calendar_events').insert({
            title: ft, description: fd, event_date: dateStr, event_time: fTime, event_type: fType,
            related_module: fModule, color, org_id: orgResult.data?.id
        })
        if (error) toast.error('Error al crear')
        else { toast.success('Evento creado'); setCreateOpen(false); fetchEvents() }
        setSaving(false)
    }

    async function handleDelete() {
        if (!selectedEvent || selectedEvent.is_auto) return
        setSaving(true)
        const { error } = await supabase.from('calendar_events').delete().eq('id', selectedEvent.id)
        if (error) toast.error('Error al eliminar')
        else { toast.success('Evento eliminado'); setDeleteOpen(false); setSelectedEvent(null); fetchEvents() }
        setSaving(false)
    }

    const isToday = (day: number) => day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const todayEvents = events.filter(e => e.event_date?.startsWith(now.toISOString().split('T')[0]))

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Calendario Inteligente</h1>
                    <p className="text-sm text-muted-foreground mt-1">Eventos manuales + automáticos sincronizados desde proyectos, deals y vencimientos</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'month' ? 'bg-brand-purple text-white' : 'hover:bg-muted'}`}>Mes</button>
                        <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'week' ? 'bg-brand-purple text-white' : 'hover:bg-muted'}`}>Semana</button>
                    </div>
                    <Button size="sm" onClick={() => { setSelectedDay(now.getDate()); setFt(''); setFd(''); setCreateOpen(true) }} className="promptive-btn text-white">
                        <Plus className="h-4 w-4 mr-1" />Evento
                    </Button>
                </div>
            </div>

            {/* Today's events */}
            {todayEvents.length > 0 && (
                <Card className="p-4 border-0 bg-brand-purple/5 border border-brand-purple/10">
                    <h3 className="text-xs font-semibold text-brand-purple mb-2 flex items-center gap-1"><Zap className="h-3.5 w-3.5" />Hoy — {todayEvents.length} evento{todayEvents.length > 1 ? 's' : ''}</h3>
                    <div className="flex flex-wrap gap-2">
                        {todayEvents.map(e => (
                            <Badge key={e.id} variant="secondary" className="text-xs" style={{ borderColor: e.color + '40' }}>
                                {TYPE_CONFIG[e.event_type]?.emoji} {e.title}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar Grid */}
                <Card className="p-4 border-0 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">{MONTH_NAMES[month]} {year}</h2>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()) }}>Hoy</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-background min-h-[80px] sm:min-h-[100px]" />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dayEvents = getEventsForDay(day)
                            const today = isToday(day)
                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`bg-background min-h-[80px] sm:min-h-[100px] p-1.5 cursor-pointer hover:bg-muted/50 transition-colors relative ${today ? 'ring-2 ring-brand-purple ring-inset' : ''}`}
                                >
                                    <span className={`text-xs font-medium ${today ? 'bg-brand-purple text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-muted-foreground'}`}>{day}</span>
                                    <div className="mt-1 space-y-0.5">
                                        {dayEvents.slice(0, 3).map(e => (
                                            <button key={e.id} onClick={(ev) => { ev.stopPropagation(); setSelectedDay(day); setSelectedEvent(e) }}
                                                className="w-full text-left px-1 py-0.5 rounded text-[10px] truncate leading-tight hover:opacity-80"
                                                style={{ background: e.color + '15', color: e.color, borderLeft: `2px solid ${e.color}` }}>
                                                {e.is_auto && '⚡'}{e.title}
                                            </button>
                                        ))}
                                        {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} más</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                {/* Side Panel - Day Detail or Legend */}
                <div className="space-y-4">
                    {selectedDay && (
                        <Card className="p-4 border-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold">{selectedDay} {MONTH_NAMES[month]}</h3>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedDay(null)}><X className="h-3.5 w-3.5" /></Button>
                            </div>
                            {getEventsForDay(selectedDay).length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-xs text-muted-foreground mb-2">Sin eventos</p>
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateOpen(true)}><Plus className="h-3 w-3 mr-1" />Crear</Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {getEventsForDay(selectedDay).map(e => (
                                        <div key={e.id} className="p-2.5 rounded-lg border border-border" style={{ borderLeftColor: e.color, borderLeftWidth: '3px' }}>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-medium">{TYPE_CONFIG[e.event_type]?.emoji} {e.title}</p>
                                                {!e.is_auto && (
                                                    <button onClick={() => { setSelectedEvent(e); setDeleteOpen(true) }} className="text-muted-foreground hover:text-brand-pink">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                            {e.description && <p className="text-[10px] text-muted-foreground mt-1">{e.description}</p>}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{e.event_time}</span>
                                                {e.is_auto && <Badge variant="secondary" className="text-[9px] h-4 bg-brand-purple/10 text-brand-purple">Auto</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    <Card className="p-4 border-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tipos de Evento</h3>
                        <div className="space-y-2">
                            {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2 text-xs">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: val.color }} />
                                    <span>{val.emoji} {val.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4 border-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resumen</h3>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Total: <strong className="text-foreground">{events.length}</strong></p>
                            <p className="text-xs text-muted-foreground">Manuales: <strong className="text-foreground">{events.filter(e => !e.is_auto).length}</strong></p>
                            <p className="text-xs text-muted-foreground">Automáticos: <strong className="text-brand-purple">{events.filter(e => e.is_auto).length}</strong></p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create Event Dialog */}
            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title={`Nuevo Evento — ${selectedDay} ${MONTH_NAMES[month]}`} onSave={handleCreate} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Título</label><Input value={ft} onChange={e => setFt(e.target.value)} placeholder="Reunión con equipo..." /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Descripción</label><Input value={fd} onChange={e => setFd(e.target.value)} placeholder="Opcional" /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Hora</label><Input type="time" value={fTime} onChange={e => setFTime(e.target.value)} /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                        <select value={fType} onChange={e => setFType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'auto').map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                        </select>
                    </div>
                </div>
            </CrudDialog>

            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedEvent(null) }} onConfirm={handleDelete}
                title="Eliminar Evento" description={`¿Eliminar "${selectedEvent?.title}"?`} loading={saving} />
        </div>
    )
}
