'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Boxes, Package, Truck, AlertTriangle, Search,
    Filter, Plus, Download, Upload, ArrowRight,
    Calendar, Tag, Layers, Database, Warehouse,
    CheckCircle2, Clock, MoreVertical, LayoutGrid, List, ShieldCheck,
    Droplet, Palette, Beaker, FileText, History as HistoryIcon, Info,
    ScanLine, MapPin, PackageSearch, ScrollText, ArrowUpRight, ArrowDownRight,
    Scissors, FileSpreadsheet, ClipboardCheck, ChevronRight, Settings
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription
} from '@/components/ui/sheet'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// --- MOCK DATA ---
const KARDEX_MOVEMENTS = [
    { date: '2024-03-15 08:30', type: 'Ingreso', qty: '+5,000', source: 'Producción E-01', user: 'Almacenero - R. Soto' },
    { date: '2024-03-14 16:45', type: 'Salida', qty: '-1,200', source: 'Guía 001-4567', user: 'Logística - M. Jara' },
    { date: '2024-03-14 10:20', type: 'Ajuste', qty: '-50', source: 'Muestra Calidad', user: 'Control - D. Vega' },
    { date: '2024-03-13 14:00', type: 'Ingreso', qty: '+2,000', source: 'Producción T-04', user: 'Almacenero - R. Soto' },
]

const INITIAL_FINISHED_PRODUCTS = [
    { id: 'FP-001', code: 'VP-12-TR', name: 'Vaso PP 12oz Transparente', category: 'Vasos', presentation: 'Caja x 12 Bultos', rotation: 85, stockReal: 15400, stockReserved: 2100, unit: 'Millar', location: 'Rack A-12', image: '/manufactura/vaso.png' },
    { id: 'FP-002', code: 'PL-09-BL', name: 'Plato PET 9" Blanco', category: 'Platos', presentation: 'Caja x 500 Unid.', rotation: 72, stockReal: 8200, stockReserved: 500, unit: 'Caja', location: 'Rack B-04', image: '/manufactura/plato.png' },
    { id: 'FP-003', code: 'CN-50-HV', name: 'Contenedor Vianda XL', category: 'Contenedores', presentation: 'Bulto x 100 Pack', rotation: 45, stockReal: 3100, stockReserved: 1200, unit: 'Bulto', location: 'Rack C-01', image: '/manufactura/contenedor.png' },
]

const INITIAL_RAW_MATERIALS = [
    { id: 'MP-001', name: 'Resina Polypropylene (Virgen)', code: 'PP-V-01', category: 'Resinas', stock: 12500, unit: 'KG', minStock: 2000, supplier: 'Resinas del Perú', location: 'Siloe A-1', icon: Droplet },
    { id: 'MP-002', name: 'Masterbatch Blanco', code: 'MB-WH-02', category: 'Pigmentos', stock: 450, unit: 'KG', minStock: 100, supplier: 'Colores SAC', location: 'Estante Q-1', icon: Palette },
    { id: 'MP-003', name: 'Aditivo Biodegradable', code: 'AD-BIO-03', category: 'Aditivos', stock: 85, unit: 'KG', minStock: 50, supplier: 'Bio-Chem Ind.', location: 'Rack Especial', icon: Beaker },
]

const WAREHOUSES = [
    { id: 'WH-01', name: 'Almacén Principal', capacity: 85, color: 'bg-[#0f4c81]' },
    { id: 'WH-02', name: 'Almacén Secundario', capacity: 42, color: 'bg-[#e8820c]' },
    { id: 'WH-03', name: 'Bodega Distribución', capacity: 15, color: 'bg-teal-500' },
]

const LOTS = [
    { id: 'L-7890', product: 'Vasos 7oz', date: '2026-10-15', daysLeft: 120, status: 'Vence Pronto', qty: '50,000 Uds', image: '/manufactura/lote.png' },
    { id: 'L-7895', product: 'Platos #22', date: '2026-06-20', daysLeft: 15, status: 'Crítico', qty: '24,000 Uds', image: '/manufactura/lote.png' },
    { id: 'L-7901', product: 'Bandejas N4', date: '2027-01-10', daysLeft: 300, status: 'Ok', qty: '12,000 Uds', image: '/manufactura/lote.png' },
]

const INVENTORY = [
    ...INITIAL_FINISHED_PRODUCTS.map(p => ({ ...p, type: 'producto-terminado', stock: p.stockReal })),
    ...INITIAL_RAW_MATERIALS.map(m => ({ ...m, type: 'materia-prima' })),
]

export default function InventarioManufactura() {
    const [activeTab, setActiveTab] = useState('terminado')
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
    const [auditStep, setAuditStep] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredInventory = INVENTORY.filter(item =>
        item.type === activeTab &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleAuditSubmit = () => {
        setAuditStep(3)
        setTimeout(() => {
            setIsAuditModalOpen(false)
            setAuditStep(1)
        }, 2000)
    }
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
    const [materiaPrima, setMateriaPrima] = useState(INITIAL_RAW_MATERIALS)
    const [finishedProducts, setFinishedProducts] = useState(INITIAL_FINISHED_PRODUCTS)


    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#e8820c] rounded-2xl text-white shadow-lg">
                        <Boxes className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Inventario & Almacenes</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Gestión de Stock, Lotes y Logística de Planta</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-black uppercase tracking-tighter text-[10px]">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                    </Button>
                    <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-black uppercase tracking-tighter text-[10px]">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajuste
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl border-none p-8">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black italic uppercase text-slate-800">Ajuste de Existencias (Manual)</DialogTitle>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#e8820c] italic">Tipo de Ajuste</Label>
                                    <Select defaultValue="pos">
                                        <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold italic">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pos">ENTRADA (Ajuste Positivo)</SelectItem>
                                            <SelectItem value="neg">SALIDA (Ajuste Negativo)</SelectItem>
                                            <SelectItem value="merm">MERMA INDUSTRIAL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#e8820c] italic">Producto / Insumo</Label>
                                    <Select>
                                        <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold italic">
                                            <SelectValue placeholder="Seleccionar item..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...finishedProducts, ...materiaPrima].map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#e8820c] italic">Cantidad</Label>
                                        <Input type="number" placeholder="Ej: 50" className="rounded-xl border-slate-100" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#e8820c] italic">Almacén</Label>
                                        <Select defaultValue="WH-01">
                                            <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold italic">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WH-01">Almacén Principal</SelectItem>
                                                <SelectItem value="WH-02">Almacén Secundario</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#e8820c] italic">Motivo / Observación</Label>
                                    <Input placeholder="Justificación del ajuste" className="rounded-xl border-slate-100 h-10 font-medium italic" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black uppercase italic"
                                    onClick={() => setIsAdjustModalOpen(false)}
                                >
                                    Aplicar Ajuste a Kardex
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button size="sm" className="bg-[#0f4c81] hover:bg-[#1a3a5a] text-white font-black uppercase tracking-tighter text-[10px]">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Warehouse Capacity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {WAREHOUSES.map((wh) => (
                    <div key={wh.id} className="p-5 bg-card rounded-3xl border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Warehouse className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{wh.name}</span>
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase">
                                Capacidad
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-black text-slate-800 italic">{wh.capacity}%</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Espacio Disponible: {100 - wh.capacity}%</span>
                            </div>
                            <Progress value={wh.capacity} className="h-2" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Tabs Container */}
            <Tabs defaultValue="producto-terminado" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto self-start">
                        <TabsTrigger value="materia-prima" className="data-[state=active]:bg-white data-[state=active]:text-[#0f4c81] font-black uppercase tracking-widest text-[10px] py-2 px-4 italic">
                            Materia Prima
                        </TabsTrigger>
                        <TabsTrigger value="en-proceso" className="data-[state=active]:bg-white data-[state=active]:text-[#0f4c81] font-black uppercase tracking-widest text-[10px] py-2 px-4 italic">
                            En Proceso
                        </TabsTrigger>
                        <TabsTrigger value="producto-terminado" className="data-[state=active]:bg-white data-[state=active]:text-[#0f4c81] font-black uppercase tracking-widest text-[10px] py-2 px-4 italic">
                            Producto Terminado
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Buscar producto o código..." className="pl-10 h-9 rounded-xl border-slate-200 text-sm italic font-medium" />
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Inventory Table Container */}
                <div className="bg-card rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Search className="h-4 w-4 text-slate-400 shrink-0" />
                            <Input
                                placeholder="Buscar por SKU, nombre o lote..."
                                className="bg-white border-slate-100 rounded-xl max-w-xs h-10 font-bold italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded-xl font-black uppercase italic tracking-widest text-[10px] h-10 gap-2 border-slate-200">
                                <Filter className="h-4 w-4" /> Filtros
                            </Button>
                            <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#e8820c] hover:bg-[#d4760a] text-white rounded-xl font-black uppercase italic tracking-widest text-[10px] h-10 gap-2 shadow-lg shadow-orange-900/10">
                                        <ClipboardCheck className="h-4 w-4" /> Iniciar Auditoría
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl border-none p-0 overflow-hidden max-w-lg">
                                    <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-black italic uppercase text-slate-800">Auditoría de Inventario</h2>
                                            <Badge className="bg-orange-100 text-orange-700 font-black italic">PASO {auditStep} / 3</Badge>
                                        </div>

                                        {auditStep === 1 && (
                                            <div className="space-y-4">
                                                <p className="text-xs font-bold text-slate-500 italic">Seleccione el almacén y la zona de conteo para iniciar el proceso de validación física.</p>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-[#e8820c] transition-all cursor-pointer group">
                                                        <p className="text-[10px] font-black uppercase text-slate-400">Almacén Principal</p>
                                                        <p className="font-black italic text-[#0f4c81]">Zona A - Productos Terminados</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#e8820c] transition-all cursor-pointer">
                                                        <p className="text-[10px] font-black uppercase text-slate-400">Almacén de Materia Prima</p>
                                                        <p className="font-black italic text-[#0f4c81]">Cámaras de Refrigeración 01-04</p>
                                                    </div>
                                                </div>
                                                <Button onClick={() => setAuditStep(2)} className="w-full bg-[#0f4c81] h-12 rounded-2xl font-black uppercase italic">Siguiente Paso</Button>
                                            </div>
                                        )}

                                        {auditStep === 2 && (
                                            <div className="space-y-4 text-center py-4">
                                                <div className="flex justify-center">
                                                    <div className="p-6 bg-orange-100 rounded-full">
                                                        <ScanLine className="h-10 w-10 text-orange-600 animate-pulse" />
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-black italic text-slate-800 uppercase">Escaneo de Códigos</h3>
                                                <p className="text-xs font-bold text-slate-500 italic">Utilice el escáner de mano o la cámara del dispositivo para verificar los ítems en el estante 04-B.</p>
                                                <div className="p-4 bg-slate-900 rounded-2xl text-left border border-white/10">
                                                    <p className="text-[9px] font-mono text-emerald-400">PROMPTIVE SCAN CORE v2.1</p>
                                                    <p className="text-xs font-mono text-white mt-2 italic">Scanned: PROD-PLAS-772 - OK</p>
                                                    <p className="text-xs font-mono text-white italic">Scanned: LOTE-PP-2024-001 - OK</p>
                                                </div>
                                                <Button onClick={handleAuditSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-2xl font-black uppercase italic text-white">Finalizar Conteo</Button>
                                            </div>
                                        )}

                                        {auditStep === 3 && (
                                            <div className="text-center py-8 space-y-4">
                                                <div className="flex justify-center">
                                                    <div className="p-6 bg-emerald-50 rounded-full">
                                                        <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none">Auditoría Exitosa</h3>
                                                <p className="text-sm font-bold text-slate-500 italic">La conciliación de stock se ha procesado sin discrepancias en la Zona A.</p>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Producto</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-center">Stock Actual</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Ubicación</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Estado Stock</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Último Mov.</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredInventory.map((item) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => setSelectedItem(item)}
                                            className="group hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-xl flex items-center justify-center font-black italic text-sm shadow-md transition-transform group-hover:scale-110",
                                                        item.type === 'materia_prima' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                                    )}>
                                                        {item.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-800 italic uppercase leading-none">{item.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">SKU: {item.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-[#0f4c81] italic">{item.stock.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center">
                                                        <MapPin className="h-3 w-3 text-slate-500" />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-700 uppercase italic tracking-tighter">{item.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                                                        <span>Capacidad</span>
                                                        <span className={cn(
                                                            (item.stock / 5000) > 0.8 ? "text-emerald-500" :
                                                                (item.stock / 5000) < 0.2 ? "text-red-500" : "text-amber-500"
                                                        )}>{Math.round((item.stock / 5000) * 100)}%</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (item.stock / 5000) * 100)}%` }}
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                (item.stock / 5000) > 0.8 ? "bg-emerald-500" :
                                                                    (item.stock / 5000) < 0.2 ? "bg-red-500" : "bg-amber-500"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-700 italic">Hace 2 horas</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase italic">Recepción Lote</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-white transition-colors">
                                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0f4c81]" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Stock Item Detail Sheet */}
                            <SheetContent className="w-[100vw] sm:max-w-[500px] p-0 border-l border-white/20 bg-slate-50 overflow-y-auto">
                                <div className="p-8 space-y-8">
                                    {selectedItem && (
                                        <>
                                            <header className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className={cn(
                                                        "p-4 rounded-2xl text-white shadow-xl",
                                                        selectedItem.type === 'materia_prima' ? "bg-blue-600" : "bg-orange-600"
                                                    )}>
                                                        <PackageSearch className="h-8 w-8" />
                                                    </div>
                                                    <Badge className="bg-emerald-500 text-white font-black italic uppercase tracking-widest">
                                                        Stock Verificado
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-black italic uppercase text-slate-800 leading-none">{selectedItem.name}</h2>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Análisis de Existencia y Trazabilidad</p>
                                                </div>
                                            </header>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mínimo Crítico</p>
                                                    <span className="text-xl font-black italic text-red-500">1,200 <span className="text-[10px] uppercase not-italic">KG</span></span>
                                                </div>
                                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Punto de Re-pedido</p>
                                                    <span className="text-xl font-black italic text-[#e8820c]">2,500 <span className="text-[10px] uppercase not-italic">KG</span></span>
                                                </div>
                                            </div>

                                            {/* Warehouse Visualizer */}
                                            <div className="p-6 bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Localización de Almacén</h4>
                                                    <Badge className="bg-white/10 text-white/60 border-none font-mono text-[9px]">{selectedItem.location}</Badge>
                                                </div>
                                                <div className="grid grid-cols-6 gap-2 h-32 relative">
                                                    {[...Array(24)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "rounded-md border border-white/5 transition-all",
                                                                i === 14 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400 scale-110" : "bg-white/5"
                                                            )}
                                                        />
                                                    ))}
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[.5em] rotate-12">SECTOR LOGÍSTICO A-II</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <span className="text-[9px] font-black text-white/40 uppercase">Item Aquí</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-2 w-2 rounded-full bg-white/10" />
                                                        <span className="text-[9px] font-black text-white/40 uppercase">Ocupado</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Batch History (Kardex) */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic flex items-center gap-2">
                                                    <ScrollText className="h-3 w-3" /> Kardex de Movimientos
                                                </h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { type: 'Entrada', date: '21 May, 09:12 AM', qty: '+5,000', stock: '24,200', ref: 'OC-2291' },
                                                        { type: 'Salida', date: '20 May, 04:45 PM', qty: '-1,200', stock: '19,200', ref: 'OP-441-A' },
                                                        { type: 'Ajuste', date: '19 May, 11:30 AM', qty: '-50', stock: '20,400', ref: 'AUDIT-02' },
                                                    ].map((move, i) => (
                                                        <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-slate-200 transition-all">
                                                            <div className="flex gap-3 items-center">
                                                                <div className={cn(
                                                                    "p-2 rounded-lg",
                                                                    move.type === 'Entrada' ? "bg-emerald-50 text-emerald-600" :
                                                                        move.type === 'Salida' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                                                )}>
                                                                    {move.type === 'Entrada' ? <ArrowUpRight className="h-4 w-4" /> :
                                                                        move.type === 'Salida' ? <ArrowDownRight className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black uppercase text-slate-800">{move.type} - {move.ref}</span>
                                                                    <span className="text-[9px] font-bold text-slate-400 italic">{move.date}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={cn(
                                                                    "text-sm font-black italic",
                                                                    move.type === 'Entrada' ? "text-emerald-600" : "text-red-600"
                                                                )}>{move.qty}</span>
                                                                <p className="text-[10px] font-bold text-slate-400 italic">Total: {move.stock}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                                <Button variant="outline" className="rounded-2xl h-12 font-black uppercase italic text-[10px] tracking-widest gap-2 bg-white">
                                                    <Scissors className="h-4 w-4" /> Separar Lote
                                                </Button>
                                                <Button className="bg-[#0f4c81] text-white rounded-2xl h-12 font-black uppercase italic text-[10px] tracking-widest gap-2 shadow-lg shadow-blue-900/10">
                                                    <FileSpreadsheet className="h-4 w-4" /> Exportar Kardex
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* PRODUCTO TERMINADO VIEW */}
                <TabsContent value="producto-terminado" className="mt-0">
                    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Código & Descripción</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Presentación</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Ubicación</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Stock Real</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Reservado</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Disponible</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Rotación</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {finishedProducts.map((p) => {
                                        const available = p.stockReal - p.stockReserved;
                                        const isCritical = available <= 0;
                                        return (
                                            <motion.tr
                                                key={p.id}
                                                className={cn(
                                                    "group transition-colors",
                                                    isCritical ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-slate-50/50"
                                                )}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-[#e8820c] tracking-tighter">{p.code}</span>
                                                        <span className="text-sm font-black text-slate-800 italic uppercase leading-tight">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] uppercase tracking-tighter">
                                                        {p.presentation}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                        <Tag className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter italic">{p.location}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-slate-700 italic">{p.stockReal.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-[#0f4c81] italic">{p.stockReserved.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className={cn(
                                                            "text-sm font-black italic",
                                                            isCritical ? "text-red-500" : "text-emerald-500"
                                                        )}>
                                                            {available.toLocaleString()}
                                                        </div>
                                                        {isCritical && (
                                                            <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
                                                                <AlertTriangle className="h-2 w-2" />
                                                                Quiebre Stock
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-black text-slate-800 italic">{p.rotation} Días</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Prom. Salida</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Sheet>
                                                        <SheetTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelectedItem(p)}>
                                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#e8820c]" />
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent className="w-[500px] sm:max-w-none">
                                                            <SheetHeader>
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="p-2 bg-[#e8820c]/10 rounded-xl">
                                                                        <HistoryIcon className="h-6 w-6 text-[#e8820c]" />
                                                                    </div>
                                                                    <div>
                                                                        <SheetTitle className="text-xl font-black italic uppercase text-slate-800">Kardex de Producto</SheetTitle>
                                                                        <SheetDescription className="font-medium italic">Historial de movimientos y trazabilidad.</SheetDescription>
                                                                    </div>
                                                                </div>
                                                            </SheetHeader>
                                                            <div className="py-6 space-y-6">
                                                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div>
                                                                            <h3 className="text-lg font-black italic text-[#0f4c81] leading-none uppercase">{selectedItem?.name}</h3>
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedItem?.code}</span>
                                                                        </div>
                                                                        <Badge className="bg-[#0f4c81] text-white font-black italic">{selectedItem ? (selectedItem.stockReal - selectedItem.stockReserved) : 0} DISP.</Badge>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stock Actual</span>
                                                                            <span className="text-sm font-black italic">{selectedItem?.stockReal.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ubicación</span>
                                                                            <span className="text-sm font-black italic uppercase">{selectedItem?.location}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2 px-2">
                                                                        <Layers className="h-3 w-3" /> Movimientos Recientes
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {KARDEX_MOVEMENTS.map((mov, i) => (
                                                                            <div key={i} className="group p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{mov.date}</span>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className={cn(
                                                                                                "h-1.5 w-1.5 rounded-full",
                                                                                                mov.type === 'Ingreso' ? "bg-emerald-500" : mov.type === 'Salida' ? "bg-red-500" : "bg-amber-500"
                                                                                            )} />
                                                                                            <span className="text-xs font-black italic uppercase">{mov.type}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className={cn(
                                                                                        "text-sm font-black italic",
                                                                                        mov.qty.startsWith('+') ? "text-emerald-500" : "text-red-500"
                                                                                    )}>{mov.qty}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Ref: {mov.source}</span>
                                                                                    <span className="text-[10px] font-black text-[#0f4c81] italic">{mov.user}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-auto">
                                                                <Button variant="outline" className="w-full border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl italic gap-2 hover:bg-[#0f4c81] hover:text-white hover:border-[#0f4c81] transition-all">
                                                                    <FileText className="h-4 w-4" /> Exportar Kardex Completo (Excel)
                                                                </Button>
                                                            </div>
                                                        </SheetContent>
                                                    </Sheet>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* MATERIA PRIMA VIEW */}
                <TabsContent value="materia-prima" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {materiaPrima.map((mat) => (
                            <motion.div
                                key={mat.id}
                                className="p-5 bg-white rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[#0f4c81]/5 transition-colors">
                                        <mat.icon className="h-5 w-5 text-slate-400 group-hover:text-[#0f4c81]" />
                                    </div>
                                    <Badge className={cn(
                                        "font-black text-[9px] uppercase tracking-tighter",
                                        mat.stock <= mat.minStock ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                                    )}>
                                        {mat.stock <= mat.minStock ? 'Stock Bajo' : 'Normal'}
                                    </Badge>
                                </div>
                                <h3 className="font-black text-slate-800 text-sm italic uppercase leading-tight mb-1">{mat.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{mat.code}</p>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-2xl font-black text-slate-800 italic">{mat.stock.toLocaleString()} {mat.unit}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Min: {mat.minStock} {mat.unit}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full", mat.stock <= mat.minStock ? "bg-red-500" : "bg-[#0f4c81]")}
                                                style={{ width: `${Math.min(100, (mat.stock / (mat.minStock * 2)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Proveedor</span>
                                            <span className="text-[10px] font-black text-slate-600 uppercase italic leading-tight">{mat.supplier}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Ubicación</span>
                                            <span className="text-[10px] font-black text-slate-600 uppercase italic leading-tight">{mat.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Bottom Section: Expirations & Batches */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <div className="p-6 bg-card rounded-3xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-emerald-500" />
                                <h3 className="font-black text-sm text-slate-800 uppercase tracking-widest italic">Lotes & Vencimientos Críticos</h3>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-[#0f4c81]">Ver Todos</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {LOTS.map((lot) => (
                                <div key={lot.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2 group/lot">
                                    <div className="relative h-24 w-full bg-slate-200 rounded-xl overflow-hidden mb-2">
                                        <img src={lot.image} alt={lot.id} className="h-full w-full object-cover group-hover/lot:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <Badge className={cn(
                                                "font-black text-[7px] uppercase tracking-tighter h-4 px-1 border-none",
                                                lot.status === 'Crítico' ? "bg-red-500 text-white" : lot.status === 'Vence Pronto' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                            )}>{lot.status}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-[#0f4c81] tracking-tighter italic">{lot.id}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{lot.qty}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-800 italic uppercase leading-tight">{lot.product}</span>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Vence en</span>
                                            <span className={cn("text-xs font-black italic", lot.daysLeft <= 30 ? "text-red-500" : "text-slate-700")}>{lot.daysLeft} Días</span>
                                        </div>
                                        <Calendar className="h-4 w-4 text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 bg-card rounded-3xl border border-border shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#e8820c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2">Herramientas</h4>
                        <ul className="space-y-3 relative">
                            {[
                                { name: 'Kardex de Producto', icon: LayoutGrid },
                                { name: 'Traslado Almacenes', icon: Warehouse },
                                { name: 'Auditoría de Stock', icon: ClipboardCheck },
                            ].map((item, i) => (
                                <li key={i} className="flex items-center justify-between group/item cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg group-hover/item:bg-[#e8820c]/10 group-hover/item:text-[#e8820c] transition-colors">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-black text-slate-700 italic group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">{item.name}</span>
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-slate-300 group-hover/item:text-[#e8820c] opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-5 bg-[#0f4c81] rounded-3xl text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="h-4 w-4 text-emerald-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest italic text-white/70">Mermas & Dev.</h4>
                        </div>
                        <p className="text-2xl font-black italic tracking-tighter mb-1">2.4%</p>
                        <p className="text-[10px] text-white/50 font-medium uppercase tracking-[0.2em]">Merma Industrial Mes</p>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <Button className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white font-black text-[10px] uppercase tracking-tighter italic h-8">
                                Reportar Merma
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-5 bg-card rounded-3xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase italic leading-none mb-1">Stock Asegurado</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Kardex Diario Validado</p>
                        </div>
                    </div>
                    <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black text-[10px] uppercase italic tracking-widest gap-2">
                                <Plus className="h-4 w-4" /> Tomar Inventario
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl border-none p-0 overflow-hidden max-w-lg">
                            <div className="p-8 bg-emerald-600 text-white">
                                <ShieldCheck className="h-10 w-10 mb-2" />
                                <h2 className="text-2xl font-black italic uppercase leading-none">Auditoría de Stock</h2>
                                <p className="text-white/80 text-xs font-medium italic mt-1 uppercase tracking-widest">Validación de existencias físicas vs sistema</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-dotted border-slate-200 text-center">
                                    <p className="text-xs text-slate-500 font-medium italic">Se recomienda el uso del escáner industrial Zebra o Promptive Mobile para una auditoría sin errores.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#0f4c81] italic">Zona a Auditar</Label>
                                        <Select defaultValue="secA">
                                            <SelectTrigger className="rounded-xl border-slate-100 h-11 font-bold italic">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="secA">SECTOR A (PRODUCTO TERMINADO)</SelectItem>
                                                <SelectItem value="secB">SECTOR B (MATERIA PRIMA)</SelectItem>
                                                <SelectItem value="siloe">SILOE (RESERVA)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                                        <Info className="h-4 w-4 text-amber-500 shrink-0" />
                                        <p className="text-[11px] text-amber-700 font-bold italic leading-tight">Esta acción bloqueará temporalmente los movimientos de salida para la zona seleccionada.</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl font-black uppercase italic text-xs tracking-[0.2em]"
                                    onClick={() => setIsAuditModalOpen(false)}
                                >
                                    Iniciar Conteo Ciego
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

// End of InventarioManufactura
