'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownRight,
    DollarSign, FileText, CreditCard,
    PieChart, BarChart3, Calendar,
    Download, Filter, Search, MoreVertical,
    CheckCircle2, AlertCircle, Clock,
    Building2, Scale, Check, MapPin
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { toast } from 'sonner'

export default function Contabilidad() {
    const [isClosingMonthOpen, setIsClosingMonthOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isCollectionsOpen, setIsCollectionsOpen] = useState(false)
    const [closingSteps, setClosingSteps] = useState([
        { id: 1, label: 'Conciliación Bancaria', done: true },
        { id: 2, label: 'Validación de Compras/Ventas (SUNAT)', done: false },
        { id: 3, label: 'Depreciaciones y Amortizaciones', done: false },
        { id: 4, label: 'Cálculo de Impuestos Mensuales', done: false },
    ])

    const handleExport = () => {
        setIsExporting(true)
        toast.info("Generación de libros electrónicos en curso...", {
            description: "Preparando XML para PLE (SUNAT)"
        })
        setTimeout(() => {
            setIsExporting(false)
            toast.success("Libros exportados correctamente", {
                description: "Los archivos están listos en la carpeta de descargas."
            })
        }, 3000)
    }

    const toggleStep = (id: number) => {
        setClosingSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
    }

    const handleCloseMonth = () => {
        if (closingSteps.every(s => s.done)) {
            toast.success("Mes cerrado exitosamente", {
                description: "Se han generado los asientos de cierre y bloqueado el periodo."
            })
            setIsClosingMonthOpen(false)
        } else {
            toast.error("Pendientes detectados", {
                description: "Debes completar todos los pasos del checklist antes de cerrar el mes."
            })
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Centro Contable & Financiero</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Balances, Estados de Resultados e Impuestos (SUNAT)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-11 rounded-xl text-[10px] font-black uppercase italic tracking-widest gap-2 bg-white"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download className={cn("h-4 w-4", isExporting && "animate-bounce")} />
                        {isExporting ? 'Exportando...' : 'Exportar Libros'}
                    </Button>
                    <Button
                        className="h-11 rounded-xl bg-slate-900 text-white hover:bg-black text-[10px] font-black uppercase italic tracking-widest"
                        onClick={() => setIsClosingMonthOpen(true)}
                    >
                        Cierre de Mes
                    </Button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Egresos Totales', value: 'S/ 42,850', trend: '+12%', color: 'text-red-500', icon: TrendingUp, bg: 'bg-red-50' },
                    { label: 'Ingresos Totales', value: 'S/ 128,420', trend: '+24%', color: 'text-emerald-500', icon: TrendingDown, bg: 'bg-emerald-50' },
                    { label: 'Utilidad Neta (P&L)', value: 'S/ 85,570', trend: '+18%', color: 'text-blue-600', icon: DollarSign, bg: 'bg-blue-50' },
                    { label: 'IGV por Pagar', value: 'S/ 12,450', trend: '-5%', color: 'text-amber-600', icon: FileText, bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <span className={cn("text-[10px] font-black uppercase italic", stat.color)}>{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black italic tracking-tighter text-slate-800">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* P&L Chart Simulation */}
                <div className="lg:col-span-8 p-8 bg-white rounded-[2.5rem] border border-border shadow-xl flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Estado de Resultados (Mensual)</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Comparativa de ingresos vs egresos operativos</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600" />
                                <span className="text-[9px] font-black uppercase italic text-slate-500">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <div className="h-3 w-3 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black uppercase italic text-slate-500">Egresos</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="w-full flex flex-col items-center justify-end gap-1 h-64">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className="w-full bg-blue-600 rounded-t-lg shadow-lg group-hover:bg-blue-700 transition-colors"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h * 0.6}%` }}
                                        className="w-full bg-slate-200 rounded-t-lg shadow-sm"
                                    />
                                </div>
                                <span className="text-[9px] font-black uppercase italic text-slate-400">Mes {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accounts Receivable/Payable */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                        <h3 className="text-xs font-black uppercase italic tracking-widest text-white/60 mb-8 flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-emerald-400" />
                            Cuentas por Cobrar
                        </h3>
                        <div className="space-y-6">
                            {[
                                { client: 'Distribuidora Norte', amount: 'S/ 12,450', days: 12, status: 'Overdue' },
                                { client: 'Bodegas Unidas', amount: 'S/ 8,200', days: 5, status: 'Recent' },
                                { client: 'Empresa Textil SA', amount: 'S/ 41,000', days: 2, status: 'Normal' },
                            ].map((acc, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:translate-x-1 transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center font-black italic shadow-inner",
                                            acc.status === 'Overdue' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'
                                        )}>
                                            {acc.client[0]}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic leading-none mb-1">{acc.client}</p>
                                            <p className="text-[9px] font-bold text-white/40 uppercase">Hace {acc.days} días</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black italic tracking-tighter">{acc.amount}</p>
                                        <ArrowUpRight className="h-3 w-3 ml-auto text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            className="w-full mt-10 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase italic tracking-widest"
                            onClick={() => setIsCollectionsOpen(true)}
                        >
                            Cobranza Masiva
                        </Button>
                    </div>

                    <div className="p-8 bg-white border border-border shadow-lg rounded-[2.5rem]">
                        <h3 className="text-xs font-black uppercase italic tracking-widest text-slate-800 mb-6 flex items-center gap-3">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Próximos Pagos (SUNAT)
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase italic text-slate-400">IGV Feb 2026</span>
                                    <span className="text-[10px] font-black text-amber-600">PENDIENTE</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-black italic tracking-tighter text-slate-800">S/ 8,420.00</span>
                                    <span className="text-[9px] font-bold text-slate-400">Vence: 22 Marzo</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase italic text-slate-400">Impuesto a la Renta</span>
                                    <span className="text-[10px] font-black text-emerald-600">PROGRAMADO</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-black italic tracking-tighter text-slate-800">S/ 4,150.00</span>
                                    <span className="text-[9px] font-bold text-slate-400">Vence: 25 Marzo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Close Month Dialog */}
            <Dialog open={isClosingMonthOpen} onOpenChange={setIsClosingMonthOpen}>
                <DialogContent className="max-w-md bg-white rounded-[2.5rem] border-none shadow-2xl p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">Checklist de Cierre</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Periodo: Febrero 2026
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {closingSteps.map(step => (
                            <div key={step.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toggleStep(step.id)}>
                                <div className={cn(
                                    "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                                    step.done ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 bg-white"
                                )}>
                                    {step.done && <Check className="h-3 w-3" />}
                                </div>
                                <span className={cn(
                                    "text-[11px] font-black uppercase italic transition-all",
                                    step.done ? "text-slate-400 line-through" : "text-slate-800"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <Button variant="outline" className="h-12 rounded-xl text-[10px] font-black uppercase italic" onClick={() => setIsClosingMonthOpen(false)}>Cancelar</Button>
                        <Button
                            className="h-12 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest"
                            onClick={handleCloseMonth}
                        >
                            Confirmar Cierre
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Collections Sheet */}
            <Sheet open={isCollectionsOpen} onOpenChange={setIsCollectionsOpen}>
                <SheetContent side="right" className="w-[450px] bg-white p-0 flex flex-col border-l">
                    <div className="bg-emerald-600 p-8 text-white">
                        <Badge className="bg-white/20 text-white border-none font-black text-[8px] uppercase tracking-widest mb-4 italic">Gestión de Cartera</Badge>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Cobranza Masiva</h2>
                        <p className="text-xs font-bold text-white/70 uppercase">Total Pendiente: S/ 61,700</p>
                    </div>
                    <ScrollArea className="flex-1 p-8">
                        <div className="space-y-6">
                            {[
                                { client: 'Distribuidora Norte', amount: 'S/ 12,450', dueDate: '15/02', status: 'Vencido' },
                                { client: 'Bodegas Unidas', amount: 'S/ 8,200', dueDate: '28/02', status: 'Por Vencer' },
                                { client: 'Empresa Textil SA', amount: 'S/ 41,000', dueDate: '05/03', status: 'Normal' },
                            ].map((acc, i) => (
                                <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3 items-center">
                                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center font-black italic text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                {acc.client[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black uppercase italic text-slate-800">{acc.client}</h4>
                                                <p className="text-[9px] font-bold text-slate-400">Vence: {acc.dueDate}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase italic border-none h-4 px-2",
                                            acc.status === 'Vencido' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                        )}>
                                            {acc.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black italic tracking-tighter text-slate-800">{acc.amount}</span>
                                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[8px] italic rounded-lg h-8">
                                            Emitir Aviso
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-8 border-t bg-slate-50/50">
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black text-[10px] uppercase italic tracking-[0.2em]"
                            onClick={() => {
                                toast.success("Avisos enviados", { description: "Se han enviado recordatorios por correo y WhatsApp a todos los clientes seleccionados." })
                                setIsCollectionsOpen(false)
                            }}
                        >
                            Confirmar Cobranzas
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
