'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Layers, Search, Clock, Package, MapPin,
    ArrowRight, CheckCircle2, Factory, Scissors,
    ShieldCheck, Truck, ShoppingBag, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TIMELINE_DATA = [
    {
        id: 'STEP-001',
        label: 'Recepción de Tela',
        date: '2026-03-01 10:30 AM',
        status: 'completed',
        icon: Package,
        details: 'Rollo ID: R-501 (Pima Jersey). Proveedor: Textil del Valle. Metraje: 50.4m.'
    },
    {
        id: 'STEP-002',
        label: 'Auditoría de Paño',
        date: '2026-03-01 02:45 PM',
        status: 'completed',
        icon: ShieldCheck,
        details: 'Resultado: APROBADO. Encogimiento: 2% Largo / 1.5% Ancho.'
    },
    {
        id: 'STEP-003',
        label: 'Corte Programado',
        date: '2026-03-02 08:00 AM',
        status: 'completed',
        icon: Scissors,
        details: 'Mesa 4. Tizador: T-12. Cortes realizados: 200 piezas (Talla M).'
    },
    {
        id: 'STEP-004',
        label: 'Ingreso a Costura',
        date: '2026-03-03 09:15 AM',
        status: 'active',
        icon: Factory,
        details: 'Línea A. Operario Líder: Carlos M. Avance: 45%.'
    },
    {
        id: 'STEP-005',
        label: 'Acabado & Vaporizado',
        date: 'Pendiente',
        status: 'todo',
        icon: Clock,
        details: 'Programado para el 2026-03-05.'
    },
    {
        id: 'STEP-006',
        label: 'Empaque & Despacho',
        date: 'Pendiente',
        status: 'todo',
        icon: Truck,
        details: 'Destino: Almacén Principal.'
    },
]

export default function TrazabilidadLotes() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('timeline')

    return (
        <div className="space-y-8 pb-10">
            {/* Search Header */}
            <div className="p-10 bg-brand-purple rounded-[2.5rem] shadow-2xl shadow-brand-purple/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Layers className="h-64 w-64 text-white" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Trazabilidad de Lotes</h2>
                    <p className="text-brand-purple-foreground/70 font-medium mb-8">Rastrea cada fibra, proceso y responsable de tu producción.</p>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-purple" />
                        <input
                            type="text"
                            placeholder="Escribe el ID del Lote o Rollo de tela (ej: LT-2026-001)..."
                            className="w-full pl-14 pr-4 sil-4 py-5 bg-white rounded-2xl text-foreground font-bold shadow-xl outline-none focus:ring-4 focus:ring-white/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: General Info Card */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-brand-purple">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">LT-2026-001</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Lote de Producción</p>
                            </div>
                        </div>

                        <div className="h-px bg-border/60" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-muted-foreground">Producto</span>
                                <span>Polo Pima Jersey</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-muted-foreground">Cantidad</span>
                                <span className="bg-brand-purple/5 text-brand-purple px-2 py-0.5 rounded-lg border border-brand-purple/10">600 Unidades</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-muted-foreground">Talla Base</span>
                                <span>M</span>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="h-4 w-4 text-brand-cyan" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase">Ubicación Actual</span>
                            </div>
                            <p className="text-sm font-black">Planta 02 — Línea de Costura A</p>
                            <p className="text-xs text-muted-foreground mt-1">Ingreso: Hoy, 09:15 AM</p>
                        </div>
                    </motion.div>

                    <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-200">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-amber-600 mt-1" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Info de Material</h4>
                                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                                    Este lote utiliza **Fibra de Algodón Orgánico** certificada GOTS bajo la partida arancelaria 5201.00.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Timeline & Trace Details */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border w-fit mb-4">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'timeline' ? "bg-white text-brand-purple shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Línea de Vida
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'materials' ? "bg-white text-brand-purple shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Componentes Insumos
                        </button>
                    </div>

                    <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm min-h-[500px]">
                        {activeTab === 'timeline' ? (
                            <div className="relative pl-8 space-y-12">
                                {/* Vertical Line */}
                                <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-muted-foreground/10" />

                                {TIMELINE_DATA.map((step, i) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative flex gap-10 group"
                                    >
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border-2 z-10 transition-all duration-300",
                                            step.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" :
                                                step.status === 'active' ? "bg-brand-purple border-brand-purple text-white animate-pulse shadow-[0_0_20px_rgba(124,58,237,0.3)]" :
                                                    "bg-card border-muted text-muted-foreground/30"
                                        )}>
                                            <step.icon className="h-6 w-6" />
                                        </div>

                                        <div className="space-y-1 pt-1 opacity-100 group-hover:translate-x-1 transition-transform">
                                            <div className="flex items-center gap-3">
                                                <h3 className={cn("font-black uppercase tracking-widest text-sm",
                                                    step.status === 'todo' ? 'text-muted-foreground/40' : 'text-foreground'
                                                )}>{step.label}</h3>
                                                {step.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                {step.status === 'active' && <span className="text-[9px] font-black text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full border border-brand-purple/10">AHORA</span>}
                                            </div>
                                            <p className="text-xs font-bold text-muted-foreground">{step.date}</p>
                                            <div className={cn(
                                                "p-4 mt-3 rounded-2xl border border-border/80 text-sm font-medium leading-relaxed max-w-lg",
                                                step.status === 'todo' ? 'bg-muted/10 opacity-40' : 'bg-muted/30 text-foreground/80'
                                            )}>
                                                {step.details}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Hilado Pima 40/1', code: 'INS-TEL-401', prov: 'Textil del Valle', icon: Layers },
                                    { label: 'Tinte Reactivo Azul', code: 'INS-QUIM-0401', prov: 'Clariant', icon: ShieldCheck },
                                    { label: 'Hilo Poliester 40/2', code: 'INS-HILO-22', prov: 'Coats Cadena', icon: CheckCircle2 },
                                    { label: 'Botón Nácar 18L', code: 'INS-AVIO-09', prov: 'Botones SAC', icon: Package },
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl border border-border bg-muted/10 hover:border-brand-purple/30 transition-all flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center text-brand-purple shadow-sm">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">{item.code}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{item.label}</h4>
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.prov}</p>
                                        </div>
                                        <button className="mt-2 text-[10px] font-black text-brand-purple uppercase flex items-center gap-2 group">
                                            Ver Certificado de Calidad <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
