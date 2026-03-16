'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Wallet, Banknote, CreditCard, QrCode,
    ArrowUpRight, ArrowDownRight, Printer,
    Clock, Lock, Unlock, AlertCircle,
    RotateCcw, DollarSign, FileText, CheckCircle2,
    TrendingUp, Plus, Minus, Search, History
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const MOVEMENTS = [
    { id: 1, type: 'VENTA', category: 'Ingreso', amount: 450.0, method: 'Efectivo', time: '14:24', user: 'Luigi Bravo', ref: 'TK-002450' },
    { id: 2, type: 'VENTA', category: 'Ingreso', amount: 120.0, method: 'Yape', time: '14:15', user: 'Luigi Bravo', ref: 'TK-002449' },
    { id: 3, type: 'GASTO', category: 'Egreso', amount: 25.0, method: 'Efectivo', time: '13:50', user: 'Luigi Bravo', ref: 'Limpieza' },
    { id: 4, type: 'VENTA', category: 'Ingreso', amount: 2800.0, method: 'Tarjeta', time: '12:30', user: 'Luigi Bravo', ref: 'TK-002448' },
    { id: 5, type: 'APERTURA', category: 'Ingreso', amount: 200.0, method: 'Efectivo', time: '08:00', user: 'Luigi Bravo', ref: 'Saldo Inicial' },
]

export default function CajaAutomotriz() {
    const [isShiftOpen, setIsShiftOpen] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="space-y-8 pb-10">
            {/* Upper Shift Banner */}
            <div className={cn(
                "p-8 rounded-3xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-xl",
                isShiftOpen ? "bg-white border-white shadow-slate-200" : "bg-slate-100 border-dashed border-slate-300 shadow-none"
            )}>
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "h-20 w-20 rounded-3xl flex items-center justify-center text-white shadow-lg",
                        isShiftOpen ? "bg-[#3841F2] animate-pulse" : "bg-slate-400"
                    )}>
                        {isShiftOpen ? <Unlock className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900">
                                {isShiftOpen ? "Turno Actual: Mañana" : "Caja Cerrada"}
                            </h2>
                            <Badge className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                isShiftOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                            )}>
                                {isShiftOpen ? "ACTIVO" : "INACTIVO"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm font-bold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Apertura: 08:32 AM</span>
                            <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">Responsable: Luigi Bravo</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    {isShiftOpen ? (
                        <button
                            onClick={() => {
                                toast.success('Caja cerrada con éxito. Imprimiendo reporte Z...')
                                setIsShiftOpen(false)
                            }}
                            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-3"
                        >
                            <Lock className="h-4 w-4" />
                            CERRAR TURNO
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsShiftOpen(true)}
                            className="px-8 py-4 bg-[#3841F2] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all flex items-center gap-3"
                        >
                            <Unlock className="h-4 w-4" />
                            ABRIR TURNO
                        </button>
                    )}
                    <button className="p-4 bg-slate-100 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all">
                        <Printer className="h-6 w-6 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Efectivo en Caja', amount: 'S/ 625.00', icon: Banknote, color: 'text-emerald-600' },
                    { label: 'Ventas Tarjeta', amount: 'S/ 2,800.00', icon: CreditCard, color: 'text-[#3841F2]' },
                    { label: 'Yape / Plin', amount: 'S/ 120.00', icon: QrCode, color: 'text-purple-600' },
                    { label: 'Egresos / Gastos', amount: 'S/ 25.00', icon: ArrowDownRight, color: 'text-red-500' },
                    { label: 'Balance Neto', amount: 'S/ 3,520.00', icon: Wallet, color: 'text-slate-900', highlight: true },
                ].map((card, i) => (
                    <div key={i} className={cn(
                        "bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between",
                        card.highlight && "bg-[#020659] text-white border-white/10"
                    )}>
                        <div className="flex justify-between items-start mb-4">
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", card.highlight ? "text-blue-300" : "text-muted-foreground")}>{card.label}</span>
                            <card.icon className={cn("h-5 w-5", card.highlight ? "text-[#3841F2]" : card.color)} />
                        </div>
                        <p className="text-2xl font-black italic">{card.amount}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Movements Table */}
                <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                                <History className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Movimientos del Día</h3>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 border border-border rounded-xl hover:bg-muted"><Search className="h-4 w-4 text-slate-500" /></button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#3841F2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#3841F2]/20">
                                <Plus className="h-4 w-4" /> INGRESO / GASTO
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Hora</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Concepto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Referencia</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">M. Pago</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                {MOVEMENTS.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-[10px] font-black text-muted-foreground">{mov.time}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    mov.category === 'Ingreso' ? 'bg-emerald-500' : 'bg-red-500'
                                                )} />
                                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{mov.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-slate-500">{mov.ref}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-600">{mov.method}</Badge>
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-black text-xs",
                                            mov.category === 'Ingreso' ? 'text-emerald-600' : 'text-red-500'
                                        )}>
                                            {mov.category === 'Ingreso' ? '+' : '-'} S/ {mov.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Denominaciones y Resumen */}
                <div className="space-y-6">
                    <div className="bg-[#020659] rounded-3xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-400 opacity-20 rotate-12">
                            <DollarSign className="h-32 w-32" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-200">Arqueo de Efectivo</h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { bill: '200', qty: 1 },
                                { bill: '100', qty: 2 },
                                { bill: '50', qty: 4 },
                                { bill: '20', qty: 1 },
                                { bill: '10', qty: 0 },
                                { bill: 'Monedas', qty: 5 },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px] font-black border border-white/10">S/ {row.bill}</div>
                                        <span className="text-[10px] font-bold text-blue-300">x {row.qty}</span>
                                    </div>
                                    <span className="text-xs font-black italic">S/ {Number(row.bill) * row.qty}.00</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-2 flex justify-between items-end border-t border-white/20">
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Total Fisico</p>
                            <p className="text-2xl font-black italic">S/ 625.00</p>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Diferencia Detectada</h3>
                        </div>
                        <p className="text-[11px] font-bold text-red-700 italic">
                            Se detecta un descuadre de <span className="underline font-black">S/ 2.50</span> respecto al sistema.
                        </p>
                        <button className="w-full py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                            Justificar Saldo
                        </button>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest text-center">Validado por Supervisor Central ✓</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
