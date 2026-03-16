import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Factory, Users, Activity, ChevronLeft, ChevronRight,
    Calendar, AlertCircle, CheckCircle2, MoreHorizontal, X, Info,
    Clock, Tag, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const CAPACIDAD_LINEAS = [
    { id: 'Línea A', type: 'Costura Polo', machines: 12, staff: 14, load: 85, status: 'alto' },
    { id: 'Línea B', type: 'Costura Pantalón', machines: 10, staff: 10, load: 45, status: 'bajo' },
    { id: 'Línea C', type: 'Acabado & Planchado', machines: 8, staff: 12, load: 92, status: 'critico' },
    { id: 'Línea D', type: 'Corte Programado', machines: 4, staff: 6, load: 70, status: 'normal' },
]

const WEEK_DAYS = ['Lunes 16', 'Martes 17', 'Miércoles 18', 'Jueves 19', 'Viernes 20']

const CALENDAR_DATA = [
    { dayIdx: 0, ot: 'OT-2026-001', line: 'Línea A', qty: '200 pcs', status: 'done', manager: 'Ricardo L.', start: '08:00 AM', end: '05:00 PM' },
    { dayIdx: 0, ot: 'OT-2026-002', line: 'Línea B', qty: '150 pcs', status: 'done', manager: 'Ana G.', start: '08:30 AM', end: '04:00 PM' },
    { dayIdx: 1, ot: 'OT-2026-001', line: 'Línea A', qty: '200 pcs', status: 'done', manager: 'Ricardo L.', start: '08:00 AM', end: '05:00 PM' },
    { dayIdx: 1, ot: 'OT-2026-003', line: 'Línea C', qty: '100 pcs', status: 'doing', manager: 'Carlos M.', start: '07:00 AM', end: '06:00 PM' },
    { dayIdx: 2, ot: 'OT-2026-004', line: 'Línea A', qty: '400 pcs', status: 'doing', manager: 'Ricardo L.', start: '08:00 AM', end: '08:00 PM' },
    { dayIdx: 2, ot: 'OT-2026-005', line: 'Línea D', qty: '180 pcs', status: 'todo', manager: 'Elena P.', start: '09:00 AM', end: '03:00 PM' },
    { dayIdx: 3, ot: 'OT-2026-004', line: 'Línea A', qty: '400 pcs', status: 'todo', manager: 'Ricardo L.', start: '08:00 AM', end: '08:00 PM' },
    { dayIdx: 4, ot: 'OT-2026-006', line: 'Línea B', qty: '320 pcs', status: 'todo', manager: 'Ana G.', start: '08:30 AM', end: '05:30 PM' },
]

export default function PlaneacionPlanta() {
    const [selectedTask, setSelectedTask] = useState<any>(null)

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
                                className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:border-brand-purple/30 transition-all cursor-default"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-sm text-foreground">{line.id}</h3>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{line.type}</p>
                                    </div>
                                    <div className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                        line.status === 'critico' ? 'bg-red-50 text-red-600 border-red-100' :
                                            line.status === 'alto' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
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
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
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

                    <div className="rounded-2xl overflow-hidden border border-border h-40 relative group">
                        <img
                            src="/textil/production_line.png"
                            alt="Production Line"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                        <div className="absolute bottom-3 left-4">
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Vista de Planta Sector A</span>
                        </div>
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
                            <button className="p-1.5 rounded-lg border border-border hover:bg-card transition-all shadow-sm active:scale-95"><ChevronLeft className="h-4 w-4" /></button>
                            <button className="p-1.5 rounded-lg border border-border hover:bg-card transition-all shadow-sm active:scale-95"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 h-[620px]">
                        {WEEK_DAYS.map((day, dayIdx) => (
                            <div key={day} className="flex flex-col gap-3">
                                <div className="text-center py-2.5 px-3 bg-muted/40 rounded-xl border border-border/60">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block leading-tight">{day.split(' ')[0]}</span>
                                    <span className="text-xs font-black text-foreground">{day.split(' ')[1]} MAR</span>
                                </div>
                                <div className="flex-1 bg-muted/20 border border-dashed border-border/40 rounded-2xl p-2 space-y-4 overflow-y-auto no-scrollbar shadow-inner">
                                    {CALENDAR_DATA.filter(d => d.dayIdx === dayIdx).map((task, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => setSelectedTask(task)}
                                            className={cn(
                                                "p-3 rounded-xl border shadow-sm flex flex-col gap-2 relative group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                                                task.status === 'done' ? 'bg-emerald-50 border-emerald-100' :
                                                    task.status === 'doing' ? 'bg-brand-purple/5 border-brand-purple/10' :
                                                        'bg-card border-border'
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className={cn("text-[10px] font-black tracking-tighter uppercase",
                                                    task.status === 'done' ? 'text-emerald-700' :
                                                        task.status === 'doing' ? 'text-brand-purple' :
                                                            'text-muted-foreground'
                                                )}>{task.ot}</span>
                                                {task.status === 'done' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                {task.status === 'doing' && <div className="h-2 w-2 rounded-full bg-brand-purple animate-pulse" />}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-foreground group-hover:text-brand-purple transition-colors">{task.line}</p>
                                                <p className="text-[11px] font-black text-muted-foreground uppercase opacity-80">{task.qty}</p>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="h-1 flex-1 bg-muted/50 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", task.status === 'done' ? 'bg-emerald-500 w-full' : task.status === 'doing' ? 'bg-brand-purple w-1/2' : 'w-0')} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTask(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:ml-[256px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-3xl z-[60] shadow-2xl p-8 lg:ml-[128px]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-black text-brand-purple tracking-tighter uppercase">{selectedTask.ot}</h2>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase border",
                                            selectedTask.status === 'done' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                selectedTask.status === 'doing' ? "bg-brand-purple/10 text-brand-purple border-brand-purple/20" :
                                                    "bg-muted text-muted-foreground border-border")}>
                                            {selectedTask.status === 'done' ? 'Completado' : selectedTask.status === 'doing' ? 'En Proceso' : 'Pendiente'}
                                        </span>
                                    </div>
                                    <p className="text-foreground font-black text-lg">{selectedTask.line}</p>
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="p-2.5 hover:bg-muted border border-border rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                        <Clock className="h-4 w-4 text-brand-cyan mb-2" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70">Horario</p>
                                        <p className="text-sm font-bold">{selectedTask.start} - {selectedTask.end}</p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                        <Layers className="h-4 w-4 text-brand-purple mb-2" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70">Cantidad</p>
                                        <p className="text-sm font-bold">{selectedTask.qty}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-4 w-4 text-brand-purple" />
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Responsable de Turno</p>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl">
                                        <div className="h-10 w-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-black uppercase shadow-inner">
                                            {selectedTask.manager[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{selectedTask.manager}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Supervisor de Planta</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Info className="h-4 w-4 text-brand-purple" />
                                        <span className="text-[10px] font-black uppercase text-brand-purple tracking-widest">Observaciones</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed">
                                        "Priorizar control de costuras en hombros para esta partida de Polo Pima. Reportar avance cada 2 horas al supervisor."
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button className="flex-1 py-3.5 border border-border rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-muted transition-all">Ver OT Completa</button>
                                    <button className="flex-1 py-3.5 bg-brand-purple text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-all">Ajustar Tarea</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Proyección Chart Area */}
            <div className="p-8 bg-card rounded-3xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                            <Activity className="h-5 w-5 text-brand-purple" />
                            Proyección Carga vs Capacidad
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter opacity-70">Basado en órdenes activas y capacidad instalada</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <div className="h-3 w-3 rounded-full bg-brand-purple shadow-sm" /> Capacidad Max
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <div className="h-3 w-3 rounded-full bg-brand-cyan shadow-sm" /> Carga Actual
                        </div>
                    </div>
                </div>
                <div className="h-56 flex items-end gap-16 px-12">
                    {CAPACIDAD_LINEAS.map((line, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full flex justify-center items-end gap-1.5 h-36 relative">
                                <div className="w-5 h-full bg-muted shadow-inner rounded-t-xl absolute top-0 opacity-50" />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${line.load}%` }}
                                    transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                                    className={cn("w-5 bg-brand-cyan rounded-t-xl z-10 transition-all shadow-lg",
                                        line.load > 90 ? 'bg-red-400' : 'group-hover:bg-brand-purple'
                                    )}
                                />
                                <div className="w-8 h-[2px] bg-brand-purple/40 absolute top-0 z-0 border-t border-dashed border-brand-purple" />
                            </div>
                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em]">{line.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
