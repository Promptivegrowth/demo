'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Search, Filter, Plus,
    DollarSign, CreditCard, Clock,
    AlertCircle, CheckCircle2, History,
    User, Package, ChevronRight, Share2,
    TrendingDown, ArrowRight, Wallet, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const APARTADOS = [
    {
        id: 'SEP-210',
        client: 'Roberto Gómez Silva',
        product: 'Casco Arai RX-7V Racing',
        date: '2024-06-01',
        expiry: '2024-07-01',
        total: 2800.0,
        paid: 1500.0,
        pending: 1300.0,
        status: 'Al día',
        installments: [
            { id: 1, date: '2024-06-01', amount: 1500.0, status: 'Pagado' },
            { id: 2, date: '2024-06-15', amount: 1300.0, status: 'Pendiente' },
        ]
    },
    {
        id: 'SEP-208',
        client: 'Mecánica Los Olivos EIRL',
        product: 'Kit Transmisión DID (x4)',
        date: '2024-05-15',
        expiry: '2024-06-15',
        total: 2320.0,
        paid: 2320.0,
        pending: 0.0,
        status: 'Finalizado',
        installments: [
            { id: 1, date: '2024-05-15', amount: 1000.0, status: 'Pagado' },
            { id: 2, date: '2024-06-01', amount: 1320.0, status: 'Pagado' },
        ]
    },
    {
        id: 'SEP-215',
        client: 'Juan Manuel Torres',
        product: 'Llanta Pirelli MT 60',
        date: '2024-06-10',
        expiry: '2024-06-25',
        total: 380.0,
        paid: 100.0,
        pending: 280.0,
        status: 'Vencido',
        installments: [
            { id: 1, date: '2024-06-10', amount: 100.0, status: 'Pagado' },
            { id: 2, date: '2024-06-25', amount: 280.0, status: 'Vencido' },
        ]
    }
]

export default function ApartadosAutomotriz() {
    const [selectedApartado, setSelectedApartado] = useState<any>(APARTADOS[0])
    const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false)

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-[#020659] rounded-3xl flex items-center justify-center text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#3841F2] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <Wallet className="h-7 w-7 relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Sistema de Apartados</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reserva de Repuestos / Pagos por Cuotas</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#3841F2]" />
                        <input
                            type="text"
                            placeholder="Buscar separado o cliente..."
                            className="h-11 pl-10 pr-4 bg-white border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-[#3841F2] shadow-sm w-full"
                        />
                    </div>
                    <button
                        onClick={() => setIsNewReservationModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all italic"
                    >
                        <Plus className="h-4 w-4" />
                        NUEVA RESERVA
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List Table */}
                <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#020659] italic">Reservas en Curso</h3>
                        <div className="flex gap-2">
                            <Badge className="bg-emerald-100 text-emerald-700 font-bold text-[9px]">2 AL DÍA</Badge>
                            <Badge className="bg-red-100 text-red-700 font-bold text-[9px]">1 VENCIDO</Badge>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-border">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Reserva / Fecha</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Cliente / Item</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase text-center">Progreso</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase text-center">Estado</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase text-right">Pendiente</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {APARTADOS.map((a) => (
                                    <tr
                                        key={a.id}
                                        onClick={() => setSelectedApartado(a)}
                                        className={cn(
                                            "hover:bg-slate-50/50 transition-all group cursor-pointer border-l-4",
                                            selectedApartado?.id === a.id ? 'border-[#3841F2] bg-blue-50/20' : 'border-transparent'
                                        )}
                                    >
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">{a.id}</p>
                                            <p className="text-xs font-bold text-muted-foreground">{a.date}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-slate-800 leading-tight italic truncate max-w-[180px]">{a.client}</p>
                                            <p className="text-xs font-bold text-[#3841F2] uppercase tracking-tighter truncate max-w-[180px]">{a.product}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(a.paid / a.total) * 100}%` }}
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            a.status === 'Vencido' ? 'bg-red-500' : 'bg-[#3841F2]'
                                                        )}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400">{Math.round((a.paid / a.total) * 100)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase tracking-tighter px-2",
                                                a.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-700' :
                                                    a.status === 'Al día' ? 'bg-blue-100 text-[#3841F2]' : 'bg-red-100 text-red-700'
                                            )}>
                                                {a.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-sm text-[#020659] italic">
                                            S/ {a.pending.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Installment Tracker */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedApartado && (
                            <motion.div
                                key={selectedApartado.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-[#020659] rounded-[2.5rem] p-8 text-white space-y-8 shadow-xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 text-blue-400 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                                    <Clock className="h-24 w-24" />
                                </div>

                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-300">Cronograma de Pagos</h3>
                                    <p className="text-2xl font-black italic">{selectedApartado.id}</p>
                                    <p className="text-[10px] font-bold text-blue-100/60 uppercase">Vence el {selectedApartado.expiry}</p>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {selectedApartado.installments.map((inst: any, i: number) => (
                                        <div key={i} className="flex gap-4 relative">
                                            {i !== selectedApartado.installments.length - 1 && <div className="absolute left-[11px] top-6 bottom-[-1.5rem] w-0.5 bg-white/10" />}
                                            <div className={cn(
                                                "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10",
                                                inst.status === 'Pagado' ? 'bg-emerald-500' : inst.status === 'Vencido' ? 'bg-red-500' : 'bg-[#3841F2] animate-pulse shadow-[0_0_10px_rgba(56,65,242,0.8)]'
                                            )}>
                                                {inst.status === 'Pagado' ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-white/40" />}
                                            </div>
                                            <div className="flex-1 flex items-center justify-between border-b border-white/5 pb-2">
                                                <div>
                                                    <p className="text-sm font-black uppercase italic tracking-tighter">Cuota {inst.id}</p>
                                                    <p className="text-xs font-bold text-blue-300/60 uppercase">{inst.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black italic">S/ {inst.amount.toFixed(2)}</p>
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase",
                                                        inst.status === 'Pendiente' ? 'text-blue-300' : inst.status === 'Vencido' ? 'text-red-400' : 'text-emerald-400'
                                                    )}>{inst.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <button
                                        disabled={selectedApartado.pending === 0}
                                        onClick={() => toast.success('Pago registrado con éxito')}
                                        className="w-full py-4 bg-[#3841F2] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3841F2]/30 disabled:opacity-50 disabled:grayscale"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        REGISTRAR PAGO
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[10px] font-black text-blue-300 uppercase italic">Restante:</span>
                                        <span className="text-xl font-black italic">S/ {selectedApartado.pending.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 text-[#3841F2]">
                            <TrendingDown className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest leading-tight">Garantía de Reserva</h3>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 italic">
                            "El stock para <span className="underline font-black">{selectedApartado?.product}</span> está bloqueado exclusivamente hasta el <span className="font-black text-red-600">{selectedApartado?.expiry}</span>."
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal: Nueva Reserva */}
            <AnimatePresence>
                {isNewReservationModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#020659]/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 italic">Nueva Reserva (Apartado)</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sánchez Financial Services</p>
                                </div>
                                <button onClick={() => setIsNewReservationModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cliente</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="text" placeholder="DNI o Nombre" className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-[#3841F2] transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Producto</label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="text" placeholder="Seleccionar item" className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-[#3841F2] transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Monto Total</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="number" placeholder="0.00" className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adelanto Mínimo (20%)</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="number" placeholder="0.00" className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-[#3841F2]" />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Plan de Cuotas</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Una Cuota', 'Quincenal', 'Mensual'].map(plan => (
                                            <button key={plan} className="py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase hover:border-[#3841F2] hover:text-[#3841F2] transition-all">
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsNewReservationModalOpen(false)}
                                    className="flex-1 py-5 px-8 border border-slate-200 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Reserva SEP-216 creada con bloqueo de stock activo');
                                        setIsNewReservationModalOpen(false);
                                    }}
                                    className="flex-[2] py-5 px-8 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    CONFIRMAR RESERVA
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
