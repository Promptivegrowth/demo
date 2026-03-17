'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Truck, MapPin, Package, Clock,
    Navigation, Search, Filter, Layers,
    Plus, ChevronRight, CheckCircle2,
    AlertTriangle, Phone, MoreVertical,
    Calendar, Map as MapIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const TRUCKS = [
    { id: 'T-01', plate: 'BCU-125', driver: 'Mario Casas', status: 'En Entrega', load: 85, nextStop: 'Surco', eta: '12 min' },
    { id: 'T-02', plate: 'XRT-980', driver: 'Jorge Luna', status: 'Cargando', load: 40, nextStop: 'Independencia', eta: '45 min' },
    { id: 'T-03', plate: 'ABC-456', driver: 'Ana Ortiz', status: 'En Ruta', load: 92, nextStop: 'Miraflores', eta: '8 min' },
]

const SHIPMENTS = [
    { id: 'ENV-1001', client: 'Distribuidora Lima', items: '500x Vasos 8oz', status: 'Entregado', time: '09:30 AM', priority: 'Media' },
    { id: 'ENV-1002', client: 'Minimarkt Sol', items: '200x Platos Descart.', status: 'En Tránsito', time: '10:45 AM', priority: 'Alta' },
    { id: 'ENV-1003', client: 'Rest. Sabor Real', items: '1000x Cubiertos', status: 'Pendiente', time: '02:00 PM', priority: 'Normal' },
]

export default function LogisticaDistribucion() {
    const [selectedTruck, setSelectedTruck] = useState<any>(null)
    const [selectedShipment, setSelectedShipment] = useState<any>(null)
    const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'map' | 'routes'>('map')

    const handleCreateDispatch = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success("Nuevo despacho programado y sincronizado con el servidor local", {
            description: "El camión asignado recibirá la hoja de ruta en 30 segundos."
        })
        setIsNewDispatchOpen(false)
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                        <Truck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Logística & Distribución</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Gestión de flotas y despacho de pedidos en tiempo real</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('map')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic",
                            activeTab === 'map' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        Vista Mapa
                    </button>
                    <button
                        onClick={() => setActiveTab('routes')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic",
                            activeTab === 'routes' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        Gestión de Rutas
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Fleet Map Area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative aspect-video bg-slate-200 rounded-[2.5rem] overflow-hidden border border-border shadow-inner group">
                        {/* Map Background */}
                        <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700">
                            <div className="absolute inset-0 p-8 flex flex-col gap-4">
                                <div className="h-px w-full bg-slate-300 transform rotate-12 mt-20" />
                                <div className="h-px w-full bg-slate-300 transform -rotate-45" />
                                <div className="h-32 w-32 border-2 border-slate-300 rounded-full self-center" />
                            </div>
                            <MapIcon className="h-32 w-32 text-slate-300" />
                        </div>

                        {/* Truck Markers */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute top-1/4 left-1/3 z-10"
                        >
                            <div className="p-1 bg-white rounded-full shadow-2xl border-2 border-blue-600">
                                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div className="absolute top-0 left-full ml-3 bg-white p-3 rounded-2xl shadow-xl border border-border whitespace-nowrap">
                                    <p className="text-[10px] font-black uppercase italic text-slate-800">Camión T-01</p>
                                    <p className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter">Destino: Surco (Meta 85%)</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="absolute top-1/2 left-2/3 z-10">
                            <div className="p-1 bg-white rounded-full shadow-2xl border-2 border-emerald-500">
                                <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div className="absolute top-0 left-full ml-3 bg-white p-3 rounded-2xl shadow-xl border border-border whitespace-nowrap">
                                    <p className="text-[10px] font-black uppercase italic text-slate-800">Camión T-03</p>
                                    <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">En Ruta: Miraflores</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Heatmap Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl flex items-center justify-between shadow-2xl">
                            <div className="grid grid-cols-3 gap-12 w-full">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Entregas Hoy</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-slate-800">142/180</p>
                                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-[78%]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Tiemp. Promedio</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-blue-600">38 min</p>
                                    <p className="text-[8px] font-bold text-emerald-500">▼ 12% vs ayer</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Vehículos Activos</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                                    <Truck className="h-3 w-3 text-slate-400" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-sm font-black italic text-slate-800">+8</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fleet Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TRUCKS.map(truck => (
                            <div key={truck.id} className="p-5 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Truck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black italic text-slate-800 uppercase tracking-tighter">{truck.plate}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{truck.driver}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "text-[8px] font-black uppercase italic border-none",
                                        truck.status === 'En Entrega' ? "bg-blue-100 text-blue-600" :
                                            truck.status === 'En Ruta' ? "bg-emerald-100 text-emerald-600" :
                                                "bg-amber-100 text-amber-600"
                                    )}>
                                        {truck.status}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Próxima Parada</span>
                                        <span className="text-slate-800">{truck.nextStop} ({truck.eta})</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-black uppercase italic tracking-widest leading-none">
                                            <span>Capacidad de Carga</span>
                                            <span>{truck.load}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={cn(
                                                "h-full transition-all duration-1000",
                                                truck.load > 80 ? 'bg-red-500' : 'bg-blue-600'
                                            )} style={{ width: `${truck.load}%` }} />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full mt-2 h-10 bg-slate-50 hover:bg-blue-50 text-blue-600 font-black uppercase text-[9px] italic tracking-widest rounded-xl"
                                        onClick={() => setSelectedTruck(truck)}
                                    >
                                        Ver Hoja de Ruta
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dispatch List */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-border shadow-2xl flex flex-col h-fit">
                    <div className="p-8 border-b border-border bg-slate-50/50 rounded-t-[2.5rem]">
                        <h3 className="font-black text-sm text-slate-800 uppercase italic tracking-widest flex items-center gap-3">
                            <Navigation className="h-4 w-4 text-blue-600" />
                            Control de Despachos
                        </h3>
                    </div>
                    <ScrollArea className="p-8 h-[500px]">
                        <div className="space-y-6">
                            {SHIPMENTS.map((ship, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                            ship.status === 'Entregado' ? 'bg-emerald-100 text-emerald-600' :
                                                ship.status === 'En Tránsito' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                                                    'bg-slate-100 text-slate-400'
                                        )}>
                                            {ship.status === 'Entregado' ? <CheckCircle2 className="h-5 w-5" /> :
                                                ship.status === 'En Tránsito' ? <Truck className="h-5 w-5" /> :
                                                    <Package className="h-5 w-5" />}
                                        </div>
                                        <div className="w-[2px] flex-1 bg-slate-100 group-last:hidden" />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-xs font-black text-slate-800 uppercase italic tracking-tight">{ship.client}</h4>
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase italic border-none h-4 px-2",
                                                ship.priority === 'Alta' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {ship.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-2">{ship.items}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase italic text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {ship.time}
                                            </div>
                                            <span
                                                className="text-[9px] font-black uppercase text-blue-600 italic tracking-widest cursor-pointer hover:underline"
                                                onClick={() => setSelectedShipment(ship)}
                                            >
                                                Detalles
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-8 border-t border-border mt-auto">
                        <Button
                            className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black text-[10px] uppercase italic tracking-[0.2em]"
                            onClick={() => setIsNewDispatchOpen(true)}
                        >
                            Programar Nuevo Despacho
                        </Button>
                    </div>
                </div>
            </div>

            {/* Truck Route Sheet */}
            <Sheet open={!!selectedTruck} onOpenChange={() => setSelectedTruck(null)}>
                <SheetContent side="right" className="w-[400px] bg-white p-0 flex flex-col border-l">
                    <div className="bg-blue-600 p-8 text-white">
                        <Badge className="bg-white/20 text-white border-none font-black text-[8px] uppercase tracking-widest mb-4 italic">Unidad Logística</Badge>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{selectedTruck?.plate}</h2>
                        <p className="text-xs font-bold text-white/70 uppercase">Conductor: {selectedTruck?.driver}</p>
                    </div>
                    <ScrollArea className="flex-1 p-8">
                        <div className="space-y-8">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Carga Actual</p>
                                    <p className="text-xl font-black italic text-slate-800">{selectedTruck?.load}% Capacidad</p>
                                </div>
                                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm">
                                    <Truck className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-blue-600 border-b pb-2">Itinerario de Hoy</h3>
                                {[
                                    { stop: '1. Planta Lurín', time: '08:00 AM', status: 'Completado' },
                                    { stop: '2. Surco (C.C. Jockey)', time: '10:30 AM', status: 'En Ruta' },
                                    { stop: '3. Miraflores (Larcomar)', time: '12:00 PM', status: 'Pendiente' },
                                    { stop: '4. San Isidro', time: '02:30 PM', status: 'Pendiente' },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border-2",
                                                step.status === 'Completado' ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                    step.status === 'En Ruta' ? 'bg-blue-100 border-blue-600 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-300'
                                            )}>
                                                {i + 1}
                                            </div>
                                            {i < 3 && <div className="w-[2px] h-10 bg-slate-100" />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic text-slate-800">{step.stop}</p>
                                            <p className="text-[9px] font-bold text-slate-400">{step.time} — {step.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-8 border-t bg-slate-50/50">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-black text-[10px] uppercase italic tracking-[0.2em]">
                            Contactar Conductor
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Shipment Detail Dialog */}
            <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
                <DialogContent className="max-w-md bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-8 pb-12 bg-[#f8f9fa] border-b border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase italic px-3 py-1">
                                {selectedShipment?.id}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 italic">{selectedShipment?.time}</span>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase mb-2">{selectedShipment?.client}</h3>
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Calle Las Orquídeas 456, San Isidro</span>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Artículos en Envío</p>
                            <div className="space-y-3">
                                {[
                                    { qty: '500x', item: 'Vaso PP 12oz Transparente', price: 'S/ 75.00' },
                                    { qty: '200x', item: 'Tapa Domo p/Vaso 12oz', price: 'S/ 20.00' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex gap-3 items-center">
                                            <span className="text-[10px] font-black text-blue-600">{item.qty}</span>
                                            <span className="text-[10px] font-bold text-slate-700">{item.item}</span>
                                        </div>
                                        <span className="text-[10px] font-black italic">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 bg-slate-50/50">
                        <Button variant="outline" className="flex-1 rounded-xl h-11 text-[10px] font-black uppercase italic" onClick={() => setSelectedShipment(null)}>Cerrar</Button>
                        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 text-[10px] font-black uppercase italic">Reenviar Guía</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Dispatch Form (Dialog/Drawer simulation) */}
            <Dialog open={isNewDispatchOpen} onOpenChange={setIsNewDispatchOpen}>
                <DialogContent className="max-w-lg bg-white rounded-[2.5rem] border-none shadow-2xl p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">Programar Despacho</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Asignación de carga y rutas para la flota local
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateDispatch} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase italic text-slate-500">Unidad de Transporte</Label>
                                <Select defaultValue="T-01">
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black italic text-xs uppercase">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-100 rounded-xl">
                                        {TRUCKS.map(t => <SelectItem key={t.id} value={t.id} className="text-[10px] font-black uppercase italic">{t.plate} - {t.driver}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase italic text-slate-500">Prioridad</Label>
                                <Select defaultValue="normal">
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black italic text-xs uppercase">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-100 rounded-xl">
                                        <SelectItem value="low" className="text-[10px] font-black uppercase italic">Baja</SelectItem>
                                        <SelectItem value="normal" className="text-[10px] font-black uppercase italic">Media (Std)</SelectItem>
                                        <SelectItem value="high" className="text-[10px] font-black uppercase italic">Alta / Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase italic text-slate-500">Cliente / Destino</Label>
                            <Input placeholder="Buscar cliente..." className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black italic text-xs uppercase" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant="outline" className="h-12 rounded-xl text-[10px] font-black uppercase italic" onClick={() => setIsNewDispatchOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest">
                                Confirmar Ruta
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
