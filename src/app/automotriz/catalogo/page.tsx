'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, Grid, List as ListIcon,
    Info, ShoppingCart, Tag, Share2,
    Eye, ChevronRight, Download,
    Image as ImageIcon, Box, Zap, Settings
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const PARTS = [
    {
        id: 1,
        name: 'Pastilla de Freno Delantera EBC',
        code: 'EBC-FA231HH',
        brand: 'EBC Brakes',
        model: 'Double-H Sintered',
        compatibility: ['Yamaha MT-07', 'MT-09', 'R6'],
        price: 245.0,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
        specs: { material: 'Sinterizado', position: 'Delantera', origin: 'UK' }
    },
    {
        id: 2,
        name: 'Casco Scorpion EXO-R1 Air',
        code: 'SCO-EXOR1',
        brand: 'Scorpion',
        model: 'Corpus Mat',
        compatibility: ['Universal / Racing'],
        price: 1850.0,
        stock: 4,
        image: 'https://images.unsplash.com/photo-1599812189309-8d976a6a7c4a?w=800&q=80',
        specs: { shell: 'Carbono', weight: '1350g', safety: 'ECE/DOT' }
    },
    {
        id: 3,
        name: 'Kit de Transmisión DID 525VX3',
        code: 'DID-525VX3',
        brand: 'D.I.D',
        model: 'X-Ring Gold',
        compatibility: ['Honda CB500X', 'Kawasaki Z650'],
        price: 580.0,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',
        specs: { chain: '525', links: '120', color: 'Gold' }
    },
    {
        id: 4,
        name: 'Aceite Liqui Moly 10W-40',
        code: 'LM-1522',
        brand: 'Liqui Moly',
        model: 'Street Race',
        compatibility: ['Motores 4T'],
        price: 55.0,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1635843104285-df360706248b?w=800&q=80',
        specs: { type: 'Sintético', volume: '1L', api: 'SN/JASO MA2' }
    }
]

export default function CatalogoAutomotriz() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedPart, setSelectedPart] = useState<any>(null)

    return (
        <div className="space-y-8 pb-10">
            {/* Gallery Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">Catálogo Digital</h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Sánchez Repuestos — Colección 2024</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#3841F2]" />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-[#3841F2] shadow-sm"
                        />
                    </div>
                    <div className="flex bg-white border border-border rounded-xl p-1 shadow-sm">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-[#3841F2] text-white shadow-md" : "text-slate-400 hover:bg-slate-50")}><Grid className="h-4 w-4" /></button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-[#3841F2] text-white shadow-md" : "text-slate-400 hover:bg-slate-50")}><ListIcon className="h-4 w-4" /></button>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className={cn(
                "grid gap-8",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
            )}>
                {PARTS.map((part) => (
                    <motion.div
                        layout
                        key={part.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "bg-white rounded-[2.5rem] border border-border shadow-md overflow-hidden group hover:shadow-2xl hover:border-[#3841F2]/30 transition-all duration-500",
                            viewMode === 'list' && "flex flex-row"
                        )}
                    >
                        {/* Image Section */}
                        <div className={cn(
                            "relative overflow-hidden bg-slate-100",
                            viewMode === 'grid' ? "h-64" : "w-72 h-48 shrink-0"
                        )}>
                            <Image
                                src={part.image}
                                alt={part.name}
                                width={800}
                                height={600}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <button className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#3841F2] hover:text-white transition-all">
                                    <Eye className="h-4 w-4" />
                                    Vista Rápida
                                </button>
                            </div>
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-white/90 backdrop-blur-md text-[#3841F2] border-none font-black text-[9px] px-3 py-1 shadow-sm">
                                    {part.brand}
                                </Badge>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">{part.code}</p>
                                    {part.stock < 5 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Stock Bajo" />}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight italic group-hover:text-[#3841F2] transition-colors">{part.name}</h3>
                                <p className="text-xs font-bold text-muted-foreground line-clamp-1">{part.model}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {part.compatibility.map((c) => (
                                    <Badge key={c} variant="secondary" className="bg-slate-50 text-[9px] font-bold text-slate-500 border-none px-2">
                                        {c}
                                    </Badge>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">Precio Sanchez</p>
                                    <p className="text-2xl font-black italic text-[#3841F2]">S/ {part.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toast.success('Añadido al carrito')} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-[#3841F2] transition-all shadow-lg shadow-slate-200">
                                        <ShoppingCart className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Brands Carousel Placeholder */}
            <div className="bg-[#020659] rounded-3xl p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#3841F2]/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#3841F2] rounded-xl">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-200">Nuevos Ingresos</h3>
                        </div>
                        <h2 className="text-4xl font-black italic leading-tight">Accesorios Premium de <span className="text-[#3841F2]">Alto Rendimiento</span></h2>
                        <p className="text-blue-100/60 font-medium leading-relaxed">
                            Explora nuestra nueva selección de componentes para competición y aventura. Importación directa con garantía Sanchez.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
                        {['Pirelli', 'Motul', 'DID', 'Arai', 'Akrapovic'].map((brand) => (
                            <span key={brand} className="text-3xl font-black uppercase tracking-tighter italic border-b-4 border-transparent hover:border-[#3841F2] cursor-default transition-all">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Integration Banner */}
            <div className="p-6 bg-slate-50 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#3841F2]/10 flex items-center justify-center">
                        <Box className="h-4 w-4 text-[#3841F2]" />
                    </div>
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">Sincronizado con Almacén Central</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#3841F2]/10 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-[#3841F2]" />
                    </div>
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">Fichas Técnicas Actualizadas</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#3841F2]/10 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-[#3841F2]" />
                    </div>
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">Fotografías de Alta Resolución</span>
                </div>
            </div>
        </div>
    )
}
