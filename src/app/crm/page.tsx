'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Users, UserPlus, Plus, Mail, Phone, Building2, Edit3, Trash2, Eye, DollarSign, ArrowRight, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Client { id: string; full_name: string; email: string; phone: string; company: string; status: string; source: string; created_at: string }
interface Deal { id: string; title: string; value: number; stage: string; expected_close: string; client_id: string; notes?: string }

const PIPELINE_STAGES = [
    { key: 'lead', label: 'Lead', color: '#94a3b8', icon: '🎯' },
    { key: 'qualified', label: 'Calificado', color: '#F6AD27', icon: '✅' },
    { key: 'proposal', label: 'Propuesta', color: '#1AA3D9', icon: '📄' },
    { key: 'negotiation', label: 'Negociación', color: '#B234BD', icon: '🤝' },
    { key: 'won', label: 'Ganado', color: '#22c55e', icon: '🏆' },
    { key: 'lost', label: 'Perdido', color: '#E44078', icon: '❌' },
]

export default function CRMPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [view, setView] = useState<'clients' | 'pipeline'>('pipeline')
    const [createClientOpen, setCreateClientOpen] = useState(false)
    const [createDealOpen, setCreateDealOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

    const [fn, setFn] = useState(''); const [fe, setFe] = useState(''); const [fph, setFph] = useState('')
    const [fco, setFco] = useState(''); const [fst, setFst] = useState('lead'); const [fso, setFso] = useState('web')
    const [dt, setDt] = useState(''); const [dv, setDv] = useState(''); const [ds, setDs] = useState('lead')
    const [dc, setDc] = useState(''); const [dn, setDn] = useState('')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        const [c, d] = await Promise.all([
            supabase.from('clients').select('*').order('created_at', { ascending: false }),
            supabase.from('deals').select('*').order('created_at', { ascending: false }),
        ])
        setClients(c.data || []); setDeals(d.data || [])
        setLoading(false)
    }

    function openCreate() { setFn(''); setFe(''); setFph(''); setFco(''); setFst('lead'); setFso('web'); setCreateClientOpen(true) }
    function openEdit(c: Client) { setFn(c.full_name); setFe(c.email); setFph(c.phone); setFco(c.company); setFst(c.status); setFso(c.source); setSelectedClient(c); setEditOpen(true) }

    async function handleCreateClient() {
        if (!fn || !fe) { toast.error('Nombre y email requeridos'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('clients').insert({ full_name: fn, email: fe, phone: fph, company: fco, status: fst, source: fso, org_id: orgResult.data?.id })
        if (error) toast.error('Error')
        else { toast.success('Cliente registrado'); setCreateClientOpen(false); fetchData() }
        setSaving(false)
    }

    async function handleEdit() {
        if (!selectedClient) return
        setSaving(true)
        const { error } = await supabase.from('clients').update({ full_name: fn, email: fe, phone: fph, company: fco, status: fst, source: fso }).eq('id', selectedClient.id)
        if (error) toast.error('Error')
        else { toast.success('Actualizado'); setEditOpen(false); fetchData() }
        setSaving(false)
    }

    async function handleDelete() {
        if (selectedClient) {
            const { error } = await supabase.from('clients').delete().eq('id', selectedClient.id)
            if (error) toast.error('Error')
            else { toast.success('Eliminado'); setDeleteOpen(false); setSelectedClient(null); fetchData() }
        } else if (selectedDeal) {
            const { error } = await supabase.from('deals').delete().eq('id', selectedDeal.id)
            if (error) toast.error('Error')
            else { toast.success('Deal eliminado'); setDeleteOpen(false); setSelectedDeal(null); fetchData() }
        }
    }

    async function handleCreateDeal() {
        if (!dt || !dv) { toast.error('Complete los campos'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('deals').insert({
            title: dt, value: parseFloat(dv), stage: ds, client_id: dc || null, notes: dn,
            expected_close: new Date(Date.now() + 30 * 86400000).toISOString(), org_id: orgResult.data?.id,
        })
        if (error) toast.error('Error')
        else { toast.success('Deal creado'); setCreateDealOpen(false); fetchData() }
        setSaving(false)
    }

    async function advanceDeal(deal: Deal) {
        const stages = PIPELINE_STAGES.map(s => s.key)
        const idx = stages.indexOf(deal.stage)
        if (idx < stages.length - 2) { // Skip 'lost'
            const next = stages[idx + 1]
            const { error } = await supabase.from('deals').update({ stage: next }).eq('id', deal.id)
            if (error) toast.error('Error')
            else { toast.success(`Deal avanzado a: ${PIPELINE_STAGES.find(s => s.key === next)?.label}`); fetchData() }
        }
    }

    function exportPDF() {
        const doc = new jsPDF()
        doc.setFontSize(18); doc.setTextColor(178, 52, 189); doc.text('PROMPTIVE - CRM', 14, 20)
        autoTable(doc, {
            startY: 35, head: [['Cliente', 'Email', 'Empresa', 'Estado', 'Fuente']],
            body: clients.map(c => [c.full_name, c.email, c.company, c.status, c.source]),
            headStyles: { fillColor: [178, 52, 189] },
        })
        doc.save('crm-promptive.pdf'); toast.success('PDF exportado')
    }

    const filtered = clients.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()))
    const pipelineValue = (stage: string) => deals.filter(d => d.stage === stage).reduce((s, d) => s + Number(d.value), 0)
    const totalPipeline = deals.filter(d => d.stage !== 'lost' && d.stage !== 'won').reduce((s, d) => s + Number(d.value), 0)
    const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + Number(d.value), 0)

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">CRM & Ventas</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de clientes y pipeline de ventas con seguimiento de deals</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button onClick={() => setView('pipeline')} className={`px-3 py-1.5 text-xs font-medium ${view === 'pipeline' ? 'bg-brand-purple text-white' : 'hover:bg-muted'}`}>Pipeline</button>
                        <button onClick={() => setView('clients')} className={`px-3 py-1.5 text-xs font-medium ${view === 'clients' ? 'bg-brand-purple text-white' : 'hover:bg-muted'}`}>Clientes</button>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportPDF}><Download className="h-4 w-4 mr-1" />PDF</Button>
                    {view === 'pipeline'
                        ? <Button size="sm" onClick={() => { setDt(''); setDv(''); setDs('lead'); setDn(''); setDc(''); setCreateDealOpen(true) }} className="promptive-btn text-white"><Plus className="h-4 w-4 mr-1" />Deal</Button>
                        : <Button size="sm" onClick={openCreate} className="promptive-btn text-white"><UserPlus className="h-4 w-4 mr-1" />Cliente</Button>
                    }
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 border-0"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-purple" /><div><p className="text-[10px] text-muted-foreground">Clientes</p><p className="text-lg font-bold">{clients.length}</p></div></div></Card>
                <Card className="p-3 border-0"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-brand-cyan" /><div><p className="text-[10px] text-muted-foreground">Deals Activos</p><p className="text-lg font-bold">{deals.filter(d => !['won', 'lost'].includes(d.stage)).length}</p></div></div></Card>
                <Card className="p-3 border-0"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-brand-amber" /><div><p className="text-[10px] text-muted-foreground">Pipeline</p><p className="text-lg font-bold">{formatCurrency(totalPipeline)}</p></div></div></Card>
                <Card className="p-3 border-0"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><div><p className="text-[10px] text-muted-foreground">Ganados</p><p className="text-lg font-bold text-emerald-500">{formatCurrency(wonValue)}</p></div></div></Card>
            </div>

            {view === 'pipeline' ? (
                /* Pipeline Kanban */
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {PIPELINE_STAGES.filter(s => s.key !== 'lost').map(stage => {
                        const stageDeals = deals.filter(d => d.stage === stage.key)
                        return (
                            <div key={stage.key} className="min-w-[260px] sm:min-w-[280px] flex-shrink-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <span>{stage.icon}</span>
                                    <h3 className="text-sm font-semibold">{stage.label}</h3>
                                    <Badge variant="secondary" className="text-[10px] h-5">{stageDeals.length}</Badge>
                                    <span className="ml-auto text-[10px] font-medium" style={{ color: stage.color }}>{formatCurrency(pipelineValue(stage.key))}</span>
                                </div>
                                <div className="space-y-2 min-h-[100px]">
                                    {stageDeals.map(deal => (
                                        <Card key={deal.id} className="p-3 border cursor-pointer hover:shadow-md transition-shadow" style={{ borderLeftColor: stage.color, borderLeftWidth: '3px' }}
                                            onClick={() => { setSelectedDeal(deal); setDetailOpen(true) }}>
                                            <p className="text-sm font-medium mb-1">{deal.title}</p>
                                            <p className="text-xs font-bold" style={{ color: stage.color }}>{formatCurrency(deal.value)}</p>
                                            {deal.notes && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{deal.notes}</p>}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {clients.find(c => c.id === deal.client_id)?.full_name || 'Sin cliente'}
                                                </span>
                                                {stage.key !== 'won' && (
                                                    <button onClick={e => { e.stopPropagation(); advanceDeal(deal) }}
                                                        className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded hover:bg-muted" style={{ color: stage.color }}>
                                                        <ArrowRight className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* Clients Table */
                <>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                    </div>
                    <Card className="border-0 overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Cliente</TableHead><TableHead className="hidden sm:table-cell">Empresa</TableHead>
                                <TableHead className="hidden md:table-cell">Contacto</TableHead><TableHead>Estado</TableHead><TableHead></TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {filtered.map(client => (
                                    <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedClient(client); setDetailOpen(true) }}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full promptive-gradient text-white text-[10px] font-bold shrink-0">
                                                    {client.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className="min-w-0"><p className="font-medium text-sm truncate">{client.full_name}</p><p className="text-[10px] text-muted-foreground truncate">{client.email}</p></div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm">{client.company}</TableCell>
                                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{client.phone}</TableCell>
                                        <TableCell><Badge variant="secondary" className={`text-[10px] ${getStatusColor(client.status)}`}>{getStatusLabel(client.status)}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(client)}><Edit3 className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-brand-pink" onClick={() => { setSelectedClient(client); setSelectedDeal(null); setDeleteOpen(true) }}><Trash2 className="h-3 w-3" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            )}

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
                    {selectedDeal && (
                        <>
                            <SheetHeader><SheetTitle>{selectedDeal.title}</SheetTitle></SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className="flex gap-2">
                                    {PIPELINE_STAGES.filter(s => s.key !== 'lost').map(s => (
                                        <span key={s.key} className={`text-xs ${selectedDeal.stage === s.key ? 'font-bold' : 'text-muted-foreground'}`} style={selectedDeal.stage === s.key ? { color: s.color } : {}}>
                                            {s.icon}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Valor</p><p className="text-lg font-bold text-brand-cyan">{formatCurrency(selectedDeal.value)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Cierre</p><p className="text-sm font-medium mt-0.5">{formatDate(selectedDeal.expected_close)}</p></div>
                                </div>
                                {selectedDeal.notes && <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Notas</p><p className="text-sm mt-1">{selectedDeal.notes}</p></div>}
                                <div className="flex gap-2">
                                    {selectedDeal.stage !== 'won' && <Button className="flex-1 promptive-btn text-white" onClick={() => { advanceDeal(selectedDeal); setDetailOpen(false) }}><ArrowRight className="h-4 w-4 mr-1" />Avanzar</Button>}
                                    <Button variant="destructive" className="flex-1" onClick={() => { setSelectedClient(null); setDetailOpen(false); setDeleteOpen(true) }}><Trash2 className="h-4 w-4 mr-1" />Eliminar</Button>
                                </div>
                            </div>
                        </>
                    )}
                    {selectedClient && !selectedDeal && (
                        <>
                            <SheetHeader><SheetTitle>{selectedClient.full_name}</SheetTitle></SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full promptive-gradient text-white text-lg font-bold">{selectedClient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                                    <div><p className="font-semibold">{selectedClient.company}</p><Badge variant="secondary" className={`text-[10px] ${getStatusColor(selectedClient.status)}`}>{getStatusLabel(selectedClient.status)}</Badge></div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{selectedClient.email}</p>
                                    <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{selectedClient.phone || '—'}</p>
                                    <p className="text-sm flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{selectedClient.company || '—'}</p>
                                </div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Deals del Cliente</h4>
                                <div className="space-y-2">
                                    {deals.filter(d => d.client_id === selectedClient.id).map(d => (
                                        <div key={d.id} className="p-2 rounded-lg bg-muted/50 flex justify-between items-center">
                                            <span className="text-xs font-medium">{d.title}</span>
                                            <span className="text-xs font-bold text-brand-cyan">{formatCurrency(d.value)}</span>
                                        </div>
                                    ))}
                                    {deals.filter(d => d.client_id === selectedClient.id).length === 0 && <p className="text-xs text-muted-foreground">Sin deals</p>}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Create Client */}
            <CrudDialog open={createClientOpen} onClose={() => setCreateClientOpen(false)} title="Nuevo Cliente" onSave={handleCreateClient} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label><Input value={fn} onChange={e => setFn(e.target.value)} placeholder="María García" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label><Input type="email" value={fe} onChange={e => setFe(e.target.value)} placeholder="maria@empresa.pe" /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Teléfono</label><Input value={fph} onChange={e => setFph(e.target.value)} placeholder="+51 999..." /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Empresa</label><Input value={fco} onChange={e => setFco(e.target.value)} placeholder="Tech SAC" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Estado</label>
                        <select value={fst} onChange={e => setFst(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="lead">Lead</option><option value="qualified">Calificado</option><option value="customer">Cliente</option>
                        </select></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Fuente</label>
                        <select value={fso} onChange={e => setFso(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="web">Web</option><option value="referido">Referido</option><option value="redes_sociales">Redes</option><option value="evento">Evento</option>
                        </select></div>
                </div>
            </CrudDialog>

            {/* Edit Client */}
            <CrudDialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar Cliente" onSave={handleEdit} loading={saving} saveLabel="Actualizar">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label><Input value={fn} onChange={e => setFn(e.target.value)} /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label><Input type="email" value={fe} onChange={e => setFe(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Teléfono</label><Input value={fph} onChange={e => setFph(e.target.value)} /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Empresa</label><Input value={fco} onChange={e => setFco(e.target.value)} /></div>
                </div>
            </CrudDialog>

            {/* Create Deal */}
            <CrudDialog open={createDealOpen} onClose={() => setCreateDealOpen(false)} title="Nuevo Deal" onSave={handleCreateDeal} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Título</label><Input value={dt} onChange={e => setDt(e.target.value)} placeholder="Consultoría Q1" /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor (S/)</label><Input type="number" value={dv} onChange={e => setDv(e.target.value)} placeholder="15000" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Etapa</label>
                        <select value={ds} onChange={e => setDs(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {PIPELINE_STAGES.filter(s => s.key !== 'lost').map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                        </select></div>
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Cliente</label>
                    <select value={dc} onChange={e => setDc(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Sin asignar</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Notas</label><Input value={dn} onChange={e => setDn(e.target.value)} placeholder="Contexto del deal..." /></div>
            </CrudDialog>

            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedClient(null); setSelectedDeal(null) }} onConfirm={handleDelete}
                title="Eliminar" description={`¿Eliminar "${selectedDeal?.title || selectedClient?.full_name}"?`} loading={saving} />
        </div>
    )
}
