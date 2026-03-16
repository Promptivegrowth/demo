'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Plus, FileText, X, ArrowRight,
    DraftingCompass, Scissors, Ruler, Package,
    Share2, Download, CheckCircle2, MoreVertical,
    Clock, Filter, ChevronRight, Info, Layers, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FICHAS_DATA = [
    { id: 'FT-2026-P01', name: 'Polo Pima Jersey', season: 'Invierno 2026', type: 'Casual', status: 'En Producción', image: '/textil/tech_pack.png' },
    { id: 'FT-2026-H02', name: 'Hoodie Oversized', season: 'Invierno 2026', type: 'Sport', status: 'Aprobada', image: '/textil/tech_pack.png' },
    { id: 'FT-2026-P03', name: 'Pantalón Dril', season: 'Primavera 2026', type: 'Formal', status: 'Borrador', image: '/textil/tech_pack.png' },
    { id: 'FT-2026-V04', name: 'Vestido Verano', season: 'Primavera 2026', type: 'Casual', status: 'Borrador', image: '/textil/tech_pack.png' },
    { id: 'FT-2026-J05', name: 'Jogger Fleece', season: 'Invierno 2026', type: 'Sport', status: 'Aprobada', image: '/textil/tech_pack.png' },
    { id: 'FT-2026-C06', name: 'Chaqueta Ejecutiva', season: 'Invierno 2026', type: 'Formal', status: 'Aprobada', image: '/textil/tech_pack.png' },
]

export default function FichaTecnica() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFicha, setSelectedFicha] = useState<any>(null)

    return (
        <div className="space-y-6">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por código o nombre..."
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus className="h-4 w-4" />
                    Nueva Ficha Técnica
                </button>
            </div>

            {/* Grid of Tech Packs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {FICHAS_DATA.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.includes(searchTerm)).map((ficha, i) => (
                    <motion.div
                        key={ficha.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedFicha(ficha)}
                        className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all cursor-pointer flex flex-col"
                    >
                        <div className="h-40 bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border">
                            <div className="absolute top-3 left-3 flex gap-2 z-10">
                                <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md",
                                    ficha.status === 'En Producción' ? 'bg-emerald-500/80 text-white border-emerald-400' :
                                        ficha.status === 'Aprobada' ? 'bg-brand-purple/80 text-white border-brand-purple/40' :
                                            'bg-white/80 text-slate-500 border-slate-200'
                                )}>
                                    {ficha.status}
                                </span>
                            </div>
                            <img
                                src={ficha.image}
                                alt={ficha.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-brand-purple uppercase tracking-tight">{ficha.id}</span>
                                <MoreVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground mb-1">{ficha.name}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {ficha.type}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {ficha.season}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Detail */}
            <AnimatePresence>
                {selectedFicha && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFicha(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-card w-full max-w-5xl h-full rounded-3xl border border-border shadow-2xl relative z-10 flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-brand-purple text-white flex items-center justify-center shadow-lg shadow-brand-purple/20">
                                        <DraftingCompass className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-black tracking-tighter uppercase">{selectedFicha.name}</h2>
                                            <span className="text-[10px] font-black bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full border border-brand-purple/10">TECH PACK</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{selectedFicha.id} — {selectedFicha.season}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-all">
                                        <Download className="h-4 w-4" />
                                        Exportar PDF
                                    </button>
                                    <div className="w-px h-8 bg-border mx-2" />
                                    <button onClick={() => setSelectedFicha(null)} className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-8 bg-[#f0ede8]/30">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Data & Medidas */}
                                    <div className="space-y-8">
                                        {/* General Info */}
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <FileText className="h-4 w-4 text-brand-purple" />
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Datos Generales</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Tipo de Prenda</p>
                                                    <p className="text-sm font-bold">{selectedFicha.type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Género</p>
                                                    <p className="text-sm font-bold">Masculino / Unisex</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Temporada</p>
                                                    <p className="text-sm font-bold">{selectedFicha.season}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Colección</p>
                                                    <p className="text-sm font-bold">Invierno Atemporal</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medidas Table */}
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Ruler className="h-4 w-4 text-brand-cyan" />
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tabla de Medidas (cm)</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-border">
                                                            <th className="pb-3 text-[10px] font-black text-muted-foreground uppercase">Punto de Medida</th>
                                                            <th className="pb-3 text-[10px] font-black text-center text-muted-foreground uppercase">S</th>
                                                            <th className="pb-3 text-[10px] font-black text-center text-muted-foreground uppercase">M</th>
                                                            <th className="pb-3 text-[10px] font-black text-center text-muted-foreground uppercase">L</th>
                                                            <th className="pb-3 text-[10px] font-black text-center text-muted-foreground uppercase">TOL (+/-)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {[
                                                            { p: 'Ancho de pecho', s: 52, m: 54, l: 56, t: 1 },
                                                            { p: 'Largo total', s: 70, m: 72, l: 74, t: 2 },
                                                            { p: 'Largo de manga', s: 20, m: 21, l: 22, t: 0.5 },
                                                            { p: 'Ancho de hombro', s: 44, m: 46, l: 48, t: 1 },
                                                            { p: 'Abertura de cuello', s: 18, m: 18.5, l: 19, t: 0.5 },
                                                        ].map((row, i) => (
                                                            <tr key={i}>
                                                                <td className="py-3 text-xs font-bold">{row.p}</td>
                                                                <td className="py-3 text-xs font-bold text-center bg-muted/20">{row.s}</td>
                                                                <td className="py-3 text-xs font-bold text-center bg-brand-purple/5 text-brand-purple">{row.m}</td>
                                                                <td className="py-3 text-xs font-bold text-center bg-muted/20">{row.l}</td>
                                                                <td className="py-3 text-xs font-bold text-center text-muted-foreground italic">{row.t}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Materiales & Avíos */}
                                    <div className="space-y-8">
                                        {/* Materiales */}
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Scissors className="h-4 w-4 text-brand-amber" />
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Materiales & Composición</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { name: 'Tela Jersey Pima 40/1', comp: '100% Algodón', prov: 'Textil del Valle', unit: 'kg' },
                                                    { name: 'Rib Reactivo 1x1', comp: '95% Algodón 5% Elastano', prov: 'Incalpaca', unit: 'kg' },
                                                ].map((mat, i) => (
                                                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/10 group hover:border-brand-amber/30 transition-all">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-sm font-bold">{mat.name}</h4>
                                                            <span className="text-[10px] font-black text-brand-amber uppercase">{mat.unit}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-2">{mat.comp}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">{mat.prov}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Avíos */}
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <ArrowRight className="h-4 w-4 text-emerald-500" />
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Avíos & Accesorios</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { item: 'Etiqueta Principal', qty: '1 x prenda' },
                                                    { item: 'Hilo Polyester 40/2', qty: '120m x prenda' },
                                                    { item: 'Bolsa Bio-degradable', qty: '1 x prenda' },
                                                    { item: 'Hangtag Temporada', qty: '1 x prenda' },
                                                ].map((av, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/10 border border-border/60">
                                                        <span className="text-xs font-medium text-foreground">{av.item}</span>
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{av.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Costura Instructions */}
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-4 w-4 rounded-full bg-brand-purple" />
                                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Instrucciones de Costura</h3>
                                                </div>
                                                <span className="flex items-center gap-1 text-[10px] font-black text-brand-purple uppercase"><CheckCircle2 className="h-3 w-3" /> Verificado</span>
                                            </div>
                                            <div className="p-4 bg-muted/20 rounded-xl border border-dashed border-border text-xs leading-relaxed text-muted-foreground">
                                                - Usar remalle de 4 hilos con puntada de seguridad.<br />
                                                - Recubierto de 2 agujas para basta de manga y faldón.<br />
                                                - Limpiar excedente de hilo al 100%.<br />
                                                - Densidad de puntada: 12-14 ppp.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
