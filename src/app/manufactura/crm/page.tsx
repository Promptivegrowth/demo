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

// --- MOCK DATA ---
const SALES_REPS = [
    { id: 'V-01', name: 'Alvaro Mendoza', status: 'En Ruta', battery: 85, signal: '4G', location: 'Surco, Lima', progress: 65, sales: 'S/ 4,200', visits: '8/12' },
    { id: 'V-02', name: 'Claudia Torres', status: 'En Ruta', battery: 42, signal: '3G', location: 'Independencia, Lima', progress: 40, sales: 'S/ 2,850', visits: '5/12' },
    { id: 'V-03', name: 'Roberto Sanchez', status: 'Desconectado', battery: 0, signal: 'No service', location: 'Planta', progress: 0, sales: 'S/ 0', visits: '0/12' },
]

const CUSTOMERS_IN_ROUTE = [
    { id: 'C-101', name: 'Bodega Don Pepe', address: 'Av. El Sol 123', status: 'Pendiente', debt: 'S/ 450.00', time: '10:30 AM' },
    { id: 'C-102', name: 'Minimakt "La Estrella"', address: 'Jr. Luna Pizarro 456', status: 'Visitado', debt: 'S/ 0.00', time: '09:15 AM' },
    { id: 'C-103', name: 'Restaurante El Sabor', address: 'Av. Larco 789', status: 'Pendiente', debt: 'S/ 1,200.00', time: '11:45 AM' },
]

export default function CRMDeCampo() {
    const [viewMode, setViewMode] = useState<'supervisor' | 'mobile'>('supervisor')
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

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
                            <div className="relative aspect-video bg-slate-200 rounded-3xl overflow-hidden border border-border shadow-inner group">
                                {/* Map Simulation Background */}
                                <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-40 mix-blend-multiply flex flex-wrap gap-8 p-12 overflow-hidden pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-1000">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="h-32 w-32 border border-slate-300 rounded-xl" />
                                        ))}
                                    </div>
                                    <MapIcon className="h-24 w-24 text-slate-300" />
                                </div>

                                {/* Tracking Pins */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute top-1/3 left-1/2 p-1 bg-white rounded-full shadow-2xl border-2 border-emerald-500 z-10"
                                >
                                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                        <Navigation className="h-4 w-4" />
                                    </div>
                                    <div className="absolute top-0 left-full ml-2 bg-white p-2 rounded-lg shadow-xl border border-border whitespace-nowrap">
                                        <p className="text-[10px] font-black uppercase italic text-slate-800">Alvaro Mendoza</p>
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase">En Movimiento - 45 km/h</p>
                                    </div>
                                </motion.div>

                                <div className="absolute top-1/2 left-1/4 p-1 bg-white rounded-full shadow-2xl border-2 border-[#e8820c] z-10">
                                    <div className="h-8 w-8 rounded-full bg-[#e8820c] flex items-center justify-center text-white">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div className="absolute top-0 left-full ml-2 bg-white p-2 rounded-lg shadow-xl border border-border whitespace-nowrap">
                                        <p className="text-[10px] font-black uppercase italic text-slate-800">Claudia Torres</p>
                                        <p className="text-[8px] font-bold text-[#e8820c] uppercase">Visitando: Bodega Juanita</p>
                                    </div>
                                </div>

                                {/* Map Controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <Button size="icon" className="bg-white/90 backdrop-blur-md text-slate-600 border border-border shadow-lg">
                                        <Layers className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" className="bg-white/90 backdrop-blur-md text-slate-600 border border-border shadow-lg">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Real-time Feed Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center justify-between text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Live Dashboard Supervisor</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black italic tracking-tighter">S/ 12,450</span>
                                            <span className="text-[8px] font-bold uppercase text-white/60">Ventas Hoy</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black italic tracking-tighter">84%</span>
                                            <span className="text-[8px] font-bold uppercase text-white/60">Cobertura Ruta</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Rep Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {SALES_REPS.map(rep => (
                                    <div key={rep.id} className="p-5 bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group">
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
                                            <Button variant="ghost" className="w-full mt-2 h-8 text-[9px] font-black uppercase italic text-[#e8820c] hover:bg-[#e8820c]/5 group/btn">
                                                Llamar a Vendedor
                                                <Phone className="h-3 w-3 ml-2 group-hover/btn:rotate-12 transition-transform" />
                                            </Button>
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
                                    {[
                                        { type: 'order', rep: 'Alvaro M.', client: 'Bodega Don Pepe', amount: 'S/ 450.00', time: '10:45 AM' },
                                        { type: 'payment', rep: 'Claudia T.', client: 'Minimarkt Estrella', amount: 'S/ 1,200.00', time: '10:12 AM' },
                                        { type: 'visit', rep: 'Alvaro M.', client: 'Rest. Sabor Peruano', amount: 'Sin Pedido', time: '09:55 AM' },
                                        { type: 'order', rep: 'Alvaro M.', client: 'Dist. Veloz', amount: 'S/ 2,800.00', time: '09:30 AM' },
                                        { type: 'payment', rep: 'Claudia T.', client: 'Bodega El Sol', amount: 'S/ 300.00', time: '09:12 AM' },
                                    ].map((act, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center shadow-sm",
                                                    act.type === 'order' ? 'bg-[#0f4c81] text-white' :
                                                        act.type === 'payment' ? 'bg-emerald-500 text-white' :
                                                            'bg-amber-500 text-white'
                                                )}>
                                                    {act.type === 'order' ? <ShoppingBag className="h-4 w-4" /> :
                                                        act.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                                                            <MapPin className="h-4 w-4" />}
                                                </div>
                                                {i < 4 && <div className="w-[2px] flex-1 bg-slate-100 group-last:hidden" />}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-xs font-black text-slate-800 uppercase italic">{act.client}</h4>
                                                    <span className="text-[9px] font-bold text-slate-400">{act.time}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium">Realizado por <span className="text-[#e8820c] font-black italic">{act.rep}</span></p>
                                                <div className={cn(
                                                    "inline-block mt-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase italic",
                                                    act.type === 'order' ? 'bg-[#0f4c81]/10 text-[#0f4c81]' :
                                                        act.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-amber-100 text-amber-600'
                                                )}>
                                                    {act.amount}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10">
                                                    <Navigation className="h-16 w-16 text-[#e8820c]" />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-[#e8820c]/10 rounded-2xl flex items-center justify-center text-[#e8820c]">
                                                        <MapPin className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="text-sm font-black italic text-slate-800 uppercase leading-none mb-1">Bodega Don Pepe</h5>
                                                        <p className="text-[10px] text-slate-400 font-medium">Av. El Sol 123, Surco</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-slate-300" />
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Badge className="bg-red-50 text-red-500 border-none font-black text-[8px] uppercase tracking-tighter h-6 px-3">Deuda: S/ 450</Badge>
                                                    <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] uppercase tracking-tighter h-6 px-3">Cat: Gold</Badge>
                                                </div>
                                                <Button className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-12 font-black text-[10px] uppercase italic tracking-widest gap-2">
                                                    Iniciar Visita
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Dashboard Stats (App style) */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                                                <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-3">
                                                    <CreditCard className="h-5 w-5" />
                                                </div>
                                                <p className="text-lg font-black italic text-slate-800 leading-none">S/ 4,200</p>
                                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Cobros Hoy</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                                                <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
                                                    <ShoppingBag className="h-5 w-5" />
                                                </div>
                                                <p className="text-lg font-black italic text-slate-800 leading-none">23</p>
                                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Pedidos Realizados</p>
                                            </div>
                                        </div>

                                        {/* Bottom Action Menu */}
                                        <div className="pt-4 grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-200 bg-white text-slate-600 flex flex-col gap-1 font-black text-[9px] uppercase italic tracking-tighter">
                                                <Calendar className="h-5 w-5 text-[#e8820c]" />
                                                Agendar Visita
                                            </Button>
                                            <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-200 bg-white text-slate-600 flex flex-col gap-1 font-black text-[9px] uppercase italic tracking-tighter">
                                                <Send className="h-5 w-5 text-[#0f4c81]" />
                                                Enviar Listas
                                            </Button>
                                        </div>
                                    </div>
                                </ScrollArea>

                                {/* System Bottom Nav (iOS) */}
                                <div className="h-20 bg-white border-t border-slate-100 px-8 flex items-center justify-between pb-4">
                                    <Home className="h-6 w-6 text-[#0f4c81] fill-[#0f4c81]/10" />
                                    <MapIcon className="h-6 w-6 text-slate-300" />
                                    <div className="h-12 w-12 bg-[#e8820c] rounded-2xl flex items-center justify-center text-white shadow-xl -mt-10 ring-4 ring-white active:scale-90 transition-transform">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <Search className="h-6 w-6 text-slate-300" />
                                    <User className="h-6 w-6 text-slate-300" />
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
