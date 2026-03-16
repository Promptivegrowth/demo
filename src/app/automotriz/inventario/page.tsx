'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Search, Scan, Filter,
    MoreHorizontal, Edit3, History, Clock, RefreshCw,
    AlertCircle, TrendingUp, TrendingDown,
    Download, Upload, Barcode, Warehouse,
    ChevronDown, ChevronUp, ArrowRight,
    Tag, Info, Plus, X
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const PRODUCTS = [
    { id: 1, name: 'Aceite Motul 10W-40 1L', code: '7891234560001', category: 'Lubricantes', brand: 'Motul', model: 'Universal', stock: 24, minStock: 10, costPrice: 32.0, salePrice: 45.0, location: 'Estante A-3', provider: 'Motul Perú' },
    { id: 3, name: 'Filtro de Aire Universal K&N', code: '7891234560003', category: 'Filtros', brand: 'K&N', model: 'Universal', stock: 4, minStock: 5, costPrice: 85.0, salePrice: 120.0, location: 'Estante B-1', provider: 'Repuestos SAC' },
    { id: 5, name: 'Llanta Pirelli MT 60 90/90-21', code: '7891234560005', category: 'Llantas', brand: 'Pirelli', model: 'Varios', stock: 9, minStock: 2, costPrice: 280.0, salePrice: 380.0, location: 'Almacén Exterior', provider: 'Pirelli Import' },
    { id: 8, name: 'Amortiguador Trasero YSS', code: '7891234560008', category: 'Suspensión', brand: 'YSS', model: 'NMAX / PCX', stock: 3, minStock: 2, costPrice: 340.0, salePrice: 450.0, location: 'Estante C-2', provider: 'Suspensión Global' },
    { id: 11, name: 'Casco Arai RX-7V Negro M', code: '7891234560011', category: 'Accesorios', brand: 'Arai', model: 'Racing', stock: 2, minStock: 1, costPrice: 2100.0, salePrice: 2800.0, location: 'Vitrina 01', provider: 'Premium Helmets' },
]

export default function InventarioAutomotriz() {
    const [products, setProducts] = useState(PRODUCTS)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState('Todas')
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        setImportProgress(0)
        let progress = 0
        const interval = setInterval(() => {
            progress += 10
            setImportProgress(progress)
            if (progress >= 100) {
                clearInterval(interval)
                setTimeout(() => {
                    setIsImporting(false)
                    toast.success(`Archivo "${file.name}" importado exitosamente`)
                    // Reset input
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }, 500)
            }
        }, 300)
    }

    const handleExport = (type: string) => {
        if (type === 'Excel' || type === 'CSV') {
            const headers = ['Nombre', 'Codigo', 'Ubicacion', 'Categoria', 'Stock', 'Precio Venta', 'Costo']
            const rows = products.map(p => [
                p.name, p.code, p.location, p.category, p.stock, p.salePrice, p.costPrice
            ])
            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `inventario_sanchez_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('Inventario exportado a CSV correctamente')
        }
    }

    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.includes(searchQuery)) &&
        (filterCategory === 'Todas' || p.category === filterCategory)
    )

    const handleUpdateStock = (id: number, newStock: number) => {
        setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p))
        toast.success('Stock actualizado correctamente')
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Actions Menu */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#3841F2] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre o ubicación..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-[#3841F2] focus:ring-4 focus:ring-[#3841F2]/5 transition-all shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-muted rounded-xl hover:bg-slate-200 cursor-pointer transition-colors">
                        <Scan className="h-4 w-4 text-slate-600" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={onFileChange}
                    />
                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold hover:bg-muted/50 transition-all active:scale-95"
                    >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        Importar
                    </button>
                    <button
                        onClick={() => handleExport('CSV')}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold hover:bg-muted/50 transition-all active:scale-95"
                    >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        Exportar
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        NUEVO PRODUCTO
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Lateral Panel: Alertas y Resumen */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Alertas de Stock Bajo */}
                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Stock Crítico</h3>
                        </div>
                        <div className="space-y-3">
                            {PRODUCTS.filter(p => p.stock <= p.minStock).map(p => (
                                <div key={p.id} className="p-3 bg-white rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-black text-slate-800 line-clamp-1 italic">{p.name}</p>
                                        <p className="text-[9px] font-bold text-red-500">{p.stock} unid. / Mín {p.minStock}</p>
                                    </div>
                                    <button className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                        <TrendingUp className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sin Movimiento */}
                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <Clock className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Sin Movimiento</h3>
                        </div>
                        <p className="text-[10px] font-medium text-amber-700/70 italic">
                            Productos sin ventas en los últimos 30 días. Sugerencia: Promocionar o liquidar.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-white/50 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-700">Cable Acelerador</span>
                                <span className="text-[9px] font-black text-amber-600">42 Días</span>
                            </div>
                        </div>
                    </div>

                    {/* Más Vendidos */}
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Top Ventas</h3>
                        </div>
                        <div className="space-y-3">
                            {['Aceite Motul', 'Pastilla Honda'].map(name => (
                                <div key={name} className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-700">{name}</span>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px]">ALTA ROTACIÓN</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabla de Inventario Central */}
                <div className="lg:col-span-3 bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#3841F2] rounded-xl text-white">
                                <Warehouse className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Maestro de Inventario</h3>
                                <p className="text-[11px] text-muted-foreground font-medium">Visualización de stock real en Group Sanchez.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['Todas', 'Lubricantes', 'Frenos', 'Accesorios'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                                        filterCategory === cat ? 'bg-[#3841F2] text-white' : 'text-slate-400 hover:bg-slate-100'
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Código & Producto</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Precios</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((p) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-xl text-slate-400 group-hover:text-[#3841F2] transition-colors border border-border">
                                                        <Barcode className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-slate-800 leading-tight italic">{p.name}</p>
                                                        <p className="text-xs font-black text-[#3841F2] tracking-tighter uppercase">{p.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{p.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] uppercase tracking-tighter">
                                                    {p.category}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "text-sm font-black italic",
                                                        p.stock <= p.minStock ? 'text-red-500' : 'text-slate-900'
                                                    )}>
                                                        {p.stock} {p.stock === 1 ? 'UD' : 'UDS'}
                                                    </div>
                                                    <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className={cn("h-full", p.stock <= p.minStock ? 'bg-red-500' : 'bg-[#3841F2]')}
                                                            style={{ width: `${Math.min(100, (p.stock / (p.minStock * 2)) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-base font-black text-slate-900">S/ {p.salePrice.toFixed(2)}</p>
                                                <p className="text-xs font-bold text-muted-foreground italic">Costo: S/ {p.costPrice.toFixed(2)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedProduct(p)}
                                                        className="p-2 hover:bg-[#3841F2]/10 hover:text-[#3841F2] rounded-lg transition-colors" title="Editar"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => toast.info('Historial detallado para ' + p.code)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors" title="Historial">
                                                        <History className="h-4 w-4 text-slate-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStock(p.id, p.stock + 1)}
                                                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors" title="Ajuste Stock"
                                                    >
                                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Integration chip bottom */}
                    <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full shadow-sm">
                            <RefreshCw className="h-3 w-3 text-[#3841F2] animate-spin-slow" />
                            <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Sincronizado con POS en tiempo real</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Insight Panel */}
            <div className="p-8 bg-[#020659] rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#3841F2] rounded-xl">
                            <Info className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Optimización de Stock — IA</h3>
                    </div>
                    <p className="text-blue-100/80 text-xl font-medium leading-relaxed italic">
                        "Se detecta alta rotación en <span className="text-white font-black underline decoration-[#3841F2]">Lubricantes Motul</span>. Sugerimos adelantar orden de compra para evitar quiebre de stock el fin de semana."
                    </p>
                    <button className="px-6 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Generar Sugerencia de Compra
                    </button>
                </div>
                <div className="h-40 w-40 shrink-0 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#3841F2]/20 rounded-full animate-ping" />
                    <TrendingUp className="h-20 w-20 text-[#3841F2] relative z-10 drop-shadow-[0_0_15px_rgba(56,65,242,0.5)]" />
                </div>
            </div>

            {/* --- MODALES --- */}
            <AnimatePresence>
                {(selectedProduct || isAddModalOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900 italic">
                                    {isAddModalOpen ? 'Nuevo Producto' : 'Editar Producto'}
                                </h2>
                                <button onClick={() => { setSelectedProduct(null); setIsAddModalOpen(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Producto</label>
                                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" defaultValue={selectedProduct?.name || ''} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</label>
                                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" defaultValue={selectedProduct?.code || 'PR-0000'} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</label>
                                    <select className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                        <option>Lubricantes</option>
                                        <option>Frenos</option>
                                        <option>Accesorios</option>
                                        <option>Llantas</option>
                                    </select>
                                </div>
                                <div className="space-y-1 text-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Actual</label>
                                    <div className="flex items-center justify-center gap-4 h-12 bg-blue-50 rounded-xl border border-blue-100">
                                        <button className="h-8 w-8 bg-white rounded-lg shadow-sm font-black">-</button>
                                        <span className="font-black text-lg">{selectedProduct?.stock || 0}</span>
                                        <button className="h-8 w-8 bg-white rounded-lg shadow-sm font-black">+</button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Venta</label>
                                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#3841F2]" defaultValue={selectedProduct ? `S/ ${selectedProduct.salePrice.toFixed(2)}` : 'S/ 0.00'} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => { setSelectedProduct(null); setIsAddModalOpen(false); }}
                                    className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success(isAddModalOpen ? 'Producto creado' : 'Cambios guardados');
                                        setSelectedProduct(null);
                                        setIsAddModalOpen(false);
                                    }}
                                    className="flex-[2] py-4 px-6 bg-[#3841F2] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Importación */}
            <AnimatePresence>
                {isImporting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl text-center space-y-6"
                        >
                            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="h-10 w-10 text-[#3841F2] animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black italic text-slate-900">Importando Inventario</h2>
                                <p className="text-sm font-medium text-slate-500">Procesando archivo Excel y validando SKUs...</p>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#3841F2]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${importProgress}%` }}
                                />
                            </div>
                            <p className="text-xs font-black text-[#3841F2] uppercase tracking-[0.3em]">{importProgress}% COMPLETADO</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
