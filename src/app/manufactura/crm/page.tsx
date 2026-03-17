'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Smartphone, MapPin, Users, Navigation,
    Search, ShoppingBag, CreditCard, CheckCircle2,
    Clock, AlertTriangle, Phone, Mail,
    ArrowRight, Map as MapIcon, Filter, Layers,
    Plus, DollarSign, Calendar, ChevronRight,
    Wifi, Battery, Signal, ArrowLeft, Home,
    User, Menu, Send, Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

// --- MOCK DATA ---
const SALES_REPS = [
    { id: 'V-01', name: 'Alvaro Mendoza', status: 'En Ruta', battery: 85, signal: '4G', location: 'Surco, Lima', progress: 65, sales: 'S/ 4,200', visits: '8/12' },
    { id: 'V-02', name: 'Claudia Torres', status: 'En Ruta', battery: 42, signal: '3G', location: 'Independencia, Lima', progress: 40, sales: 'S/ 2,850', visits: '5/12' },
    { id: 'V-03', name: 'Roberto Sanchez', status: 'Desconectado', battery: 0, signal: 'No service', location: 'Planta', progress: 0, sales: 'S/ 0', visits: '0/12' },
]

const CUSTOMERS_IN_ROUTE = [
    { id: 'C-101', name: 'Bodega Don Pepe', address: 'Av. El Sol 123', status: 'Pendiente', debt: 'S/ 450.00', time: '10:30 AM', coords: { x: 45, y: 35 } },
    { id: 'C-102', name: 'Minimakt "La Estrella"', address: 'Jr. Luna Pizarro 456', status: 'Visitado', debt: 'S/ 0.00', time: '09:15 AM', coords: { x: 65, y: 55 } },
    { id: 'C-103', name: 'Restaurante El Sabor', address: 'Av. Larco 789', status: 'Pendiente', debt: 'S/ 1,200.00', time: '11:45 AM', coords: { x: 30, y: 75 } },
]

export default function CRMDeCampo() {
    const [viewMode, setViewMode] = useState<'supervisor' | 'mobile'>('supervisor')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [visitStatus, setVisitStatus] = useState<'idle' | 'started' | 'checkout'>('idle')
    const [reps, setReps] = useState(SALES_REPS)
    const [selectedRep, setSelectedRep] = useState<string | null>(null)
    const [activities, setActivities] = useState<any[]>([
        { id: 1, type: 'order', rep: 'Alvaro M.', client: 'Bodega Don Pepe', amount: 'S/ 450.00', time: '10:45 AM' },
        { id: 2, type: 'payment', rep: 'Claudia T.', client: 'Minimarkt Estrella', amount: 'S/ 1,200.00', time: '10:12 AM' },
        { id: 3, type: 'visit', rep: 'Alvaro M.', client: 'Rest. Sabor Peruano', amount: 'Sin Pedido', time: '09:55 AM' },
    ])

    // Mobile App internal state
    const [mobileScreen, setMobileScreen] = useState<'home' | 'catalog' | 'visit' | 'clients' | 'collection'>('home')
    const [mobileCart, setMobileCart] = useState<any[]>([])


    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)

        const activityInterval = setInterval(() => {
            const types = ['order', 'payment', 'visit']
            const type = types[Math.floor(Math.random() * types.length)]
            const rep = reps[Math.floor(Math.random() * reps.length)]
            const amount = type === 'order' ? `S/ ${(Math.random() * 500 + 100).toFixed(2)}` : type === 'payment' ? `S/ ${(Math.random() * 1000).toFixed(2)}` : 'Sin Pedido'

            const newAct = {
                id: Date.now(),
                type,
                rep: rep.name.split(' ')[0] + '.',
                client: ['Bodega Sol', 'Market Gloria', 'Ferretería Lima', 'Rest. Marino'][Math.floor(Math.random() * 4)],
                amount,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setActivities(prev => [newAct, ...prev].slice(0, 10))
        }, 8000)

        return () => {
            clearInterval(timer)
            clearInterval(activityInterval)
        }
    }, [reps])

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#e8820c] rounded-2xl text-white shadow-lg">
                        <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">CRM de Campo & App Móvil</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Sincronización en tiempo real con la fuerza de ventas</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('supervisor')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic",
                            viewMode === 'supervisor' ? "bg-white text-[#0f4c81] shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        Vista Supervisor
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic",
                            viewMode === 'mobile' ? "bg-white text-[#e8820c] shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        Simulación App Móvil
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'supervisor' ? (
                    <motion.div
                        key="supervisor"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Map & Tracking Area */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="relative aspect-video bg-indigo-950 rounded-3xl overflow-hidden border border-border shadow-2xl group">
                                {/* Interactive Map Simulation (Lima) */}
                                <div className="absolute inset-0 p-8 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

                                <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full p-4">
                                    {/* Simplified Lima Districts Shapes */}
                                    <path d="M400,100 L450,150 L420,200 L380,180 Z" fill="#1e293b" stroke="#334155" />
                                    <path d="M450,150 L500,180 L480,250 L420,200 Z" fill="#0f172a" stroke="#334155" />
                                    <path d="M380,180 L420,200 L400,280 L320,250 Z" fill="#1e293b" stroke="#334155" />
                                    <path d="M420,200 L480,250 L440,320 L400,280 Z" fill="#0f4c81" fillOpacity="0.4" stroke="#334155" />
                                    <path d="M320,250 L400,280 L350,380 L280,320 Z" fill="#1e293b" stroke="#334155" />

                                    {/* Main Avenues Animation */}
                                    <path d="M200,50 Q400,150 600,400" fill="none" stroke="#e8820c" strokeWidth="1" strokeDasharray="4,4" className="animate-[dash_20s_linear_infinite]" />
                                    <path d="M100,400 Q400,200 700,50" fill="none" stroke="#0f4c81" strokeWidth="1" strokeDasharray="4,4" className="animate-[dash_20s_linear_infinite_reverse]" />
                                </svg>

                                <style jsx>{`
                                    @keyframes dash {
                                        to { stroke-dashoffset: -100; }
                                    }
                                    @keyframes radar {
                                        0% { transform: scale(0.1); opacity: 1; }
                                        100% { transform: scale(2.5); opacity: 0; }
                                    }
                                `}</style>

                                {/* Radar Ripples */}
                                {reps.filter(r => r.status === 'En Ruta').map((rep, idx) => (
                                    <div
                                        key={`radar-${rep.id}`}
                                        className="absolute h-20 w-20 pointer-events-none"
                                        style={{
                                            left: `calc(${idx * 150 + 200}px - 40px)`,
                                            top: `calc(${idx * 80 + 150}px - 40px)`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-[radar_3s_ease-out_infinite]" />
                                        <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-[radar_3s_ease-out_1.5s_infinite]" />
                                    </div>
                                ))}

                                {/* Markers for Customers */}
                                {CUSTOMERS_IN_ROUTE.map((c) => (
                                    <motion.div
                                        key={c.id}
                                        className="absolute cursor-pointer group/pin"
                                        style={{ left: `${c.coords.x}%`, top: `${c.coords.y}%` }}
                                        whileHover={{ scale: 1.2 }}
                                        onClick={() => toast.info(`Cliente: ${c.name}`, {
                                            description: `Estado: ${c.status} | Deuda: ${c.debt}`
                                        })}
                                    >
                                        <div className={cn(
                                            "relative h-5 w-5 flex items-center justify-center",
                                            c.status === 'Visitado' ? "text-emerald-500" : "text-white/40 group-hover/pin:text-white"
                                        )}>
                                            <MapPin className="h-full w-full" />
                                            {c.status === 'Pendiente' && (
                                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-indigo-950" />
                                            )}
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 border border-white/10 p-2 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                                            <p className="text-[9px] font-black uppercase text-white">{c.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400">{c.status} - {c.time}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Vendor Live Tracker Pins */}
                                {reps.filter(r => r.status === 'En Ruta').map((rep, idx) => (
                                    <motion.div
                                        key={rep.id}
                                        className={cn(
                                            "absolute p-1 bg-white rounded-full shadow-2xl border-2 z-30 cursor-pointer",
                                            selectedRep === rep.id ? "border-emerald-500 scale-125" : "border-[#e8820c]"
                                        )}
                                        initial={{ x: idx * 150 + 200, y: idx * 80 + 150 }}
                                        animate={{
                                            x: idx * 150 + 200 + (Math.sin(Date.now() / 2000) * 10),
                                            y: idx * 80 + 150 + (Math.cos(Date.now() / 2000) * 10)
                                        }}
                                        onClick={() => setSelectedRep(rep.id === selectedRep ? null : rep.id)}
                                    >
                                        <div className="h-6 w-6 rounded-full bg-[#0f4c81] flex items-center justify-center text-white">
                                            <Navigation className="h-3 w-3 rotate-45" />
                                        </div>
                                        <AnimatePresence>
                                            {(selectedRep === rep.id || true) && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="absolute top-0 left-full ml-2 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap"
                                                >
                                                    <p className="text-[10px] font-black uppercase italic text-[#0f4c81]">{rep.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] p-0 px-1 font-black">{rep.progress}% OK</Badge>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{rep.location}</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}

                                {/* Map Overlay Controls */}
                                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                                    <div className="flex bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10 rounded-xl"><Layers className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-[#e8820c] hover:bg-white/10 rounded-xl"><MapIcon className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-500/30">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-400 uppercase italic">3 Vendedores Activos</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Rep Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {SALES_REPS.map(rep => (
                                    <div
                                        key={rep.id}
                                        className={cn(
                                            "p-5 bg-card rounded-3xl border transition-all group cursor-pointer",
                                            selectedRep === rep.id ? "border-emerald-500 shadow-xl scale-[1.02]" : "border-border shadow-sm hover:shadow-md"
                                        )}
                                        onClick={() => setSelectedRep(rep.id === selectedRep ? null : rep.id)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden group-hover:border-[#e8820c] transition-all">
                                                    <User className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black italic text-slate-800 uppercase leading-none mb-1">{rep.name}</h3>
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase italic border-none h-4 px-1.5",
                                                        rep.status === 'En Ruta' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        {rep.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Signal className="h-3 w-3 text-slate-300" />
                                                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                                                    <Battery className="h-3 w-3" /> {rep.battery}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-slate-400 uppercase">Visitas</span>
                                                <span className="text-slate-800 italic">{rep.visits}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${rep.progress}%` }}
                                                    className="h-full bg-[#0f4c81]"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-slate-400 uppercase">Venta Acum.</span>
                                                <span className="text-[#0f4c81] italic font-black">{rep.sales}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" className="flex-1 h-8 text-[8px] font-black uppercase italic text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50">
                                                    WhatsApp
                                                </Button>
                                                <Button variant="ghost" className="flex-1 h-8 text-[8px] font-black uppercase italic text-[#e8820c] bg-[#e8820c]/5 hover:bg-[#e8820c]/10">
                                                    Ver Ruta
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="lg:col-span-4 bg-white rounded-3xl border border-border shadow-xl flex flex-col">
                            <div className="p-6 border-b border-border bg-slate-50/50">
                                <h3 className="font-black text-sm text-slate-800 uppercase italic tracking-widest flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#e8820c]" />
                                    Actividad en Tiempo Real
                                </h3>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    <AnimatePresence initial={false}>
                                        {activities.map((act) => (
                                            <motion.div
                                                key={act.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex gap-4 group"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-xl flex items-center justify-center shadow-sm transition-all duration-500",
                                                        act.type === 'order' ? 'bg-[#0f4c81] text-white' :
                                                            act.type === 'payment' ? 'bg-emerald-500 text-white' :
                                                                'bg-amber-500 text-white animate-pulse'
                                                    )}>
                                                        {act.type === 'order' ? <ShoppingBag className="h-4 w-4" /> :
                                                            act.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                                                                <MapPin className="h-4 w-4" />}
                                                    </div>
                                                    <div className="w-[2px] flex-1 bg-slate-100 group-last:hidden" />
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-xs font-black text-slate-800 uppercase italic">{act.client}</h4>
                                                        <span className="text-[9px] font-bold text-slate-400">{act.time}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium">Por <span className="text-[#e8820c] font-black italic">{act.rep}</span></p>
                                                    <div className={cn(
                                                        "inline-block mt-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase italic shadow-sm",
                                                        act.type === 'order' ? 'bg-[#0f4c81]/10 text-[#0f4c81]' :
                                                            act.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                                                'bg-amber-100 text-amber-600'
                                                    )}>
                                                        {act.amount}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="mobile"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-center py-4"
                    >
                        {/* iPhone Simulation Container */}
                        <div className="relative w-[340px] h-[680px] bg-slate-800 rounded-[60px] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.4)] border-[8px] border-slate-900 overflow-hidden ring-4 ring-slate-100/50">
                            {/* Inner Screen */}
                            <div className="relative w-full h-full bg-white rounded-[45px] overflow-hidden flex flex-col border border-slate-200 shadow-inner">

                                {/* Status Bar */}
                                <div className="h-10 bg-white px-8 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-800 tracking-tighter italic">10:45 AM</span>
                                    <div className="flex items-center gap-2">
                                        <Signal className="h-3 w-3 text-slate-800 fill-slate-800" />
                                        <Wifi className="h-3 w-3 text-slate-800" />
                                        <Battery className="h-3 w-3 text-slate-800 rotate-90" />
                                    </div>
                                </div>

                                {/* App UI Header */}
                                <div className="bg-[#0f4c81] p-6 text-white">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                            <Menu className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Promptive</h2>
                                            <h3 className="text-sm font-black italic tracking-tighter">FIELD SALES</h3>
                                        </div>
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                            <User className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/5">
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black uppercase text-white/50 mb-1">Hola, Alvaro</p>
                                            <p className="text-xs font-black italic tracking-tight">Tu meta de hoy: S/ 8,000</p>
                                        </div>
                                        <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                                            <Wifi className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* App UI Scroll Content */}
                                <ScrollArea className="flex-1 -mt-4 bg-slate-50 rounded-t-[30px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
                                    <div className="p-6 space-y-6">
                                        <AnimatePresence mode="wait">
                                            {mobileScreen === 'home' ? (
                                                <motion.div key="h" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                                    {/* Quick Search */}
                                                    <div className="relative">
                                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <Input placeholder="Buscar cliente..." className="pl-12 h-12 bg-white border-none rounded-2xl shadow-sm text-xs italic font-medium" />
                                                    </div>

                                                    {/* Current Visit */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4 px-1">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8820c]">Próxima Parada</h4>
                                                            <span className="text-[9px] font-black text-slate-400 italic">4 min • 1.2 km</span>
                                                        </div>
                                                        <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-4 relative overflow-hidden group active:scale-95 transition-transform cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-12 w-12 bg-[#e8820c]/10 rounded-2xl flex items-center justify-center text-[#e8820c]">
                                                                    <MapPin className="h-6 w-6" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="text-sm font-black italic text-slate-800 uppercase leading-none mb-1">Bodega Don Pepe</h5>
                                                                    <p className="text-[10px] text-slate-400 font-medium">Av. El Sol 123, Surco</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black text-[10px] uppercase italic tracking-widest gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setVisitStatus('started');
                                                                    setMobileScreen('visit');
                                                                    toast.success("Visita Iniciada", { description: "Ubicación GPS registrada." });
                                                                }}
                                                            >
                                                                Iniciar Visita
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button onClick={() => setMobileScreen('collection')} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-left active:scale-95 transition-all">
                                                            <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-3">
                                                                <CreditCard className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-lg font-black italic text-slate-800 leading-none">S/ 4,200</p>
                                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Cobros Hoy</p>
                                                        </button>
                                                        <button onClick={() => setMobileScreen('catalog')} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-left active:scale-95 transition-all">
                                                            <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
                                                                <ShoppingBag className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-lg font-black italic text-slate-800 leading-none">23</p>
                                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Pedidos</p>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : mobileScreen === 'visit' ? (
                                                <motion.div key="v" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                                    <Button variant="ghost" size="sm" className="mb-2 p-0 h-8 font-black uppercase italic text-[10px]" onClick={() => setMobileScreen('home')}>
                                                        <ArrowLeft className="h-4 w-4 mr-2" /> Atrás a Inicio
                                                    </Button>
                                                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-2 border-emerald-500 flex flex-col gap-6">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                                                                    <Clock className="h-5 w-5 animate-pulse" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-xs font-black uppercase italic text-slate-800">Parada Activa</h5>
                                                                    <p className="text-[10px] text-emerald-600 font-bold italic">Tiempo: 04:12</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <Button className="h-16 bg-white border border-slate-200 text-[#0f4c81] rounded-2xl flex justify-between items-center px-6 shadow-sm group" onClick={() => setMobileScreen('catalog')}>
                                                                <div className="flex items-center gap-3">
                                                                    <ShoppingBag className="h-5 w-5" />
                                                                    <span className="text-[10px] font-black uppercase italic">Levantar Pedido</span>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 opacity-30" />
                                                            </Button>
                                                            <Button className="h-16 bg-white border border-slate-200 text-emerald-600 rounded-2xl flex justify-between items-center px-6 shadow-sm" onClick={() => setMobileScreen('collection')}>
                                                                <div className="flex items-center gap-3">
                                                                    <DollarSign className="h-5 w-5" />
                                                                    <span className="text-[10px] font-black uppercase italic">Registrar Cobro</span>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 opacity-30" />
                                                            </Button>
                                                        </div>
                                                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-black text-[10px] uppercase italic tracking-widest" onClick={() => {
                                                            setVisitStatus('idle');
                                                            setMobileScreen('home');
                                                            toast.success("Visita Finalizada", { description: "Datos sincronizados con planta." });
                                                        }}>
                                                            Finalizar Parada
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ) : mobileScreen === 'catalog' ? (
                                                <motion.div key="c" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Button variant="ghost" size="sm" className="p-0 h-8 font-black uppercase italic text-[10px]" onClick={() => setMobileScreen('home')}>
                                                            <ArrowLeft className="h-4 w-4 mr-2" /> Catalogo
                                                        </Button>
                                                        <div className="h-8 w-8 bg-[#0f4c81] rounded-full flex items-center justify-center relative">
                                                            <ShoppingBag className="h-4 w-4 text-white" />
                                                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-[#e8820c] rounded-full text-[8px] flex items-center justify-center font-black">2</div>
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-3">
                                                        {['Vaso PP 12oz', 'Vaso PP 16oz', 'Plato PET 9"', 'Cubierto Eco'].map((p, i) => (
                                                            <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-border shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                                                                    <div>
                                                                        <h5 className="text-[10px] font-black uppercase italic text-slate-800 leading-none mb-1">{p}</h5>
                                                                        <p className="text-[9px] font-bold text-[#0f4c81]">S/ {(i + 1) * 0.15}</p>
                                                                    </div>
                                                                </div>
                                                                <Button size="icon" className="h-8 w-8 rounded-lg bg-[#0f4c81] hover:bg-[#e8820c]"><Plus className="h-4 w-4" /></Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>

                                {/* System Bottom Nav (iOS) */}
                                <div className="h-20 bg-white border-t border-slate-100 px-8 flex items-center justify-between pb-4">
                                    <button onClick={() => setMobileScreen('home')}><Home className={cn("h-6 w-6 transition-colors", mobileScreen === 'home' ? "text-[#0f4c81] fill-[#0f4c81]/10" : "text-slate-300")} /></button>
                                    <button onClick={() => setMobileScreen('clients')}><Users className={cn("h-6 w-6 transition-colors", mobileScreen === 'clients' ? "text-[#0f4c81]" : "text-slate-300")} /></button>
                                    <div className="h-12 w-12 bg-[#e8820c] rounded-2xl flex items-center justify-center text-white shadow-xl -mt-10 ring-4 ring-white active:scale-90 transition-transform">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <button onClick={() => setMobileScreen('catalog')}><ShoppingBag className={cn("h-6 w-6 transition-colors", mobileScreen === 'catalog' ? "text-[#0f4c81]" : "text-slate-300")} /></button>
                                    <button onClick={() => setMobileScreen('collection')}><DollarSign className={cn("h-6 w-6 transition-colors", mobileScreen === 'collection' ? "text-[#0f4c81]" : "text-slate-300")} /></button>
                                </div>
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-100 rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
