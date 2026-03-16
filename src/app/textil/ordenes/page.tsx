'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, Plus, MoreHorizontal, FileText,
    ChevronRight, Clock, User, ArrowRight, X,
    CheckCircle2, AlertCircle, PlayCircle, Loader2, DollarSign,
    Download, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, { label: string, bg: string, text: string, icon: any }> = {
    'borrador': { label: 'Borrador', bg: 'bg-slate-100', text: 'text-slate-600', icon: FileText },
    'aprobada': { label: 'Aprobada', bg: 'bg-blue-100', text: 'text-blue-600', icon: CheckCircle2 },
    'corte': { label: 'En Corte', bg: 'bg-orange-100', text: 'text-orange-600', icon: PlayCircle },
    'costura': { label: 'En Costura', bg: 'bg-purple-100', text: 'text-purple-600', icon: PlayCircle },
    'acabado': { label: 'En Acabado', bg: 'bg-cyan-100', text: 'text-cyan-600', icon: Loader2 },
    'qc': { label: 'QC', bg: 'bg-amber-100', text: 'text-amber-600', icon: AlertCircle },
    'completada': { label: 'Completada', bg: 'bg-emerald-100', text: 'text-emerald-600', icon: CheckCircle2 },
    'entregada': { label: 'Entregada', bg: 'bg-emerald-200', text: 'text-emerald-800', icon: CheckCircle2 },
}

interface OT {
    id: string
    client: string
    product: string
    sizes: { xs: number, s: number, m: number, l: number, xl: number }
    total: number
    deadline: string
    status: string
    progress: number
    manager: string
}

const INITIAL_OTS: OT[] = [
    { id: 'OT-2026-001', client: 'Textiles Andinos SAC', product: 'Polo Pima Jersey', sizes: { xs: 50, s: 150, m: 200, l: 150, xl: 50 }, total: 600, deadline: '2026-03-25', status: 'entregada', progress: 100, manager: 'Ricardo L.' },
    { id: 'OT-2026-002', client: 'Moda Lima', product: 'Hoodie Oversized', sizes: { xs: 20, s: 80, m: 120, l: 80, xl: 20 }, total: 320, deadline: '2026-03-28', status: 'completada', progress: 100, manager: 'Ana G.' },
    { id: 'OT-2026-003', client: 'Uniforms Corp', product: 'Pantalón Dril', sizes: { xs: 10, s: 40, m: 50, l: 40, xl: 10 }, total: 150, deadline: '2026-04-05', status: 'acabado', progress: 85, manager: 'Carlos M.' },
    { id: 'OT-2026-004', client: 'Textiles Andinos SAC', product: 'Camiseta Deportiva', sizes: { xs: 100, s: 300, m: 400, l: 300, xl: 100 }, total: 1200, deadline: '2026-04-10', status: 'costura', progress: 60, manager: 'Ricardo L.' },
    { id: 'OT-2026-005', client: 'Alpha Retail', product: 'Vestido Verano', sizes: { xs: 15, s: 45, m: 60, l: 45, xl: 15 }, total: 180, deadline: '2026-04-12', status: 'costura', progress: 45, manager: 'Elena P.' },
    { id: 'OT-2026-006', client: 'Moda Lima', product: 'Jogger Fleece', sizes: { xs: 30, s: 90, m: 120, l: 90, xl: 30 }, total: 360, deadline: '2026-04-15', status: 'corte', progress: 20, manager: 'Ana G.' },
    { id: 'OT-2026-007', client: 'Uniforms Corp', product: 'Chaqueta Ejecutiva', sizes: { xs: 5, s: 20, m: 25, l: 20, xl: 5 }, total: 75, deadline: '2026-04-20', status: 'aprobada', progress: 5, manager: 'Carlos M.' },
    { id: 'OT-2026-008', client: 'Retail Global', product: 'Básico Cuello V', sizes: { xs: 100, s: 200, m: 300, l: 200, xl: 100 }, total: 900, deadline: '2026-04-25', status: 'borrador', progress: 0, manager: 'Daniel S.' },
]

export default function OrdenesProduccion() {
    const [ots, setOts] = useState<OT[]>(INITIAL_OTS)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [selectedOT, setSelectedOT] = useState<OT | null>(null)
    const [showNewOT, setShowNewOT] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    // New OT State
    const [formData, setFormData] = useState({
        client: '',
        product: 'Polo Pima Jersey',
        deadline: '',
        manager: 'Admin Promptive',
        xs: 0, s: 0, m: 0, l: 0, xl: 0
    })

    const filteredOTs = ots.filter(ot => {
        const matchesSearch = ot.id.includes(searchTerm) ||
            ot.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ot.product.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'Todos' || ot.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const handleCreateOT = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.client || !formData.deadline) return toast.error('Complete cliente y fecha')

        const total = Number(formData.xs) + Number(formData.s) + Number(formData.m) + Number(formData.l) + Number(formData.xl)
        if (total === 0) return toast.error('La cantidad total no puede ser cero')

        const newId = `OT-2026-${(ots.length + 1).toString().padStart(3, '0')}`
        const newItem: OT = {
            id: newId,
            client: formData.client,
            product: formData.product,
            deadline: formData.deadline,
            manager: formData.manager,
            status: 'borrador',
            progress: 0,
            total,
            sizes: { xs: Number(formData.xs), s: Number(formData.s), m: Number(formData.m), l: Number(formData.l), xl: Number(formData.xl) }
        }

        setOts([newItem, ...ots])
        setShowNewOT(false)
        setFormData({ client: '', product: 'Polo Pima Jersey', deadline: '', manager: 'Admin Promptive', xs: 0, s: 0, m: 0, l: 0, xl: 0 })
        toast.success(`Orden ${newId} generada exitosamente`)
    }

    const updateStatus = (id: string, newStatus: string) => {
        setOts(ots.map(ot => ot.id === id ? { ...ot, status: newStatus, progress: newStatus === 'entregada' ? 100 : ot.progress } : ot))
        if (selectedOT?.id === id) setSelectedOT({ ...selectedOT, status: newStatus })
        toast.info(`Estado de OT actualizado a ${newStatus.toUpperCase()}`)
    }

    const handleExport = () => {
        setIsExporting(true)
        toast.promise(new Promise(res => setTimeout(res, 2000)), {
            loading: 'Generando informe de producción...',
            success: () => {
                setIsExporting(false)
                return 'Informe exportado correctamente (Excel/PDF)'
            },
            error: 'Error en la exportación'
        })
    }

    return (
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card/50 p-4 rounded-3xl border border-border/50">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por OT, Cliente o Producto..."
                            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-xs font-bold py-2 px-4 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/20"
                    >
                        <option value="Todos">Todos los Estados</option>
                        {Object.keys(STATUS_COLORS).map(s => (
                            <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-black uppercase tracking-tight hover:bg-muted/50 transition-all disabled:opacity-50"
                    >
                        <Download className={cn("h-4 w-4 text-muted-foreground", isExporting && "animate-bounce")} />
                        Exportar
                    </button>
                    <button
                        onClick={() => setShowNewOT(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva OT
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex-1">
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-background z-10 shadow-sm">
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">N° OT</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Cliente / Producto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Tallas (XS-XL)</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Cantidad</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Entrega</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Estado / Avance</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-10 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOTs.length > 0 ? filteredOTs.map((ot, i) => {
                                const status = STATUS_COLORS[ot.status]
                                return (
                                    <motion.tr
                                        key={ot.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => setSelectedOT(ot)}
                                        className="group hover:bg-muted/30 cursor-pointer transition-all duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-brand-purple">{ot.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{ot.product}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{ot.client}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5">
                                                {Object.entries(ot.sizes).map(([s, v]) => (
                                                    <div key={s} className="flex flex-col items-center">
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">{s}</span>
                                                        <span className="text-[10px] font-bold bg-muted/60 px-1.5 py-0.5 rounded-md border border-border/50">{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-muted-foreground"><span className="text-foreground">{ot.total}</span> pcs</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-muted-foreground">
                                            {ot.deadline}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-black uppercase tracking-widest shadow-sm border", status.bg, status.text, `border-${ot.status === 'borrador' ? 'slate' : status.text.split('-')[1]}-200`)}>
                                                    <status.icon className="h-3 w-3" />
                                                    {status.label}
                                                </div>
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/20">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${ot.progress}%` }}
                                                        transition={{ duration: 1, delay: i * 0.05 }}
                                                        className={cn("h-full rounded-full",
                                                            ot.progress >= 90 ? 'bg-emerald-500' :
                                                                ot.progress >= 40 ? 'bg-brand-purple' : 'bg-amber-500'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                                        </td>
                                    </motion.tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground font-bold">
                                        No se encontraron órdenes de producción
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {selectedOT && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOT(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:ml-[256px]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-[60] p-8 overflow-y-auto shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-brand-purple tracking-tighter uppercase">{selectedOT.id}</h2>
                                        <select
                                            value={selectedOT.status}
                                            onChange={(e) => updateStatus(selectedOT.id, e.target.value)}
                                            className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase border outline-none cursor-pointer", STATUS_COLORS[selectedOT.status].bg, STATUS_COLORS[selectedOT.status].text, 'border-current')}
                                        >
                                            {Object.keys(STATUS_COLORS).map(s => (
                                                <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-foreground font-black text-lg">{selectedOT.product}</p>
                                    <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold">CLIENTE: {selectedOT.client}</p>
                                </div>
                                <button onClick={() => setSelectedOT(null)} className="p-2.5 hover:bg-muted border border-border rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-5 bg-muted/40 rounded-3xl border border-border/60">
                                    <Clock className="h-4 w-4 text-brand-purple mb-2" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Entrega</p>
                                    <p className="text-sm font-bold">{selectedOT.deadline}</p>
                                </div>
                                <div className="p-5 bg-muted/40 rounded-3xl border border-border/60">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mb-2" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Cantidad</p>
                                    <p className="text-sm font-bold">{selectedOT.total} pcs</p>
                                </div>
                                <div className="p-5 bg-muted/40 rounded-3xl border border-border/60 flex flex-col justify-center">
                                    <User className="h-4 w-4 text-brand-cyan mb-2" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Responsable</p>
                                    <p className="text-[11px] font-bold leading-tight">{selectedOT.manager}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-3">
                                        Subórdenes por Talla
                                        <div className="h-px flex-1 bg-border/40" />
                                    </h3>
                                    <div className="grid grid-cols-5 gap-3">
                                        {Object.entries(selectedOT.sizes).map(([s, v]) => (
                                            <div key={s} className="flex flex-col items-center p-4 bg-card border border-border rounded-2xl shadow-sm">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase mb-1">{s}</span>
                                                <span className="text-xl font-black text-brand-purple tracking-tighter">{v as number}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-3">
                                        Timeline de Avance Real
                                        <div className="h-px flex-1 bg-border/40" />
                                    </h3>
                                    <div className="space-y-5 pl-2">
                                        {[
                                            { label: 'Ingreso & Aprobación', date: '2026-03-01', done: true },
                                            { label: 'Corte de Tela', date: '2026-03-05', done: selectedOT.progress > 15 },
                                            { label: 'Ensamblaje (Costura)', date: 'En proceso', done: selectedOT.progress > 50, current: selectedOT.status === 'costura' },
                                            { label: 'Acabado & Limpieza', date: 'Pendiente', done: selectedOT.progress > 85, current: selectedOT.status === 'acabado' },
                                            { label: 'Logística & Entrega', date: 'Pendiente', done: selectedOT.status === 'entregada' },
                                        ].map((step, i) => (
                                            <div key={i} className="flex gap-4 group relative">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn("z-10 h-5 w-5 rounded-full border-2 transition-all duration-300",
                                                        step.done ? "bg-brand-purple border-brand-purple" : "bg-card border-border",
                                                        step.current && "ring-4 ring-brand-purple/20 scale-110"
                                                    )}>
                                                        {step.done && <CheckCircle2 className="h-3 w-3 text-white m-auto translate-y-[2px]" />}
                                                    </div>
                                                    {i < 4 && <div className={cn("w-[2px] h-full absolute top-5 left-2.5 -translate-x-1/2", step.done ? "bg-brand-purple" : "bg-border/50")} />}
                                                </div>
                                                <div className="flex-1 pb-2">
                                                    <p className={cn("text-xs font-black uppercase tracking-tight", step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{step.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-brand-purple/5 border border-dashed border-brand-purple/20 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-brand-purple/10 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-brand-purple/10 rounded-2xl text-brand-purple shadow-sm">
                                            <DollarSign className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-purple/70 uppercase tracking-[0.2em] mb-1">Costo Estimado Actual</p>
                                            <p className="text-xl font-black text-foreground tracking-tighter">S/ {(selectedOT.total * 21.5).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full border border-brand-purple/20 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="py-4 border border-border rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-muted/50 transition-all">Reporte de Calidad</button>
                                    <button className="py-4 bg-brand-purple text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-all">Ficha Técnica</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* New OT Drawer (Functional) */}
            <AnimatePresence>
                {showNewOT && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewOT(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:ml-[256px]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-[60] p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Nueva Orden</h2>
                                    <p className="text-xs text-muted-foreground font-bold tracking-widest">REGISTRO DE PRODUCCIÓN</p>
                                </div>
                                <button onClick={() => setShowNewOT(false)} className="p-2.5 hover:bg-muted border border-border rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateOT} className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Cliente / Razon Social</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-brand-purple/10 outline-none font-bold text-sm"
                                        placeholder="Ingrese el nombre del cliente"
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Producto / Ficha</label>
                                        <select
                                            className="w-full p-4 bg-muted/30 border border-border rounded-2xl font-bold text-sm"
                                            value={formData.product}
                                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                        >
                                            <option>Polo Pima Jersey</option>
                                            <option>Hoodie Oversized</option>
                                            <option>Pantalón Dril</option>
                                            <option>Jogger Fleece</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Fecha de Entrega</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-4 bg-muted/30 border border-border rounded-2xl font-bold text-sm"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1 flex items-center gap-2">
                                        Distribución de Tallas (Cantidades)
                                        <div className="h-px flex-1 bg-border/40" />
                                    </label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {['xs', 's', 'm', 'l', 'xl'].map(size => (
                                            <div key={size} className="space-y-2">
                                                <p className="text-[10px] font-black text-center uppercase text-muted-foreground">{size}</p>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full p-3 bg-muted/20 border border-border rounded-xl text-center font-bold text-xs"
                                                    value={(formData as any)[size]}
                                                    onChange={(e) => setFormData({ ...formData, [size]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-brand-purple/5 border border-brand-purple/10 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Info className="h-4 w-4 text-brand-purple" />
                                        <span className="text-[10px] font-black uppercase text-brand-purple tracking-widest">Resumen de Orden</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold tracking-tight">
                                        Total a producir: <span className="text-brand-purple">{Number(formData.xs) + Number(formData.s) + Number(formData.m) + Number(formData.l) + Number(formData.xl)} unidades</span>.
                                        La orden se creará en estado "Borrador" y reservará materiales en el inventario.
                                    </p>
                                </div>
                            </form>

                            <div className="pt-6 border-t border-border mt-auto flex gap-4">
                                <button
                                    onClick={() => setShowNewOT(false)}
                                    className="flex-1 py-4 border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateOT}
                                    className="flex-2 px-12 py-4 bg-brand-purple text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-all"
                                >
                                    Generar Orden
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
