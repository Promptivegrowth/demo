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

// --- MOCK DATA ---
const PRODUCTION_ORDERS = [
    { id: 'OP-2024-001', product: 'Vasos descartables 7oz', presentation: 'Caja x 100', shift: 'Mañana', machine: 'Extrusora E-01', target: 25000, real: 18500, status: 'En Proceso', operator: 'Juan Perez' },
    { id: 'OP-2024-002', product: 'Platos #22 Blancos', presentation: 'Bolsa x 25', shift: 'Mañana', machine: 'Termoformadora T-04', target: 12000, real: 12000, status: 'Completado', operator: 'Maria Flores' },
    { id: 'OP-2024-003', product: 'Bolsas Biopack XL', presentation: 'Rollo x 500', shift: 'Tarde', machine: 'Selladora S-02', target: 15000, real: 4200, status: 'En Proceso', operator: 'Carlos Ruiz' },
    { id: 'OP-2024-004', product: 'Contenedores 500ml', presentation: 'Caja x 50', shift: 'Mañana', machine: 'Inyectora I-05', target: 8000, real: 2100, status: 'Detenido', operator: 'Roberto Diaz' },
]

const MACHINES = [
    { id: 'L1', name: 'Línea Extrusión 01', type: 'Extrusora', status: 'Activa', speed: 4500, efficiency: 92, temp: 185, oee: 88 },
    { id: 'L2', name: 'Línea Termoformado 04', type: 'Termoformado', status: 'Activa', speed: 2800, efficiency: 85, temp: 210, oee: 82 },
    { id: 'L3', name: 'Línea Sellado 02', type: 'Sellado', status: 'Mantenimiento', speed: 0, efficiency: 0, temp: 25, oee: 0 },
    { id: 'L4', name: 'Línea Inyección 05', type: 'Inyección', status: 'Parada', speed: 0, efficiency: 45, temp: 160, oee: 54 },
]

export default function ProduccionManufactura() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

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
                    <Button size="sm" className="bg-[#0f4c81] hover:bg-[#1a3a5a] text-white font-black uppercase tracking-tighter text-[10px]">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Orden
                    </Button>
                </div>
            </div>

            {/* Machine Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MACHINES.map((machine) => (
                    <motion.div
                        key={machine.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "p-5 bg-card rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl",
                            machine.status === 'Activa' ? "border-emerald-500/20 bg-emerald-50/10" :
                                machine.status === 'Parada' ? "border-red-500/20 bg-red-50/10" :
                                    "border-amber-500/20 bg-amber-50/10"
                        )}
                    >
                        {/* Status Glow */}
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 opacity-20",
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
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Velocidad</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-800 italic">{machine.speed} <span className="text-[10px] text-slate-400 not-italic">UDS/H</span></span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Eficiencia Turno</span>
                                        <span className={cn(
                                            machine.efficiency >= 85 ? "text-emerald-500" : machine.efficiency >= 60 ? "text-amber-500" : "text-red-500"
                                        )}>{machine.efficiency}%</span>
                                    </div>
                                    <Progress value={machine.efficiency} className="h-1.5" />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Thermometer className="h-3 w-3" /> Temp.
                                        </div>
                                        <span className="text-xs font-black text-slate-700 italic">{machine.temp}°C</span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-100 pl-2">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Zap className="h-3 w-3" /> OEE Act.
                                        </div>
                                        <span className="text-xs font-black text-[#0f4c81] italic">{machine.oee}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Estado</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {PRODUCTION_ORDERS.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
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
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (order.real / order.target) * 100)}%` }}
                                                        className={cn(
                                                            "h-full rounded-full",
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
                        <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-tighter italic">
                            Ajustar Mezcla
                        </Button>
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
                    <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative group cursor-pointer overflow-hidden">
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
                </div>
            </div>
        </div>
    )
}
