'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Boxes, Package, Truck, AlertTriangle, Search,
    Filter, Plus, Download, Upload, ArrowRight,
    Calendar, Tag, Layers, Database, Warehouse,
    CheckCircle2, Clock, MoreVertical, LayoutGrid, List, ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// --- MOCK DATA ---
const RAW_MATERIALS = [
    { id: 'MP-001', name: 'Resina Polypropylene (Virgen)', code: 'PP-V-01', category: 'Resinas', stock: 12500, unit: 'KG', minStock: 2000, supplier: 'Resinas del Perú', location: 'Siloe A-1' },
    { id: 'MP-002', name: 'Masterbatch Blanco', code: 'MB-WH-02', category: 'Pigmentos', stock: 450, unit: 'KG', minStock: 100, supplier: 'Colores SAC', location: 'Estante Q-1' },
];

const FINISHED_PRODUCTS = [
    { id: 'PT-001', name: 'Vaso Transparente PP 12oz', code: 'V-12-PP', presentation: 'Caja x 1000', stockReal: 15000, stockReserved: 2000, location: 'Almacén A-1', minStock: 5000, rotation: 15 },
    { id: 'PT-002', name: 'Plato PET 9"', code: 'P-09-PET', presentation: 'Caja x 500', stockReal: 8500, stockReserved: 1200, location: 'Almacén B-2', minStock: 3000, rotation: 12 },
    { id: 'PT-003', name: 'Contenedor Vianda', code: 'C-V-HB', presentation: 'Paquete x 50', stockReal: 4200, stockReserved: 500, location: 'Almacén C-3', minStock: 2000, rotation: 8 },
];

const PRODUCTS = [
    { id: 'PROD-001', name: 'Vaso Transparente PP 12oz', category: 'Producto Terminado', stock: 15000, minStock: 5000, price: 'S/ 0.12', status: 'In Stock', image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/vaso_descartable_pp_1773781872568.png' },
    { id: 'PROD-002', name: 'Plato PET 9"', category: 'Producto Terminado', stock: 8500, minStock: 3000, price: 'S/ 0.25', status: 'In Stock', image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/plato_descartable_pet_1773781887432.png' },
    { id: 'PROD-003', name: 'Contenedor Vianda con Bisagra', category: 'Producto Terminado', stock: 4200, minStock: 2000, price: 'S/ 0.45', status: 'Low Stock', image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/contenedor_bisagra_portacomida_peru_1773781902193.png' },
    { id: 'PROD-004', name: 'Pack Cubiertos Premium (3-en-1)', category: 'Producto Terminado', stock: 12000, minStock: 5000, price: 'S/ 0.35', status: 'In Stock', image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/cubiertos_descartables_premium_1773781915994.png' },
    { id: 'RAW-001', name: 'Resina Polypropylene (Virgen)', category: 'Materia Prima', stock: 2500, minStock: 1000, price: 'S/ 5.80/kg', status: 'In Stock', image: null },
];

const WAREHOUSES = [
    { id: 'WH-01', name: 'Almacén Principal', capacity: 85, color: 'bg-[#0f4c81]' },
    { id: 'WH-02', name: 'Almacén Secundario', capacity: 42, color: 'bg-[#e8820c]' },
    { id: 'WH-03', name: 'Bodega Distribución', capacity: 15, color: 'bg-teal-500' },
]

const LOTS = [
    { id: 'L-7890', product: 'Vasos 7oz', date: '2026-10-15', daysLeft: 120, status: 'Vence Pronto' },
    { id: 'L-7895', product: 'Platos #22', date: '2026-06-20', daysLeft: 15, status: 'Crítico' },
    { id: 'L-7901', product: 'Bandejas N4', date: '2027-01-10', daysLeft: 300, status: 'Ok' },
]

export default function InventarioManufactura() {
    const [activeTab, setActiveTab] = useState('producto-terminado')

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
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-black uppercase tracking-tighter text-[10px]">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajuste
                    </Button>
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
                                    {FINISHED_PRODUCTS.map((p) => {
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#e8820c]" />
                                                    </Button>
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
                        {RAW_MATERIALS.map((mat) => (
                            <motion.div
                                key={mat.id}
                                className="p-5 bg-white rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[#0f4c81]/5 transition-colors">
                                        <Database className="h-5 w-5 text-slate-400 group-hover:text-[#0f4c81]" />
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
                                <div key={lot.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-[#0f4c81] tracking-tighter italic">{lot.id}</span>
                                        <Badge className={cn(
                                            "font-black text-[8px] uppercase tracking-tighter h-4 px-1.5",
                                            lot.status === 'Crítico' ? "bg-red-500 text-white" : lot.status === 'Vence Pronto' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                        )}>{lot.status}</Badge>
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
                    <Button className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black text-[10px] uppercase italic tracking-widest gap-2">
                        <Plus className="h-4 w-4" /> Tomar Inventario
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 14 2 2 4-4" />
        </svg>
    )
}
