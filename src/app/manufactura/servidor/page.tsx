'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Server, Activity, Shield, Database,
    Wifi, Cpu, HardDrive, Zap, RefreshCw,
    Terminal, Lock, Globe, AlertCircle,
    CheckCircle2, Play, Settings, History,
    ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function AdministracionServidor() {
    const [status, setStatus] = useState<'online' | 'restarting' | 'syncing'>('online')
    const [uptime, setUptime] = useState('14d 06h 22m')
    const [stats, setStats] = useState({
        cpu: 12,
        ram: 44,
        disk: 68,
        temp: 42
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                cpu: Math.floor(Math.random() * 20) + 10,
                ram: 44 + (Math.random() * 2 - 1),
                disk: prev.disk,
                temp: 42 + (Math.random() * 4 - 2)
            }))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleRestart = () => {
        setStatus('restarting')
        setTimeout(() => setStatus('online'), 5000)
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0f4c81] rounded-2xl text-white shadow-lg">
                        <Server className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Administración Servidor Local</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Núcleo ERP Híbrido - Sincronizado con PROMPTIVE Cloud</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase italic transition-all",
                        status === 'online' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            status === 'restarting' ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                                "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                        <div className={cn("h-2 w-2 rounded-full", status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500")} />
                        {status === 'online' ? 'Servidor Operativo' : status === 'restarting' ? 'Reiniciando...' : 'Sincronizando'}
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Stats Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CPU & RAM */}
                    <div className="col-span-1 md:col-span-2 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Cpu className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Carga del Procesador</h3>
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-black italic tracking-tighter">{stats.cpu.toFixed(1)}%</span>
                                    <Badge className="bg-blue-500 text-white border-none font-black italic">OPTIMAL</Badge>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-400"
                                        animate={{ width: `${stats.cpu}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Zap className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Memoria RAM (16GB)</h3>
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-black italic tracking-tighter">{stats.ram.toFixed(1)}%</span>
                                    <Badge className="bg-emerald-500 text-white border-none font-black italic">HEALTHY</Badge>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-400"
                                        animate={{ width: `${stats.ram}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disk Usage */}
                    <div className="p-6 bg-white rounded-3xl border border-border shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-100 rounded-2xl text-slate-600">
                                <HardDrive className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Almacenamiento Local</p>
                                <p className="text-lg font-black italic text-slate-800 uppercase">SSD NVMe 512GB</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black italic">
                                <span>348 GB Usados</span>
                                <span className="text-slate-400">512 GB Total</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0f4c81] w-[68%]" />
                            </div>
                        </div>
                    </div>

                    {/* Connectivity */}
                    <div className="p-6 bg-white rounded-3xl border border-border shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                                <Globe className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ancho de Banda</p>
                                <p className="text-lg font-black italic text-slate-800 uppercase">Fibra Óptica 1Gbps</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Upload</p>
                                <p className="text-sm font-black italic text-emerald-600">842 Mbps</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Download</p>
                                <p className="text-sm font-black italic text-blue-600">920 Mbps</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls & Logs */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Actions */}
                    <div className="p-6 bg-white rounded-3xl border border-border shadow-xl">
                        <h3 className="text-xs font-black uppercase italic tracking-widest text-slate-800 mb-6 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-[#e8820c]" />
                            Acciones de Control
                        </h3>
                        <div className="space-y-3">
                            <Button
                                onClick={handleRestart}
                                disabled={status === 'restarting'}
                                className="w-full justify-start h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase italic tracking-[0.1em] gap-4 px-6"
                            >
                                <RefreshCw className={cn("h-5 w-5 text-amber-400", status === 'restarting' && "animate-spin")} />
                                Reiniciar Nodo Local
                            </Button>
                            <Button className="w-full justify-start h-14 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-2xl font-black text-[10px] uppercase italic tracking-[0.1em] gap-4 px-6">
                                <Database className="h-5 w-5 text-[#0f4c81]" />
                                Forzar Sincronización DB
                            </Button>
                            <Button className="w-full justify-start h-14 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-2xl font-black text-[10px] uppercase italic tracking-[0.1em] gap-4 px-6">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                Auditoría de Seguridad
                            </Button>
                        </div>
                    </div>

                    {/* Terminal / Logs */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[400px] flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-emerald-400" />
                                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Server Console (Read Only)</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-red-400/50" />
                                <div className="h-2 w-2 rounded-full bg-amber-400/50" />
                                <div className="h-2 w-2 rounded-full bg-emerald-400/50" />
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-4 font-mono text-[10px] text-emerald-500/80">
                            {[
                                `[${new Date().toLocaleTimeString()}] INFO: API Gateway initialized on port 8080`,
                                `[${new Date().toLocaleTimeString()}] INFO: Connecting to Local PostgreSQL Cluster...`,
                                `[${new Date().toLocaleTimeString()}] SUCCESS: Database connected (lat: 2ms)`,
                                `[${new Date().toLocaleTimeString()}] WARN: Redis cache missed for key: sales_sum_daily`,
                                `[${new Date().toLocaleTimeString()}] INFO: Starting CRM field agent sync worker`,
                                `[${new Date().toLocaleTimeString()}] INFO: Sincronización con Nube completada (42ms)`,
                                `[${new Date(Date.now() - 5000).toLocaleTimeString()}] INFO: Heartbeat sent to PROMPTIVE Cloud`,
                                `[${new Date(Date.now() - 10000).toLocaleTimeString()}] INFO: Checksum validation: OK`,
                                `[${new Date(Date.now() - 15000).toLocaleTimeString()}] INFO: Recibida orden de producción #OP-501`,
                                `[${new Date(Date.now() - 20000).toLocaleTimeString()}] INFO: Actualizando inventario local`,
                                `[${new Date(Date.now() - 25000).toLocaleTimeString()}] INFO: Backup programado iniciado...`,
                            ].map((log, i) => (
                                <div key={i} className="mb-1 leading-relaxed">
                                    <span className="opacity-50 tracking-tighter mr-2 italic">server:~$</span>
                                    {log}
                                </div>
                            ))}
                            {status === 'restarting' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-amber-400 font-bold mt-2"
                                >
                                    &gt; TERMINATING ACTIVE SESSIONS...
                                    <br />
                                    &gt; FLUSHING BUFFERS...
                                    <br />
                                    &gt; SYSTEM REBOOT INITIATED.
                                </motion.div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    )
}
