'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    RefreshCw, Search, ArrowRightLeft,
    FileText, CheckCircle2, AlertTriangle,
    XCircle, User, Package, Calculator,
    Plus, ChevronRight, Info, History,
    ShieldCheck, ArrowLeft, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const RECENT_RETURNS = [
    { id: 'DEV-105', sale: 'VTA-8821', client: 'Roberto Gómez Silva', date: '2024-06-15', total: 450.0, status: 'Aprobado', reason: 'Error de pedido' },
    { id: 'DEV-104', sale: 'VTA-8790', client: 'Mecánica Los Olivos EIRL', date: '2024-06-12', total: 120.0, status: 'Bajo Inspección', reason: 'Defecto Fabrica' },
    { id: 'DEV-102', sale: 'VTA-8750', client: 'Juan Manuel Torres', date: '2024-06-05', total: 85.0, status: 'Rechazado', reason: 'Fuera de tiempo' },
]

export default function DevolucionesAutomotriz() {
    const [step, setStep] = useState(1) // 1: Buscar, 2: Seleccionar, 3: Confirmar
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-red-500 rounded-3xl flex items-center justify-center text-white shadow-xl">
                        <RefreshCw className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Devoluciones y Cambios</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sánchez Repuestos — Logística Inversa</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                        <History className="h-4 w-4" />
                        Historial Completo
                    </button>
                    <button
                        onClick={() => {
                            setStep(1);
                            setSearchQuery('');
                            toast.info('Iniciando nuevo proceso de devolución');
                        }}
                        className="px-6 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest italic"
                    >
                        Nueva Devolución
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search / Action Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-md p-8 md:p-12 space-y-8 relative overflow-hidden">
                        <div className="flex items-center gap-4 text-slate-800">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center font-black text-xs",
                                step === 1 ? 'bg-[#3841F2] text-white' : 'bg-slate-100 text-slate-400'
                            )}>1</div>
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Identificar Venta Original</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-[#3841F2]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ingrese N° de Boleta, Factura o DNI de cliente..."
                                    className="w-full h-16 pl-14 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold focus:outline-none focus:border-[#3841F2] shadow-sm transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setStep(2)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#3841F2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                                    >
                                        BUSCAR
                                    </button>
                                )}
                            </div>

                            <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                                <Info className="h-4 w-4 text-[#3841F2]" />
                                Recuerde que las devoluciones solo son válidas dentro de los 7 días hábiles posteriores a la compra.
                            </p>
                        </div>

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-8 border-t border-slate-100 space-y-4"
                            >
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resultado Encontrado:</h4>
                                <div className="p-6 bg-slate-50 border border-border rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#3841F2] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                                            <FileText className="h-6 w-6 text-[#3841F2]" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-slate-900 tracking-tighter">Venta VTA-8840</p>
                                            <p className="text-[10px] font-bold text-muted-foreground">Cliente: Roberto Gómez Silva • 14 Jun 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Total Original</p>
                                            <p className="text-lg font-black italic text-[#020659]">S/ 580.00</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                toast.success('Venta Identificada. Procesando Nota de Crédito...', { duration: 2000 });
                                                setTimeout(() => {
                                                    toast.success('Nota de Crédito Generada Exitosamente');
                                                    setStep(1);
                                                    setSearchQuery('');
                                                }, 2500);
                                            }}
                                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-[#3841F2] transition-all"
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Secondary List */}
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-md overflow-hidden">
                        <div className="p-8 border-b border-border bg-slate-50/20">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Devoluciones Recientes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Ticket</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Cliente / Ref</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Crédito a Favor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {RECENT_RETURNS.map((dev) => (
                                        <tr key={dev.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="px-8 py-5">
                                                <p className="text-[11px] font-black text-slate-900 uppercase italic">{dev.id}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">{dev.date}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[12px] font-black text-slate-800 leading-tight italic">{dev.client}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Ref: {dev.sale}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <Badge className={cn(
                                                    "text-[8px] font-black uppercase tracking-tighter px-2",
                                                    dev.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                                        dev.status === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                )}>
                                                    {dev.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-sm text-[#020659] italic">
                                                S/ {dev.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Policies & Insight Panel */}
                <div className="space-y-6">
                    <div className="bg-[#020659] rounded-[2.5rem] p-10 text-white space-y-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-400 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-40 w-40" />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-300">Normativa de Cambios</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Estado del Producto', desc: 'Debe estar en empaque original sin sellos rotos.', icon: Package },
                                    { label: 'Documento Legal', desc: 'Indispensable presentar Boleta o Factura.', icon: FileText },
                                    { label: 'Forma de Devolución', desc: 'Nota de crédito válida por 6 meses.', icon: Calculator },
                                ].map((rule, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                            <rule.icon className="h-5 w-5 text-[#3841F2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black uppercase italic text-white/90">{rule.label}</p>
                                            <p className="text-[10px] font-bold text-blue-100/60 leading-relaxed">{rule.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-4 bg-[#3841F2] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-[#3841F2]/30">
                            Términos y Condiciones PDF
                        </button>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest leading-tight italic">Alerta de Fraude IA</h3>
                        </div>
                        <p className="text-[11px] font-bold text-red-900/70 italic">
                            "Se ha detectado un comportamiento inusual: 3 devoluciones en menos de 15 días para este cliente. Requiere supervisión de gerencia."
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom System Labels */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-center gap-8 italic opacity-70">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#3841F2]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Reingreso Automático Stock ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#3841F2]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Ajuste de Comisiones Ventas ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#3841F2]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Sincronización Sunat (Créditos) ✓</span>
                </div>
            </div>
        </div>
    )
}
