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
import { Search, Download, Users, DollarSign, Calendar, Plus, Trash2, Edit3, FileText, Briefcase, PieChart } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { PieChart as RPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Employee { id: string; full_name: string; email: string; position: string; department: string; salary: number; hire_date: string; status: string }

export default function HRPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selected, setSelected] = useState<Employee | null>(null)
    const [saving, setSaving] = useState(false)
    const [filterDept, setFilterDept] = useState('todos')

    const [fn, setFn] = useState(''); const [fe, setFe] = useState(''); const [fp, setFp] = useState('')
    const [fd, setFd] = useState(''); const [fs, setFs] = useState(''); const [fh, setFh] = useState('')

    useEffect(() => { fetchEmployees() }, [])

    async function fetchEmployees() {
        const { data } = await supabase.from('employees').select('*').order('full_name')
        setEmployees(data || [])
        setLoading(false)
    }

    function openCreate() { setFn(''); setFe(''); setFp(''); setFd(''); setFs(''); setFh(''); setCreateOpen(true) }
    function openEdit(e: Employee) { setFn(e.full_name); setFe(e.email); setFp(e.position); setFd(e.department); setFs(String(e.salary)); setFh(e.hire_date?.split('T')[0] || ''); setSelected(e); setEditOpen(true) }

    async function handleCreate() {
        if (!fn || !fe || !fp) { toast.error('Complete campos obligatorios'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('employees').insert({ full_name: fn, email: fe, position: fp, department: fd, salary: parseFloat(fs) || 0, hire_date: fh || new Date().toISOString().split('T')[0], status: 'activo', org_id: orgResult.data?.id })
        if (error) toast.error('Error al crear')
        else { toast.success('Empleado registrado'); setCreateOpen(false); fetchEmployees() }
        setSaving(false)
    }

    async function handleEdit() {
        if (!selected || !fn) return
        setSaving(true)
        const { error } = await supabase.from('employees').update({ full_name: fn, email: fe, position: fp, department: fd, salary: parseFloat(fs) || 0, hire_date: fh }).eq('id', selected.id)
        if (error) toast.error('Error')
        else { toast.success('Actualizado'); setEditOpen(false); fetchEmployees() }
        setSaving(false)
    }

    async function handleDelete() {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase.from('employees').delete().eq('id', selected.id)
        if (error) toast.error('Error')
        else { toast.success('Eliminado'); setDeleteOpen(false); setSelected(null); fetchEmployees() }
        setSaving(false)
    }

    function calcPayroll(salary: number) {
        const afp = salary * 0.13; const essalud = salary * 0.09; const gratificacion = salary
        const cts = salary / 12 * 1.1666; const vacaciones = salary / 12
        const neto = salary - afp
        return { afp, essalud, gratificacion, cts, vacaciones, neto, costoTotal: salary + essalud }
    }

    function generatePayslip(emp: Employee) {
        const doc = new jsPDF()
        const p = calcPayroll(emp.salary)
        doc.setFontSize(18); doc.setTextColor(178, 52, 189); doc.text('PROMPTIVE', 14, 20)
        doc.setFontSize(10); doc.setTextColor(100); doc.text('Boleta de Pago Mensual', 14, 28)
        doc.setDrawColor(178, 52, 189); doc.line(14, 32, 196, 32)
        doc.setFontSize(11); doc.setTextColor(0)
        doc.text(`Empleado: ${emp.full_name}`, 14, 42); doc.text(`Cargo: ${emp.position}`, 14, 50)
        doc.text(`Departamento: ${emp.department}`, 14, 58); doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 14, 66)
        autoTable(doc, {
            startY: 75,
            head: [['Concepto', 'Monto (S/)']],
            body: [
                ['Salario Base', formatCurrency(emp.salary)],
                ['AFP (13%)', `- ${formatCurrency(p.afp)}`],
                ['', ''],
                ['NETO A PAGAR', formatCurrency(p.neto)],
                ['', ''],
                ['EsSalud (9%) - Empleador', formatCurrency(p.essalud)],
                ['Gratificación (anual)', formatCurrency(p.gratificacion)],
                ['CTS (anual)', formatCurrency(p.cts)],
                ['Vacaciones (anual)', formatCurrency(p.vacaciones)],
            ],
            headStyles: { fillColor: [178, 52, 189] },
            styles: { fontSize: 10 },
        })
        doc.save(`boleta-${emp.full_name.replace(/\s/g, '-').toLowerCase()}.pdf`)
        toast.success('Boleta generada')
    }

    function exportPlanilla() {
        const doc = new jsPDF('l')
        doc.setFontSize(18); doc.setTextColor(178, 52, 189); doc.text('PROMPTIVE - Planilla', 14, 20)
        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28)
        autoTable(doc, {
            startY: 35,
            head: [['Empleado', 'Cargo', 'Depto.', 'Base', 'AFP 13%', 'EsSalud 9%', 'Neto']],
            body: employees.filter(e => e.status === 'activo').map(e => {
                const p = calcPayroll(e.salary)
                return [e.full_name, e.position, e.department, formatCurrency(e.salary), formatCurrency(p.afp), formatCurrency(p.essalud), formatCurrency(p.neto)]
            }),
            headStyles: { fillColor: [178, 52, 189] },
            styles: { fontSize: 9 },
        })
        doc.save('planilla-promptive.pdf')
        toast.success('Planilla exportada')
    }

    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]
    const filtered = employees.filter(e => {
        const matchSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase())
        const matchDept = filterDept === 'todos' || e.department === filterDept
        return matchSearch && matchDept
    })
    const totalNomina = employees.filter(e => e.status === 'activo').reduce((s, e) => s + Number(e.salary), 0)
    const activeCount = employees.filter(e => e.status === 'activo').length
    const deptData = departments.map(d => ({ name: d, value: employees.filter(e => e.department === d).length }))
    const DEPT_COLORS = ['#B234BD', '#1AA3D9', '#F6AD27', '#E44078', '#22c55e', '#8b5cf6', '#06b6d4', '#f43f5e']

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Recursos Humanos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de personal y nómina con cálculos laborales peruanos automatizados (AFP, EsSalud, CTS, gratificación)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportPlanilla}><Download className="h-4 w-4 mr-1" />Planilla PDF</Button>
                    <Button size="sm" onClick={openCreate} className="promptive-btn text-white"><Plus className="h-4 w-4 mr-1" />Empleado</Button>
                </div>
            </div>

            {/* Dashboard Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B234BD] to-[#8b5cf6]"><Users className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{employees.length}</p></div></div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1AA3D9] to-[#0ea5e9]"><Briefcase className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Activos</p><p className="text-xl font-bold">{activeCount}</p></div></div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F6AD27] to-[#f59e0b]"><DollarSign className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Nómina Mensual</p><p className="text-xl font-bold">{formatCurrency(totalNomina)}</p></div></div>
                </Card>
                <Card className="p-4 border-0">
                    <h4 className="text-xs text-muted-foreground mb-2">Por Departamento</h4>
                    {deptData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={80}>
                            <RPie><Pie data={deptData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} paddingAngle={3} dataKey="value">
                                {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                            </Pie><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }} /></RPie>
                        </ResponsiveContainer>
                    ) : <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>}
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar empleados..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="todos">Todos los departamentos</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Employee Table */}
            <Card className="border-0 overflow-x-auto">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead>Empleado</TableHead><TableHead className="hidden sm:table-cell">Cargo</TableHead><TableHead className="hidden md:table-cell">Depto.</TableHead>
                        <TableHead>Salario</TableHead><TableHead className="hidden lg:table-cell">Ingreso</TableHead><TableHead>Estado</TableHead><TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {filtered.map(emp => (
                            <TableRow key={emp.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(emp); setDetailOpen(true) }}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full promptive-gradient text-white text-[10px] font-bold shrink-0">
                                            {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="min-w-0"><p className="font-medium text-sm truncate">{emp.full_name}</p><p className="text-[10px] text-muted-foreground truncate">{emp.email}</p></div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-sm">{emp.position}</TableCell>
                                <TableCell className="hidden md:table-cell"><Badge variant="secondary" className="text-[10px]">{emp.department}</Badge></TableCell>
                                <TableCell className="font-semibold text-sm">{formatCurrency(emp.salary)}</TableCell>
                                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(emp.hire_date)}</TableCell>
                                <TableCell><Badge variant="secondary" className={`text-[10px] ${getStatusColor(emp.status)}`}>{getStatusLabel(emp.status)}</Badge></TableCell>
                                <TableCell>
                                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(emp)}><Edit3 className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => generatePayslip(emp)} title="Boleta"><FileText className="h-3 w-3 text-brand-purple" /></Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-brand-pink" onClick={() => { setSelected(emp); setDeleteOpen(true) }}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full sm:w-[420px] overflow-y-auto">
                    {selected && (() => {
                        const p = calcPayroll(selected.salary)
                        return (<>
                            <SheetHeader><SheetTitle>{selected.full_name}</SheetTitle></SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full promptive-gradient text-white text-lg font-bold">{selected.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                                    <div><p className="font-semibold">{selected.position}</p><p className="text-sm text-muted-foreground">{selected.department}</p></div>
                                </div>

                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Desglose de Nómina</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span>Salario Base</span><span className="font-medium">{formatCurrency(selected.salary)}</span></div>
                                    <div className="flex justify-between text-sm text-brand-pink"><span>AFP (13%)</span><span>- {formatCurrency(p.afp)}</span></div>
                                    <div className="h-px bg-border" />
                                    <div className="flex justify-between text-sm font-bold"><span>Neto a Pagar</span><span className="text-brand-cyan">{formatCurrency(p.neto)}</span></div>
                                </div>

                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">Beneficios Anuales</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">EsSalud (9%)</p><p className="text-sm font-bold mt-0.5">{formatCurrency(p.essalud)}/mes</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Gratificación</p><p className="text-sm font-bold mt-0.5">{formatCurrency(p.gratificacion)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">CTS</p><p className="text-sm font-bold mt-0.5">{formatCurrency(p.cts)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Vacaciones</p><p className="text-sm font-bold mt-0.5">{formatCurrency(p.vacaciones)}</p></div>
                                </div>

                                <div className="p-3 rounded-lg bg-brand-purple/5 border border-brand-purple/10">
                                    <p className="text-[10px] text-muted-foreground">Costo Total Empleador</p>
                                    <p className="text-lg font-bold text-brand-purple">{formatCurrency(p.costoTotal)}/mes</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 promptive-btn text-white" onClick={() => generatePayslip(selected)}><FileText className="h-4 w-4 mr-1" />Boleta PDF</Button>
                                    <Button variant="outline" className="flex-1" onClick={() => { setDetailOpen(false); openEdit(selected) }}><Edit3 className="h-4 w-4 mr-1" />Editar</Button>
                                </div>
                            </div>
                        </>)
                    })()}
                </SheetContent>
            </Sheet>

            {/* Create/Edit Dialogs */}
            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Empleado" onSave={handleCreate} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre Completo</label><Input value={fn} onChange={e => setFn(e.target.value)} placeholder="Juan Pérez" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label><Input type="email" value={fe} onChange={e => setFe(e.target.value)} placeholder="juan@empresa.pe" /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Cargo</label><Input value={fp} onChange={e => setFp(e.target.value)} placeholder="Analista" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Departamento</label><Input value={fd} onChange={e => setFd(e.target.value)} placeholder="IT" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Salario (S/)</label><Input type="number" value={fs} onChange={e => setFs(e.target.value)} placeholder="3500" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Fecha Ingreso</label><Input type="date" value={fh} onChange={e => setFh(e.target.value)} /></div>
                </div>
            </CrudDialog>

            <CrudDialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar Empleado" onSave={handleEdit} loading={saving} saveLabel="Actualizar">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label><Input value={fn} onChange={e => setFn(e.target.value)} /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label><Input type="email" value={fe} onChange={e => setFe(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Cargo</label><Input value={fp} onChange={e => setFp(e.target.value)} /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Depto.</label><Input value={fd} onChange={e => setFd(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Salario</label><Input type="number" value={fs} onChange={e => setFs(e.target.value)} /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Ingreso</label><Input type="date" value={fh} onChange={e => setFh(e.target.value)} /></div>
                </div>
            </CrudDialog>

            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null) }} onConfirm={handleDelete} title="Eliminar Empleado" description={`¿Eliminar a "${selected?.full_name}"?`} loading={saving} />
        </div>
    )
}
