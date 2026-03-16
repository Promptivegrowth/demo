import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ClipboardCheck, AlertTriangle, CheckCircle2,
    XCircle, Info, BarChart3, Search, Filter,
    ChevronRight, ArrowUpRight, TrendingDown,
    X, Plus, MoreHorizontal, History, Download, FileCheck,
    Layers, Activity, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const QUALITY_STATS = [
    { label: 'Tasa de Defectos', value: '3.2%', change: '-0.8%', icon: AlertTriangle, color: 'text-brand-amber', trend: 'down' },
    { label: 'Inspecciones Hoy', value: '142', change: '+12', icon: ClipboardCheck, color: 'text-brand-purple', trend: 'up' },
    { label: 'Prendas Aprobadas', value: '3,420', change: '↑ 96.8%', icon: CheckCircle2, color: 'text-emerald-500', trend: 'up' },
    { label: 'Rechazos Críticos', value: '12', change: '-4', icon: XCircle, color: 'text-red-500', trend: 'down' },
]

const DEFECT_TYPES = [
    { label: 'Defectos de Costura', value: 45, color: 'bg-brand-purple' },
    { label: 'Defectos de Tela', value: 25, color: 'bg-brand-cyan' },
    { label: 'Desviación de Medidas', value: 20, color: 'bg-brand-amber' },
    { label: 'Otros (Avíos/Limpieza)', value: 10, color: 'bg-slate-400' },
]

const INITIAL_INSPECTIONS = [
    { id: 'INS-001', ot: 'OT-2026-001', product: 'Polo Pima Jersey', samples: 50, defects: 1, rate: 2, status: 'approved', auditor: 'Maria C.', date: 'Hoy, 10:45 AM' },
    { id: 'INS-002', ot: 'OT-2026-003', product: 'Pantalón Dril', samples: 32, defects: 4, rate: 12.5, status: 'rejected', auditor: 'José S.', date: 'Hoy, 09:20 AM' },
    { id: 'INS-003', ot: 'OT-2026-004', product: 'Hoodie Oversized', samples: 80, defects: 2, rate: 2.5, status: 'approved', auditor: 'Maria C.', date: 'Ayer, 04:15 PM' },
    { id: 'INS-004', ot: 'OT-2026-002', product: 'Vestido Verano', samples: 20, defects: 0, rate: 0, status: 'approved', auditor: 'Roberto V.', date: 'Ayer, 02:30 PM' },
]

export default function ControlCalidad() {
    const [searchTerm, setSearchTerm] = useState('')
    const [inspections, setInspections] = useState(INITIAL_INSPECTIONS)
    const [selectedIns, setSelectedIns] = useState<any>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    // Form state for new inspection
    const [newIns, setNewIns] = useState({
        ot: '',
        samples: 50,
        defects: 0,
        auditor: 'Admin Promptive'
    })

    const handleCreateInspection = () => {
        if (!newIns.ot) {
            toast.error("Por favor ingresa un número de OT")
            return
        }

        const rate = (newIns.defects / newIns.samples) * 100
        const status = rate > 5 ? 'rejected' : 'approved'

        const inspection = {
            id: `INS-00${inspections.length + 1}`,
            ot: newIns.ot,
            product: 'Carga General - Textil',
            samples: newIns.samples,
            defects: newIns.defects,
            rate: parseFloat(rate.toFixed(1)),
            status,
            auditor: newIns.auditor,
            date: 'Ahora mismo'
        }

        setInspections([inspection, ...inspections])
        setIsDrawerOpen(false)
        setNewIns({ ot: '', samples: 50, defects: 0, auditor: 'Admin Promptive' })

        if (status === 'rejected') {
            toast.error(`Inspección ${inspection.id} RECHAZADA por exceder límite de defectos.`, {
                description: `Tasa de defectos: ${rate}%`
            })
        } else {
            toast.success(`Inspección ${inspection.id} registrada exitosamente.`, {
                description: "El lote ha sido aprobado para despacho/empaque."
            })
        }
    }

    const handleExport = () => {
        setIsExporting(true)
        const promise = new Promise(res => setTimeout(res, 2500))
        toast.promise(promise, {
            loading: 'Generando Informe de Auditoría Mensual - Sector Textil...',
            success: () => {
                setIsExporting(false)
                return 'Reporte QC-2026-MAR.pdf generado exitosamente'
            },
            error: 'Error al procesar la exportación'
        })
    }

    const filteredInspections = inspections.filter(ins =>
        ins.ot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ins.product.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Auditoría & Control de Calidad</h1>
                    <p className="text-sm text-muted-foreground font-medium">Gestión de estándares AQL y reportes de defectos.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Download className="h-4 w-4 text-brand-cyan" /> Exportar Reporte
                    </button>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-purple text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Nueva Inspección
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {QUALITY_STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-card rounded-3xl border border-border shadow-sm group hover:border-brand-purple/30 transition-all hover:shadow-xl hover:shadow-brand-purple/5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl bg-muted/50 transition-colors group-hover:bg-brand-purple/5", stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={cn("text-[11px] font-black px-3 py-1 rounded-full shadow-sm",
                                stat.trend === 'down' && stat.label.includes('Defectos') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    stat.trend === 'up' && stat.label.includes('Defectos') ? 'bg-red-50 text-red-600 border border-red-100' :
                                        stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            )}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black mb-1 leading-tight tracking-tighter">{stat.value}</h3>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tabla de Defectos (Pareto) */}
                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <BarChart3 className="h-5 w-5 text-brand-purple" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Distribución de Defectos</h3>
                    </div>
                    <div className="space-y-8 flex-1">
                        {DEFECT_TYPES.map((type, i) => (
                            <div key={i} className="space-y-3 group">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                                    <span className="text-foreground/80 group-hover:text-brand-purple transition-colors">{type.label}</span>
                                    <span className="bg-muted/50 px-2 py-0.5 rounded-md">{type.value}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/10 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${type.value}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                                        className={cn("h-full rounded-full transition-all group-hover:brightness-110", type.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 p-5 bg-brand-purple/5 rounded-2xl border border-brand-purple/20 text-[11px] font-medium text-brand-purple/80 italic leading-relaxed shadow-inner">
                        <Info className="h-4 w-4 mb-2 opacity-60" />
                        "La mayoría de defectos de costura se concentran en la **Línea A** (recubierta). Requiere revisión de tensión de agujas."
                    </div>
                </div>

                {/* Tabla de Inspecciones Recientes */}
                <div className="lg:col-span-2 bg-card p-8 rounded-3xl border border-border shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-3">
                            <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Inspecciones Recientes (AQL 2.5)</h3>
                                <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter opacity-70">Monitoreo de auditoría en tiempo real</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-purple transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar OT o Producto..."
                                className="pl-10 pr-4 py-2 bg-muted/40 border-border/40 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/80">
                                    <th className="pb-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">OT / Producto</th>
                                    <th className="pb-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60 text-center">Muestra</th>
                                    <th className="pb-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60 text-center">Defectos</th>
                                    <th className="pb-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60 text-center">% Rate</th>
                                    <th className="pb-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60 text-center">Estado</th>
                                    <th className="pb-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredInspections.map((row, i) => (
                                    <motion.tr
                                        key={row.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedIns(row)}
                                        className="group hover:bg-muted/30 transition-all cursor-pointer"
                                    >
                                        <td className="py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-brand-purple tracking-tight uppercase mb-0.5">{row.ot}</span>
                                                <span className="text-[12px] font-black text-foreground/80 group-hover:text-foreground transition-colors">{row.product}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter flex items-center gap-1.5 opacity-60">
                                                    <History className="h-3 w-3" /> {row.date}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-center text-xs font-black text-foreground">{row.samples} pcs</td>
                                        <td className="py-5 text-center text-xs font-black text-red-500">{row.defects}</td>
                                        <td className="py-5 text-center">
                                            <span className={cn("text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm border",
                                                row.rate > 5 ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100')}>
                                                {row.rate}%
                                            </span>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex justify-center">
                                                {row.status === 'approved' ? (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full shadow-inner">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded-full shadow-inner">
                                                        <XCircle className="h-3.5 w-3.5" /> Rechazado
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            <button className="p-2.5 hover:bg-muted bg-muted/20 border border-border/20 rounded-xl text-muted-foreground transition-all group-hover:text-brand-purple active:scale-90">
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Checklist Visual Area */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-brand-cyan" />
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Guía de Auditoría Visual (Estándar Promptive)</h3>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter opacity-70">Protocolo de inspección para asegurar calidad premium</p>
                        </div>
                    </div>
                    <button className="text-[11px] font-black text-brand-purple border-b-2 border-brand-purple/20 pb-0.5 uppercase tracking-widest hover:border-brand-purple transition-all">Ver Manual Full</button>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="w-full lg:w-2/5 h-64 rounded-3xl overflow-hidden border border-border relative group shadow-2xl">
                        <img
                            src="/textil/quality_control.png"
                            alt="Quality Control"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em] drop-shadow-md">Estación de Inspección</span>
                                <h4 className="text-white font-black text-xl tracking-tight uppercase flex items-center gap-2">Protocolo L-04 <FileCheck className="h-5 w-5 text-emerald-400" /></h4>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: 'Simetría & Medidas', desc: 'Verificar tolerancia de +/- 1cm en puntos críticos según Tech Pack.', icon: Layers },
                            { title: 'Tensión de Puntada', desc: 'Asegurar que no haya saltos de ramillete ni hilos sueltos.', icon: Activity },
                            { title: 'Acabado & Limpieza', desc: 'Cero manchas de aceite y remoción total de hilos excedentes.', icon: CheckCircle2 },
                            { title: 'Tolerancia Crítica', desc: 'Cualquier hueco o rotura en tela es rechazo directo del lote.', icon: AlertTriangle },
                        ].map((step, i) => (
                            <div key={i} className="p-5 rounded-2xl border border-border/50 bg-muted/10 group hover:border-brand-purple/30 transition-all hover:bg-card hover:shadow-lg shadow-brand-purple/5 flex gap-4 items-start">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all shadow-sm">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[12px] font-black uppercase tracking-tight text-foreground group-hover:text-brand-purple transition-colors">{step.title}</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold opacity-70">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Inspection Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-[110] shadow-2xl p-10 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ClipboardCheck className="h-5 w-5 text-brand-purple" />
                                        <span className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Auditoría de Planta</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Nueva Inspección</h2>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-3 hover:bg-muted border border-border rounded-xl transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar pr-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Orden de Producción (OT)</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-purple transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Ej: OT-2026-045"
                                            className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/80 rounded-2xl text-sm font-black focus:ring-2 focus:ring-brand-purple/10 outline-none placeholder:text-muted-foreground/40 uppercase"
                                            value={newIns.ot}
                                            onChange={(e) => setNewIns({ ...newIns, ot: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tamaño Muestra</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-4 bg-muted/30 border border-border/80 rounded-2xl text-sm font-black focus:ring-2 focus:ring-brand-purple/10 outline-none"
                                            value={newIns.samples}
                                            onChange={(e) => setNewIns({ ...newIns, samples: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 text-red-600">Defectos Hallados</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-4 bg-card border-2 border-red-500/20 rounded-2xl text-sm font-black text-red-600 focus:ring-2 focus:ring-red-500/10 outline-none"
                                            value={newIns.defects}
                                            onChange={(e) => setNewIns({ ...newIns, defects: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-brand-purple/5 rounded-3xl border border-brand-purple/10 space-y-4 shadow-inner">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-1 opacity-70">Resultado Proyectado</p>
                                            <h4 className="text-xl font-black text-foreground uppercase tracking-tighter">Cálculo de Tasa AQL</h4>
                                        </div>
                                        <span className={cn("text-3xl font-black tracking-tighter", ((newIns.defects / newIns.samples) * 100) > 5 ? 'text-red-500' : 'text-emerald-600')}>
                                            {((newIns.defects / newIns.samples) * 100 || 0).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/20 shadow-inner">
                                        <div
                                            className={cn("h-full transition-all duration-500", ((newIns.defects / newIns.samples) * 100) > 5 ? 'bg-red-500' : 'bg-emerald-500')}
                                            style={{ width: `${Math.min(((newIns.defects / newIns.samples) * 100 || 0) * 10, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-bold italic opacity-80 uppercase tracking-tighter">
                                        * Basado en estándar ISO 2859-1 (AQL 2.5). El límite de rechazo para {newIns.samples} unidades es de {(newIns.samples * 0.05).toFixed(0)} defectos.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Observaciones Críticas</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describir los defectos encontrados (ej: hilos sueltos, medidas fuera de tolerancia...)"
                                        className="w-full p-4 bg-muted/30 border border-border/80 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-purple/10 outline-none placeholder:text-muted-foreground/40 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-10 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="px-6 py-4 border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-all active:scale-95 shadow-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateInspection}
                                    className="px-6 py-4 bg-brand-purple text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    Guardar Resultado
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Inspection Details Modal */}
            <AnimatePresence>
                {selectedIns && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedIns(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-[2.5rem] z-[110] shadow-2xl p-10 overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-black text-brand-purple uppercase tracking-[0.3em]">Auditoría Finalizada</span>
                                        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            selectedIns.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                        )}>
                                            {selectedIns.status === 'approved' ? 'Lote Aprobado' : 'Lote Rechazado'}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">{selectedIns.id}</h2>
                                    <p className="text-brand-purple font-black text-lg -mt-1">{selectedIns.ot}</p>
                                </div>
                                <button onClick={() => setSelectedIns(null)} className="p-3 hover:bg-muted border border-border rounded-2xl transition-all active:scale-90">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-muted/30 p-5 rounded-3xl border border-border/50 shadow-inner">
                                        <ClipboardCheck className="h-5 w-5 text-brand-cyan mb-2" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Producto</p>
                                        <p className="text-sm font-black text-foreground leading-tight">{selectedIns.product}</p>
                                    </div>
                                    <div className="bg-muted/30 p-5 rounded-3xl border border-border/50 shadow-inner">
                                        <History className="h-5 w-5 text-brand-purple mb-2" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Fecha Auditoría</p>
                                        <p className="text-sm font-black text-foreground leading-tight">{selectedIns.date}</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-card border border-border rounded-[2rem] shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-purple/10 transition-all duration-700" />
                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div className="space-y-1">
                                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Resultado Muestreo</h4>
                                            <p className="text-sm font-black text-foreground">AQL Límite 2.5</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn("text-4xl font-black tracking-tighter", selectedIns.rate > 5 ? 'text-red-500' : 'text-emerald-600')}>
                                                {selectedIns.rate}%
                                            </span>
                                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60 flex items-center gap-1.5 justify-end">
                                                Tasa de Defectos {selectedIns.rate > 5 ? <TrendingDown className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 relative z-10">
                                        <div className="text-center p-4 bg-muted/20 rounded-2xl border border-border/30">
                                            <p className="text-2xl font-black text-foreground">{selectedIns.samples}</p>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Muestra</p>
                                        </div>
                                        <div className="text-center p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                            <p className="text-2xl font-black text-red-500">{selectedIns.defects}</p>
                                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Hallados</p>
                                        </div>
                                        <div className="text-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                            <p className="text-2xl font-black text-emerald-600">{selectedIns.status === 'approved' ? 'OK' : 'FAIL'}</p>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Veredicto</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 bg-muted/20 border border-border rounded-3xl transition-all hover:bg-muted/40 group">
                                    <div className="h-12 w-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple font-black uppercase shadow-inner group-hover:scale-110 transition-transform">
                                        {selectedIns.auditor[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground">{selectedIns.auditor}</p>
                                        <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-70">Auditor de Calidad Senior</p>
                                    </div>
                                    <button className="ml-auto p-2 hover:bg-white rounded-xl border border-transparent hover:border-border transition-all shadow-sm">
                                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-muted transition-all active:scale-95 shadow-sm">
                                        <Download className="h-4 w-4" /> PDF Report
                                    </button>
                                    <button className="py-4 bg-brand-purple text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-all active:scale-95">
                                        Re-Auditar Lote
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
