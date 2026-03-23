'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Bell, Menu, X, Settings2, HelpCircle,
    ChevronRight, User, LogOut, Shield, Zap,
    AlertCircle, CheckCircle2, MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

interface RetHeaderProps {
    activeTabLabel: string
    isSidebarOpen: boolean
    toggleSidebar: () => void
}

export function RetHeader({ activeTabLabel, isSidebarOpen, toggleSidebar }: RetHeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    const notifications = [
        { id: 1, title: 'Stock Crítico', desc: 'Inka Kola 1.5L debajo del mínimo', time: '5m ago', icon: AlertCircle, color: 'text-red-500' },
        { id: 2, title: 'Pedido Recibido', desc: 'Factura #OC-9021 de Alicorp', time: '1h ago', icon: Truck, color: 'text-emerald-500' },
        { id: 3, title: 'Cierre de Caja', desc: 'Turno Mañana completado', time: '2h ago', icon: CheckCircle2, color: 'text-blue-500' }
    ]

    return (
        <header className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 relative z-[100] shadow-sm">
            <div className="flex items-center gap-6">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all text-slate-500 hover:text-emerald-600 border border-slate-200"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>

                <div className="hidden md:block">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                        <span>Sector Retail</span>
                        <ChevronRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-slate-900 border-b border-emerald-500/30">Premium v2.0</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-none">{activeTabLabel}</h2>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Ultra-Clean */}
                <div className="hidden lg:flex items-center bg-slate-50 rounded-full px-6 py-3 border border-slate-200/60 w-80 group focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-white focus-within:border-emerald-500 transition-all duration-300">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500" />
                    <input
                        type="text"
                        placeholder="Buscar en el ecosistema..."
                        className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full ml-3 text-slate-900 placeholder:text-slate-300 placeholder:font-bold"
                    />
                </div>

                <div className="flex items-center gap-2 relative">
                    {/* Botón Notificaciones */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications)
                                setShowUserMenu(false)
                            }}
                            className={`p-3.5 rounded-2xl transition-all relative group ${showNotifications ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30' : 'bg-slate-50 text-slate-500 hover:bg-white hover:shadow-lg hover:text-emerald-600 border border-slate-200'}`}
                        >
                            <Bell className="w-5 h-5" />
                            {!showNotifications && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 10, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-96 bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden"
                                >
                                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900">Centro de Alertas</h4>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase">3 Nuevas</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.map(n => (
                                            <div key={n.id} className="p-5 hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-50 group">
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white transition-all`}>
                                                        <n.icon className={`w-5 h-5 ${n.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 mb-1">{n.title}</p>
                                                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{n.desc}</p>
                                                        <p className="text-[9px] text-slate-300 font-black uppercase mt-2">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all">Ver todas las actividades</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Botón Usuario */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => {
                                setShowUserMenu(!showUserMenu)
                                setShowNotifications(false)
                            }}
                            className={`flex items-center gap-3 p-1.5 pr-5 rounded-2xl transition-all border ${showUserMenu ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 font-black text-sm shadow-lg shadow-emerald-500/20">
                                AD
                            </div>
                            <div className="text-left hidden lg:block">
                                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 ${showUserMenu ? 'text-emerald-400' : 'text-slate-900'}`}>Admin Promptive</p>
                                <p className="text-[9px] font-bold opacity-60 leading-none">Super Usuario</p>
                            </div>
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 10, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden"
                                >
                                    <div className="p-4 space-y-1">
                                        <MenuAction icon={Shield} label="Seguridad & Roles" />
                                        <MenuAction icon={Zap} label="Suscripción Pro" />
                                        <MenuAction icon={Settings2} label="Configuración" />
                                        <div className="h-px bg-slate-100 my-2 mx-2" />
                                        <MenuAction icon={LogOut} label="Cerrar Sesión" color="text-red-500" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    )
}

function MenuAction({ icon: Icon, label, color = "text-slate-600" }: any) {
    return (
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl transition-all group">
            <Icon className={`w-4 h-4 ${color} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
            <span className={`text-[11px] font-black uppercase tracking-widest ${color}`}>{label}</span>
        </button>
    )
}

function Truck(props: any) {
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
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7Z" />
            <path d="M13 9h4" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
        </svg>
    )
}
