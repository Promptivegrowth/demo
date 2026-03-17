'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Package, MapPin, CheckCircle2,
    Clock, AlertTriangle, Plus, Search,
    Filter, ArrowRight, Navigation, Boxes,
    ClipboardList, Map as MapIcon, ChevronRight,
    QrCode, Timer, User, ShieldCheck, Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

// --- MOCK DATA ---
const DISPATCH_ORDERS = [
    { id: 'DESP-001', client: 'Distribuidora Norte', items: 45, weight: '320 kg', status: 'Pick & Pack', route: 'Ruta 01 - Lima Norte', priority: 'Urgente' },
    { id: 'DESP-002', client: 'Bodega El Sol', items: 12, weight: '45 kg', status: 'Listo para Despacho', route: 'Ruta 04 - Surco', priority: 'Normal' },
    { id: 'DESP-003', client: 'Supermercado Metro', items: 120, weight: '1,200 kg', status: 'En Tránsito', route: 'Ruta 02 - Centro', priority: 'Programado' },
    { id: 'DESP-004', client: 'Horeca S.A.', items: 28, weight: '180 kg', status: 'Pendiente', route: 'Sin Asignar', priority: 'Normal' },
]

const FLEET = [
    { id: 'V-001', plate: 'F1L-445', driver: 'Mario Casas', capacity: 85, status: 'En Ruta', nextStop: 'Los Olivos' },
    { id: 'V-002', plate: 'P2Q-990', driver: 'Jorge Luna', capacity: 10, status: 'En Planta', nextStop: '-' },
    { id: 'V-003', plate: 'B7M-112', driver: 'Sandra Ruiz', capacity: 100, status: 'Cargando', nextStop: 'Ate' },
]

export default function LogisticaDistribucion() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0f4c81] rounded-2xl text-white shadow-lg">
                        <Truck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-1">Logística & Distribución</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">Centro de Despacho y Gestión de Flota</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-black uppercase tracking-tighter text-[10px]">
                        <MapIcon className="h-4 w-4 mr-2" /> Monitor de Rutas
                    </Button>
                    <Button size="sm" className="bg-[#e8820c] hover:bg-[#ff9500] text-white font-black uppercase tracking-tighter text-[10px]">
                        <Plus className="h-4 w-4 mr-2" /> Programar Despacho
                    </Button>
                </div>
            </div>

            {/* Top Stats: Pickup & Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                            <Package className="h-5 w-5" />
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-tighter">Activo</Badge>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-800 italic tracking-tighter">15</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Despachos Hoy</span>
                    </div>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                            <Timer className="h-5 w-5" />
                        </div>
                        <Badge className="bg-amber-500 text-white border-none font-black text-[9px] uppercase tracking-tighter">Retraso</Badge>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-800 italic tracking-tighter">3</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Rutas Críticas</span>
                    </div>
                </div>
                <div className="p-5 bg-card rounded-3xl border border-border shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Ocupación de Flota (M3/Peso)</span>
                        <Zap className="h-4 w-4 text-[#e8820c]" />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                                <span>Capacidad Utilizada</span>
                                <span className="text-[#0f4c81]">78%</span>
                            </div>
                            <Progress value={78} className="h-2" />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-black text-[#0f4c81] italic leading-none">4.5 T</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Disp. Carga</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout: Dispatch Board + Fleet Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Dispatch Board (Order List) */}
                <div className="lg:col-span-8 bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#0f4c81] rounded-xl text-white">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-black italic uppercase tracking-widest text-slate-800">Tablero de Despacho</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Filtro rápido..." className="pl-10 h-9 w-48 rounded-xl border-slate-200 text-xs italic font-medium" />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 shadow-inner">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">ID / Destinatario</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Carga</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ruta Asignada</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Prioridad</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Estado</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {DISPATCH_ORDERS.map((order) => (
                                    <tr key={order.id} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-[#0f4c81] tracking-tighter mb-0.5">{order.id}</span>
                                                <span className="text-sm font-black text-slate-800 italic uppercase leading-none">{order.client}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Boxes className="h-4 w-4 text-slate-300" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-700 italic leading-none">{order.items} Uni.</span>
                                                    <span className="text-[9px] font-bold text-slate-400 italic">{order.weight}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                <Navigation className="h-3 w-3 text-blue-500" />
                                                <span className="text-xs font-black text-slate-600 italic uppercase tracking-tighter">{order.route}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn(
                                                "font-black text-[8px] uppercase tracking-tighter border-none",
                                                order.priority === 'Urgente' ? "bg-red-500 text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {order.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <Badge className={cn(
                                                    "font-black text-[9px] uppercase italic tracking-tighter leading-none border-none",
                                                    order.status === 'En Tránsito' ? "bg-emerald-100 text-emerald-700" :
                                                        order.status === 'Listo para Despacho' ? "bg-blue-100 text-blue-700" :
                                                            order.status === 'Pick & Pack' ? "bg-amber-100 text-amber-700" :
                                                                "bg-slate-100 text-slate-500"
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-[#e8820c]/10 group-hover:text-[#e8820c] transition-all">
                                                <QrCode className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fleet Management */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Fleet Status List */}
                    <div className="p-6 bg-white rounded-3xl border border-border shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black italic uppercase tracking-widest text-[#0f4c81] flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Estado de Flota
                            </h3>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-slate-400">Gestión</Button>
                        </div>
                        <div className="space-y-4">
                            {FLEET.map(v => (
                                <div key={v.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#0f4c81]/20 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                <Truck className={cn("h-5 w-5", v.status === 'En Ruta' ? 'text-emerald-500' : 'text-slate-400')} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase italic leading-none truncate">{v.driver}</h4>
                                                <span className="text-[9px] font-black text-[#0f4c81] tracking-tighter">{v.plate}</span>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase tracking-tighter border-none h-4",
                                            v.status === 'En Ruta' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                                        )}>{v.status}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-bold uppercase text-slate-400">
                                            <span>Carga</span>
                                            <span className="text-slate-800">{v.capacity}%</span>
                                        </div>
                                        <Progress value={v.capacity} className="h-1 bg-slate-200" />
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <MapPin className="h-3 w-3 text-[#e8820c]" />
                                            <span className="text-[9px] font-bold text-slate-500 italic uppercase">Sig. Parada: {v.nextStop}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pick & Pack Quick Area */}
                    <div className="p-6 bg-[#0f4c81] rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Package className="h-20 w-20" />
                        </div>
                        <div className="relative">
                            <h4 className="text-[10px] font-black uppercase tracking-widest italic mb-6 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                Picking Eficiente
                            </h4>
                            <div className="space-y-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black italic tracking-tighter leading-none mb-1">08 min</span>
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Tiempo Prom. Packing</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black italic tracking-tighter leading-none mb-1">98.5%</span>
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Exactitud Inv.</span>
                                </div>
                            </div>
                            <Button className="w-full bg-[#e8820c] hover:bg-[#ff9500] text-white rounded-2xl h-12 font-black text-[10px] uppercase italic tracking-widest gap-2 shadow-xl">
                                Iniciar Escaneo (Picking)
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Driver Summary Mini-Card */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            <User className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 italic leading-none mb-1">Driver del Mes</p>
                            <h4 className="text-sm font-black text-slate-800 italic uppercase">Juan Del Aguila</h4>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-[#e8820c] italic leading-none">99.2%</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">On-Time</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
