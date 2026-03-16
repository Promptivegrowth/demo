'use client'

import { motion } from 'framer-motion'
import {
    Factory, Users, Activity, ChevronLeft, ChevronRight,
    Calendar, AlertCircle, CheckCircle2, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CAPACIDAD_LINEAS = [
    { id: 'Línea A', type: 'Costura Polo', machines: 12, staff: 14, load: 85, status: 'alto' },
    { id: 'Línea B', type: 'Costura Pantalón', machines: 10, staff: 10, load: 45, status: 'bajo' },
    { id: 'Línea C', type: 'Acabado & Planchado', machines: 8, staff: 12, load: 92, status: 'critico' },
    { id: 'Línea D', type: 'Corte Programado', machines: 4, staff: 6, load: 70, status: 'normal' },
]

const WEEK_DAYS = ['Lunes 16', 'Martes 17', 'Miércoles 18', 'Jueves 19', 'Viernes 20']

const CALENDAR_DATA = [
    { dayIdx: 0, ot: 'OT-001', line: 'Línea A', qty: '200 pcs', status: 'done' },
    { dayIdx: 0, ot: 'OT-002', line: 'Línea B', qty: '150 pcs', status: 'done' },
    { dayIdx: 1, ot: 'OT-001', line: 'Línea A', qty: '200 pcs', status: 'done' },
    { dayIdx: 1, ot: 'OT-003', line: 'Línea C', qty: '100 pcs', status: 'doing' },
    { dayIdx: 2, ot: 'OT-004', line: 'Línea A', qty: '400 pcs', status: 'doing' },
    { dayIdx: 2, ot: 'OT-005', line: 'Línea D', qty: '180 pcs', status: 'todo' },
    { dayIdx: 3, ot: 'OT-004', line: 'Línea A', qty: '400 pcs', status: 'todo' },
    { dayIdx: 4, ot: 'OT-006', line: 'Línea B', qty: '320 pcs', status: 'todo' },
]

export default function PlaneacionPlanta() {
    return (
        <div className="space-y-8 pb-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                {/* Left: Capacidad Disponible */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Factory className="h-4 w-4 text-brand-purple" />
                            Capacidad / Líneas
                        </h2>
                        <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/5 px-2 py-0.5 rounded-full border border-brand-purple/10">Capacidad Real-Time</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {CAPACIDAD_LINEAS.map((line, i) => (
                            <motion.div
                                key={line.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:border-brand-purple/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-sm text-foreground">{line.id}</h3>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{line.type}</p>
                                    </div>
                                    <div className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                        line.status === 'critico' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            line.status === 'alto' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    )}>
                                        {line.status}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4 text-[11px] font-bold text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> {line.machines} Máquinas
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3 w-3" /> {line.staff} Operarios
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                        <span>Utilización</span>
                                        <span className={cn(line.load > 90 ? 'text-red-600 font-black' : 'text-foreground')}>{line.load}%</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${line.load}%` }}
                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                            className={cn("h-full rounded-full transition-colors",
                                                line.load > 90 ? 'bg-red-500' : line.load > 70 ? 'bg-amber-500' : 'bg-brand-purple'
                                            )}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-5 bg-brand-purple/5 border border-dashed border-brand-purple/30 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="h-4 w-4 text-brand-purple" />
                            <h4 className="text-xs font-black text-brand-purple uppercase tracking-tight">Sugerencia de Optimización</h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                            La **Línea C** está operando al límite. Considerar reasignar 2 operarios de la **Línea B** para equilibrar la carga de acabados y evitar cuellos de botella.
                        </p>
                    </div>
                </div>

                {/* Right: Calendario de Carga */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-brand-cyan" />
                            Cronograma Semanal de Planta
                        </h2>
                        <div className="flex gap-2">
                            <button className="p-1.5 rounded-lg border border-border hover:bg-card transition-all"><ChevronLeft className="h-4 w-4" /></button>
                            <button className="p-1.5 rounded-lg border border-border hover:bg-card transition-all"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 h-[600px]">
                        {WEEK_DAYS.map((day, dayIdx) => (
                            <div key={day} className="flex flex-col gap-3">
                                <div className="text-center py-2 px-3 bg-muted/40 rounded-xl border border-border/60">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block leading-tight">{day.split(' ')[0]}</span>
                                    <span className="text-xs font-bold text-foreground">{day.split(' ')[1]} MAR</span>
                                </div>
                                <div className="flex-1 bg-muted/20 border border-dashed border-border/40 rounded-2xl p-2 space-y-3 overflow-y-auto no-scrollbar">
                                    {CALENDAR_DATA.filter(d => d.dayIdx === dayIdx).map((task, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={cn(
                                                "p-3 rounded-xl border shadow-sm flex flex-col gap-2 relative group cursor-pointer",
                                                task.status === 'done' ? 'bg-emerald-50 border-emerald-100' :
                                                    task.status === 'doing' ? 'bg-brand-purple/5 border-brand-purple/10' :
                                                        'bg-card border-border'
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className={cn("text-[9px] font-black tracking-tighter uppercase",
                                                    task.status === 'done' ? 'text-emerald-700' :
                                                        task.status === 'doing' ? 'text-brand-purple' :
                                                            'text-muted-foreground'
                                                )}>{task.ot}</span>
                                                {task.status === 'done' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                {task.status === 'doing' && <div className="h-2 w-2 rounded-full bg-brand-purple animate-pulse" />}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-foreground group-hover:text-brand-purple transition-colors mb-0.5">{task.line}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase">{task.qty}</p>
                                            </div>
                                            <button className="absolute bottom-2 right-2 p-1 hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Carga vs Capacidad Chart Area (Placeholder styling) */}
            <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-brand-purple" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Proyección Carga vs Capacidad</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                            <div className="h-2 w-2 rounded-full bg-brand-purple" /> Capacidad Max
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                            <div className="h-2 w-2 rounded-full bg-brand-cyan" /> Carga Actual
                        </div>
                    </div>
                </div>
                <div className="h-48 flex items-end gap-12 px-8">
                    {CAPACIDAD_LINEAS.map((line, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                            <div className="w-full flex justify-center items-end gap-1.5 h-32 relative group">
                                <div className="w-4 h-full bg-muted/40 rounded-t-lg absolute top-0" />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${line.load}%` }}
                                    transition={{ duration: 1.2, delay: 0.8 }}
                                    className={cn("w-4 bg-brand-cyan/40 rounded-t-lg z-10 transition-all group-hover:bg-brand-cyan",
                                        line.load > 90 && 'bg-red-400'
                                    )}
                                />
                                <div className="w-4 h-[100%] border-t-2 border-brand-purple/30 absolute top-0 z-0" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{line.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
