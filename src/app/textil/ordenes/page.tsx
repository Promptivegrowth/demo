'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, Plus, MoreHorizontal, FileText,
    ChevronRight, Clock, User, ArrowRight, X,
    CheckCircle2, AlertCircle, PlayCircle, Loader2, DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

const API_DATA = [
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
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOT, setSelectedOT] = useState<any>(null)
    const [showNewOT, setShowNewOT] = useState(false)

    return (
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por OT, Cliente o Producto..."
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-all">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        Filtros
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
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">N° OT</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente / Producto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tallas (XS-XL)</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cantidad</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entrega</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado / Avance</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {API_DATA.filter(ot =>
                                ot.id.includes(searchTerm) ||
                                ot.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                ot.product.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((ot, i) => {
                                const status = STATUS_COLORS[ot.status]
                                return (
                                    <motion.tr
                                        key={ot.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedOT(ot)}
                                        className="group hover:bg-muted/30 cursor-pointer transition-all duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-brand-purple">{ot.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{ot.product}</span>
                                                <span className="text-xs text-muted-foreground">{ot.client}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {Object.entries(ot.sizes).map(([s, v]) => (
                                                    <div key={s} className="flex flex-col items-center">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{s}</span>
                                                        <span className="text-[10px] font-medium bg-muted px-1 rounded">{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold">{ot.total} pcs</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                                            {ot.deadline}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 min-w-[120px]">
                                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit text-[11px] font-bold uppercase tracking-tight", status.bg, status.text)}>
                                                    <status.icon className="h-3 w-3" />
                                                    {status.label}
                                                </div>
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${ot.progress}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className={cn("h-full rounded-full",
                                                            ot.progress >= 80 ? 'bg-emerald-500' :
                                                                ot.progress >= 40 ? 'bg-brand-purple' : 'bg-amber-500'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-1 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                )
                            })}
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
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-50 p-8 overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-brand-purple tracking-tighter">{selectedOT.id}</h2>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase border", STATUS_COLORS[selectedOT.status].bg, STATUS_COLORS[selectedOT.status].text, `border-${selectedOT.status === 'borrador' ? 'slate' : 'brand'}-200`)}>
                                            {STATUS_COLORS[selectedOT.status].label}
                                        </span>
                                    </div>
                                    <p className="text-foreground font-bold">{selectedOT.product}</p>
                                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Cliente: {selectedOT.client}</p>
                                </div>
                                <button onClick={() => setSelectedOT(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-muted/40 rounded-2xl border border-border/60">
                                    <Clock className="h-4 w-4 text-brand-purple mb-2" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Entrega</p>
                                    <p className="text-sm font-bold">{selectedOT.deadline}</p>
                                </div>
                                <div className="p-4 bg-muted/40 rounded-2xl border border-border/60">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mb-2" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Cantidad</p>
                                    <p className="text-sm font-bold">{selectedOT.total} pcs</p>
                                </div>
                                <div className="p-4 bg-muted/40 rounded-2xl border border-border/60">
                                    <User className="h-4 w-4 text-brand-cyan mb-2" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Responsable</p>
                                    <p className="text-sm font-bold leading-tight">{selectedOT.manager}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Subórdenes por Talla
                                        <div className="h-px flex-1 bg-border/40" />
                                    </h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(selectedOT.sizes).map(([s, v]) => (
                                            <div key={s} className="flex flex-col items-center p-3 bg-card border border-border rounded-xl">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase">{s}</span>
                                                <span className="text-lg font-bold text-brand-purple">{v as number}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Timeline de Avance
                                        <div className="h-px flex-1 bg-border/40" />
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Ingreso & Aprobación', date: '2026-03-01', done: true },
                                            { label: 'Corte de Tela', date: '2026-03-05', done: selectedOT.progress > 10 },
                                            { label: 'Ensamblaje (Costura)', date: 'En proceso', done: selectedOT.progress > 50, current: true },
                                            { label: 'Control de Calidad Final', date: 'Pendiente', done: false },
                                        ].map((step, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn("h-4 w-4 rounded-full border-2",
                                                        step.done ? "bg-brand-purple border-brand-purple" : "bg-card border-border",
                                                        step.current && "bg-brand-purple animate-pulse"
                                                    )} />
                                                    {i < 3 && <div className={cn("w-[2px] h-full my-1", step.done ? "bg-brand-purple" : "bg-border")} />}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <p className={cn("text-sm font-bold", step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                                                    <p className="text-[11px] text-muted-foreground font-medium uppercase">{step.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Costo Acumulado</p>
                                            <p className="text-lg font-black text-amber-900 leading-tight">S/ {(selectedOT.total * 18.4 * (selectedOT.progress / 100)).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 py-3 bg-card border border-border rounded-xl font-bold text-sm hover:bg-muted/50 transition-colors">Generar Ficha de Corte</button>
                                    <button className="flex-1 py-3 bg-brand-purple text-white rounded-xl font-bold text-sm shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-transform">Ver Tech Pack Completo</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* New OT Drawer (Placeholder) */}
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
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-50 p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black uppercase tracking-widest">Crear Nueva Orden</h2>
                                <button onClick={() => setShowNewOT(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="p-20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                                    <Plus className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                    <p className="text-sm font-bold text-muted-foreground leading-relaxed">Formulario de registro de OT disponible en la versión completa.<br />Integrado con CRM & Ventas.</p>
                                </div>
                                <button
                                    onClick={() => setShowNewOT(false)}
                                    className="w-full py-4 bg-brand-purple text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-purple/20"
                                >
                                    Cerrar Demo
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
