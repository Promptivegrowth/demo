'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, Grid, List as ListIcon,
    Info, ShoppingCart, Tag, Share2,
    Eye, ChevronRight, Download,
    Image as ImageIcon, Box, Zap, Settings, X
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const BRANDS = ['Todas', 'EBC Brakes', 'Scorpion', 'D.I.D', 'Liqui Moly', 'Motul', 'Pirelli']
const CATEGORIES = ['Todas', 'Frenos', 'Accesorios', 'Transmisión', 'Lubricantes', 'Llantas']

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
        image: '/automotriz/productos/pastilla_freno.png',
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
        image: '/automotriz/productos/casco_arai.png',
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
        image: '/automotriz/productos/kit_cadena.png',
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
        image: '/automotriz/productos/aceite_motul.png',
        specs: { type: 'Sintético', volume: '1L', api: 'SN/JASO MA2' }
    },
    {
        id: 5,
        name: 'Llanta Pirelli MT 60 90/90-21',
        code: '7891234560005',
        brand: 'Pirelli',
        model: 'MT 60',
        compatibility: ['Varios'],
        price: 380.0,
        stock: 9,
        image: '/automotriz/productos/llanta_pirelli.png',
        specs: { material: 'Caucho', position: 'Delantera', origin: 'Italia' }
    },
    {
        id: 6,
        name: 'Bujía NGK CR7HSA',
        code: '7891234560006',
        brand: 'NGK',
        model: 'Estándar',
        compatibility: ['Varios'],
        price: 15.0,
        stock: 45,
        image: '/automotriz/productos/bujia_ngk.png',
        specs: { type: 'Cobre', origin: 'Japón' }
    },
    {
        id: 7,
        name: 'Faro LED Universal 40W',
        code: '7891234560007',
        brand: 'Generica',
        model: 'Universal',
        compatibility: ['Varios'],
        price: 95.0,
        stock: 7,
        image: '/automotriz/productos/faro_led.png',
        specs: { power: '40W', type: 'LED' }
    },
    {
        id: 8,
        name: 'Amortiguador Trasero YSS',
        code: '7891234560008',
        brand: 'YSS',
        model: 'G-Sport',
        compatibility: ['Yamaha NMAX'],
        price: 450.0,
        stock: 3,
        image: '/automotriz/productos/amortiguador_yss.png',
        specs: { type: 'Gas', origin: 'Tailandia' }
    }
]

export default function CatalogoAutomotriz() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedPart, setSelectedPart] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterBrand, setFilterBrand] = useState('Todas')
    const [filterCategory, setFilterCategory] = useState('Todas')
    const [showFilters, setShowFilters] = useState(false)

    const filteredParts = PARTS.filter(part => {
        const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) || part.code.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesBrand = filterBrand === 'Todas' || part.brand === filterBrand
        // Note: Kategoría isn't in mock data yet, let's infer or add it. I'll use category from tag if I add it.
        // For now let's just use Brand and Search. 
        return matchesSearch && matchesBrand
    })

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-[#3841F2] shadow-sm transition-all"
                        />
                    </div>
                    <div className="flex bg-white border border-border rounded-xl p-1 shadow-sm">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-[#3841F2] text-white shadow-md" : "text-slate-400 hover:bg-slate-50")}><Grid className="h-4 w-4" /></button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-[#3841F2] text-white shadow-md" : "text-slate-400 hover:bg-slate-50")}><ListIcon className="h-4 w-4" /></button>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            showFilters ? "bg-[#3841F2] text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                    >
                        <Filter className="h-4 w-4" />
                        {showFilters ? 'Cerrar' : 'Filtros'}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-white border border-border rounded-3xl shadow-sm flex flex-wrap gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Marca</label>
                                <div className="flex flex-wrap gap-2">
                                    {BRANDS.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => setFilterBrand(brand)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                                filterBrand === brand ? "bg-[#3841F2] border-[#3841F2] text-white shadow-md" : "border-slate-100 text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Catalog Grid */}
            <div className={cn(
                "grid gap-8",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
            )}>
                {filteredParts.map((part) => (
                    <motion.div
                        layout
                        key={part.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                                <button
                                    onClick={() => setSelectedPart(part)}
                                    className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#3841F2] hover:text-white transition-all shadow-xl"
                                >
                                    <Eye className="h-4 w-4" />
                                    Vista Rápida
                                </button>
                            </div>
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-white/90 backdrop-blur-md text-[#3841F2] border-none font-black text-xs px-3 py-1 shadow-sm">
                                    {part.brand}
                                </Badge>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-black text-[#3841F2] uppercase tracking-widest">{part.code}</p>
                                    {part.stock < 5 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Stock Bajo" />}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight italic group-hover:text-[#3841F2] transition-colors">{part.name}</h3>
                                <p className="text-sm font-bold text-muted-foreground line-clamp-1">{part.model}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {part.compatibility.map((c) => (
                                    <Badge key={c} variant="secondary" className="bg-slate-50 text-[10px] font-bold text-slate-500 border-none px-2 py-1">
                                        {c}
                                    </Badge>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">Precio Sanchez</p>
                                    <p className="text-3xl font-black italic text-[#3841F2]">S/ {part.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toast.success('Añadido al carrito')} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-[#3841F2] transition-all shadow-lg shadow-slate-200 active:scale-95">
                                        <ShoppingCart className="h-6 w-6" />
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

            {/* Quick View Modal */}
            <AnimatePresence>
                {selectedPart && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
                        >
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="absolute top-6 right-6 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6 text-slate-800" />
                            </button>

                            <div className="md:w-1/2 bg-slate-100 h-64 md:h-auto relative">
                                <Image src={selectedPart.image} alt={selectedPart.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            <div className="md:w-1/2 p-10 space-y-6 overflow-y-auto max-h-[80vh]">
                                <Badge className="bg-[#3841F2] text-white font-black text-xs px-4 py-1.5 uppercase tracking-widest mb-2">
                                    {selectedPart.brand}
                                </Badge>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black italic text-slate-900 leading-tight">{selectedPart.name}</h2>
                                    <p className="text-sm font-bold text-muted-foreground uppercase">{selectedPart.model} — {selectedPart.code}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Especificaciones Técnicas</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(selectedPart.specs).map(([key, value]) => (
                                            <div key={key} className="p-3 bg-slate-50 rounded-2xl">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-1 pb-1">{key}</p>
                                                <p className="text-xs font-bold text-slate-800 uppercase">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Compatibilidad Verificada</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPart.compatibility.map((c: string) => (
                                            <span key={c} className="px-3 py-1 bg-blue-50 text-[#3841F2] rounded-lg text-xs font-bold border border-blue-100 italic">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Precio Unitario</p>
                                        <p className="text-4xl font-black italic text-[#3841F2] tracking-tighter">S/ {selectedPart.price.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            toast.success('Producto añadido al carrito móvil')
                                            setSelectedPart(null)
                                        }}
                                        className="h-16 px-8 bg-slate-900 text-white rounded-[20px] font-black uppercase text-xs hover:bg-[#3841F2] transition-all flex items-center gap-3 shadow-xl shadow-slate-200"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Añadir al Carrito
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
