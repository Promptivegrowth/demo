'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Search, Download, Package, AlertTriangle, Tag, Plus, Edit3, Trash2, Minus } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InventoryItem { id: string; name: string; sku: string; stock: number; min_stock: number; price: number; category: string; warehouse: string }

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [detailOpen, setDetailOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<InventoryItem | null>(null)

    const [formName, setFormName] = useState('')
    const [formSku, setFormSku] = useState('')
    const [formStock, setFormStock] = useState(0)
    const [formMinStock, setFormMinStock] = useState(0)
    const [formPrice, setFormPrice] = useState(0)
    const [formCategory, setFormCategory] = useState('')
    const [formWarehouse, setFormWarehouse] = useState('')

    useEffect(() => { fetchItems() }, [])

    async function fetchItems() {
        const { data } = await supabase.from('inventory').select('*').order('name')
        setItems(data || [])
        setLoading(false)
    }

    const categories = [...new Set(items.map(i => i.category))]
    const filtered = items.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
        return matchSearch && (categoryFilter === 'all' || i.category === categoryFilter)
    })

    const totalValue = items.reduce((s, i) => s + i.stock * i.price, 0)
    const lowStockCount = items.filter(i => i.stock <= i.min_stock).length
    const totalItems = items.reduce((s, i) => s + i.stock, 0)

    const getStockStatus = (stock: number, minStock: number) => {
        if (stock <= 0) return { label: 'Sin Stock', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
        if (stock <= minStock) return { label: 'Stock Bajo', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
        return { label: 'Normal', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
    }

    function openCreate() {
        setFormName(''); setFormSku(''); setFormStock(0); setFormMinStock(10); setFormPrice(0); setFormCategory(''); setFormWarehouse('Almacén Central')
        setCreateOpen(true)
    }

    function openEdit(item: InventoryItem) {
        setSelected(item); setFormName(item.name); setFormSku(item.sku); setFormStock(item.stock); setFormMinStock(item.min_stock); setFormPrice(item.price); setFormCategory(item.category); setFormWarehouse(item.warehouse)
        setEditOpen(true)
    }

    async function handleCreate() {
        if (!formName || !formSku) { toast.error('Nombre y SKU son obligatorios'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()
        const { error } = await supabase.from('inventory').insert({
            name: formName, sku: formSku, stock: formStock, min_stock: formMinStock,
            price: formPrice, category: formCategory, warehouse: formWarehouse, org_id: orgResult.data?.id
        })
        if (error) toast.error('Error al crear producto')
        else { toast.success('Producto creado'); setCreateOpen(false); fetchItems() }
        setSaving(false)
    }

    async function handleEdit() {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase.from('inventory').update({
            name: formName, sku: formSku, stock: formStock, min_stock: formMinStock,
            price: formPrice, category: formCategory, warehouse: formWarehouse
        }).eq('id', selected.id)
        if (error) toast.error('Error al editar')
        else { toast.success('Producto actualizado'); setEditOpen(false); setSelected(null); fetchItems() }
        setSaving(false)
    }

    async function handleDelete() {
        if (!selected) return
        setSaving(true)
        const { error } = await supabase.from('inventory').delete().eq('id', selected.id)
        if (error) toast.error('Error al eliminar')
        else { toast.success('Producto eliminado'); setDeleteOpen(false); setSelected(null); fetchItems() }
        setSaving(false)
    }

    async function adjustStock(item: InventoryItem, delta: number) {
        const newStock = Math.max(0, item.stock + delta)
        const { error } = await supabase.from('inventory').update({ stock: newStock }).eq('id', item.id)
        if (error) toast.error('Error al ajustar stock')
        else { toast.success(`Stock ${delta > 0 ? 'incrementado' : 'reducido'}`); fetchItems() }
    }

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(18); doc.setTextColor(79, 70, 229); doc.text('PROMPTIVE', 14, 20)
        doc.setFontSize(10); doc.setTextColor(100); doc.text('Reporte de Inventario', 14, 28)
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 14, 34)
        autoTable(doc, {
            startY: 42,
            head: [['Producto', 'SKU', 'Stock', 'Mín.', 'Precio', 'Categoría', 'Almacén']],
            body: filtered.map(i => [i.name, i.sku, i.stock, i.min_stock, formatCurrency(i.price), i.category, i.warehouse]),
            headStyles: { fillColor: [79, 70, 229] },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            styles: { fontSize: 8 },
        })
        doc.save('inventario.pdf')
    }

    const formFields = (
        <>
            <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label>
                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Laptop Pro 15&quot;" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">SKU</label>
                    <Input value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="TEC-001" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Stock</label>
                    <Input type="number" value={formStock} onChange={(e) => setFormStock(Number(e.target.value))} /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Mínimo</label>
                    <Input type="number" value={formMinStock} onChange={(e) => setFormMinStock(Number(e.target.value))} /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Precio</label>
                    <Input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoría</label>
                    <Input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Tecnología" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Almacén</label>
                    <Input value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} placeholder="Almacén Central" /></div>
            </div>
        </>
    )

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold tracking-tight">Inventario & Almacén</h1>
                    <p className="text-sm text-muted-foreground mt-1">Control de stock multi-almacén</p></div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportPDF}><Download className="h-4 w-4 mr-1" />PDF</Button>
                    <Button size="sm" onClick={openCreate} className="promptive-btn text-white">
                        <Plus className="h-4 w-4 mr-1" />Nuevo Producto
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 border-0"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl promptive-gradient"><Package className="h-5 w-5 text-white" /></div><div><p className="text-xs text-muted-foreground">Total en Stock</p><p className="text-xl font-bold">{totalItems.toLocaleString()} uds</p></div></div></Card>
                <Card className="p-4 border-0"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1AA3D9] to-[#0ea5e9]"><Tag className="h-5 w-5 text-white" /></div><div><p className="text-xs text-muted-foreground">Valor del Inventario</p><p className="text-xl font-bold">{formatCurrency(totalValue)}</p></div></div></Card>
                <Card className="p-4 border-0"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F6AD27] to-[#f59e0b]"><AlertTriangle className="h-5 w-5 text-white" /></div><div><p className="text-xs text-muted-foreground">Alertas de Stock</p><p className="text-xl font-bold text-amber-600">{lowStockCount}</p></div></div></Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nombre o SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">Todas las categorías</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <Card className="border-0 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Producto</TableHead><TableHead>SKU</TableHead><TableHead>Stock</TableHead><TableHead>Mín.</TableHead><TableHead>Precio</TableHead><TableHead>Categoría</TableHead><TableHead>Almacén</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((item) => {
                            const status = getStockStatus(item.stock, item.min_stock)
                            return (
                                <TableRow key={item.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(item); setDetailOpen(true) }}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.sku}</code></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div className={`h-full rounded-full ${item.stock <= item.min_stock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min((item.stock / (item.min_stock * 3)) * 100, 100)}%` }} />
                                            </div>
                                            <span className="text-sm font-medium">{item.stock}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{item.min_stock}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(item.price)}</TableCell>
                                    <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{item.warehouse}</TableCell>
                                    <TableCell><Badge variant="secondary" className={status.color}>{status.label}</Badge></TableCell>
                                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => adjustStock(item, -1)}><Minus className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => adjustStock(item, 1)}><Plus className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}><Edit3 className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { setSelected(item); setDeleteOpen(true) }}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-[400px]">
                    {selected && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selected.name}</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">SKU</p><p className="text-sm font-mono font-medium mt-1">{selected.sku}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Precio</p><p className="text-sm font-medium mt-1">{formatCurrency(selected.price)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Stock Actual</p><p className="text-xl font-bold mt-1">{selected.stock}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Stock Mínimo</p><p className="text-sm font-medium mt-1">{selected.min_stock}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Categoría</p><p className="text-sm font-medium mt-1">{selected.category}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Almacén</p><p className="text-sm font-medium mt-1">{selected.warehouse}</p></div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground uppercase">Valor Total</p><p className="text-lg font-bold mt-1">{formatCurrency(selected.stock * selected.price)}</p></div>
                                <div className="flex gap-2">
                                    <Button className="flex-1 promptive-btn text-white" onClick={() => { setDetailOpen(false); openEdit(selected) }}><Edit3 className="h-4 w-4 mr-1" />Editar</Button>
                                    <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => { setDetailOpen(false); setDeleteOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Producto" onSave={handleCreate} loading={saving}>{formFields}</CrudDialog>
            <CrudDialog open={editOpen} onClose={() => { setEditOpen(false); setSelected(null) }} title="Editar Producto" onSave={handleEdit} loading={saving} saveLabel="Guardar Cambios">{formFields}</CrudDialog>
            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null) }} onConfirm={handleDelete} title="Eliminar Producto" description={`¿Eliminar "${selected?.name}"?`} loading={saving} />
        </div>
    )
}
