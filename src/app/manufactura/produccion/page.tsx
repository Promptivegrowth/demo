'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Factory, Play, Pause, AlertTriangle, CheckCircle2,
    Settings, Clock, Zap, Gauge, Thermometer,
    Plus, History, ClipboardCheck, Info, ArrowRight,
    Server, Cpu, Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter
} from '@/components/ui/sheet'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect } from 'react'

// --- MOCK DATA ---
const INITIAL_ORDERS = [
    { id: 'OP-2024-001', product: 'Vasos descartables 7oz', presentation: 'Caja x 100', shift: 'Mañana', machine: 'Extrusora E-01', target: 25000, real: 18500, status: 'En Proceso', operator: 'Juan Perez' },
    { id: 'OP-2024-002', product: 'Platos #22 Blancos', presentation: 'Bolsa x 25', shift: 'Mañana', machine: 'Termoformadora T-04', target: 12000, real: 12000, status: 'Completado', operator: 'Maria Flores' },
    { id: 'OP-2024-003', product: 'Bolsas Biopack XL', presentation: 'Rollo x 500', shift: 'Tarde', machine: 'Selladora S-02', target: 15000, real: 4200, status: 'En Proceso', operator: 'Carlos Ruiz' },
    { id: 'OP-2024-004', product: 'Contenedores 500ml', presentation: 'Caja x 50', shift: 'Mañana', machine: 'Inyectora I-05', target: 8000, real: 2100, status: 'Detenido', operator: 'Roberto Diaz' },
]

const INITIAL_MACHINES = [
    { id: 'L1', name: 'Línea Extrusión 01', type: 'Extrusora', status: 'Activa', speed: 4500, efficiency: 92, temp: 185, oee: 88 },
    { id: 'L2', name: 'Línea Termoformado 04', type: 'Termoformado', status: 'Activa', speed: 2800, efficiency: 85, temp: 210, oee: 82 },
    { id: 'L3', name: 'Línea Sellado 02', type: 'Sellado', status: 'Mantenimiento', speed: 0, efficiency: 0, temp: 25, oee: 0 },
    { id: 'L4', name: 'Línea Inyección 05', type: 'Inyección', status: 'Parada', speed: 0, efficiency: 45, temp: 160, oee: 54 },
]

export default function ProduccionManufactura() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [selectedMachine, setSelectedMachine] = useState<any>(null)
    const [machines, setMachines] = useState(INITIAL_MACHINES)
    const [orders, setOrders] = useState(INITIAL_ORDERS)
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false)
    const [isMixModalOpen, setIsMixModalOpen] = useState(false)
    const [mixAdjusted, setMixAdjusted] = useState(false)
    const [telemetryLogs, setTelemetryLogs] = useState<string[]>([])

    // Telemetry Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setMachines(prev => prev.map(m => {
                if (m.status !== 'Activa') return m
                const fluctuation = Math.floor(Math.random() * 101) - 50 // ±50
                const newSpeed = Math.max(2000, m.speed + fluctuation)
                const newEfficiency = Math.min(100, Math.max(80, m.efficiency + (Math.random() * 2 - 1)))

                // Random log sometimes
                if (Math.random() > 0.95) {
                    setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] ${m.name}: Estabilidad de flujo confirmada`, ...prev].slice(0, 5))
                }

                return {
                    ...m,
                    speed: newSpeed,
                    efficiency: Number(newEfficiency.toFixed(1)),
                    temp: m.temp + (Math.random() > 0.5 ? 0.2 : -0.2)
                }
            }))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const handleEmergencyStop = (machineId: string | 'all') => {
        setMachines(prev => prev.map(m => {
            if (machineId === 'all' || m.id === machineId) {
                return { ...m, status: 'Parada', speed: 0, oee: Math.floor(m.oee * 0.7) }
            }
            return m
        }))
        setIsEmergencyModalOpen(false)
        setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] !!! PARADA DE EMERGENCIA REGISTRADA !!!`, ...prev].slice(0, 5))
    }

    const addNewOrder = (newOrder: any) => {
        setOrders([newOrder, ...orders])
    }

    const toggleOrderStatus = (orderId: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                const newStatus = o.status === 'En Proceso' ? 'Detenido' : 'En Proceso'
                return { ...o, status: newStatus }
            }
            return o
        }))
    }

    // Production Progress Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setOrders(prev => prev.map(order => {
                if (order.status !== 'En Proceso') return order
                // Find if the machine for this order is active
                const machine = machines.find(m => m.name === order.machine || m.id === order.machine)
                if (machine && machine.status !== 'Activa') return order

                const increment = Math.floor(Math.random() * 80) + 20
                const newReal = Math.min(order.target, order.real + increment)
                return {
                    ...order,
                    real: newReal,
                    status: newReal >= order.target ? 'Completado' : order.status
                }
            }))
        }, 1500)
        return () => clearInterval(interval)
    }, [machines])


    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0f4c81] rounded-2xl text-white shadow-lg">
                        <Factory className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Producción & Manufactura</h1>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-slate-50 text-[#0f4c81] border-[#0f4c81]/20 font-bold text-[10px]">
                                <Server className="h-3 w-3 mr-1" />
                                NÚCLEO LOCAL ACTIVO
                            </Badge>
                            <span className="text-xs text-slate-500 font-medium tracking-tight">Datos en Servidor Local — Sin dependencia de internet</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-bold uppercase tracking-tighter text-[10px]">
                        <History className="h-4 w-4 mr-2" />
                        Historial de Paradas
                    </Button>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="sm" className="bg-[#0f4c81] hover:bg-[#1a3a5a] text-white font-black uppercase tracking-tighter text-[10px]">
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Orden
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[480px] sm:max-w-none">
                            <SheetHeader>
                                <SheetTitle className="text-xl font-black italic uppercase text-[#0f4c81]">Crear Nueva Orden de Producción</SheetTitle>
                                <SheetDescription className="font-medium italic">
                                    Define los parámetros para el inicio de la nueva corrida de producción.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-8 space-y-6">
                                <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Producto</Label>
                                        <Select defaultValue="001">
                                            <SelectTrigger className="bg-white rounded-xl h-12 border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="001">Vaso PP 12oz (Transparente)</SelectItem>
                                                <SelectItem value="002">Plato PET 9" (Blanco)</SelectItem>
                                                <SelectItem value="003">Contenedor Vianda XL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Turno</Label>
                                            <Select defaultValue="mañana">
                                                <SelectTrigger className="bg-white rounded-xl h-12 border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mañana">MAÑANA</SelectItem>
                                                    <SelectItem value="tarde">TARDE</SelectItem>
                                                    <SelectItem value="noche">NOCHE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Línea/Máquina</Label>
                                            <Select defaultValue="L1">
                                                <SelectTrigger className="bg-white rounded-xl h-12 border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {machines.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Meta de Producción (Unidades)</Label>
                                        <Input type="number" placeholder="Ej: 50000" className="bg-white rounded-xl h-12 border-slate-200" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Operador Asignado</Label>
                                        <Input placeholder="Nombre Completo" className="bg-white rounded-xl h-12 border-slate-200" />
                                    </div>
                                </div>
                            </div>
                            <SheetFooter>
                                <Button
                                    className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-14 font-black uppercase italic tracking-widest text-xs"
                                    onClick={() => addNewOrder({
                                        id: `OP-2024-00${orders.length + 1}`,
                                        product: 'Nuevo Producto',
                                        presentation: 'Caja x 100',
                                        shift: 'Mañana',
                                        machine: 'Línea Extrusión 01',
                                        target: 50000,
                                        real: 0,
                                        status: 'En Proceso',
                                        operator: 'Juan Perez'
                                    })}
                                >
                                    Confirmar y Crear Orden
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Machine Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Sheet open={!!selectedMachine} onOpenChange={(open) => !open && setSelectedMachine(null)}>
                    {machines.map((machine) => (
                        <motion.div
                            key={machine.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedMachine(machine)}
                            className={cn(
                                "p-5 bg-card rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl cursor-pointer",
                                machine.status === 'Activa' ? "border-emerald-500/20 bg-emerald-50/10" :
                                    machine.status === 'Parada' ? "border-red-500/20 bg-red-50/10" :
                                        "border-amber-500/20 bg-amber-50/10"
                            )}
                        >
                            {/* Status Glow */}
                            <div className={cn(
                                "absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 opacity-20 transition-all duration-500 group-hover:scale-150",
                                machine.status === 'Activa' ? "bg-emerald-500" : machine.status === 'Parada' ? "bg-red-500" : "bg-amber-500"
                            )} />

                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm leading-tight italic uppercase">{machine.name}</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{machine.type}</p>
                                    </div>
                                    <Badge className={cn(
                                        "font-black text-[9px] uppercase tracking-tighter border-none",
                                        machine.status === 'Activa' ? "bg-emerald-500 text-white" :
                                            machine.status === 'Parada' ? "bg-red-500 text-white" :
                                                "bg-amber-500 text-white"
                                    )}>
                                        {machine.status}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Gauge className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Velocidad</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-800 italic">{machine.speed} <span className="text-[10px] text-slate-400 not-italic">UDS/H</span></span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                                            <span>Eficiencia Turno</span>
                                            <span className={cn(
                                                machine.efficiency >= 85 ? "text-emerald-500" : machine.efficiency >= 60 ? "text-amber-500" : "text-red-500"
                                            )}>{machine.efficiency}%</span>
                                        </div>
                                        <Progress value={machine.efficiency} className="h-1.5" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                <Thermometer className="h-3 w-3" /> Temp.
                                            </div>
                                            <span className="text-xs font-black text-slate-700 italic">{machine.temp.toFixed(1)}°C</span>
                                        </div>
                                        <div className="flex flex-col border-l border-slate-100 pl-2">
                                            <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                <Zap className="h-3 w-3" /> OEE Act.
                                            </div>
                                            <span className="text-xs font-black text-[#0f4c81] italic">{machine.oee}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Machine Detail Sheet */}
                    <SheetContent className="w-[100vw] sm:max-w-[500px] p-0 border-l border-white/20 bg-slate-50 overflow-y-auto">
                        <div className="p-8 space-y-8">
                            {selectedMachine && (
                                <>
                                    <header className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-4 bg-[#0f4c81] rounded-2xl text-white shadow-xl">
                                                <Settings className="h-8 w-8 animate-spin-slow" />
                                            </div>
                                            <Badge className="bg-emerald-500 text-white font-black italic uppercase tracking-widest">
                                                Sensor Link Activo
                                            </Badge>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black italic uppercase text-slate-800 leading-none">{selectedMachine.name}</h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Dashboard de Telemetría Industrial</p>
                                        </div>
                                    </header>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Sistema</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-sm font-black italic text-slate-800 uppercase">{selectedMachine.status}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carga Motor</p>
                                            <span className="text-xl font-black italic text-[#0f4c81]">74.2%</span>
                                        </div>
                                    </div>

                                    {/* Simulated Real-time Graphs */}
                                    <div className="space-y-6">
                                        <div className="p-6 bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Activity className="h-12 w-12 text-blue-400" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic mb-6">Velocidad de Inyección (Real-time)</h4>
                                            <div className="flex items-end gap-1.5 h-32">
                                                {[...Array(20)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: "10%" }}
                                                        animate={{ height: `${20 + Math.random() * 80}%` }}
                                                        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: i * 0.1 }}
                                                        className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-4">
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">T-60s</span>
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Actual</span>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-6">Temperatura de Fusión</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-3xl font-black italic text-slate-800">{selectedMachine.temp.toFixed(1)}°C</span>
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-black italic">±0.2° VAR</Badge>
                                                </div>
                                                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        animate={{ width: `${(selectedMachine.temp / 300) * 100}%` }}
                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium italic">Parámetros dentro del rango óptimo para PP-V-01.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic">Control Directo de Línea</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="rounded-2xl h-12 font-black uppercase italic text-[10px] tracking-widest gap-2 bg-white hover:bg-slate-50"
                                                onClick={() => handleEmergencyStop(selectedMachine.id)}
                                            >
                                                <Pause className="h-4 w-4" /> Detener Proceso
                                            </Button>
                                            <Button className="bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black uppercase italic text-[10px] tracking-widest gap-2 shadow-lg shadow-blue-900/20">
                                                <Settings className="h-4 w-4" /> Calibrar Unit.
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Event Log */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                                            <History className="h-3 w-3" /> Log de Telemetría
                                        </h4>
                                        <div className="space-y-2">
                                            {telemetryLogs.map((log, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-3 bg-white rounded-xl border border-slate-100 flex gap-3 items-center"
                                                >
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                                                    <span className="text-[10px] font-bold text-slate-600 font-mono italic">{log}</span>
                                                </motion.div>
                                            ))}
                                            {telemetryLogs.length === 0 && (
                                                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                                                    <p className="text-[10px] text-slate-400 font-medium italic">Esperando datos de sensores...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Layout Main: Orders Table + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Orders Table */}
                <div className="lg:col-span-3 bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#0f4c81] rounded-xl text-white">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black italic uppercase tracking-widest text-slate-800">Órdenes de Producción Activas</h3>
                                <p className="text-[11px] text-muted-foreground font-medium">Control de turno y cumplimiento de metas.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['Mañana', 'Tarde', 'Noche'].map(shift => (
                                <Badge key={shift} variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-bold text-[9px] uppercase hover:bg-slate-50 cursor-pointer">
                                    {shift}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">N° Orden / Producto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Plan vs Real</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">% Cumplimiento</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Máquina / Operador</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Acciones</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Estado</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        layout
                                        onClick={() => {
                                            const machine = machines.find(m => m.name === order.machine || m.id === order.machine)
                                            if (machine) setSelectedMachine(machine)
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-[#0f4c81] tracking-tighter">{order.id}</span>
                                                <span className="text-sm font-black text-slate-800 italic uppercase leading-tight">{order.product}</span>
                                                <span className="text-[10px] text-slate-400 font-bold italic">{order.presentation}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-black text-slate-700 italic">{order.real.toLocaleString()} / {order.target.toLocaleString()}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Unidades</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={false}
                                                        animate={{ width: `${Math.min(100, (order.real / order.target) * 100)}%` }}
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            (order.real / order.target) >= 0.9 ? "bg-emerald-500" :
                                                                (order.real / order.target) >= 0.5 ? "bg-[#e8820c]" : "bg-red-500"
                                                        )}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 italic">{((order.real / order.target) * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <Settings className={cn("h-3 w-3", order.status === 'Detenido' ? "text-red-500" : "text-emerald-500")} />
                                                    <span className="text-xs font-black text-slate-700 italic truncate">{order.machine}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{order.operator}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn(
                                                        "h-8 w-8 rounded-full",
                                                        order.status === 'En Proceso' ? "text-amber-500 bg-amber-50" : "text-emerald-500 bg-emerald-50"
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleOrderStatus(order.id)
                                                    }}
                                                >
                                                    {order.status === 'En Proceso' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-full text-blue-600 bg-blue-50"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <ClipboardCheck className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="rounded-3xl border-none p-8" onClick={(e) => e.stopPropagation()}>
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-black italic uppercase text-slate-800">Inspección de Calidad (QC)</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="py-6 space-y-6">
                                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Orden de Referencia</p>
                                                                    <p className="text-sm font-black italic text-[#0f4c81]">{order.id}</p>
                                                                </div>
                                                                <Badge className="bg-emerald-500 text-white font-black italic uppercase tracking-widest text-[8px]">PROMPTIVE QC L1</Badge>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">Gramaje (gr)</Label>
                                                                    <Input defaultValue="4.2" className="bg-white rounded-xl h-10 border-slate-100" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">Transparencia (%)</Label>
                                                                    <Input defaultValue="98" className="bg-white rounded-xl h-10 border-slate-100" />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                                <p className="text-xs font-bold text-emerald-700 italic">Muestra dentro de los parámetros de tolerancia estipulados.</p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button
                                                                className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black uppercase italic"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Simulate validation
                                                                    setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] QC Aprobado para ${order.id}`, ...prev].slice(0, 5))
                                                                }}
                                                            >
                                                                Validar Lote y Continuar
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn(
                                                "font-black text-[9px] uppercase italic tracking-tighter border-none",
                                                order.status === 'En Proceso' ? "bg-blue-100 text-blue-700" :
                                                    order.status === 'Completado' ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-red-100 text-red-700"
                                            )}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-white transition-colors">
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#0f4c81]" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Control de Paradas & Calidad */}
                <div className="space-y-6">
                    {/* Alerta de Materia Prima */}
                    <div className="p-5 bg-white rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                        </div>
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic mb-3">Control de Materiales</h4>
                        <div className="flex flex-col gap-1 mb-4">
                            <span className="text-lg font-black text-slate-800 tracking-tight italic">Exceso de Consumo</span>
                            <p className="text-xs text-slate-500 font-medium leading-tight">La extrusora E-01 está consumiendo un 12.5% más de polietileno de lo planificado.</p>
                        </div>
                        <Dialog open={isMixModalOpen} onOpenChange={setIsMixModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className={cn(
                                    "w-full border-red-200 font-black text-[10px] uppercase tracking-tighter italic",
                                    mixAdjusted ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "text-red-600 hover:bg-red-50"
                                )}>
                                    {mixAdjusted ? "Mezcla ajustada ✓" : "Ajustar Mezcla"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-none p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic uppercase text-slate-800">Ajuste de Composición de Mezcla</DialogTitle>
                                </DialogHeader>
                                <div className="py-6 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#0f4c81] italic">Polietileno (Virgen)</Label>
                                            <span className="text-sm font-black italic">85%</span>
                                        </div>
                                        <input type="range" className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#0f4c81]" defaultValue="85" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#0f4c81] italic">Masterbatch (Color)</Label>
                                            <span className="text-sm font-black italic">15%</span>
                                        </div>
                                        <input type="range" className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#e8820c]" defaultValue="15" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">El ajuste se aplicará inmediatamente a la línea E-01 mediante el dosificador gravimétrico.</p>
                                </div>
                                <DialogFooter>
                                    <Button
                                        className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black uppercase italic"
                                        onClick={() => {
                                            setMixAdjusted(true)
                                            setIsMixModalOpen(false)
                                        }}
                                    >
                                        Guardar Parámetros
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Calidad Lote */}
                    <div className="p-5 bg-card rounded-3xl border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic">Últimos Lotes QC</h4>
                        </div>
                        <div className="space-y-3">
                            {[
                                { lote: 'L-7890', status: 'Aprobado', desc: 'Vasos 7oz - Gramaje OK' },
                                { lote: 'L-7891', status: 'Revision', desc: 'Platos #22 - Dimensión -0.2mm' }
                            ].map((qc, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-[#0f4c81] tracking-tighter">{qc.lote}</span>
                                        <Badge className={cn(
                                            "text-[8px] uppercase tracking-tighter font-black h-4 px-1.5",
                                            qc.status === 'Aprobado' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                        )}>{qc.status}</Badge>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium italic leading-tight">{qc.desc}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-3 text-[10px] font-black text-[#0f4c81] uppercase tracking-tighter hover:bg-[#0f4c81]/5">
                            Ver Reporte de Calidad
                        </Button>
                    </div>

                    {/* Parada No Planificada Form Quick Link */}
                    <Dialog open={isEmergencyModalOpen} onOpenChange={setIsEmergencyModalOpen}>
                        <DialogTrigger asChild>
                            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative group cursor-pointer overflow-hidden border border-red-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest italic mb-4 flex items-center gap-2">
                                        <Pause className="h-3 w-3 fill-red-400" />
                                        Botón de Emergencia
                                    </h4>
                                    <p className="text-lg font-black italic tracking-tighter leading-tight mb-4">Registrar Parada Crítica de Línea</p>
                                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Proceder ahora</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl border-none p-0 overflow-hidden max-w-md">
                            <div className="p-8 bg-red-600 text-white">
                                <AlertTriangle className="h-12 w-12 mb-4 animate-bounce" />
                                <h2 className="text-2xl font-black italic uppercase leading-none mb-2">Protocolo de Emergencia</h2>
                                <p className="text-white/80 text-xs font-medium italic">Selecciona la acción inmediata para detener la producción.</p>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Línea Crítica</Label>
                                    <Select>
                                        <SelectTrigger className="rounded-xl border-slate-100 h-12 font-bold italic">
                                            <SelectValue placeholder="Seleccionar línea..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {machines.map(m => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl font-black uppercase italic text-xs"
                                    onClick={() => handleEmergencyStop('L1')}
                                >
                                    Detener Línea Seleccionada
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-red-200 text-red-600 h-12 rounded-xl font-black uppercase italic text-xs"
                                    onClick={() => handleEmergencyStop('all')}
                                >
                                    DETENER TODO EL PLANTA
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full h-10 text-slate-400 font-bold uppercase text-[10px]"
                                    onClick={() => setIsEmergencyModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
